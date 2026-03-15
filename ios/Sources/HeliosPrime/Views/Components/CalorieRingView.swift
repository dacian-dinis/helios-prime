import SwiftUI

// MARK: - Calorie Ring

struct CalorieRingView: View {
    let consumed: Int
    let goal: Int
    let lineWidth: CGFloat

    private var progress: Double {
        guard goal > 0 else { return 0 }
        return min(Double(consumed) / Double(goal), 1.0)
    }

    private var remaining: Int {
        max(goal - consumed, 0)
    }

    var body: some View {
        ZStack {
            Circle()
                .stroke(Color.gray.opacity(0.2), lineWidth: lineWidth)

            Circle()
                .trim(from: 0, to: progress)
                .stroke(
                    AngularGradient(
                        gradient: Gradient(colors: [.green, .yellow, .orange, .red]),
                        center: .center,
                        startAngle: .degrees(0),
                        endAngle: .degrees(360 * progress)
                    ),
                    style: StrokeStyle(lineWidth: lineWidth, lineCap: .round)
                )
                .rotationEffect(.degrees(-90))
                .animation(.easeInOut(duration: 0.5), value: progress)

            VStack(spacing: 4) {
                Text("\(consumed)")
                    .font(.system(size: 34, weight: .bold, design: .rounded))

                Text("of \(goal) kcal")
                    .font(.caption)
                    .foregroundStyle(.secondary)

                Text("\(remaining) left")
                    .font(.caption2)
                    .foregroundStyle(.tertiary)
            }
        }
    }
}

// MARK: - Macro Bar

struct MacroBarView: View {
    let label: String
    let current: Double
    let goal: Int
    let color: Color

    private var progress: Double {
        guard goal > 0 else { return 0 }
        return min(current / Double(goal), 1.0)
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            HStack {
                Text(label)
                    .font(.caption)
                    .foregroundStyle(.secondary)
                Spacer()
                Text("\(Int(current))/\(goal)g")
                    .font(.caption)
                    .fontWeight(.medium)
            }

            GeometryReader { geo in
                ZStack(alignment: .leading) {
                    RoundedRectangle(cornerRadius: 4)
                        .fill(color.opacity(0.2))

                    RoundedRectangle(cornerRadius: 4)
                        .fill(color)
                        .frame(width: geo.size.width * progress)
                        .animation(.easeInOut(duration: 0.3), value: progress)
                }
            }
            .frame(height: 8)
        }
    }
}

// MARK: - Nutrient Bar (compact)

struct NutrientBar: View {
    let value: Double
    let unit: String
    let label: String
    let color: Color

    var body: some View {
        VStack(spacing: 2) {
            Text(String(format: "%.0f", value))
                .font(.system(.title3, design: .rounded, weight: .bold))
            Text(unit)
                .font(.caption2)
                .foregroundStyle(.secondary)
            Text(label)
                .font(.caption2)
                .foregroundStyle(color)
        }
        .frame(maxWidth: .infinity)
    }
}
