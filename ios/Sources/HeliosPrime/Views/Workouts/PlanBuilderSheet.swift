import SwiftUI

struct PlanBuilderSheet: View {
    @Environment(AppState.self) private var state
    @Environment(\.dismiss) private var dismiss

    @State private var planName = ""
    @State private var planDescription = ""
    @State private var estimatedMinutes = 45
    @State private var selectedExercises: [PlanExercise] = []
    @State private var showExercisePicker = false

    var body: some View {
        NavigationStack {
            Form {
                Section("Plan Details") {
                    TextField("Plan Name", text: $planName)
                    TextField("Description (optional)", text: $planDescription)
                    Stepper("Duration: \(estimatedMinutes) min", value: $estimatedMinutes, in: 15...120, step: 5)
                }

                Section("Exercises (\(selectedExercises.count))") {
                    ForEach($selectedExercises) { $pe in
                        exerciseRow(pe: $pe)
                    }
                    .onDelete { indexSet in
                        selectedExercises.remove(atOffsets: indexSet)
                    }

                    Button {
                        showExercisePicker = true
                    } label: {
                        Label("Add Exercise", systemImage: "plus")
                    }
                }
            }
            .navigationTitle("New Plan")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarLeading) {
                    Button("Cancel") { dismiss() }
                }
                ToolbarItem(placement: .topBarTrailing) {
                    Button("Save") { savePlan() }
                        .fontWeight(.semibold)
                        .disabled(planName.isEmpty || selectedExercises.isEmpty)
                }
            }
            .sheet(isPresented: $showExercisePicker) {
                ExercisePickerSheet { exercise in
                    selectedExercises.append(
                        PlanExercise(exercise: exercise, sets: 3, targetReps: 10, restSeconds: 90)
                    )
                }
            }
        }
    }

    private func exerciseRow(pe: Binding<PlanExercise>) -> some View {
        VStack(alignment: .leading, spacing: 4) {
            Text(pe.wrappedValue.exercise.name)
                .font(.subheadline)
                .fontWeight(.medium)

            HStack {
                Stepper("Sets: \(pe.wrappedValue.sets)", value: pe.sets, in: 1...10)
                    .font(.caption)
            }
            HStack {
                Stepper("Reps: \(pe.wrappedValue.targetReps)", value: pe.targetReps, in: 1...50)
                    .font(.caption)
            }
        }
        .padding(.vertical, 4)
    }

    private func savePlan() {
        let muscleGroups = Array(Set(selectedExercises.map { $0.exercise.muscleGroup }))
        let plan = WorkoutPlan(
            name: planName,
            description: planDescription,
            exercises: selectedExercises,
            muscleGroups: muscleGroups,
            estimatedMinutes: estimatedMinutes
        )
        state.addWorkoutPlan(plan)
        dismiss()
    }
}

// MARK: - Exercise Picker

struct ExercisePickerSheet: View {
    @Environment(\.dismiss) private var dismiss
    let onSelect: (Exercise) -> Void

    @State private var searchText = ""
    @State private var selectedGroup: MuscleGroup? = nil

    private var filteredExercises: [Exercise] {
        var exercises = ExerciseLibrary.exercises
        if let group = selectedGroup {
            exercises = exercises.filter { $0.muscleGroup == group }
        }
        if !searchText.isEmpty {
            exercises = exercises.filter { $0.name.localizedCaseInsensitiveContains(searchText) }
        }
        return exercises
    }

    var body: some View {
        NavigationStack {
            VStack(spacing: 0) {
                ScrollView(.horizontal, showsIndicators: false) {
                    HStack(spacing: 8) {
                        filterChip("All", selected: selectedGroup == nil) {
                            selectedGroup = nil
                        }
                        ForEach(MuscleGroup.allCases, id: \.self) { group in
                            filterChip(group.display, selected: selectedGroup == group) {
                                selectedGroup = group
                            }
                        }
                    }
                    .padding(.horizontal)
                    .padding(.vertical, 8)
                }

                List(filteredExercises) { exercise in
                    Button {
                        onSelect(exercise)
                        dismiss()
                    } label: {
                        HStack {
                            Image(systemName: exercise.muscleGroup.icon)
                                .frame(width: 24)
                                .foregroundStyle(.blue)
                            VStack(alignment: .leading) {
                                Text(exercise.name)
                                    .font(.subheadline)
                                    .foregroundStyle(.primary)
                                Text("\(exercise.muscleGroup.display) \u{2022} \(exercise.equipment.display)")
                                    .font(.caption)
                                    .foregroundStyle(.secondary)
                            }
                        }
                    }
                }
            }
            .navigationTitle("Add Exercise")
            .navigationBarTitleDisplayMode(.inline)
            .searchable(text: $searchText, prompt: "Search exercises")
            .toolbar {
                ToolbarItem(placement: .topBarLeading) {
                    Button("Cancel") { dismiss() }
                }
            }
        }
    }

    private func filterChip(_ title: String, selected: Bool, action: @escaping () -> Void) -> some View {
        Button(action: action) {
            Text(title)
                .font(.caption)
                .fontWeight(.medium)
                .padding(.horizontal, 12)
                .padding(.vertical, 6)
                .background(selected ? Color.blue : Color.gray.opacity(0.15), in: Capsule())
                .foregroundStyle(selected ? .white : .primary)
        }
    }
}
