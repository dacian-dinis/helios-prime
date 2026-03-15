import SwiftUI

struct SettingsView: View {
    @Environment(AppState.self) private var state

    var body: some View {
        @Bindable var s = state
        NavigationStack {
            Form {
                Section("Profile") {
                    TextField("Name", text: $s.profile.name)

                    Picker("Gender", selection: $s.profile.gender) {
                        ForEach(Gender.allCases, id: \.self) { Text($0.display).tag($0) }
                    }

                    HStack {
                        Text("Height")
                        Spacer()
                        TextField("cm", value: $s.profile.heightCm, format: .number)
                            .keyboardType(.decimalPad)
                            .frame(width: 80)
                            .multilineTextAlignment(.trailing)
                        Text("cm")
                            .foregroundStyle(.secondary)
                    }

                    Picker("Activity Level", selection: $s.profile.activityLevel) {
                        ForEach(ActivityLevel.allCases, id: \.self) { Text($0.display).tag($0) }
                    }

                    Picker("Goal", selection: $s.profile.goal) {
                        ForEach(FitnessGoal.allCases, id: \.self) { Text($0.display).tag($0) }
                    }
                }

                Section("Daily Goals") {
                    Stepper("Calories: \(s.profile.dailyCalorieGoal) kcal",
                            value: $s.profile.dailyCalorieGoal, in: 1000...5000, step: 50)
                    Stepper("Protein: \(s.profile.proteinGoal)g",
                            value: $s.profile.proteinGoal, in: 30...400, step: 5)
                    Stepper("Carbs: \(s.profile.carbsGoal)g",
                            value: $s.profile.carbsGoal, in: 30...500, step: 5)
                    Stepper("Fat: \(s.profile.fatGoal)g",
                            value: $s.profile.fatGoal, in: 20...200, step: 5)
                    Stepper("Water: \(s.profile.waterGoalMl)ml",
                            value: $s.profile.waterGoalMl, in: 500...5000, step: 250)

                    Button("Auto-Calculate from Profile") {
                        s.profile.calculateGoals()
                    }
                }

                Section("AI Integration") {
                    Picker("Provider", selection: $s.profile.aiProvider) {
                        ForEach(AIProvider.allCases, id: \.self) { Text($0.display).tag($0) }
                    }

                    SecureField("API Key", text: $s.profile.apiKey)
                        .textContentType(.password)

                    if s.profile.apiKey.isEmpty {
                        Text("Without an API key, AI features will use mock data.")
                            .font(.caption)
                            .foregroundStyle(.orange)
                    } else {
                        Label("API key configured", systemImage: "checkmark.circle.fill")
                            .font(.caption)
                            .foregroundStyle(.green)
                    }
                }

                Section("Units") {
                    Toggle("Use Metric", isOn: $s.profile.useMetric)
                }

                Section("Data") {
                    HStack {
                        Text("Food Entries")
                        Spacer()
                        Text("\(state.foodEntries.count)")
                            .foregroundStyle(.secondary)
                    }
                    HStack {
                        Text("Workout Sessions")
                        Spacer()
                        Text("\(state.workoutSessions.count)")
                            .foregroundStyle(.secondary)
                    }
                    HStack {
                        Text("Fasting Sessions")
                        Spacer()
                        Text("\(state.fastingSessions.count)")
                            .foregroundStyle(.secondary)
                    }
                    HStack {
                        Text("Weight Entries")
                        Spacer()
                        Text("\(state.weightEntries.count)")
                            .foregroundStyle(.secondary)
                    }
                }

                Section {
                    Text("Helios Prime v1.0")
                        .foregroundStyle(.secondary)
                    Text("Built with xtool on Linux")
                        .font(.caption)
                        .foregroundStyle(.tertiary)
                }
            }
            .navigationTitle("Settings")
            .onChange(of: s.profile) { _, _ in
                state.saveProfile()
            }
        }
    }
}
