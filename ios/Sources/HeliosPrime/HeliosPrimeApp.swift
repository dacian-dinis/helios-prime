import SwiftUI

@main
struct HeliosPrimeApp: App {
    @State private var appState = AppState()

    var body: some Scene {
        WindowGroup {
            ContentView()
                .environment(appState)
                .onAppear {
                    appState.loadAll()
                }
        }
    }
}
