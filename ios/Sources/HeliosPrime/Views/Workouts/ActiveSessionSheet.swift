import SwiftUI

struct ActiveSessionSheet: View {
    @Environment(AppState.self) private var state
    @Environment(\.dismiss) private var dismiss

    let plan: WorkoutPlan

    @State private var hasStarted = false
    @State private var localExercises: [SessionExercise] = []

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 16) {
                    if let active = state.activeWorkout {
                        timerHeader(active)
                    }

                    ForEach(localExercises.indices, id: \.self) { exIdx in
                        exerciseCard(exerciseIndex: exIdx)
                    }

                    HStack(spacing: 16) {
                        Button {
                            syncBack()
                            state.completeWorkout()
                            dismiss()
                        } label: {
                            Text("Complete Workout")
                                .fontWeight(.semibold)
                                .frame(maxWidth: .infinity)
                                .padding()
                                .background(Color.green, in: RoundedRectangle(cornerRadius: 12))
                                .foregroundStyle(.white)
                        }

                        Button {
                            state.cancelWorkout()
                            dismiss()
                        } label: {
                            Text("Cancel")
                                .frame(maxWidth: .infinity)
                                .padding()
                                .background(Color.red.opacity(0.15), in: RoundedRectangle(cornerRadius: 12))
                                .foregroundStyle(.red)
                        }
                    }
                }
                .padding()
            }
            .navigationTitle(plan.name)
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarLeading) {
                    Button("Close") {
                        syncBack()
                        dismiss()
                    }
                }
            }
        }
        .onAppear {
            if !hasStarted {
                if state.activeWorkout == nil {
                    state.startWorkout(from: plan)
                }
                hasStarted = true
            }
            if let active = state.activeWorkout {
                localExercises = active.exercises
            }
        }
    }

    private func syncBack() {
        if state.activeWorkout != nil {
            state.activeWorkout?.exercises = localExercises
        }
    }

    // MARK: - Timer Header

    private func timerHeader(_ session: ActiveSession) -> some View {
        HStack {
            Image(systemName: "timer")
                .foregroundStyle(.orange)
            Text(formatElapsed(from: session.startedAt))
                .font(.title3)
                .fontWeight(.semibold)
                .monospacedDigit()
            Spacer()
            Text("\(localExercises.count) exercises")
                .font(.caption)
                .foregroundStyle(.secondary)
        }
        .padding()
        .background(Color.orange.opacity(0.1), in: RoundedRectangle(cornerRadius: 12))
    }

    // MARK: - Exercise Card

    private func exerciseCard(exerciseIndex: Int) -> some View {
        VStack(alignment: .leading, spacing: 8) {
            Text(localExercises[exerciseIndex].exerciseName)
                .font(.headline)

            ForEach(localExercises[exerciseIndex].sets.indices, id: \.self) { setIdx in
                setRow(exerciseIndex: exerciseIndex, setIndex: setIdx)
            }
        }
        .padding()
        .background(.regularMaterial, in: RoundedRectangle(cornerRadius: 12))
    }

    private func setRow(exerciseIndex: Int, setIndex: Int) -> some View {
        HStack(spacing: 12) {
            Text("Set \(setIndex + 1)")
                .font(.caption)
                .foregroundStyle(.secondary)
                .frame(width: 44)

            HStack(spacing: 4) {
                TextField("0", value: $localExercises[exerciseIndex].sets[setIndex].weight, format: .number)
                    .keyboardType(.decimalPad)
                    .textFieldStyle(.roundedBorder)
                    .frame(width: 60)
                Text("kg")
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }

            HStack(spacing: 4) {
                TextField("0", value: $localExercises[exerciseIndex].sets[setIndex].reps, format: .number)
                    .keyboardType(.numberPad)
                    .textFieldStyle(.roundedBorder)
                    .frame(width: 50)
                Text("reps")
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }

            Button {
                localExercises[exerciseIndex].sets[setIndex].completed.toggle()
            } label: {
                Image(systemName: localExercises[exerciseIndex].sets[setIndex].completed ? "checkmark.circle.fill" : "circle")
                    .foregroundStyle(localExercises[exerciseIndex].sets[setIndex].completed ? .green : .gray)
            }
        }
    }

    private func formatElapsed(from date: Date) -> String {
        let total = Int(Date().timeIntervalSince(date))
        let hours = total / 3600
        let minutes = (total % 3600) / 60
        let seconds = total % 60
        if hours > 0 {
            return String(format: "%d:%02d:%02d", hours, minutes, seconds)
        }
        return String(format: "%02d:%02d", minutes, seconds)
    }
}
