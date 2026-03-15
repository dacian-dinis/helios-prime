import Foundation

// MARK: - AI Service

final class AIService: Sendable {
    static let shared = AIService()

    // MARK: - Analyze Food (Text)

    func analyzeFood(description: String, apiKey: String, provider: AIProvider) async throws -> [NutritionInfo] {
        guard !apiKey.isEmpty else {
            return mockFoodAnalysis(description)
        }

        let prompt = """
        Analyze this food and return nutritional information as JSON array.
        Each item should have: name, servingSize, calories (int), protein (double), carbs (double), fat (double).
        Return ONLY the JSON array, no other text.

        Food: \(description)
        """

        let responseText = try await callAI(prompt: prompt, apiKey: apiKey, provider: provider)
        return parseFoodResponse(responseText)
    }

    // MARK: - Generate Workout

    func generateWorkout(
        goal: String,
        activityLevel: String,
        frequency: Int,
        equipment: String,
        apiKey: String,
        provider: AIProvider
    ) async throws -> [WorkoutPlanSuggestion] {
        guard !apiKey.isEmpty else {
            return mockWorkoutPlans()
        }

        let prompt = """
        Generate 3 workout plans as a JSON array. Each plan should have:
        name (string), description (string), muscleGroups (string array), estimatedMinutes (int),
        exercises (array of {name, sets (int), reps (int), restSeconds (int)}).

        User profile:
        - Goal: \(goal)
        - Activity level: \(activityLevel)
        - Workouts per week: \(frequency)
        - Equipment: \(equipment)

        Return ONLY the JSON array.
        """

        let responseText = try await callAI(prompt: prompt, apiKey: apiKey, provider: provider)
        return parseWorkoutResponse(responseText)
    }

    // MARK: - Health Score

    func getHealthScore(
        calorieAdherence: Double,
        proteinAdherence: Double,
        workoutsThisWeek: Int,
        waterAdherence: Double,
        avgEnergy: Double,
        apiKey: String,
        provider: AIProvider
    ) async throws -> HealthScore {
        guard !apiKey.isEmpty else {
            return mockHealthScore(
                calorieAdherence: calorieAdherence,
                workouts: workoutsThisWeek,
                water: waterAdherence
            )
        }

        let prompt = """
        Based on this user's weekly health data, provide a health score.
        Return JSON with: score (0-100 int), grade (A+/A/B/C/D string), summary (string), tips (string array of 3 items).

        Data:
        - Calorie goal adherence: \(Int(calorieAdherence * 100))%
        - Protein goal adherence: \(Int(proteinAdherence * 100))%
        - Workouts completed: \(workoutsThisWeek)
        - Water goal adherence: \(Int(waterAdherence * 100))%
        - Average energy level: \(String(format: "%.1f", avgEnergy))/5

        Return ONLY the JSON object.
        """

        let responseText = try await callAI(prompt: prompt, apiKey: apiKey, provider: provider)
        return parseHealthScore(responseText)
    }

    // MARK: - API Call

    private func callAI(prompt: String, apiKey: String, provider: AIProvider) async throws -> String {
        var request: URLRequest

        switch provider {
        case .anthropic:
            request = URLRequest(url: URL(string: "https://api.anthropic.com/v1/messages")!)
            request.httpMethod = "POST"
            request.setValue("application/json", forHTTPHeaderField: "content-type")
            request.setValue(apiKey, forHTTPHeaderField: "x-api-key")
            request.setValue("2023-06-01", forHTTPHeaderField: "anthropic-version")

            let body: [String: Any] = [
                "model": "claude-sonnet-4-20250514",
                "max_tokens": 1024,
                "messages": [["role": "user", "content": prompt]]
            ]
            request.httpBody = try JSONSerialization.data(withJSONObject: body)

        case .openai:
            request = URLRequest(url: URL(string: "https://api.openai.com/v1/chat/completions")!)
            request.httpMethod = "POST"
            request.setValue("application/json", forHTTPHeaderField: "Content-Type")
            request.setValue("Bearer \(apiKey)", forHTTPHeaderField: "Authorization")

            let body: [String: Any] = [
                "model": "gpt-4o-mini",
                "messages": [["role": "user", "content": prompt]],
                "max_tokens": 1024
            ]
            request.httpBody = try JSONSerialization.data(withJSONObject: body)
        }

        let (data, _) = try await URLSession.shared.data(for: request)
        let json = try JSONSerialization.jsonObject(with: data) as? [String: Any]

        switch provider {
        case .anthropic:
            if let content = json?["content"] as? [[String: Any]],
               let text = content.first?["text"] as? String {
                return text
            }
        case .openai:
            if let choices = json?["choices"] as? [[String: Any]],
               let message = choices.first?["message"] as? [String: Any],
               let text = message["content"] as? String {
                return text
            }
        }

        throw AIError.invalidResponse
    }

