import SwiftUI

struct AddFoodSheet: View {
    @Environment(AppState.self) private var state
    @Environment(\.dismiss) private var dismiss
    @Binding var mealType: MealType

    @State private var mode: AddFoodMode = .manual
    @State private var foodName = ""
    @State private var servingSize = "1 serving"
    @State private var calories = ""
    @State private var protein = ""
    @State private var carbs = ""
    @State private var fat = ""

    // AI mode
    @State private var aiDescription = ""
    @State private var aiResults: [NutritionInfo] = []
    @State private var isAnalyzing = false
    @State private var aiError: String? = nil

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 20) {
                    modePicker
                    mealTypePicker

                    switch mode {
                    case .manual:
                        manualForm
                    case .ai:
                        aiForm
                    case .recent:
                        recentFoodsList
                    }
                }
                .padding()
            }
            .navigationTitle("Add Food")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarLeading) {
                    Button("Cancel") { dismiss() }
                }
                ToolbarItem(placement: .topBarTrailing) {
                    if mode == .manual {
                        Button("Save") { saveManualEntry() }
                            .fontWeight(.semibold)
                            .disabled(foodName.isEmpty || calories.isEmpty)
                    }
                }
            }
        }
    }

    // MARK: - Mode Picker

    private var modePicker: some View {
        Picker("Input Mode", selection: $mode) {
            Text("Manual").tag(AddFoodMode.manual)
            Text("AI Analyze").tag(AddFoodMode.ai)
            Text("Recent").tag(AddFoodMode.recent)
        }
        .pickerStyle(.segmented)
    }

    // MARK: - Meal Type Picker

    private var mealTypePicker: some View {
        HStack(spacing: 8) {
            ForEach(MealType.allCases, id: \.self) { meal in
                Button {
                    mealType = meal
                } label: {
                    VStack(spacing: 4) {
                        Image(systemName: meal.icon)
                            .font(.caption)
                        Text(meal.display)
                            .font(.caption2)
                    }
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 8)
                    .background(
                        mealType == meal ? Color.blue.opacity(0.15) : Color.clear,
                        in: RoundedRectangle(cornerRadius: 8)
                    )
                    .foregroundStyle(mealType == meal ? .blue : .secondary)
                }
            }
        }
    }

    // MARK: - Manual Form

    private var manualForm: some View {
        VStack(spacing: 16) {
            formField("Food Name", text: $foodName, placeholder: "e.g. Grilled Chicken Breast")
            formField("Serving Size", text: $servingSize, placeholder: "e.g. 200g")
            formField("Calories", text: $calories, placeholder: "0", keyboard: .numberPad)

            HStack(spacing: 12) {
                formField("Protein (g)", text: $protein, placeholder: "0", keyboard: .decimalPad)
                formField("Carbs (g)", text: $carbs, placeholder: "0", keyboard: .decimalPad)
                formField("Fat (g)", text: $fat, placeholder: "0", keyboard: .decimalPad)
            }
        }
    }

    private func formField(_ label: String, text: Binding<String>, placeholder: String, keyboard: UIKeyboardType = .default) -> some View {
        VStack(alignment: .leading, spacing: 4) {
            Text(label)
                .font(.caption)
                .foregroundStyle(.secondary)
            TextField(placeholder, text: text)
                .keyboardType(keyboard)
                .textFieldStyle(.roundedBorder)
        }
    }

    // MARK: - AI Form

    private var aiForm: some View {
        VStack(spacing: 16) {
            VStack(alignment: .leading, spacing: 8) {
                Text("Describe your food")
                    .font(.headline)
                TextEditor(text: $aiDescription)
                    .frame(minHeight: 80)
                    .overlay(
                        RoundedRectangle(cornerRadius: 8)
                            .stroke(Color.gray.opacity(0.3))
                    )

                Button {
                    analyzeWithAI()
                } label: {
                    HStack {
                        if isAnalyzing {
                            ProgressView()
                                .tint(.white)
                        }
                        Text(isAnalyzing ? "Analyzing..." : "Analyze with AI")
                    }
                    .frame(maxWidth: .infinity)
                    .padding()
                    .background(Color.blue, in: RoundedRectangle(cornerRadius: 12))
                    .foregroundStyle(.white)
                    .fontWeight(.semibold)
                }
                .disabled(aiDescription.isEmpty || isAnalyzing)
            }

            if let error = aiError {
                Text(error)
                    .font(.caption)
                    .foregroundStyle(.red)
            }

            ForEach(Array(aiResults.enumerated()), id: \.offset) { _, item in
                aiResultCard(item)
            }
        }
    }

    private func aiResultCard(_ info: NutritionInfo) -> some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                VStack(alignment: .leading) {
                    Text(info.name)
                        .font(.subheadline)
                        .fontWeight(.medium)
                    Text(info.servingSize)
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }
                Spacer()
                Text("\(info.calories) kcal")
                    .font(.headline)
            }

            HStack(spacing: 16) {
                macroLabel("P", value: info.protein, color: .blue)
                macroLabel("C", value: info.carbs, color: .orange)
                macroLabel("F", value: info.fat, color: .purple)
            }

            Button("Add to \(mealType.display)") {
                addAIResult(info)
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

    private func macroLabel(_ prefix: String, value: Double, color: Color) -> some View {
        HStack(spacing: 2) {
            Text(prefix)
                .font(.caption2)
                .fontWeight(.bold)
                .foregroundStyle(color)
            Text("\(Int(value))g")
                .font(.caption)
        }
    }

    // MARK: - Recent Foods

    private var recentFoodsList: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("Recent Foods")
                .font(.headline)

            if state.recentFoods.isEmpty {
                Text("No recent foods yet")
                    .foregroundStyle(.secondary)
                    .padding()
            }

            ForEach(state.recentFoods) { entry in
                Button {
                    addRecentFood(entry)
                } label: {
                    HStack {
                        VStack(alignment: .leading) {
                            Text(entry.name)
                                .font(.subheadline)
                                .foregroundStyle(.primary)
                            Text(entry.servingSize)
                                .font(.caption)
                                .foregroundStyle(.secondary)
                        }
                        Spacer()
                        Text("\(entry.calories) kcal")
                            .font(.subheadline)
                            .foregroundStyle(.secondary)
                        Image(systemName: "plus.circle")
                            .foregroundStyle(.blue)
                    }
                    .padding(.vertical, 4)
                }
            }
        }
    }

    // MARK: - Actions

    private func saveManualEntry() {
        let entry = FoodEntry(
            name: foodName,
            mealType: mealType,
            calories: Int(calories) ?? 0,
            protein: Double(protein) ?? 0,
            carbs: Double(carbs) ?? 0,
            fat: Double(fat) ?? 0,
            servingSize: servingSize,
            date: state.selectedDate
        )
        state.addFoodEntry(entry)
        dismiss()
    }

    private func analyzeWithAI() {
        isAnalyzing = true
        aiError = nil

        Task {
            do {
                let results = try await AIService.shared.analyzeFood(
                    description: aiDescription,
                    apiKey: state.profile.apiKey,
                    provider: state.profile.aiProvider
                )
                await MainActor.run {
                    aiResults = results
                    isAnalyzing = false
                }
            } catch {
                await MainActor.run {
                    aiError = error.localizedDescription
                    isAnalyzing = false
                }
            }
        }
    }

    private func addAIResult(_ info: NutritionInfo) {
        let entry = FoodEntry(
            name: info.name,
            mealType: mealType,
            calories: info.calories,
            protein: info.protein,
            carbs: info.carbs,
            fat: info.fat,
            servingSize: info.servingSize,
            date: state.selectedDate
        )
        state.addFoodEntry(entry)
        dismiss()
    }

    private func addRecentFood(_ existing: FoodEntry) {
        let entry = FoodEntry(
            name: existing.name,
            mealType: mealType,
            calories: existing.calories,
            protein: existing.protein,
            carbs: existing.carbs,
            fat: existing.fat,
            servingSize: existing.servingSize,
            date: state.selectedDate
        )
        state.addFoodEntry(entry)
        dismiss()
    }
}

enum AddFoodMode {
    case manual, ai, recent
}
