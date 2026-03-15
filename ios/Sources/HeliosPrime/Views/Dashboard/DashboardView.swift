import SwiftUI

struct DashboardView: View {
    @Environment(AppState.self) private var state

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 20) {
                    greetingSection
                    calorieCard
                    macrosCard
                    waterCard
                    energyCard
                    quickActions
                }
                .padding()
            }
            .navigationTitle("Dashboard")
            .background(Color(.systemGroupedBackground))
        }
    }

    // MARK: - Greeting

    private var greetingSection: some View {
        HStack {
            VStack(alignment: .leading, spacing: 4) {
                Text(greetingText)
                    .font(.title2)
                    .fontWeight(.bold)
                if !state.profile.name.isEmpty {
                    Text(state.profile.name)
                        .font(.headline)
                        .foregroundStyle(.secondary)
                }
            }
            Spacer()
            Image(systemName: "person.circle.fill")
                .font(.largeTitle)
                .foregroundStyle(.blue)
        }
    }

    private var greetingText: String {
        let hour = Calendar.current.component(.hour, from: Date())
        switch hour {
        case 5..<12: return "Good Morning"
        case 12..<17: return "Good Afternoon"
        case 17..<21: return "Good Evening"
        default: return "Good Night"
        }
    }

    // MARK: - Calorie Card

    private var calorieCard: some View {
        VStack(spacing: 16) {
            CalorieRingView(
                consumed: state.dailyCalories,
                goal: state.profile.dailyCalorieGoal,
                lineWidth: 20
            )
            .frame(height: 200)

            HStack(spacing: 0) {
                NutrientBar(value: Double(state.dailyCalories), unit: "kcal", label: "Eaten", color: .orange)
                NutrientBar(value: Double(max(state.profile.dailyCalorieGoal - state.dailyCalories, 0)), unit: "kcal", label: "Remaining", color: .green)
            }
        }
        .padding()
        .background(.regularMaterial, in: RoundedRectangle(cornerRadius: 16))
    }

    // MARK: - Macros Card

    private var macrosCard: some View {
        VStack(spacing: 12) {
            Text("Macros")
                .font(.headline)
                .frame(maxWidth: .infinity, alignment: .leading)

            MacroBarView(label: "Protein", current: state.dailyProtein, goal: state.profile.proteinGoal, color: .blue)
            MacroBarView(label: "Carbs", current: state.dailyCarbs, goal: state.profile.carbsGoal, color: .orange)
            MacroBarView(label: "Fat", current: state.dailyFat, goal: state.profile.fatGoal, color: .purple)
        }
        .padding()
        .background(.regularMaterial, in: RoundedRectangle(cornerRadius: 16))
    }

    // MARK: - Water Card

    private var waterCard: some View {
        VStack(spacing: 12) {
            HStack {
                Image(systemName: "drop.fill")
                    .foregroundStyle(.cyan)
                Text("Water")
                    .font(.headline)
                Spacer()
                Text("\(state.waterForToday)ml / \(state.profile.waterGoalMl)ml")
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
            }

            GeometryReader { geo in
                ZStack(alignment: .leading) {
                    RoundedRectangle(cornerRadius: 6)
                        .fill(Color.cyan.opacity(0.2))
                    RoundedRectangle(cornerRadius: 6)
                        .fill(Color.cyan)
                        .frame(width: geo.size.width * state.waterProgress)
                        .animation(.easeInOut, value: state.waterProgress)
                }
            }
            .frame(height: 12)

            HStack(spacing: 12) {
                waterButton(ml: 150)
                waterButton(ml: 250)
                waterButton(ml: 500)
            }
        }
        .padding()
        .background(.regularMaterial, in: RoundedRectangle(cornerRadius: 16))
    }

    private func waterButton(ml: Int) -> some View {
        Button {
            state.addWater(ml)
        } label: {
            Text("+\(ml)ml")
                .font(.caption)
                .fontWeight(.medium)
                .padding(.horizontal, 16)
                .padding(.vertical, 8)
                .background(Color.cyan.opacity(0.15), in: Capsule())
        }
        .frame(maxWidth: .infinity)
    }

    // MARK: - Energy Card

    private var energyCard: some View {
        VStack(spacing: 12) {
            HStack {
                Image(systemName: "bolt.fill")
                    .foregroundStyle(.yellow)
                Text("Energy Level")
                    .font(.headline)
                Spacer()
            }

            HStack(spacing: 16) {
                ForEach(1...5, id: \.self) { level in
                    Button {
                        state.setEnergyLevel(level)
                    } label: {
                        Text(energyEmoji(level))
                            .font(.title2)
                            .padding(8)
                            .background(
                                state.todayEnergyLevel == level ?
                                    Color.yellow.opacity(0.3) : Color.clear,
                                in: Circle()
                            )
                    }
                }
            }
        }
        .padding()
        .background(.regularMaterial, in: RoundedRectangle(cornerRadius: 16))
    }

    private func energyEmoji(_ level: Int) -> String {
        switch level {
        case 1: return "\u{1F634}" // sleepy
        case 2: return "\u{1F615}" // confused
        case 3: return "\u{1F610}" // neutral
        case 4: return "\u{1F60A}" // happy
        case 5: return "\u{1F525}" // fire
        default: return "\u{1F610}"
        }
    }

    // MARK: - Quick Actions

    private var quickActions: some View {
        HStack(spacing: 12) {
            NavigationLink {
                // Navigate to food log tab handled by parent
            } label: {
                quickActionCard(icon: "fork.knife", title: "Log Food", color: .green)
            }

            NavigationLink {
                // Navigate to workout tab handled by parent
            } label: {
                quickActionCard(icon: "figure.run", title: "Workout", color: .blue)
            }
        }
    }

    private func quickActionCard(icon: String, title: String, color: Color) -> some View {
        VStack(spacing: 8) {
            Image(systemName: icon)
                .font(.title2)
                .foregroundStyle(color)
            Text(title)
                .font(.caption)
                .fontWeight(.medium)
                .foregroundStyle(.primary)
        }
        .frame(maxWidth: .infinity)
        .padding()
        .background(.regularMaterial, in: RoundedRectangle(cornerRadius: 12))
    }
}