    // MARK: - Parse Responses

    private func parseFoodResponse(_ text: String) -> [NutritionInfo] {
        guard let jsonData = extractJSON(from: text),
              let items = try? JSONSerialization.jsonObject(with: jsonData) as? [[String: Any]] else {
            return []
        }

        return items.compactMap { item in
            guard let name = item["name"] as? String else { return nil }
            return NutritionInfo(
                name: name,
                servingSize: item["servingSize"] as? String ?? "1 serving",
                calories: (item["calories"] as? Int) ?? Int(item["calories"] as? Double ?? 0),
                protein: (item["protein"] as? Double) ?? Double(item["protein"] as? Int ?? 0),
                carbs: (item["carbs"] as? Double) ?? Double(item["carbs"] as? Int ?? 0),
                fat: (item["fat"] as? Double) ?? Double(item["fat"] as? Int ?? 0)
            )
        }
    }

    private func parseWorkoutResponse(_ text: String) -> [WorkoutPlanSuggestion] {
        guard let jsonData = extractJSON(from: text),
              let plans = try? JSONSerialization.jsonObject(with: jsonData) as? [[String: Any]] else {
            return mockWorkoutPlans()
        }

        return plans.compactMap { plan in
            guard let name = plan["name"] as? String,
                  let exercises = plan["exercises"] as? [[String: Any]] else { return nil }

            let parsedExercises = exercises.compactMap { ex -> WorkoutExerciseSuggestion? in
                guard let eName = ex["name"] as? String else { return nil }
                return WorkoutExerciseSuggestion(
                    name: eName,
                    sets: ex["sets"] as? Int ?? 3,
                    reps: ex["reps"] as? Int ?? 10,
                    restSeconds: ex["restSeconds"] as? Int ?? 90
                )
            }

            return WorkoutPlanSuggestion(
                name: name,
                description: plan["description"] as? String ?? "",
                muscleGroups: plan["muscleGroups"] as? [String] ?? [],
                exercises: parsedExercises,
                estimatedMinutes: plan["estimatedMinutes"] as? Int ?? 45
            )
        }
    }

    private func parseHealthScore(_ text: String) -> HealthScore {
        guard let jsonData = extractJSON(from: text),
              let json = try? JSONSerialization.jsonObject(with: jsonData) as? [String: Any] else {
            return HealthScore(score: 70, grade: "B", summary: "Good progress!", tips: ["Keep it up!"])
        }

        return HealthScore(
            score: json["score"] as? Int ?? 70,
            grade: json["grade"] as? String ?? "B",
            summary: json["summary"] as? String ?? "Good progress!",
            tips: json["tips"] as? [String] ?? ["Keep going!"]
        )
    }

    private func extractJSON(from text: String) -> Data? {
        // Try to find JSON array or object in the response
        let patterns = [
            try? NSRegularExpression(pattern: "\\[\\s*\\{.*\\}\\s*\\]", options: .dotMatchesLineSeparators),
            try? NSRegularExpression(pattern: "\\{.*\\}", options: .dotMatchesLineSeparators)
        ]

        for pattern in patterns.compactMap({ $0 }) {
            if let match = pattern.firstMatch(in: text, range: NSRange(text.startIndex..., in: text)),
               let range = Range(match.range, in: text) {
                return String(text[range]).data(using: .utf8)
            }
        }

        return text.data(using: .utf8)
    }

    // MARK: - Mock Data

    private func mockFoodAnalysis(_ description: String) -> [NutritionInfo] {
        [NutritionInfo(
            name: description,
            servingSize: "1 serving",
            calories: Int.random(in: 200...600),
            protein: Double.random(in: 10...40),
            carbs: Double.random(in: 20...60),
            fat: Double.random(in: 5...25)
        )]
    }

