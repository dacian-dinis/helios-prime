import Foundation

// MARK: - Weight Entry

struct WeightEntry: Codable, Identifiable, Sendable {
    var id: UUID = UUID()
    var weightKg: Double
    var date: Date

    var dateKey: String {
        let formatter = DateFormatter()
        formatter.dateFormat = "yyyy-MM-dd"
        return formatter.string(from: date)
    }
}

// MARK: - Body Measurement

struct BodyMeasurement: Codable, Identifiable, Sendable {
    var id: UUID = UUID()
    var date: Date
    var chest: Double?
    var waist: Double?
    var hips: Double?
    var leftArm: Double?
    var rightArm: Double?
    var leftThigh: Double?
    var rightThigh: Double?
    var neck: Double?

    var dateKey: String {
        let formatter = DateFormatter()
        formatter.dateFormat = "yyyy-MM-dd"
        return formatter.string(from: date)
    }
}
