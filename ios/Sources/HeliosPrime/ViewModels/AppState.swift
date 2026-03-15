import Foundation
import Observation
import SwiftUI

// MARK: - App State

@Observable
@MainActor
final class AppState {
    // MARK: - User Profile
    var profile = UserProfile()

    // MARK: - Food
    var foodEntries: [FoodEntry] = []
    var waterEntries: [WaterEntry] = []
    var dailyNotes: [DailyNote] = []
    var selectedDate: Date = Date()

    // MARK: - Workouts
    var workoutPlans: [WorkoutPlan] = []
    var workoutSessions: [WorkoutSession] = []
    var activeWorkout: ActiveSession? = nil

    // MARK: - Fasting
    var fastingSessions: [FastingSession] = []
    var activeFast: FastingSession? = nil
    var favoritePreset: FastingPreset? = nil

    // MARK: - Progress
    var weightEntries: [WeightEntry] = []
    var bodyMeasurements: [BodyMeasurement] = []

    // MARK: - UI State
    var isLoading = false
    var errorMessage: String? = nil

    // MARK: - Date Helpers

    private var dateFormatter: DateFormatter {
        let f = DateFormatter()
        f.dateFormat = "yyyy-MM-dd"
        return f
    }

    var selectedDateKey: String {
        dateFormatter.string(from: selectedDate)
    }

    var todayKey: String {
        dateFormatter.string(from: Date())
    }

    // MARK: - Food Computed Properties

    var foodForSelectedDate: [FoodEntry] {
        foodEntries.filter { $0.dateKey == selectedDateKey }
    }

    func foodForMeal(_ meal: MealType) -> [FoodEntry] {
        foodForSelectedDate.filter { $0.mealType == meal }
    }

    var dailyCalories: Int {
        foodForSelectedDate.reduce(0) { $0 + $1.calories }
    }

    var dailyProtein: Double {
        foodForSelectedDate.reduce(0) { $0 + $1.protein }
    }

    var dailyCarbs: Double {
        foodForSelectedDate.reduce(0) { $0 + $1.carbs }
    }

    var dailyFat: Double {
        foodForSelectedDate.reduce(0) { $0 + $1.fat }
    }

    var calorieProgress: Double {
        guard profile.dailyCalorieGoal > 0 else { return 0 }
        return min(Double(dailyCalories) / Double(profile.dailyCalorieGoal), 1.0)
    }

    var waterForToday: Int {
        waterEntries.filter { $0.dateKey == todayKey }.reduce(0) { $0 + $1.amountMl }
    }

    var waterProgress: Double {
        guard profile.waterGoalMl > 0 else { return 0 }
        return min(Double(waterForToday) / Double(profile.waterGoalMl), 1.0)
    }

    var todayEnergyLevel: Int? {
        dailyNotes.first { $0.dateKey == todayKey }?.energyLevel
    }

    var recentFoods: [FoodEntry] {
        let unique = Dictionary(grouping: foodEntries, by: { $0.name })
        return unique.compactMap { $0.value.max(by: { $0.timestamp < $1.timestamp }) }
            .sorted { $0.timestamp > $1.timestamp }
            .prefix(10)
            .map { $0 }
    }

    // MARK: - Workout Computed Properties

    var workoutsThisWeek: Int {
        let cal = Calendar.current
        let startOfWeek = cal.dateInterval(of: .weekOfYear, for: Date())?.start ?? Date()
        return workoutSessions.filter { $0.startedAt >= startOfWeek }.count
    }

    var totalWorkoutVolume: Double {
        workoutSessions.reduce(0) { $0 + $1.totalVolume }
    }

    // MARK: - Fasting Computed Properties

    var fastingStreak: Int {
        let completed = fastingSessions
            .filter { $0.status == .completed }
            .sorted { $0.startedAt > $1.startedAt }

        var streak = 0
        let cal = Calendar.current
        var checkDate = cal.startOfDay(for: Date())

        for session in completed {
            let sessionDay = cal.startOfDay(for: session.startedAt)
            if sessionDay == checkDate || sessionDay == cal.date(byAdding: .day, value: -1, to: checkDate)! {
                streak += 1
                checkDate = sessionDay
            } else {
                break
            }
        }
        return streak
    }

