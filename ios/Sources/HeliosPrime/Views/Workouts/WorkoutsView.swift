import SwiftUI

struct WorkoutsView: View {
    @Environment(AppState.self) private var state
    @State private var showPlanBuilder = false
    @State private var showAIGenerator = false
    @State private var selectedPlan: WorkoutPlan? = nil

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 16) {
                    if let active = state.activeWorkout {
                        activeSessionBanner(active)
                    }

                    quickStartButton
                    aiGeneratorButton

                    plansSection
                    historySection
                }
                .padding()
            }
            .navigationTitle("Workouts")
            .background(Color(.systemGroupedBackground))
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button {
                        showPlanBuilder = true
                    } label: {
                        Image(systemName: "plus.circle.fill")
                            .font(.title3)
                    }
                }
            }
            .sheet(isPresented: $showPlanBuilder) {
                PlanBuilderSheet()
            }
            .sheet(isPresented: $showAIGenerator) {
                AIWorkoutGeneratorSheet()
            }
            .sheet(item: $selectedPlan) { plan in
                ActiveSessionSheet(plan: plan)
            }
        }
    }

    // MARK: - Active Session Banner

    private func activeSessionBanner(_ session: ActiveSession) -> some View {
        VStack(spacing: 8) {
            HStack {
                Image(systemName: "flame.fill")
                    .foregroundStyle(.orange)
                Text("Active: \(session.planName)")
                    .fontWeight(.semibold)
                Spacer()
                Text(formatDuration(from: session.startedAt))
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }

            HStack(spacing: 12) {
                Button("Resume") {
                    // ActiveSession is shown via sheet
                }
                .buttonStyle(.borderedProminent)

                Button("Finish") {
                    state.completeWorkout()
                }
                .buttonStyle(.bordered)

                Button("Cancel") {
                    state.cancelWorkout()
                }
                .buttonStyle(.bordered)
                .tint(.red)
            }
            .font(.caption)
        }
        .padding()
        .background(Color.orange.opacity(0.1), in: RoundedRectangle(cornerRadius: 12))
    }

    // MARK: - Quick Start

    private var quickStartButton: some View {
        Button {
            state.startEmptyWorkout()
        } label: {
            HStack {
                Image(systemName: "bolt.fill")
                    .foregroundStyle(.yellow)
                Text("Quick Start Empty Workout")
                    .fontWeight(.medium)
                Spacer()
                Image(systemName: "chevron.right")
                    .foregroundStyle(.secondary)
            }
            .padding()
            .background(.regularMaterial, in: RoundedRectangle(cornerRadius: 12))
        }
        .foregroundStyle(.primary)
    }

    // MARK: - AI Generator

    private var aiGeneratorButton: some View {
        Button {
            showAIGenerator = true
        } label: {
            HStack {
                Image(systemName: "sparkles")
                    .foregroundStyle(.purple)
                Text("AI Workout Generator")
                    .fontWeight(.medium)
                Spacer()
                Image(systemName: "chevron.right")
                    .foregroundStyle(.secondary)
            }
            .padding()
            .background(.regularMaterial, in: RoundedRectangle(cornerRadius: 12))
        }
        .foregroundStyle(.primary)
    }

    // MARK: - Plans

    private var plansSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("My Plans")
                .font(.headline)

            if state.workoutPlans.isEmpty {
                Text("No workout plans yet. Create one or use AI to generate plans.")
                    .font(.caption)
                    .foregroundStyle(.secondary)
                    .padding()
            }

            ForEach(state.workoutPlans) { plan in
                planCard(plan)
            }
        }
    }

    private func planCard(_ plan: WorkoutPlan) -> some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                VStack(alignment: .leading, spacing: 4) {
                    Text(plan.name)
                        .font(.headline)
                    if !plan.description.isEmpty {
                        Text(plan.description)
                            .font(.caption)
                            .foregroundStyle(.secondary)
                    }
                }
                Spacer()
                Text("\(plan.estimatedMinutes) min")
                    .font(.caption)
                    .padding(.horizontal, 8)
                    .padding(.vertical, 4)
                    .background(Color.blue.opacity(0.1), in: Capsule())
            }

            HStack(spacing: 6) {
                ForEach(plan.muscleGroups, id: \.self) { group in
                    Text(group.display)
                        .font(.caption2)
                        .padding(.horizontal, 8)
                        .padding(.vertical, 3)
                        .background(Color.gray.opacity(0.15), in: Capsule())
                }
            }

            Text("\(plan.exercises.count) exercises")
                .font(.caption)
                .foregroundStyle(.secondary)

            HStack {
                Button("Start") {
                    selectedPlan = plan
                }
                .buttonStyle(.borderedProminent)
                .controlSize(.small)

                Spacer()

                Button(role: .destructive) {
                    state.deleteWorkoutPlan(plan)
                } label: {
                    Image(systemName: "trash")
                        .font(.caption)
                }
            }
        }
        .padding()
        .background(.regularMaterial, in: RoundedRectangle(cornerRadius: 12))
    }

    // MARK: - History

    private var historySection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("History")
                .font(.headline)

            let recentSessions = state.workoutSessions.sorted { $0.startedAt > $1.startedAt }.prefix(10)

            if recentSessions.isEmpty {
                Text("No completed workouts yet")
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }

            ForEach(Array(recentSessions)) { session in
                sessionRow(session)
            }
        }
    }

    private func sessionRow(_ session: WorkoutSession) -> some View {
        HStack {
            VStack(alignment: .leading, spacing: 2) {
                Text(session.planName)
                    .font(.subheadline)
                    .fontWeight(.medium)
                Text(session.startedAt.formatted(date: .abbreviated, time: .shortened))
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }
            Spacer()
            VStack(alignment: .trailing, spacing: 2) {
                Text("\(session.durationMinutes) min")
                    .font(.caption)
                Text("\(Int(session.totalVolume)) kg vol")
                    .font(.caption2)
                    .foregroundStyle(.secondary)
            }
        }
        .padding()
        .background(.regularMaterial, in: RoundedRectangle(cornerRadius: 8))
    }

    private func formatDuration(from date: Date) -> String {
        let mins = Int(Date().timeIntervalSince(date) / 60)
        return "\(mins) min"
    }
}
