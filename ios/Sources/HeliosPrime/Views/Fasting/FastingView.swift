import SwiftUI

struct FastingView: View {
    @Environment(AppState.self) private var state
    @State private var customHours: Double = 16
    @State private var showCustom = false

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 20) {
                    if let active = state.activeFast {
                        activeTimerCard(active)
                    } else {
                        presetsSection
                        if showCustom { customSection }
                    }
                    statsSection
                    historySection
                }
                .padding()
            }
            .navigationTitle("Fasting")
            .background(Color(.systemGroupedBackground))
        }
    }

    // MARK: - Active Timer

    private func activeTimerCard(_ session: FastingSession) -> some View {
        VStack(spacing: 20) {
            Text("Fasting: \(session.presetName)")
                .font(.headline)

            // Progress Ring
            ZStack {
                Circle()
                    .stroke(Color.gray.opacity(0.2), lineWidth: 16)

                Circle()
                    .trim(from: 0, to: session.progress)
                    .stroke(
                        zoneColor(session.currentZone),
                        style: StrokeStyle(lineWidth: 16, lineCap: .round)
                    )
                    .rotationEffect(.degrees(-90))
                    .animation(.easeInOut(duration: 1), value: session.progress)

                VStack(spacing: 4) {
                    Text(formatHours(session.elapsedHours))
                        .font(.system(size: 36, weight: .bold, design: .rounded))
                        .monospacedDigit()

                    Text("of \(session.targetHours)h")
                        .font(.caption)
                        .foregroundStyle(.secondary)

                    Text(String(format: "%.0f%%", session.progress * 100))
                        .font(.caption2)
                        .foregroundStyle(.tertiary)
                }
            }
            .frame(height: 220)

            // Current Zone
            VStack(spacing: 4) {
                Text(session.currentZone.rawValue)
                    .font(.title3)
                    .fontWeight(.semibold)
                    .foregroundStyle(zoneColor(session.currentZone))

                Text(session.currentZone.description)
                    .font(.caption)
                    .foregroundStyle(.secondary)
                    .multilineTextAlignment(.center)
            }
            .padding()
            .background(zoneColor(session.currentZone).opacity(0.1), in: RoundedRectangle(cornerRadius: 12))

            // Actions
            HStack(spacing: 16) {
                Button {
                    state.completeFast()
                } label: {
                    Text("Complete")
                        .fontWeight(.semibold)
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(Color.green, in: RoundedRectangle(cornerRadius: 12))
                        .foregroundStyle(.white)
                }

                Button {
                    state.cancelFast()
                } label: {
                    Text("Cancel")
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(Color.red.opacity(0.15), in: RoundedRectangle(cornerRadius: 12))
                        .foregroundStyle(.red)
                }
            }
        }
        .padding()
        .background(.regularMaterial, in: RoundedRectangle(cornerRadius: 16))
    }

    // MARK: - Presets

    private var presetsSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Text("Choose Protocol")
                    .font(.headline)
                Spacer()
                Button(showCustom ? "Hide Custom" : "Custom") {
                    showCustom.toggle()
                }
                .font(.caption)
            }

            ForEach(FastingPreset.presets) { preset in
                presetRow(preset)
            }
        }
    }

    private func presetRow(_ preset: FastingPreset) -> some View {
        HStack {
            VStack(alignment: .leading, spacing: 2) {
                HStack {
                    Text(preset.name)
                        .font(.headline)
                    if state.favoritePreset?.name == preset.name {
                        Image(systemName: "star.fill")
                            .font(.caption)
                            .foregroundStyle(.yellow)
                    }
                }
                Text(preset.description)
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }
            Spacer()

            Text("\(preset.fastingHours)h fast / \(preset.eatingHours)h eat")
                .font(.caption)
                .foregroundStyle(.secondary)

            Button {
                state.startFast(preset: preset)
            } label: {
                Text("Start")
                    .font(.caption)
                    .fontWeight(.semibold)
                    .padding(.horizontal, 16)
                    .padding(.vertical, 8)
                    .background(Color.blue, in: Capsule())
                    .foregroundStyle(.white)
            }
        }
        .padding()
        .background(.regularMaterial, in: RoundedRectangle(cornerRadius: 12))
        .onLongPressGesture {
            state.setFavoritePreset(preset)
        }
    }

    // MARK: - Custom

    private var customSection: some View {
        VStack(spacing: 12) {
            Text("Custom Fast: \(Int(customHours))h")
                .font(.headline)
            Slider(value: $customHours, in: 1...72, step: 1)
                .tint(.blue)
            Button {
                state.startCustomFast(hours: Int(customHours))
            } label: {
                Text("Start Custom Fast")
                    .fontWeight(.semibold)
                    .frame(maxWidth: .infinity)
                    .padding()
                    .background(Color.blue, in: RoundedRectangle(cornerRadius: 12))
                    .foregroundStyle(.white)
            }
        }
        .padding()
        .background(.regularMaterial, in: RoundedRectangle(cornerRadius: 12))
    }

    // MARK: - Stats

    private var statsSection: some View {
        HStack(spacing: 12) {
            statCard(value: "\(state.fastingStreak)", label: "Streak", icon: "flame.fill", color: .orange)
            statCard(value: "\(state.completedFastsThisWeek)", label: "This Week", icon: "calendar", color: .blue)
            statCard(value: String(format: "%.0f", state.totalHoursFasted), label: "Total Hours", icon: "clock.fill", color: .purple)
        }
    }

    private func statCard(value: String, label: String, icon: String, color: Color) -> some View {
        VStack(spacing: 6) {
            Image(systemName: icon)
                .foregroundStyle(color)
            Text(value)
                .font(.title2)
                .fontWeight(.bold)
            Text(label)
                .font(.caption2)
                .foregroundStyle(.secondary)
        }
        .frame(maxWidth: .infinity)
        .padding()
        .background(.regularMaterial, in: RoundedRectangle(cornerRadius: 12))
    }

    // MARK: - History

    private var historySection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("History")
                .font(.headline)

            let recent = state.fastingSessions.sorted { $0.startedAt > $1.startedAt }.prefix(20)

            if recent.isEmpty {
                Text("No fasting sessions yet")
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }

            ForEach(Array(recent)) { session in
                HStack {
                    Circle()
                        .fill(session.status == .completed ? Color.green : Color.red)
                        .frame(width: 8, height: 8)

                    VStack(alignment: .leading, spacing: 2) {
                        Text(session.presetName)
                            .font(.subheadline)
                        Text(session.startedAt.formatted(date: .abbreviated, time: .shortened))
                            .font(.caption)
                            .foregroundStyle(.secondary)
                    }
                    Spacer()
                    Text(String(format: "%.1fh", session.elapsedHours))
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }
                .padding(.vertical, 4)
            }
        }
        .padding()
        .background(.regularMaterial, in: RoundedRectangle(cornerRadius: 12))
    }

    // MARK: - Helpers

    private func formatHours(_ hours: Double) -> String {
        let totalMinutes = Int(hours * 60)
        let h = totalMinutes / 60
        let m = totalMinutes % 60
        return String(format: "%d:%02d", h, m)
    }

    private func zoneColor(_ zone: FastingZone) -> Color {
        switch zone {
        case .fed: return .green
        case .earlyFasting: return .yellow
        case .fatBurning: return .orange
        case .ketosis: return .red
        case .deepKetosis: return .purple
        }
    }
}