    private func mockWorkoutPlans() -> [WorkoutPlanSuggestion] {
        [
            WorkoutPlanSuggestion(
                name: "Push Day",
                description: "Chest, shoulders, and triceps",
                muscleGroups: ["Chest", "Shoulders", "Triceps"],
                exercises: [
                    WorkoutExerciseSuggestion(name: "Bench Press", sets: 4, reps: 8, restSeconds: 120),
                    WorkoutExerciseSuggestion(name: "Overhead Press", sets: 3, reps: 10, restSeconds: 90),
                    WorkoutExerciseSuggestion(name: "Dumbbell Flyes", sets: 3, reps: 12, restSeconds: 60),
                    WorkoutExerciseSuggestion(name: "Lateral Raises", sets: 3, reps: 15, restSeconds: 60),
                    WorkoutExerciseSuggestion(name: "Tricep Pushdown", sets: 3, reps: 12, restSeconds: 60),
                ],
                estimatedMinutes: 50
            ),
            WorkoutPlanSuggestion(
                name: "Pull Day",
                description: "Back and biceps",
                muscleGroups: ["Back", "Biceps"],
                exercises: [
                    WorkoutExerciseSuggestion(name: "Deadlift", sets: 4, reps: 6, restSeconds: 180),
                    WorkoutExerciseSuggestion(name: "Pull-ups", sets: 3, reps: 8, restSeconds: 120),
                    WorkoutExerciseSuggestion(name: "Barbell Row", sets: 3, reps: 10, restSeconds: 90),
                    WorkoutExerciseSuggestion(name: "Face Pulls", sets: 3, reps: 15, restSeconds: 60),
                    WorkoutExerciseSuggestion(name: "Barbell Curl", sets: 3, reps: 12, restSeconds: 60),
                ],
                estimatedMinutes: 50
            ),
            WorkoutPlanSuggestion(
                name: "Leg Day",
                description: "Quads, hamstrings, and calves",
                muscleGroups: ["Legs"],
                exercises: [
                    WorkoutExerciseSuggestion(name: "Squat", sets: 4, reps: 8, restSeconds: 150),
                    WorkoutExerciseSuggestion(name: "Romanian Deadlift", sets: 3, reps: 10, restSeconds: 120),
                    WorkoutExerciseSuggestion(name: "Leg Press", sets: 3, reps: 12, restSeconds: 90),
                    WorkoutExerciseSuggestion(name: "Leg Curl", sets: 3, reps: 12, restSeconds: 60),
                    WorkoutExerciseSuggestion(name: "Calf Raises", sets: 4, reps: 15, restSeconds: 60),
                ],
                estimatedMinutes: 55
            ),
        ]
    }

    private func mockHealthScore(calorieAdherence: Double, workouts: Int, water: Double) -> HealthScore {
        let score = Int(calorieAdherence * 30 + Double(min(workouts, 5)) * 10 + water * 20)
        let grade: String
        switch score {
        case 90...: grade = "A+"
        case 80..<90: grade = "A"
        case 70..<80: grade = "B"
        case 60..<70: grade = "C"
        default: grade = "D"
        }
        return HealthScore(
            score: min(score, 100),
            grade: grade,
            summary: "Based on your weekly activity and nutrition adherence.",
            tips: ["Stay consistent with your meals", "Try to hit your water goal daily", "Keep up your workout routine"]
        )
    }
}

// MARK: - AI Response Types

struct WorkoutPlanSuggestion: Codable, Sendable {
    var name: String
    var description: String
    var muscleGroups: [String]
    var exercises: [WorkoutExerciseSuggestion]
    var estimatedMinutes: Int
}

struct WorkoutExerciseSuggestion: Codable, Sendable {
    var name: String
    var sets: Int
    var reps: Int
    var restSeconds: Int
}

struct HealthScore: Codable, Sendable {
    var score: Int
    var grade: String
    var summary: String
    var tips: [String]
}

// MARK: - Errors

enum AIError: Error, LocalizedError {
    case invalidResponse
    case noAPIKey

    var errorDescription: String? {
        switch self {
        case .invalidResponse: return "Could not parse AI response"
        case .noAPIKey: return "No API key configured"
        }
    }
}