    var completedFastsThisWeek: Int {
        let cal = Calendar.current
        let startOfWeek = cal.dateInterval(of: .weekOfYear, for: Date())?.start ?? Date()
        return fastingSessions.filter { $0.status == .completed && $0.startedAt >= startOfWeek }.count
    }

    var totalHoursFasted: Double {
        fastingSessions.filter { $0.status == .completed }.reduce(0) { $0 + $1.elapsedHours }
    }

    // MARK: - Progress Computed Properties

    var latestWeight: Double? {
        weightEntries.sorted { $0.date > $1.date }.first?.weightKg
    }

    var latestMeasurement: BodyMeasurement? {
        bodyMeasurements.sorted { $0.date > $1.date }.first
    }

    func weightTrend(days: Int) -> [WeightEntry] {
        let cutoff = Calendar.current.date(byAdding: .day, value: -days, to: Date()) ?? Date()
        return weightEntries.filter { $0.date >= cutoff }.sorted { $0.date < $1.date }
    }

    // MARK: - Persistence Helper

    private func persist<T: Codable & Sendable>(_ value: T, forKey key: String) {
        try? PersistenceService.shared.save(value, forKey: key)
    }

    // MARK: - Actions: Food

    func addFoodEntry(_ entry: FoodEntry) {
        foodEntries.append(entry)
        persist(foodEntries, forKey: StorageKey.foodEntries)
    }

    func deleteFoodEntry(_ entry: FoodEntry) {
        foodEntries.removeAll { $0.id == entry.id }
        persist(foodEntries, forKey: StorageKey.foodEntries)
    }

    func addWater(_ ml: Int) {
        let entry = WaterEntry(amountMl: ml, date: Date())
        waterEntries.append(entry)
        persist(waterEntries, forKey: StorageKey.waterEntries)
    }

    func setEnergyLevel(_ level: Int) {
        if let idx = dailyNotes.firstIndex(where: { $0.dateKey == todayKey }) {
            dailyNotes[idx].energyLevel = level
        } else {
            dailyNotes.append(DailyNote(date: Date(), energyLevel: level, note: ""))
        }
        persist(dailyNotes, forKey: StorageKey.dailyNotes)
    }

    // MARK: - Actions: Workouts

    func addWorkoutPlan(_ plan: WorkoutPlan) {
        workoutPlans.append(plan)
        persist(workoutPlans, forKey: StorageKey.workoutPlans)
    }

    func deleteWorkoutPlan(_ plan: WorkoutPlan) {
        workoutPlans.removeAll { $0.id == plan.id }
        persist(workoutPlans, forKey: StorageKey.workoutPlans)
    }

    func startWorkout(from plan: WorkoutPlan) {
        let exercises = plan.exercises.map { pe in
            SessionExercise(
                exerciseName: pe.exercise.name,
                sets: (0..<pe.sets).map { _ in ExerciseSet() }
            )
        }
        activeWorkout = ActiveSession(
            planName: plan.name,
            exercises: exercises,
            startedAt: Date()
        )
        persist(activeWorkout, forKey: StorageKey.activeWorkout)
    }

    func startEmptyWorkout() {
        activeWorkout = ActiveSession(planName: "Quick Workout", exercises: [], startedAt: Date())
        persist(activeWorkout, forKey: StorageKey.activeWorkout)
    }

    func completeWorkout() {
        guard let active = activeWorkout else { return }
        let totalVolume = active.exercises.flatMap { $0.sets }.filter { $0.completed }
            .reduce(0.0) { $0 + $1.weight * Double($1.reps) }
        let duration = Int(Date().timeIntervalSince(active.startedAt) / 60)

        let session = WorkoutSession(
            planName: active.planName,
            exercises: active.exercises,
            startedAt: active.startedAt,
            completedAt: Date(),
            totalVolume: totalVolume,
            durationMinutes: duration
        )
        workoutSessions.append(session)
        activeWorkout = nil
        persist(workoutSessions, forKey: StorageKey.workoutSessions)
        try? PersistenceService.shared.delete(forKey: StorageKey.activeWorkout)
    }

    func cancelWorkout() {
        activeWorkout = nil
        try? PersistenceService.shared.delete(forKey: StorageKey.activeWorkout)
    }

