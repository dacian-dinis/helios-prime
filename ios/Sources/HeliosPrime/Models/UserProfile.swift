import Foundation

// MARK: - User Profile

struct UserProfile: Codable, Sendable, Equatable {
    var name: String = ""
    var gender: Gender = .male
    var birthday: Date = Date()
    var heightCm: Double = 170
    var weightKg: Double = 70
    var activityLevel: ActivityLevel = .moderate
    var goal: FitnessGoal = .maintain
    var dailyCalorieGoal: Int = 2000
    var proteinGoal: Int = 150
    var carbsGoal: Int = 200
    var fatGoal: Int = 65
    var waterGoalMl: Int = 2500
    var useMetric: Bool = true
    var onboardingCompleted: Bool = false
    var apiKey: String = ""
    var aiProvider: AIProvider = .anthropic

    // MARK: - TDEE Calculation

    var age: Int {
        Calendar.current.dateComponents([.year], from: birthday, to: Date()).year ?? 25
    }

    var bmr: Double {
        switch gender {
        case .male:
            return 88.362 + (13.397 * weightKg) + (4.799 * heightCm) - (5.677 * Double(age))
        case .female:
            return 447.593 + (9.247 * weightKg) + (3.098 * heightCm) - (4.330 * Double(age))
        }
    }

    var tdee: Double {
        bmr * activityLevel.multiplier
    }

    mutating func calculateGoals() {
        switch goal {
        case .lose:
            dailyCalorieGoal = Int(tdee - 500)
        case .maintain:
            dailyCalorieGoal = Int(tdee)
        case .gain:
            dailyCalorieGoal = Int(tdee + 300)
        }
        proteinGoal = Int(weightKg * 2.0)
        fatGoal = Int(Double(dailyCalorieGoal) * 0.25 / 9.0)
        carbsGoal = Int((Double(dailyCalorieGoal) - Double(proteinGoal * 4) - Double(fatGoal * 9)) / 4.0)
    }
}

// MARK: - Enums

enum Gender: String, Codable, CaseIterable, Sendable {
    case male, female
    var display: String { rawValue.capitalized }
}

enum ActivityLevel: String, Codable, CaseIterable, Sendable {
    case sedentary, light, moderate, active, veryActive

    var display: String {
        switch self {
        case .sedentary: return "Sedentary"
        case .light: return "Lightly Active"
        case .moderate: return "Moderately Active"
        case .active: return "Active"
        case .veryActive: return "Very Active"
        }
    }

    var multiplier: Double {
        switch self {
        case .sedentary: return 1.2
        case .light: return 1.375
        case .moderate: return 1.55
        case .active: return 1.725
        case .veryActive: return 1.9
        }
    }
}

enum FitnessGoal: String, Codable, CaseIterable, Sendable {
    case lose, maintain, gain

    var display: String {
        switch self {
        case .lose: return "Lose Weight"
        case .maintain: return "Maintain"
        case .gain: return "Build Muscle"
        }
    }
}

enum AIProvider: String, Codable, CaseIterable, Sendable {
    case anthropic, openai

    var display: String {
        switch self {
        case .anthropic: return "Anthropic (Claude)"
        case .openai: return "OpenAI (GPT)"
        }
    }
}
