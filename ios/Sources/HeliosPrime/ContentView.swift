import SwiftUI

struct ContentView: View {
    @Environment(AppState.self) private var state
    @State private var selectedTab = 0

    var body: some View {
        Group {
            if state.isLoading {
                loadingView
            } else if !state.profile.onboardingCompleted {
                OnboardingView()
            } else {
                mainTabView
            }
        }
    }

    // MARK: - Loading

    private var loadingView: some View {
        VStack(spacing: 16) {
            ProgressView()
                .controlSize(.large)
            Text("Loading Helios Prime...")
                .font(.subheadline)
                .foregroundStyle(.secondary)
        }
    }

    // MARK: - Main Tab View

    private var mainTabView: some View {
        TabView(selection: $selectedTab) {
            DashboardView()
                .tabItem {
                    Label("Dashboard", systemImage: "house.fill")
                }
                .tag(0)

            FoodLogView()
                .tabItem {
                    Label("Food", systemImage: "fork.knife")
                }
                .tag(1)

            WorkoutsView()
                .tabItem {
                    Label("Workouts", systemImage: "figure.run")
                }
                .tag(2)

            FastingView()
                .tabItem {
                    Label("Fasting", systemImage: "timer")
                }
                .tag(3)

            ProgressTabView()
                .tabItem {
                    Label("Progress", systemImage: "chart.line.uptrend.xyaxis")
                }
                .tag(4)

            SettingsView()
                .tabItem {
                    Label("Settings", systemImage: "gearshape.fill")
                }
                .tag(5)
        }
    }
}
