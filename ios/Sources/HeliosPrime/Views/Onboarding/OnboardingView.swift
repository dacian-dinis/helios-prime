import SwiftUI

struct OnboardingView: View {
    @Environment(AppState.self) private var state
    @State private var step = 0

    var body: some View {
        @Bindable var s = state
        VStack(spacing: 0) {
            // Progress
            ProgressView(value: Double(step + 1), total: Double(totalSteps))
                .tint(.blue)
                .padding()

            TabView(selection: $step) {
                welcomeStep.tag(0)
                nameStep.tag(1)
                bodyStep.tag(2)
                activityStep.tag(3)
                goalStep.tag(4)
                goalsReviewStep.tag(5)
            }
            .tabViewStyle(.page(indexDisplayMode: .never))
            .animation(.easeInOut, value: step)
        }
        .background(Color(.systemGroupedBackground))
    }

    private var totalSteps: Int { 6 }

    // MARK: - Steps

    private var welcomeStep: some View {
        VStack(spacing: 24) {
            Spacer()
            Image(systemName: "flame.fill")
                .font(.system(size: 80))
                .foregroundStyle(.orange)
            Text("Welcome to Helios Prime")
                .font(.title)
                .fontWeight(.bold)
            Text("Your AI-powered fitness companion")
                .font(.subheadline)
                .foregroundStyle(.secondary)
            Spacer()
            nextButton
        }
        .padding()
    }

    private var nameStep: some View {
        @Bindable var s = state
        return VStack(spacing: 24) {
            Spacer()
            Text("What's your name?")
                .font(.title2)
                .fontWeight(.bold)
            TextField("Your name", text: $s.profile.name)
                .textFieldStyle(.roundedBorder)
                .font(.title3)
                .multilineTextAlignment(.center)
                .frame(maxWidth: 280)
            Spacer()
            nextButton
        }
        .padding()
    }

    private var bodyStep: some View {
        @Bindable var s = state
        return VStack(spacing: 24) {
            Text("Your Body")
                .font(.title2)
                .fontWeight(.bold)

            Picker("Gender", selection: $s.profile.gender) {
                ForEach(Gender.allCases, id: \.self) { Text($0.display).tag($0) }
            }
            .pickerStyle(.segmented)

            VStack(spacing: 16) {
                HStack {
                    Text("Height")
                    Spacer()
                    TextField("cm", value: $s.profile.heightCm, format: .number)
                        .keyboardType(.decimalPad)
                        .frame(width: 80)
                        .textFieldStyle(.roundedBorder)
                    Text("cm")
                }

                HStack {
                    Text("Weight")
                    Spacer()
                    TextField("kg", value: $s.profile.weightKg, format: .number)
                        .keyboardType(.decimalPad)
                        .frame(width: 80)
                        .textFieldStyle(.roundedBorder)
                    Text("kg")
                }

                DatePicker("Birthday", selection: $s.profile.birthday, displayedComponents: .date)
            }
            .padding()
            .background(.regularMaterial, in: RoundedRectangle(cornerRadius: 12))

            Spacer()
            nextButton
        }
        .padding()
    }

    private var activityStep: some View {
        @Bindable var s = state
        return VStack(spacing: 24) {
            Text("Activity Level")
                .font(.title2)
                .fontWeight(.bold)

            ForEach(ActivityLevel.allCases, id: \.self) { level in
                Button {
                    s.profile.activityLevel = level
                } label: {
                    HStack {
                        Text(level.display)
                            .foregroundStyle(.primary)
                        Spacer()
                        if s.profile.activityLevel == level {
                            Image(systemName: "checkmark.circle.fill")
                                .foregroundStyle(.blue)
                        }
                    }
                    .padding()
                    .background(
                        s.profile.activityLevel == level ?
                            Color.blue.opacity(0.1) : Color.gray.opacity(0.05),
                        in: RoundedRectangle(cornerRadius: 12)
                    )
                }
            }

            Spacer()
            nextButton
        }
        .padding()
    }

    private var goalStep: some View {
        @Bindable var s = state
        return VStack(spacing: 24) {
            Text("Your Goal")
                .font(.title2)
                .fontWeight(.bold)

            ForEach(FitnessGoal.allCases, id: \.self) { goal in
                Button {
                    s.profile.goal = goal
                } label: {
                    HStack {
                        Text(goal.display)
                            .foregroundStyle(.primary)
                        Spacer()
                        if s.profile.goal == goal {
                            Image(systemName: "checkmark.circle.fill")
                                .foregroundStyle(.blue)
                        }
                    }
                    .padding()
                    .background(
                        s.profile.goal == goal ?
                            Color.blue.opacity(0.1) : Color.gray.opacity(0.05),
                        in: RoundedRectangle(cornerRadius: 12)
                    )
                }
            }

            Spacer()
            nextButton
        }
        .padding()
    }

    private var goalsReviewStep: some View {
        VStack(spacing: 24) {
            Text("Your Plan")
                .font(.title2)
                .fontWeight(.bold)

            VStack(spacing: 12) {
                goalRow("Daily Calories", value: "\(state.profile.dailyCalorieGoal) kcal")
                goalRow("Protein", value: "\(state.profile.proteinGoal)g")
                goalRow("Carbs", value: "\(state.profile.carbsGoal)g")
                goalRow("Fat", value: "\(state.profile.fatGoal)g")
                goalRow("Water", value: "\(state.profile.waterGoalMl)ml")
                goalRow("TDEE", value: "\(Int(state.profile.tdee)) kcal")
            }
            .padding()
            .background(.regularMaterial, in: RoundedRectangle(cornerRadius: 12))

            Spacer()

            Button {
                state.profile.onboardingCompleted = true
                state.saveProfile()
            } label: {
                Text("Get Started")
                    .fontWeight(.bold)
                    .frame(maxWidth: .infinity)
                    .padding()
                    .background(Color.blue, in: RoundedRectangle(cornerRadius: 14))
                    .foregroundStyle(.white)
            }
        }
        .padding()
        .onAppear {
            state.profile.calculateGoals()
        }
    }

    private func goalRow(_ label: String, value: String) -> some View {
        HStack {
            Text(label)
                .foregroundStyle(.secondary)
            Spacer()
            Text(value)
                .fontWeight(.semibold)
        }
    }

    private var nextButton: some View {
        Button {
            step += 1
        } label: {
            Text("Continue")
                .fontWeight(.semibold)
                .frame(maxWidth: .infinity)
                .padding()
                .background(Color.blue, in: RoundedRectangle(cornerRadius: 14))
                .foregroundStyle(.white)
        }
    }
}
