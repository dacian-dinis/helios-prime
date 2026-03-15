import Link from "next/link";

export default function TermsPage() {
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
        <h1 className="mb-2 text-3xl font-bold">Terms of Service</h1>
        <p className="mb-8 text-sm text-foreground/50">Last updated: March 15, 2026</p>

        <div className="space-y-8 text-sm leading-relaxed text-foreground/80">
          <section>
            <h2 className="mb-3 text-lg font-semibold text-foreground">1. Acceptance of Terms</h2>
            <p>By creating an account or using Helios Prime, you agree to these Terms of Service. If you do not agree, please do not use the app. We reserve the right to update these terms at any time, and continued use constitutes acceptance of any changes.</p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-foreground">2. Description of Service</h2>
            <p>Helios Prime is an AI-powered fitness application that provides calorie tracking, macro calculation, AI food scanning, workout plan generation, body analysis, fasting tracking, and progress monitoring. The service is available as a web app and mobile app.</p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-foreground">3. Account Responsibilities</h2>
            <ul className="ml-4 list-disc space-y-1">
              <li>You must provide accurate information when creating an account.</li>
              <li>You are responsible for maintaining the security of your account credentials.</li>
              <li>You must be at least 16 years old to use Helios Prime.</li>
              <li>One person per account. Account sharing is not permitted.</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-foreground">4. Health Disclaimer</h2>
            <p className="mb-2 font-semibold text-foreground">Helios Prime is not a medical device or healthcare provider.</p>
            <ul className="ml-4 list-disc space-y-1">
              <li>Calorie targets, macro splits, and AI-generated recommendations are estimates based on general formulas and should not be treated as medical advice.</li>
              <li>AI food scanning provides approximate nutritional values and may not be 100% accurate.</li>
              <li>AI body analysis is for informational purposes only and does not constitute a medical diagnosis.</li>
              <li>Always consult a healthcare professional before starting any diet or exercise program, especially if you have pre-existing health conditions.</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-foreground">5. Subscriptions & Payments</h2>
            <ul className="ml-4 list-disc space-y-1">
              <li>Helios Prime offers a free tier with limited features and paid Pro plans with full access.</li>
              <li>Pro subscriptions are billed monthly or as a one-time lifetime purchase.</li>
              <li>You may cancel your subscription at any time. Access continues until the end of the billing period.</li>
              <li>Refunds are handled on a case-by-case basis. Contact us for refund requests.</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-foreground">6. Acceptable Use</h2>
            <p className="mb-2">You agree not to:</p>
            <ul className="ml-4 list-disc space-y-1">
              <li>Use the service for any unlawful purpose.</li>
              <li>Attempt to reverse-engineer, decompile, or hack any part of the application.</li>
              <li>Upload malicious content, spam, or inappropriate images.</li>
              <li>Resell, redistribute, or commercially exploit the service without permission.</li>
              <li>Create automated accounts or use bots to interact with the service.</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-foreground">7. Intellectual Property</h2>
            <p>All content, design, code, and branding of Helios Prime are owned by us. You retain ownership of any personal data and content you upload (food photos, measurements, etc.). By using the service, you grant us a limited license to process your content solely for providing the service.</p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-foreground">8. Limitation of Liability</h2>
            <p>Helios Prime is provided &quot;as is&quot; without warranties of any kind. We are not liable for any damages arising from your use of the service, including but not limited to health outcomes, data loss, or service interruptions. Our total liability is limited to the amount you paid for the service in the 12 months preceding the claim.</p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-foreground">9. Termination</h2>
            <p>We may suspend or terminate your account if you violate these terms. You may delete your account at any time through the Settings page, which permanently removes all your data.</p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-foreground">10. Contact</h2>
            <p>For questions about these terms, please <Link href="/contact" className="text-accent hover:underline">contact us</Link>.</p>
          </section>
        </div>
      </main>
    </div>
  );
}
