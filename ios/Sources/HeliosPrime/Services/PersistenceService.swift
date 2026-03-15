import Foundation

// MARK: - Persistence Service

final class PersistenceService: @unchecked Sendable {
    static let shared = PersistenceService()

    private let fileManager = FileManager.default

    private var documentsURL: URL {
        fileManager.urls(for: .documentDirectory, in: .userDomainMask)[0]
    }

    private func fileURL(for key: String) -> URL {
        documentsURL.appendingPathComponent("\(key).json")
    }

    // MARK: - Save

    func save<T: Codable & Sendable>(_ value: T, forKey key: String) throws {
        let data = try JSONEncoder().encode(value)
        try data.write(to: fileURL(for: key))
    }

    // MARK: - Load

    func load<T: Codable & Sendable>(forKey key: String, as type: T.Type) throws -> T? {
        let url = fileURL(for: key)
        guard fileManager.fileExists(atPath: url.path) else { return nil }
        let data = try Data(contentsOf: url)
        return try JSONDecoder().decode(T.self, from: data)
    }

    // MARK: - Delete

    func delete(forKey key: String) throws {
        let url = fileURL(for: key)
        if fileManager.fileExists(atPath: url.path) {
            try fileManager.removeItem(at: url)
        }
    }
}

// MARK: - Storage Keys

enum StorageKey {
    static let profile = "user_profile"
    static let foodEntries = "food_entries"
    static let waterEntries = "water_entries"
    static let dailyNotes = "daily_notes"
    static let workoutPlans = "workout_plans"
    static let workoutSessions = "workout_sessions"
    static let activeWorkout = "active_workout"
    static let fastingSessions = "fasting_sessions"
    static let activeFast = "active_fast"
    static let favoritePreset = "favorite_preset"
    static let weightEntries = "weight_entries"
    static let bodyMeasurements = "body_measurements"
}
