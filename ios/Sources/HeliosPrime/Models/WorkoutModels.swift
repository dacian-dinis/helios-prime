import Foundation

// MARK: - Exercise

struct Exercise: Codable, Identifiable, Sendable, Hashable {
    var id: UUID = UUID()
    var name: String
    var muscleGroup: MuscleGroup
    var equipment: Equipment
}

enum MuscleGroup: String, Codable, CaseIterable, Sendable {
    case chest, back, shoulders, biceps, triceps, legs, core, cardio, fullBody

    var display: String {
        switch self {
        case .fullBody: return "Full Body"
        default: return rawValue.capitalized
        }
    }

    var icon: String {
        switch self {
        case .chest: return "figure.strengthtraining.traditional"
        case .back: return "figure.rowing"
        case .shoulders: return "figure.boxing"
        case .biceps: return "figure.strengthtraining.functional"
        case .triceps: return "figure.strengthtraining.functional"
        case .legs: return "figure.run"
        case .core: return "figure.core.training"
        case .cardio: return "figure.run"
        case .fullBody: return "figure.highintensity.intervaltraining"
        }
    }
}

enum Equipment: String, Codable, CaseIterable, Sendable {
    case barbell, dumbbell, machine, cable, bodyweight, kettlebell, band

    var display: String { rawValue.capitalized }
}

// MARK: - Workout Plan

struct WorkoutPlan: Codable, Identifiable, Sendable {
    var id: UUID = UUID()
    var name: String
    var description: String = ""
    var exercises: [PlanExercise]
    var muscleGroups: [MuscleGroup]
    var estimatedMinutes: Int = 45
    var createdAt: Date = Date()
}

struct PlanExercise: Codable, Identifiable, Sendable {
    var id: UUID = UUID()
    var exercise: Exercise
    var sets: Int = 3
    var targetReps: Int = 10
    var restSeconds: Int = 90
}

// MARK: - Workout Session

struct WorkoutSession: Codable, Identifiable, Sendable {
    var id: UUID = UUID()
    var planName: String
    var exercises: [SessionExercise]
    var startedAt: Date
    var completedAt: Date?
    var totalVolume: Double = 0 // kg
    var durationMinutes: Int = 0

    var dateKey: String {
        let formatter = DateFormatter()
        formatter.dateFormat = "yyyy-MM-dd"
        return formatter.string(from: startedAt)
    }
}

struct SessionExercise: Codable, Identifiable, Sendable {
    var id: UUID = UUID()
    var exerciseName: String
    var sets: [ExerciseSet]
}

struct ExerciseSet: Codable, Identifiable, Sendable {
    var id: UUID = UUID()
    var reps: Int = 0
    var weight: Double = 0
    var completed: Bool = false
}

// MARK: - Active Session

struct ActiveSession: Codable, Sendable {
    var planName: String
    var exercises: [SessionExercise]
    var startedAt: Date
    var currentExerciseIndex: Int = 0
}

// MARK: - Exercise Library

