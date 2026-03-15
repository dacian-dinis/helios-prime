import Foundation

// MARK: - Food Entry

struct FoodEntry: Codable, Identifiable, Sendable {
    var id: UUID = UUID()
    var name: String
    var mealType: MealType
    var calories: Int
    var protein: Double
    var carbs: Double
    var fat: Double
    var servingSize: String
    var date: Date
    var timestamp: Date = Date()

    var dateKey: String {
        let formatter = DateFormatter()
        formatter.dateFormat = "yyyy-MM-dd"
        return formatter.string(from: date)
    }
}

// MARK: - Meal Type

enum MealType: String, Codable, CaseIterable, Sendable {
    case breakfast, lunch, dinner, snacks

    var display: String { rawValue.capitalized }

    var icon: String {
        switch self {
        case .breakfast: return "sunrise.fill"
        case .lunch: return "sun.max.fill"
        case .dinner: return "moon.fill"
        case .snacks: return "leaf.fill"
        }
    }

    var color: String {
        switch self {
        case .breakfast: return "orange"
        case .lunch: return "yellow"
        case .dinner: return "indigo"
        case .snacks: return "green"
        }
    }
}

// MARK: - Nutrition Info

struct NutritionInfo: Codable, Sendable {
    var name: String = ""
    var servingSize: String = ""
    var calories: Int = 0
    var protein: Double = 0
    var carbs: Double = 0
    var fat: Double = 0
}

// MARK: - Water Entry

struct WaterEntry: Codable, Identifiable, Sendable {
    var id: UUID = UUID()
    var amountMl: Int
    var date: Date
    var timestamp: Date = Date()

    var dateKey: String {
        let formatter = DateFormatter()
        formatter.dateFormat = "yyyy-MM-dd"
        return formatter.string(from: date)
    }
}

// MARK: - Daily Note

struct DailyNote: Codable, Identifiable, Sendable {
    var id: UUID = UUID()
    var date: Date
    var energyLevel: Int // 1-5
    var note: String

    var dateKey: String {
        let formatter = DateFormatter()
        formatter.dateFormat = "yyyy-MM-dd"
        return formatter.string(from: date)
    }
}
