import Foundation

// MARK: - Fasting Preset

struct FastingPreset: Codable, Identifiable, Sendable, Hashable {
    var id: String { name }
    var name: String
    var fastingHours: Int
    var eatingHours: Int
    var description: String

    static let presets: [FastingPreset] = [
        FastingPreset(name: "14:10", fastingHours: 14, eatingHours: 10, description: "Beginner friendly"),
        FastingPreset(name: "16:8", fastingHours: 16, eatingHours: 8, description: "Most popular protocol"),
        FastingPreset(name: "18:6", fastingHours: 18, eatingHours: 6, description: "Intermediate fasting"),
        FastingPreset(name: "20:4", fastingHours: 20, eatingHours: 4, description: "Warrior diet"),
        FastingPreset(name: "OMAD", fastingHours: 23, eatingHours: 1, description: "One meal a day"),
    ]
}

// MARK: - Fasting Session

struct FastingSession: Codable, Identifiable, Sendable {
    var id: UUID = UUID()
    var presetName: String
    var targetHours: Int
    var startedAt: Date
    var completedAt: Date?
    var status: FastingStatus = .active

    var elapsedHours: Double {
        let end = completedAt ?? Date()
        return end.timeIntervalSince(startedAt) / 3600
    }

    var progress: Double {
        min(elapsedHours / Double(targetHours), 1.0)
    }

    var currentZone: FastingZone {
        FastingZone.zone(for: elapsedHours)
    }

    var dateKey: String {
        let formatter = DateFormatter()
        formatter.dateFormat = "yyyy-MM-dd"
        return formatter.string(from: startedAt)
    }
}

enum FastingStatus: String, Codable, Sendable {
    case active, completed, cancelled
}

// MARK: - Fasting Zones

enum FastingZone: String, Sendable {
    case fed = "Fed State"
    case earlyFasting = "Early Fasting"
    case fatBurning = "Fat Burning"
    case ketosis = "Ketosis"
    case deepKetosis = "Deep Ketosis"

    var description: String {
        switch self {
        case .fed: return "Blood sugar elevated, insulin active. Body using glucose for energy."
        case .earlyFasting: return "Blood sugar normalizing. Body starts tapping glycogen stores."
        case .fatBurning: return "Glycogen depleted. Body shifts to burning fat for fuel."
        case .ketosis: return "Liver producing ketones. Enhanced fat oxidation and mental clarity."
        case .deepKetosis: return "Peak autophagy. Cellular repair and regeneration activated."
        }
    }

    var color: String {
        switch self {
        case .fed: return "green"
        case .earlyFasting: return "yellow"
        case .fatBurning: return "orange"
        case .ketosis: return "red"
        case .deepKetosis: return "purple"
        }
    }

    static func zone(for hours: Double) -> FastingZone {
        switch hours {
        case ..<4: return .fed
        case 4..<8: return .earlyFasting
        case 8..<12: return .fatBurning
        case 12..<18: return .ketosis
        default: return .deepKetosis
        }
    }
}
