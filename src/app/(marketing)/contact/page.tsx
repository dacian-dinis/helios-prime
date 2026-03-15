"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, MessageSquare, Github } from "lucide-react";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("general");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In production, this would send to an API endpoint or email service
    setSubmitted(true);
  };

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
        <h1 className="mb-2 text-3xl font-bold">Contact Us</h1>
        <p className="mb-10 text-sm text-foreground/50">
          Have a question, feedback, or issue? We&apos;d love to hear from you.
        </p>

        <div className="grid gap-10 md:grid-cols-5">
          {/* Contact form */}
          <div className="md:col-span-3">
            {submitted ? (
              <div className="rounded-2xl border border-accent/30 bg-accent/5 p-8 text-center">
                <div className="mb-4 text-4xl">✉️</div>
                <h2 className="mb-2 text-xl font-bold">Message sent!</h2>
                <p className="text-sm text-foreground/60">
                  Thanks for reaching out. We&apos;ll get back to you within 24-48 hours.
                </p>
                <button
                  onClick={() => { setSubmitted(false); setName(""); setEmail(""); setMessage(""); }}
                  className="mt-6 rounded-lg bg-accent px-6 py-2 text-sm font-semibold text-black transition hover:bg-accent-dark"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium">Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full rounded-lg border border-foreground/20 bg-foreground/5 px-4 py-2.5 text-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
                      placeholder="Your name"
                      required
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium">Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-lg border border-foreground/20 bg-foreground/5 px-4 py-2.5 text-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
                      placeholder="you@example.com"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium">Subject</label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full rounded-lg border border-foreground/20 bg-foreground/5 px-4 py-2.5 text-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
                  >
                    <option value="general">General Question</option>
                    <option value="bug">Bug Report</option>
                    <option value="feature">Feature Request</option>
                    <option value="billing">Billing & Subscription</option>
                    <option value="account">Account Issue</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium">Message</label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={5}
                    className="w-full resize-none rounded-lg border border-foreground/20 bg-foreground/5 px-4 py-2.5 text-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
                    placeholder="Tell us what's on your mind..."
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full rounded-lg bg-accent py-2.5 text-sm font-semibold text-black transition hover:bg-accent-dark"
                >
                  Send Message
                </button>
              </form>
            )}
          </div>

          {/* Sidebar info */}
          <div className="space-y-6 md:col-span-2">
            <div className="rounded-xl border border-foreground/10 bg-foreground/[0.02] p-5">
              <div className="mb-3 flex items-center gap-2">
                <Mail className="h-4 w-4 text-accent" />
                <h3 className="text-sm font-semibold">Email</h3>
              </div>
              <p className="text-sm text-foreground/60">support@heliosprime.app</p>
            </div>

            <div className="rounded-xl border border-foreground/10 bg-foreground/[0.02] p-5">
              <div className="mb-3 flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-accent" />
                <h3 className="text-sm font-semibold">Response Time</h3>
              </div>
              <p className="text-sm text-foreground/60">We typically respond within 24-48 hours on business days.</p>
            </div>

            <div className="rounded-xl border border-foreground/10 bg-foreground/[0.02] p-5">
              <div className="mb-3 flex items-center gap-2">
                <Github className="h-4 w-4 text-accent" />
                <h3 className="text-sm font-semibold">Open Source</h3>
              </div>
              <p className="text-sm text-foreground/60">
                Found a bug? Open an issue on{" "}
                <a
                  href="https://github.com/dacian-dinis/helios-prime"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent hover:underline"
                >
                  GitHub
                </a>
                .
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