    // MARK: - Actions: Fasting

    func startFast(preset: FastingPreset) {
        activeFast = FastingSession(
            presetName: preset.name,
            targetHours: preset.fastingHours,
            startedAt: Date()
        )
        persist(activeFast, forKey: StorageKey.activeFast)
    }

    func startCustomFast(hours: Int) {
        activeFast = FastingSession(
            presetName: "Custom \(hours)h",
            targetHours: hours,
            startedAt: Date()
        )
        persist(activeFast, forKey: StorageKey.activeFast)
    }

    func completeFast() {
        guard var fast = activeFast else { return }
        fast.completedAt = Date()
        fast.status = .completed
        fastingSessions.append(fast)
        activeFast = nil
        persist(fastingSessions, forKey: StorageKey.fastingSessions)
        try? PersistenceService.shared.delete(forKey: StorageKey.activeFast)
    }

    func cancelFast() {
        guard var fast = activeFast else { return }
        fast.completedAt = Date()
        fast.status = .cancelled
        fastingSessions.append(fast)
        activeFast = nil
        persist(fastingSessions, forKey: StorageKey.fastingSessions)
        try? PersistenceService.shared.delete(forKey: StorageKey.activeFast)
    }

    func setFavoritePreset(_ preset: FastingPreset) {
        favoritePreset = preset
        persist(favoritePreset, forKey: StorageKey.favoritePreset)
    }

    // MARK: - Actions: Progress

    func addWeight(_ kg: Double) {
        let entry = WeightEntry(weightKg: kg, date: Date())
        weightEntries.append(entry)
        persist(weightEntries, forKey: StorageKey.weightEntries)
    }

    func deleteWeight(_ entry: WeightEntry) {
        weightEntries.removeAll { $0.id == entry.id }
        persist(weightEntries, forKey: StorageKey.weightEntries)
    }

    func saveMeasurement(_ measurement: BodyMeasurement) {
        if let idx = bodyMeasurements.firstIndex(where: { $0.dateKey == measurement.dateKey }) {
            bodyMeasurements[idx] = measurement
        } else {
            bodyMeasurements.append(measurement)
        }
        persist(bodyMeasurements, forKey: StorageKey.bodyMeasurements)
    }

    // MARK: - Actions: Profile

    func saveProfile() {
        persist(profile, forKey: StorageKey.profile)
    }

    // MARK: - Load All Data

    func loadAll() {
        isLoading = true
        let store = PersistenceService.shared
        do {
            if let p = try store.load(forKey: StorageKey.profile, as: UserProfile.self) {
                profile = p
            }
            if let f = try store.load(forKey: StorageKey.foodEntries, as: [FoodEntry].self) {
                foodEntries = f
            }
            if let w = try store.load(forKey: StorageKey.waterEntries, as: [WaterEntry].self) {
                waterEntries = w
            }
            if let n = try store.load(forKey: StorageKey.dailyNotes, as: [DailyNote].self) {
                dailyNotes = n
            }
            if let wp = try store.load(forKey: StorageKey.workoutPlans, as: [WorkoutPlan].self) {
                workoutPlans = wp
            }
            if let ws = try store.load(forKey: StorageKey.workoutSessions, as: [WorkoutSession].self) {
                workoutSessions = ws
            }
            if let aw = try store.load(forKey: StorageKey.activeWorkout, as: ActiveSession.self) {
                activeWorkout = aw
            }
            if let fs = try store.load(forKey: StorageKey.fastingSessions, as: [FastingSession].self) {
                fastingSessions = fs
            }
            if let af = try store.load(forKey: StorageKey.activeFast, as: FastingSession.self) {
                activeFast = af
            }
            if let fp = try store.load(forKey: StorageKey.favoritePreset, as: FastingPreset.self) {
                favoritePreset = fp
            }
            if let we = try store.load(forKey: StorageKey.weightEntries, as: [WeightEntry].self) {
                weightEntries = we
            }
            if let bm = try store.load(forKey: StorageKey.bodyMeasurements, as: [BodyMeasurement].self) {
                bodyMeasurements = bm
            }
        } catch {
            errorMessage = "Failed to load data: \(error.localizedDescription)"
        }
        isLoading = false
    }
}
