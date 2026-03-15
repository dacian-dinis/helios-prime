import SwiftUI

struct ProgressTabView: View {
    @Environment(AppState.self) private var state
    @State private var newWeight = ""
    @State private var trendDays = 30
    @State private var showMeasurements = false
    @State private var showHealthScore = false
    @State private var healthScore: HealthScore? = nil
    @State private var isLoadingScore = false

    // Measurement fields
    @State private var chest = ""
    @State private var waist = ""
    @State private var hips = ""
    @State private var leftArm = ""
    @State private var rightArm = ""
    @State private var leftThigh = ""
    @State private var rightThigh = ""
    @State private var neck = ""

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 20) {
                    weightSection
                    weightChartSection
                    measurementsSection
                    nutritionTrendsSection
                    workoutStatsSection
                    healthScoreSection
                }
                .padding()
            }
            .navigationTitle("Progress")
            .background(Color(.systemGroupedBackground))
        }
    }

    // MARK: - Weight Section

    private var weightSection: some View {
        VStack(spacing: 12) {
            HStack {
                Image(systemName: "scalemass.fill")
                    .foregroundStyle(.blue)
                Text("Weight")
                    .font(.headline)
                Spacer()
                if let latest = state.latestWeight {
                    Text(String(format: "%.1f kg", latest))
                        .font(.title3)
                        .fontWeight(.bold)
                }
            }

            HStack {
                TextField("Weight (kg)", text: $newWeight)
                    .keyboardType(.decimalPad)
                    .textFieldStyle(.roundedBorder)

                Button("Log") {
                    if let kg = Double(newWeight) {
                        state.addWeight(kg)
                        newWeight = ""
                    }
                }
                .buttonStyle(.borderedProminent)
                .disabled(newWeight.isEmpty)
            }
        }
        .padding()
        .background(.regularMaterial, in: RoundedRectangle(cornerRadius: 12))
    }

    // MARK: - Weight Chart

    private var weightChartSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Text("Trend")
                    .font(.headline)
                Spacer()
                Picker("Period", selection: $trendDays) {
                    Text("7d").tag(7)
                    Text("30d").tag(30)
                    Text("90d").tag(90)
                }
                .pickerStyle(.segmented)
                .frame(width: 180)
            }

            let trend = state.weightTrend(days: trendDays)

            if trend.count >= 2 {
                WeightChartView(entries: trend)
                    .frame(height: 180)
            } else {
                Text("Need at least 2 entries to show chart")
                    .font(.caption)
                    .foregroundStyle(.secondary)
                    .frame(height: 100)
                    .frame(maxWidth: .infinity)
            }
        }
        .padding()
        .background(.regularMaterial, in: RoundedRectangle(cornerRadius: 12))
    }

    // MARK: - Measurements

    private var measurementsSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Image(systemName: "ruler.fill")
                    .foregroundStyle(.orange)
                Text("Body Measurements")
                    .font(.headline)
                Spacer()
                Button(showMeasurements ? "Hide" : "Log") {
                    showMeasurements.toggle()
                }
                .font(.caption)
            }

            if let latest = state.latestMeasurement {
                LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 8) {
                    measurementDisplay("Chest", value: latest.chest)
                    measurementDisplay("Waist", value: latest.waist)
                    measurementDisplay("Hips", value: latest.hips)
                    measurementDisplay("L. Arm", value: latest.leftArm)
                    measurementDisplay("R. Arm", value: latest.rightArm)
                    measurementDisplay("L. Thigh", value: latest.leftThigh)
                    measurementDisplay("R. Thigh", value: latest.rightThigh)
                    measurementDisplay("Neck", value: latest.neck)
                }
            }

            if showMeasurements {
                VStack(spacing: 8) {
                    HStack(spacing: 8) {
                        measurementField("Chest", text: $chest)
                        measurementField("Waist", text: $waist)
                    }
                    HStack(spacing: 8) {
                        measurementField("Hips", text: $hips)
                        measurementField("Neck", text: $neck)
                    }
                    HStack(spacing: 8) {
                        measurementField("L. Arm", text: $leftArm)
                        measurementField("R. Arm", text: $rightArm)
                    }
                    HStack(spacing: 8) {
                        measurementField("L. Thigh", text: $leftThigh)
                        measurementField("R. Thigh", text: $rightThigh)
                    }

                    Button("Save Measurements") {
                        saveMeasurements()
                    }
                    .buttonStyle(.borderedProminent)
                }
            }
        }
        .padding()
        .background(.regularMaterial, in: RoundedRectangle(cornerRadius: 12))
    }

    private func measurementDisplay(_ label: String, value: Double?) -> some View {
        HStack {
            Text(label)
                .font(.caption)
                .foregroundStyle(.secondary)
            Spacer()
            Text(value.map { String(format: "%.1f cm", $0) } ?? "-")
                .font(.caption)
                .fontWeight(.medium)
        }
    }

    private func measurementField(_ label: String, text: Binding<String>) -> some View {
        VStack(alignment: .leading, spacing: 2) {
            Text(label)
                .font(.caption2)
                .foregroundStyle(.secondary)
            TextField("cm", text: text)
                .keyboardType(.decimalPad)
                .textFieldStyle(.roundedBorder)
                .font(.caption)
        }
    }

    // MARK: - Nutrition Trends

    private var nutritionTrendsSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Image(systemName: "chart.bar.fill")
                    .foregroundStyle(.green)
                Text("7-Day Averages")
                    .font(.headline)
            }

            let last7 = last7DayAverages

            HStack(spacing: 0) {
                NutrientBar(value: last7.calories, unit: "kcal", label: "Avg Cal", color: .orange)
                NutrientBar(value: last7.protein, unit: "g", label: "Avg Protein", color: .blue)
                NutrientBar(value: last7.carbs, unit: "g", label: "Avg Carbs", color: .yellow)
                NutrientBar(value: last7.fat, unit: "g", label: "Avg Fat", color: .purple)
            }
        }
        .padding()
        .background(.regularMaterial, in: RoundedRectangle(cornerRadius: 12))
    }

    private var last7DayAverages: (calories: Double, protein: Double, carbs: Double, fat: Double) {
        let cal = Calendar.current
        let cutoff = cal.date(byAdding: .day, value: -7, to: Date()) ?? Date()
        let recent = state.foodEntries.filter { $0.date >= cutoff }
        let days = max(1, Set(recent.map { $0.dateKey }).count)

        return (
            calories: Double(recent.reduce(0) { $0 + $1.calories }) / Double(days),
            protein: recent.reduce(0) { $0 + $1.protein } / Double(days),
            carbs: recent.reduce(0) { $0 + $1.carbs } / Double(days),
            fat: recent.reduce(0) { $0 + $1.fat } / Double(days)
        )
    }

    // MARK: - Workout Stats

    private var workoutStatsSection: some View {
        HStack(spacing: 12) {
            statCard(value: "\(state.workoutsThisWeek)", label: "This Week", color: .blue)
            statCard(value: "\(state.workoutSessions.count)", label: "Total", color: .green)
            statCard(value: String(format: "%.0f kg", state.totalWorkoutVolume), label: "Volume", color: .purple)
        }
    }

    private func statCard(value: String, label: String, color: Color) -> some View {
        VStack(spacing: 4) {
            Text(value)
                .font(.title3)
                .fontWeight(.bold)
            Text(label)
                .font(.caption2)
                .foregroundStyle(.secondary)
        }
        .frame(maxWidth: .infinity)
        .padding()
        .background(color.opacity(0.1), in: RoundedRectangle(cornerRadius: 12))
    }

    // MARK: - Health Score

    private var healthScoreSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Image(systemName: "heart.fill")
                    .foregroundStyle(.red)
                Text("AI Health Score")
                    .font(.headline)
                Spacer()

                Button {
                    fetchHealthScore()
                } label: {
                    HStack {
                        if isLoadingScore { ProgressView().controlSize(.small) }
                        Text("Analyze")
                    }
                    .font(.caption)
                    .fontWeight(.semibold)
                }
                .disabled(isLoadingScore)
            }

            if let score = healthScore {
                VStack(spacing: 12) {
                    HStack {
                        Text("\(score.score)")
                            .font(.system(size: 48, weight: .bold, design: .rounded))
                        Text(score.grade)
                            .font(.title)
                            .fontWeight(.bold)
                            .foregroundStyle(gradeColor(score.grade))
                    }

                    Text(score.summary)
                        .font(.subheadline)
                        .foregroundStyle(.secondary)

                    VStack(alignment: .leading, spacing: 6) {
                        ForEach(score.tips, id: \.self) { tip in
                            HStack(alignment: .top, spacing: 6) {
                                Image(systemName: "lightbulb.fill")
                                    .font(.caption)
                                    .foregroundStyle(.yellow)
                                Text(tip)
                                    .font(.caption)
                            }
                        }
                    }
                }
                .padding()
                .background(Color.red.opacity(0.05), in: RoundedRectangle(cornerRadius: 12))
            }
        }
        .padding()
        .background(.regularMaterial, in: RoundedRectangle(cornerRadius: 12))
    }

    private func gradeColor(_ grade: String) -> Color {
        switch grade {
        case "A+", "A": return .green
        case "B": return .blue
        case "C": return .orange
        default: return .red
        }
    }

    // MARK: - Actions

    private func saveMeasurements() {
        let m = BodyMeasurement(
            date: Date(),
            chest: Double(chest),
            waist: Double(waist),
            hips: Double(hips),
            leftArm: Double(leftArm),
            rightArm: Double(rightArm),
            leftThigh: Double(leftThigh),
            rightThigh: Double(rightThigh),
            neck: Double(neck)
        )
        state.saveMeasurement(m)
        showMeasurements = false
    }

    private func fetchHealthScore() {
        isLoadingScore = true
        let avg = last7DayAverages
        let calAdherence = state.profile.dailyCalorieGoal > 0 ?
            avg.calories / Double(state.profile.dailyCalorieGoal) : 0
        let protAdherence = state.profile.proteinGoal > 0 ?
            avg.protein / Double(state.profile.proteinGoal) : 0
        let waterAdh = state.profile.waterGoalMl > 0 ?
            Double(state.waterForToday) / Double(state.profile.waterGoalMl) : 0

        Task {
            do {
                let score = try await AIService.shared.getHealthScore(
                    calorieAdherence: calAdherence,
                    proteinAdherence: protAdherence,
                    workoutsThisWeek: state.workoutsThisWeek,
                    waterAdherence: waterAdh,
                    avgEnergy: Double(state.todayEnergyLevel ?? 3),
                    apiKey: state.profile.apiKey,
                    provider: state.profile.aiProvider
                )
                await MainActor.run {
                    healthScore = score
                    isLoadingScore = false
                }
            } catch {
                await MainActor.run {
                    isLoadingScore = false
                }
            }
        }
    }
}

