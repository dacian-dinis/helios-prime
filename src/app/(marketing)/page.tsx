export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navbar */}
      <nav className="fixed top-0 z-50 w-full border-b border-white/10 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <a href="#" className="text-xl font-bold tracking-tight">
            <span className="text-accent">Helios</span> Prime
          </a>
          <div className="hidden items-center gap-8 text-sm font-medium md:flex">
            <a href="#features" className="transition-colors hover:text-accent">
              Features
            </a>
            <a
              href="#how-it-works"
              className="transition-colors hover:text-accent"
            >
              How It Works
            </a>
            <a href="#pricing" className="transition-colors hover:text-accent">
              Pricing
            </a>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="/login"
              className="hidden text-sm font-medium transition-colors hover:text-accent sm:block"
            >
              Log In
            </a>
            <a
              href="/register"
              className="rounded-full bg-accent px-5 py-2 text-sm font-semibold text-black transition-colors hover:bg-accent-dark"
            >
              Get Started Free
            </a>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative flex min-h-screen flex-col items-center justify-center px-6 pt-20 text-center">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-accent/10 via-transparent to-transparent" />
        <span className="mb-6 inline-block rounded-full border border-accent/30 bg-accent/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-accent">
          AI-Powered Fitness
        </span>
        <h1 className="mx-auto max-w-4xl text-5xl font-extrabold leading-tight tracking-tight sm:text-6xl lg:text-7xl">
          Snap. Track.{" "}
          <span className="bg-gradient-to-r from-accent to-emerald-400 bg-clip-text text-transparent">
            Transform.
          </span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-foreground/60 sm:text-xl">
          Take a photo of your meal and get instant calorie & macro breakdowns.
          Let AI build your perfect workout plan. All in one app.
        </p>
        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
          <a
            href="#"
            className="rounded-full bg-accent px-8 py-3.5 text-base font-semibold text-black transition-all hover:bg-accent-dark hover:shadow-lg hover:shadow-accent/25"
          >
            Start Free Today
          </a>
          <a
            href="#how-it-works"
            className="group flex items-center gap-2 rounded-full border border-foreground/20 px-8 py-3.5 text-base font-semibold transition-all hover:border-accent hover:text-accent"
          >
            See How It Works
            <svg
              className="h-4 w-4 transition-transform group-hover:translate-x-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </a>
        </div>
        {/* Hero visual mockup */}
        <div className="relative mx-auto mt-16 w-full max-w-3xl">
          <div className="overflow-hidden rounded-2xl border border-foreground/10 bg-foreground/5 p-8 shadow-2xl">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-accent/20 text-2xl">
                📸
              </div>
              <div className="text-left">
                <p className="font-semibold">Grilled Chicken Salad</p>
                <p className="text-sm text-foreground/50">
                  420 kcal &middot; 38g protein &middot; 12g carbs &middot; 22g
                  fat
                </p>
              </div>
              <div className="ml-auto rounded-full bg-accent/20 px-3 py-1 text-xs font-bold text-accent">
                AI Scanned
              </div>
            </div>
            <div className="mt-6 grid grid-cols-4 gap-3">
              {[
                { label: "Calories", value: "420", color: "bg-accent" },
                { label: "Protein", value: "38g", color: "bg-blue-500" },
                { label: "Carbs", value: "12g", color: "bg-amber-500" },
                { label: "Fat", value: "22g", color: "bg-rose-500" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-xl bg-foreground/5 p-3 text-center"
                >
                  <div
                    className={`mx-auto mb-2 h-1.5 w-12 rounded-full ${item.color} opacity-60`}
                  />
                  <p className="text-lg font-bold">{item.value}</p>
                  <p className="text-xs text-foreground/50">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <span className="text-sm font-semibold uppercase tracking-wider text-accent">
              Features
            </span>
            <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
              Everything you need to reach your goals
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-foreground/60">
              From AI food scanning to personalized workout plans — Helios Prime
              gives you all the tools in one place.
            </p>
          </div>
          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: "📷",
                title: "AI Food Scanner",
                desc: "Snap a photo of any meal and get instant calorie and macro breakdowns powered by AI vision.",
              },
              {
                icon: "🏋️",
                title: "Smart Workout Plans",
                desc: "AI generates personalized workout splits based on your goals, experience, and available equipment.",
              },
              {
                icon: "📊",
                title: "Progress Tracking",
                desc: "Visualize your weight, body measurements, and workout volume over time with beautiful charts.",
              },
              {
                icon: "🎯",
                title: "Calorie & Macro Goals",
                desc: "Auto-calculated TDEE and macro targets that adapt as your body and goals change.",
              },
              {
                icon: "🤖",
                title: "AI Body Analysis",
                desc: "Upload a photo and receive AI-powered physique feedback with tailored training advice.",
              },
              {
                icon: "🔔",
                title: "Smart Reminders",
                desc: "Never miss a meal log or workout with intelligent, context-aware notifications.",
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="group rounded-2xl border border-foreground/10 bg-foreground/[0.02] p-6 transition-all hover:border-accent/30 hover:bg-accent/5"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 text-2xl transition-transform group-hover:scale-110">
                  {feature.icon}
                </div>
                <h3 className="mb-2 text-lg font-semibold">{feature.title}</h3>
                <p className="text-sm leading-relaxed text-foreground/60">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="bg-foreground/[0.02] px-6 py-24">
        <div className="mx-auto max-w-4xl text-center">
          <span className="text-sm font-semibold uppercase tracking-wider text-accent">
            How It Works
          </span>
          <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
            Three steps to a healthier you
          </h2>
          <div className="mt-16 grid gap-12 sm:grid-cols-3">
            {[
              {
                step: "01",
                title: "Set Your Goal",
                desc: "Tell us your target — lose fat, build muscle, or maintain. We calculate your ideal calories and macros.",
              },
              {
                step: "02",
                title: "Scan & Log",
                desc: "Photograph your meals for instant AI-powered nutrition data. Log workouts with one tap.",
              },
              {
                step: "03",
                title: "Track & Improve",
                desc: "Watch your progress with charts and insights. AI adjusts your plan as you improve.",
              },
            ].map((item) => (
              <div key={item.step} className="relative">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-accent text-lg font-bold text-black">
                  {item.step}
                </div>
                <h3 className="mb-2 text-lg font-semibold">{item.title}</h3>
                <p className="text-sm leading-relaxed text-foreground/60">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="px-6 py-24">
        <div className="mx-auto max-w-5xl text-center">
          <span className="text-sm font-semibold uppercase tracking-wider text-accent">
            Pricing
          </span>
          <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
            Start free, upgrade when ready
          </h2>
          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                plan: "Free",
                price: "$0",
                period: "forever",
                features: [
                  "Manual food logging",
                  "Basic workout templates",
                  "Weight tracking",
                  "5 AI food scans / month",
                ],
                cta: "Get Started",
                highlight: false,
              },
              {
                plan: "Pro",
                price: "$9",
                period: "/month",
                features: [
                  "Unlimited AI food scans",
                  "AI workout plan generator",
                  "AI body analysis",
                  "Advanced analytics",
                  "Priority support",
                ],
                cta: "Start Pro Trial",
                highlight: true,
              },
              {
                plan: "Lifetime",
                price: "$79",
                period: "one-time",
                features: [
                  "Everything in Pro",
                  "Lifetime access",
                  "Early access to new features",
                  "No recurring payments",
                ],
                cta: "Buy Lifetime",
                highlight: false,
              },
            ].map((tier) => (
              <div
                key={tier.plan}
                className={`relative rounded-2xl border p-8 text-left transition-all ${
                  tier.highlight
                    ? "border-accent bg-accent/5 shadow-lg shadow-accent/10"
                    : "border-foreground/10 bg-foreground/[0.02]"
                }`}
              >
                {tier.highlight && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-accent px-3 py-1 text-xs font-bold text-black">
                    Most Popular
                  </span>
                )}
                <h3 className="text-lg font-semibold">{tier.plan}</h3>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold">{tier.price}</span>
                  <span className="text-sm text-foreground/50">
                    {tier.period}
                  </span>
                </div>
                <ul className="mt-6 space-y-3">
                  {tier.features.map((f) => (
                    <li
                      key={f}
                      className="flex items-start gap-2 text-sm text-foreground/70"
                    >
                      <svg
                        className="mt-0.5 h-4 w-4 shrink-0 text-accent"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>
                <a
                  href="#"
                  className={`mt-8 block rounded-full py-3 text-center text-sm font-semibold transition-all ${
                    tier.highlight
                      ? "bg-accent text-black hover:bg-accent-dark"
                      : "border border-foreground/20 hover:border-accent hover:text-accent"
                  }`}
                >
                  {tier.cta}
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-3xl rounded-3xl bg-gradient-to-br from-accent/20 via-accent/10 to-transparent p-12 text-center sm:p-16">
          <h2 className="text-3xl font-bold sm:text-4xl">
            Ready to transform your fitness?
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-foreground/60">
            Join thousands of people using AI to eat smarter and train harder.
            No credit card required.
          </p>
          <a
            href="#"
            className="mt-8 inline-block rounded-full bg-accent px-8 py-3.5 text-base font-semibold text-black transition-all hover:bg-accent-dark hover:shadow-lg hover:shadow-accent/25"
          >
            Get Started — It&apos;s Free
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-foreground/10 px-6 py-12">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 sm:flex-row">
          <a href="#" className="text-lg font-bold tracking-tight">
            <span className="text-accent">Helios</span> Prime
          </a>
          <div className="flex gap-6 text-sm text-foreground/50">
            <a href="#" className="transition-colors hover:text-foreground">
              Privacy
            </a>
            <a href="#" className="transition-colors hover:text-foreground">
              Terms
            </a>
            <a href="#" className="transition-colors hover:text-foreground">
              Contact
            </a>
          </div>
          <p className="text-sm text-foreground/40">
            &copy; 2026 Helios Prime. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