struct ExerciseLibrary {
    static let exercises: [Exercise] = [
        // Chest
        Exercise(name: "Bench Press", muscleGroup: .chest, equipment: .barbell),
        Exercise(name: "Incline Bench Press", muscleGroup: .chest, equipment: .barbell),
        Exercise(name: "Dumbbell Flyes", muscleGroup: .chest, equipment: .dumbbell),
        Exercise(name: "Cable Crossover", muscleGroup: .chest, equipment: .cable),
        Exercise(name: "Push-ups", muscleGroup: .chest, equipment: .bodyweight),
        Exercise(name: "Dumbbell Press", muscleGroup: .chest, equipment: .dumbbell),
        // Back
        Exercise(name: "Deadlift", muscleGroup: .back, equipment: .barbell),
        Exercise(name: "Barbell Row", muscleGroup: .back, equipment: .barbell),
        Exercise(name: "Pull-ups", muscleGroup: .back, equipment: .bodyweight),
        Exercise(name: "Lat Pulldown", muscleGroup: .back, equipment: .cable),
        Exercise(name: "Seated Cable Row", muscleGroup: .back, equipment: .cable),
        Exercise(name: "Dumbbell Row", muscleGroup: .back, equipment: .dumbbell),
        // Shoulders
        Exercise(name: "Overhead Press", muscleGroup: .shoulders, equipment: .barbell),
        Exercise(name: "Lateral Raises", muscleGroup: .shoulders, equipment: .dumbbell),
        Exercise(name: "Front Raises", muscleGroup: .shoulders, equipment: .dumbbell),
        Exercise(name: "Face Pulls", muscleGroup: .shoulders, equipment: .cable),
        Exercise(name: "Arnold Press", muscleGroup: .shoulders, equipment: .dumbbell),
        // Biceps
        Exercise(name: "Barbell Curl", muscleGroup: .biceps, equipment: .barbell),
        Exercise(name: "Dumbbell Curl", muscleGroup: .biceps, equipment: .dumbbell),
        Exercise(name: "Hammer Curl", muscleGroup: .biceps, equipment: .dumbbell),
        Exercise(name: "Preacher Curl", muscleGroup: .biceps, equipment: .machine),
        Exercise(name: "Cable Curl", muscleGroup: .biceps, equipment: .cable),
        // Triceps
        Exercise(name: "Tricep Pushdown", muscleGroup: .triceps, equipment: .cable),
        Exercise(name: "Skull Crushers", muscleGroup: .triceps, equipment: .barbell),
        Exercise(name: "Overhead Tricep Extension", muscleGroup: .triceps, equipment: .dumbbell),
        Exercise(name: "Dips", muscleGroup: .triceps, equipment: .bodyweight),
        Exercise(name: "Close-Grip Bench Press", muscleGroup: .triceps, equipment: .barbell),
        // Legs
        Exercise(name: "Squat", muscleGroup: .legs, equipment: .barbell),
        Exercise(name: "Leg Press", muscleGroup: .legs, equipment: .machine),
        Exercise(name: "Romanian Deadlift", muscleGroup: .legs, equipment: .barbell),
        Exercise(name: "Leg Curl", muscleGroup: .legs, equipment: .machine),
        Exercise(name: "Leg Extension", muscleGroup: .legs, equipment: .machine),
        Exercise(name: "Bulgarian Split Squat", muscleGroup: .legs, equipment: .dumbbell),
        Exercise(name: "Calf Raises", muscleGroup: .legs, equipment: .machine),
        Exercise(name: "Lunges", muscleGroup: .legs, equipment: .dumbbell),
        // Core
        Exercise(name: "Plank", muscleGroup: .core, equipment: .bodyweight),
        Exercise(name: "Crunches", muscleGroup: .core, equipment: .bodyweight),
        Exercise(name: "Russian Twist", muscleGroup: .core, equipment: .bodyweight),
        Exercise(name: "Hanging Leg Raise", muscleGroup: .core, equipment: .bodyweight),
        Exercise(name: "Cable Woodchop", muscleGroup: .core, equipment: .cable),
        Exercise(name: "Ab Wheel Rollout", muscleGroup: .core, equipment: .bodyweight),
        // Cardio
        Exercise(name: "Treadmill Run", muscleGroup: .cardio, equipment: .machine),
        Exercise(name: "Cycling", muscleGroup: .cardio, equipment: .machine),
        Exercise(name: "Jump Rope", muscleGroup: .cardio, equipment: .bodyweight),
        Exercise(name: "Rowing Machine", muscleGroup: .cardio, equipment: .machine),
        Exercise(name: "Burpees", muscleGroup: .cardio, equipment: .bodyweight),
    ]

    static func exercises(for group: MuscleGroup) -> [Exercise] {
        exercises.filter { $0.muscleGroup == group }
    }
}