// MARK: - Weight Chart (SVG-style using SwiftUI)

struct WeightChartView: View {
    let entries: [WeightEntry]

    var body: some View {
        GeometryReader { geo in
            let minW = entries.map(\.weightKg).min() ?? 0
            let maxW = entries.map(\.weightKg).max() ?? 100
            let range = max(maxW - minW, 1)
            let width = geo.size.width
            let height = geo.size.height

            ZStack {
                // Grid lines
                ForEach(0..<5) { i in
                    let y = height * CGFloat(i) / 4
                    Path { path in
                        path.move(to: CGPoint(x: 0, y: y))
                        path.addLine(to: CGPoint(x: width, y: y))
                    }
                    .stroke(Color.gray.opacity(0.1), lineWidth: 1)
                }

                // Area fill
                Path { path in
                    guard entries.count >= 2 else { return }
                    for (i, entry) in entries.enumerated() {
                        let x = width * CGFloat(i) / CGFloat(entries.count - 1)
                        let y = height - height * CGFloat(entry.weightKg - minW) / CGFloat(range)
                        if i == 0 { path.move(to: CGPoint(x: x, y: y)) }
                        else { path.addLine(to: CGPoint(x: x, y: y)) }
                    }
                    path.addLine(to: CGPoint(x: width, y: height))
                    path.addLine(to: CGPoint(x: 0, y: height))
                    path.closeSubpath()
                }
                .fill(
                    LinearGradient(
                        colors: [.blue.opacity(0.3), .blue.opacity(0.05)],
                        startPoint: .top,
                        endPoint: .bottom
                    )
                )

                // Line
                Path { path in
                    guard entries.count >= 2 else { return }
                    for (i, entry) in entries.enumerated() {
                        let x = width * CGFloat(i) / CGFloat(entries.count - 1)
                        let y = height - height * CGFloat(entry.weightKg - minW) / CGFloat(range)
                        if i == 0 { path.move(to: CGPoint(x: x, y: y)) }
                        else { path.addLine(to: CGPoint(x: x, y: y)) }
                    }
                }
                .stroke(Color.blue, lineWidth: 2)

                // Dots
                ForEach(Array(entries.enumerated()), id: \.offset) { i, entry in
                    let x = width * CGFloat(i) / CGFloat(max(entries.count - 1, 1))
                    let y = height - height * CGFloat(entry.weightKg - minW) / CGFloat(range)
                    Circle()
                        .fill(Color.blue)
                        .frame(width: 6, height: 6)
                        .position(x: x, y: y)
                }

                // Labels
                VStack {
                    HStack {
                        Text(String(format: "%.1f", maxW))
                            .font(.caption2)
                            .foregroundStyle(.secondary)
                        Spacer()
                    }
                    Spacer()
                    HStack {
                        Text(String(format: "%.1f", minW))
                            .font(.caption2)
                            .foregroundStyle(.secondary)
                        Spacer()
                    }
                }
            }
        }
    }
}
