import SwiftUI

struct FoodLogView: View {
    @Environment(AppState.self) private var state
    @State private var showAddFood = false
    @State private var selectedMealType: MealType = .breakfast

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 16) {
                    datePicker
                    dailySummary

                    ForEach(MealType.allCases, id: \.self) { meal in
                        mealSection(meal)
                    }
                }
                .padding()
            }
            .navigationTitle("Food Log")
            .background(Color(.systemGroupedBackground))
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button {
                        selectedMealType = currentMealType
                        showAddFood = true
                    } label: {
                        Image(systemName: "plus.circle.fill")
                            .font(.title3)
                    }
                }
            }
            .sheet(isPresented: $showAddFood) {
                AddFoodSheet(mealType: $selectedMealType)
            }
        }
    }

    private var currentMealType: MealType {
        let hour = Calendar.current.component(.hour, from: Date())
        switch hour {
        case 5..<11: return .breakfast
        case 11..<15: return .lunch
        case 15..<20: return .dinner
        default: return .snacks
        }
    }

    // MARK: - Date Picker

    @ViewBuilder
    private var datePicker: some View {
        @Bindable var s = state
        HStack {
            Button {
                s.selectedDate = Calendar.current.date(byAdding: .day, value: -1, to: s.selectedDate) ?? s.selectedDate
            } label: {
                Image(systemName: "chevron.left")
            }

            Spacer()

            DatePicker("", selection: $s.selectedDate, displayedComponents: .date)
                .labelsHidden()

            Spacer()

            Button {
                s.selectedDate = Calendar.current.date(byAdding: .day, value: 1, to: s.selectedDate) ?? s.selectedDate
            } label: {
                Image(systemName: "chevron.right")
            }
        }
        .padding()
        .background(.regularMaterial, in: RoundedRectangle(cornerRadius: 12))
    }

    // MARK: - Daily Summary

    private var dailySummary: some View {
        HStack(spacing: 0) {
            NutrientBar(value: Double(state.dailyCalories), unit: "kcal", label: "Calories", color: .orange)
            NutrientBar(value: state.dailyProtein, unit: "g", label: "Protein", color: .blue)
            NutrientBar(value: state.dailyCarbs, unit: "g", label: "Carbs", color: .yellow)
            NutrientBar(value: state.dailyFat, unit: "g", label: "Fat", color: .purple)
        }
        .padding()
        .background(.regularMaterial, in: RoundedRectangle(cornerRadius: 12))
    }

    // MARK: - Meal Section

    private func mealSection(_ meal: MealType) -> some View {
        let entries = state.foodForMeal(meal)
        let totalCal = entries.reduce(0) { $0 + $1.calories }

        return VStack(alignment: .leading, spacing: 8) {
            HStack {
                Image(systemName: meal.icon)
                    .foregroundStyle(mealColor(meal))
                Text(meal.display)
                    .font(.headline)
                Spacer()
                Text("\(totalCal) kcal")
                    .font(.subheadline)
                    .foregroundStyle(.secondary)

                Button {
                    selectedMealType = meal
                    showAddFood = true
                } label: {
                    Image(systemName: "plus")
                        .font(.caption)
                        .padding(6)
                        .background(Color.blue.opacity(0.1), in: Circle())
                }
            }

            if entries.isEmpty {
                Text("No entries yet")
                    .font(.caption)
                    .foregroundStyle(.tertiary)
                    .padding(.vertical, 4)
            } else {
                ForEach(entries) { entry in
                    foodRow(entry)
                }
            }
        }
        .padding()
        .background(.regularMaterial, in: RoundedRectangle(cornerRadius: 12))
    }

    private func foodRow(_ entry: FoodEntry) -> some View {
        HStack {
            VStack(alignment: .leading, spacing: 2) {
                Text(entry.name)
                    .font(.subheadline)
                    .fontWeight(.medium)
                Text(entry.servingSize)
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }
            Spacer()

            VStack(alignment: .trailing, spacing: 2) {
                Text("\(entry.calories) kcal")
                    .font(.subheadline)
                    .fontWeight(.medium)
                HStack(spacing: 8) {
                    Text("P:\(Int(entry.protein))g")
                    Text("C:\(Int(entry.carbs))g")
                    Text("F:\(Int(entry.fat))g")
                }
                .font(.caption2)
                .foregroundStyle(.secondary)
            }

            Button(role: .destructive) {
                state.deleteFoodEntry(entry)
            } label: {
                Image(systemName: "xmark.circle.fill")
                    .foregroundStyle(.red.opacity(0.6))
                    .font(.caption)
            }
        }
        .padding(.vertical, 4)
    }

    private func mealColor(_ meal: MealType) -> Color {
        switch meal {
        case .breakfast: return .orange
        case .lunch: return .yellow
        case .dinner: return .indigo
        case .snacks: return .green
        }
    }
}
