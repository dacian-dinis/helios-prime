import Link from "next/link";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <nav className="border-b border-foreground/10 px-6 py-4">
        <div className="mx-auto flex max-w-4xl items-center gap-2">
          <Link href="/" className="flex items-center gap-2 text-lg font-bold tracking-tight">
            <img src="/icons/logo.png" alt="Helios Prime" className="h-7 w-7 rounded-lg" />
            <span><span className="text-accent">Helios</span> Prime</span>
          </Link>
        </div>
      </nav>

      <main className="mx-auto max-w-4xl px-6 py-12">
        <h1 className="mb-2 text-3xl font-bold">Privacy Policy</h1>
        <p className="mb-8 text-sm text-foreground/50">Last updated: March 15, 2026</p>

        <div className="space-y-8 text-sm leading-relaxed text-foreground/80">
          <section>
            <h2 className="mb-3 text-lg font-semibold text-foreground">1. Information We Collect</h2>
            <p className="mb-2">When you use Helios Prime, we collect the following types of information:</p>
            <ul className="ml-4 list-disc space-y-1">
              <li><strong>Account information:</strong> Name, email address, and password when you create an account.</li>
              <li><strong>Profile data:</strong> Gender, date of birth, height, weight, fitness goals, and dietary preferences provided during onboarding.</li>
              <li><strong>Usage data:</strong> Food logs, workout sessions, fasting records, weight entries, and body measurements you track in the app.</li>
              <li><strong>Photos:</strong> Food photos submitted for AI scanning and body photos for AI analysis. These are processed in real-time and not permanently stored on our servers.</li>
              <li><strong>Device information:</strong> Browser type, operating system, and general usage patterns for app improvement.</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-foreground">2. How We Use Your Information</h2>
            <ul className="ml-4 list-disc space-y-1">
              <li>To provide and personalize your fitness tracking experience.</li>
              <li>To calculate your nutritional targets, metabolic rate, and workout recommendations.</li>
              <li>To process AI food scans and body analysis requests.</li>
              <li>To sync your data across devices.</li>
              <li>To send notifications and reminders you have opted into.</li>
              <li>To improve our app and develop new features.</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-foreground">3. Data Storage & Security</h2>
            <p>Your data is stored securely using Supabase, which provides enterprise-grade security with row-level security policies ensuring you can only access your own data. All data is transmitted over HTTPS encryption. We do not sell, rent, or share your personal data with third parties for marketing purposes.</p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-foreground">4. Third-Party Services</h2>
            <ul className="ml-4 list-disc space-y-1">
              <li><strong>Supabase:</strong> Database and authentication provider.</li>
              <li><strong>Cohere:</strong> AI processing for food scanning, workout generation, and body analysis.</li>
              <li><strong>Open Food Facts:</strong> Barcode-based food nutrition lookup (open database, no personal data shared).</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-foreground">5. Your Rights</h2>
            <p className="mb-2">You have the right to:</p>
            <ul className="ml-4 list-disc space-y-1">
              <li>Access and export all your data (available in Settings).</li>
              <li>Correct inaccurate personal information.</li>
              <li>Delete your account and all associated data (available in Settings).</li>
              <li>Opt out of notifications at any time.</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-foreground">6. Cookies & Local Storage</h2>
            <p>We use browser local storage and cookies solely for authentication sessions and user preferences. We do not use third-party tracking cookies or advertising pixels.</p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-foreground">7. Changes to This Policy</h2>
            <p>We may update this privacy policy from time to time. We will notify you of significant changes via email or in-app notification. Continued use of Helios Prime after changes constitutes acceptance of the updated policy.</p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-foreground">8. Contact Us</h2>
            <p>If you have questions about this privacy policy, please <Link href="/contact" className="text-accent hover:underline">contact us</Link>.</p>
          </section>
        </div>
      </main>
    </div>
  );
}
