import SwiftUI

struct AIWorkoutGeneratorSheet: View {
    @Environment(AppState.self) private var state
    @Environment(\.dismiss) private var dismiss

    @State private var goal = "Build Muscle"
    @State private var frequency = 3
    @State private var equipment = "Full Gym"
    @State private var focus = "Full Body"
    @State private var isGenerating = false
    @State private var suggestions: [WorkoutPlanSuggestion] = []
    @State private var errorMessage: String? = nil

    private let goals = ["Build Muscle", "Lose Fat", "Improve Endurance", "General Fitness"]
    private let equipmentOptions = ["Full Gym", "Dumbbells Only", "Bodyweight Only", "Home Gym"]
    private let focusOptions = ["Full Body", "Upper Body", "Lower Body", "Push/Pull/Legs"]

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 20) {
                    configSection
                    generateButton

                    if let error = errorMessage {
                        Text(error)
                            .font(.caption)
                            .foregroundStyle(.red)
                    }

                    ForEach(Array(suggestions.enumerated()), id: \.offset) { _, plan in
                        suggestionCard(plan)
                    }
                }
                .padding()
            }
            .navigationTitle("AI Generator")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarLeading) {
                    Button("Close") { dismiss() }
                }
            }
        }
    }

    private var configSection: some View {
        VStack(spacing: 12) {
            pickerRow("Goal", selection: $goal, options: goals)
            pickerRow("Equipment", selection: $equipment, options: equipmentOptions)
            pickerRow("Focus", selection: $focus, options: focusOptions)

            Stepper("Sessions/week: \(frequency)", value: $frequency, in: 1...7)
                .padding()
                .background(.regularMaterial, in: RoundedRectangle(cornerRadius: 8))
        }
    }

    private func pickerRow(_ label: String, selection: Binding<String>, options: [String]) -> some View {
        VStack(alignment: .leading, spacing: 4) {
            Text(label)
                .font(.caption)
                .foregroundStyle(.secondary)
            Picker(label, selection: selection) {
                ForEach(options, id: \.self) { Text($0) }
            }
            .pickerStyle(.segmented)
        }
    }

    private var generateButton: some View {
        Button {
            generate()
        } label: {
            HStack {
                if isGenerating {
                    ProgressView().tint(.white)
                }
                Image(systemName: "sparkles")
                Text(isGenerating ? "Generating..." : "Generate Plans")
            }
            .fontWeight(.semibold)
            .frame(maxWidth: .infinity)
            .padding()
            .background(Color.purple, in: RoundedRectangle(cornerRadius: 12))
            .foregroundStyle(.white)
        }
        .disabled(isGenerating)
    }

    private func suggestionCard(_ plan: WorkoutPlanSuggestion) -> some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                Text(plan.name)
                    .font(.headline)
                Spacer()
                Text("\(plan.estimatedMinutes) min")
                    .font(.caption)
                    .padding(.horizontal, 8)
                    .padding(.vertical, 3)
                    .background(Color.blue.opacity(0.1), in: Capsule())
            }

            Text(plan.description)
                .font(.caption)
                .foregroundStyle(.secondary)

            HStack(spacing: 4) {
                ForEach(plan.muscleGroups, id: \.self) { mg in
                    Text(mg)
                        .font(.caption2)
                        .padding(.horizontal, 6)
                        .padding(.vertical, 2)
                        .background(Color.gray.opacity(0.15), in: Capsule())
                }
            }

            ForEach(Array(plan.exercises.enumerated()), id: \.offset) { _, ex in
                HStack {
                    Text(ex.name)
                        .font(.caption)
                    Spacer()
                    Text("\(ex.sets)x\(ex.reps)")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }
            }

            Button("Add to My Plans") {
                addPlan(plan)
            }
            .font(.caption)
            .fontWeight(.semibold)
            .frame(maxWidth: .infinity)
            .padding(.vertical, 8)
            .background(Color.green.opacity(0.15), in: RoundedRectangle(cornerRadius: 8))
            .foregroundStyle(.green)
        }
        .padding()
        .background(.regularMaterial, in: RoundedRectangle(cornerRadius: 12))
    }

    private func generate() {
        isGenerating = true
        errorMessage = nil

        Task {
            do {
                let results = try await AIService.shared.generateWorkout(
                    goal: goal,
                    activityLevel: state.profile.activityLevel.display,
                    frequency: frequency,
                    equipment: equipment,
                    apiKey: state.profile.apiKey,
                    provider: state.profile.aiProvider
                )
                await MainActor.run {
                    suggestions = results
                    isGenerating = false
                }
            } catch {
                await MainActor.run {
                    errorMessage = error.localizedDescription
                    isGenerating = false
                }
            }
        }
    }

    private func addPlan(_ suggestion: WorkoutPlanSuggestion) {
        let exercises = suggestion.exercises.map { ex in
            let matched = ExerciseLibrary.exercises.first { $0.name == ex.name }
                ?? Exercise(name: ex.name, muscleGroup: .fullBody, equipment: .bodyweight)
            return PlanExercise(exercise: matched, sets: ex.sets, targetReps: ex.reps, restSeconds: ex.restSeconds)
        }

        let muscleGroups = suggestion.muscleGroups.compactMap { name in
            MuscleGroup.allCases.first { $0.display.lowercased() == name.lowercased() }
        }

        let plan = WorkoutPlan(
            name: suggestion.name,
            description: suggestion.description,
            exercises: exercises,
            muscleGroups: muscleGroups.isEmpty ? [.fullBody] : muscleGroups,
            estimatedMinutes: suggestion.estimatedMinutes
        )
        state.addWorkoutPlan(plan)
    }
}
