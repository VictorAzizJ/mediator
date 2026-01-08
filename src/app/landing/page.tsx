'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--background)' }}>
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md" style={{ backgroundColor: 'rgba(255,255,255,0.9)', borderBottom: '1px solid var(--border-soft)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--color-calm-100)' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="var(--color-calm-700)">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                </svg>
              </div>
              <span className="font-semibold text-lg" style={{ color: 'var(--foreground)' }}>Mediator</span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm" style={{ color: 'var(--color-calm-600)' }}>Features</a>
              <a href="#for-teams" className="text-sm" style={{ color: 'var(--color-calm-600)' }}>For Teams</a>
              <a href="#pricing" className="text-sm" style={{ color: 'var(--color-calm-600)' }}>Pricing</a>
              <a href="#security" className="text-sm" style={{ color: 'var(--color-calm-600)' }}>Security</a>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/" className="text-sm px-4 py-2 rounded-lg" style={{ color: 'var(--color-calm-600)' }}>
                Sign In
              </Link>
              <Link href="/" className="btn-primary text-sm">
                Try Free
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-4xl mx-auto"
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-6" style={{ color: 'var(--foreground)' }}>
              Better Conversations.{' '}
              <span style={{ color: 'var(--color-calm-600)' }}>Stronger Teams.</span>
            </h1>
            <p className="text-xl mb-8 max-w-2xl mx-auto" style={{ color: 'var(--color-calm-500)' }}>
              The structured conversation platform that helps teams communicate with clarity, safety, and purpose.
              Turn workplace tension into team alignment.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/" className="btn-primary px-8 py-3 text-lg">
                Start Free Session
              </Link>
              <button className="btn-secondary px-8 py-3 text-lg flex items-center gap-2">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z" />
                </svg>
                Watch Demo
              </button>
            </div>
          </motion.div>

          {/* Product Preview */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-16 max-w-5xl mx-auto"
          >
            <div className="rounded-2xl overflow-hidden shadow-2xl border" style={{ borderColor: 'var(--border-soft)' }}>
              <div className="p-4 flex items-center gap-2" style={{ backgroundColor: 'var(--color-calm-50)', borderBottom: '1px solid var(--border-soft)' }}>
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#FF5F57' }} />
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#FFBD2E' }} />
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#28CA41' }} />
                </div>
                <span className="text-xs ml-2" style={{ color: 'var(--color-calm-400)' }}>Mediator Session</span>
              </div>
              <div className="p-8" style={{ backgroundColor: 'var(--background)' }}>
                <ProductPreview />
              </div>
            </div>
          </motion.div>

          {/* Trust badges */}
          <div className="mt-16 text-center">
            <p className="text-sm mb-6" style={{ color: 'var(--color-calm-400)' }}>
              Trusted by forward-thinking teams
            </p>
            <div className="flex items-center justify-center gap-12 opacity-50">
              {['TechCorp', 'StartupXYZ', 'Enterprise Co', 'Innovation Labs'].map((name) => (
                <span key={name} className="text-lg font-semibold" style={{ color: 'var(--color-calm-300)' }}>
                  {name}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4" style={{ backgroundColor: 'var(--color-calm-50)' }}>
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <StatItem value="80%" label="of workplace conflict is preventable" />
            <StatItem value="3x" label="faster conflict resolution" />
            <StatItem value="40%" label="reduction in escalations" />
            <StatItem value="92%" label="user satisfaction rate" />
          </div>
        </div>
      </section>

      {/* For Teams Section */}
      <section id="for-teams" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: 'var(--foreground)' }}>
              For Teams
            </h2>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: 'var(--color-calm-500)' }}>
              Conversation safety and clarity for high-performance organizations
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<TimerIcon />}
              title="Structured Turn-Taking"
              description="Equal voice for everyone. Configurable timers ensure balanced participation and prevent one person from dominating."
            />
            <FeatureCard
              icon={<ShieldIcon />}
              title="Real-Time Monitoring"
              description="Escalation prevention built-in. Volume detection and trigger warnings help conversations stay productive."
            />
            <FeatureCard
              icon={<SparkleIcon />}
              title="AI-Powered Insights"
              description="Automatic summaries and action items. Never lose track of what was discussed or agreed upon."
            />
          </div>
        </div>
      </section>

      {/* For HR Section */}
      <section className="py-20 px-4" style={{ backgroundColor: 'var(--color-calm-50)' }}>
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-sm font-medium px-3 py-1 rounded-full" style={{ backgroundColor: 'var(--color-calm-200)', color: 'var(--color-calm-700)' }}>
                For HR Leaders
              </span>
              <h2 className="text-3xl md:text-4xl font-bold mt-4 mb-6" style={{ color: 'var(--foreground)' }}>
                Tools for Insight, Fairness, and Documentation
              </h2>
              <div className="space-y-4">
                <CheckItem text="Aggregate team health dashboards" />
                <CheckItem text="Compliance-ready conversation records" />
                <CheckItem text="Early warning indicators for team issues" />
                <CheckItem text="Privacy-first architecture" />
                <CheckItem text="Export capabilities for documentation" />
              </div>
              <div className="mt-8">
                <button className="btn-secondary">
                  Download HR Toolkit
                </button>
              </div>
            </div>
            <div className="rounded-2xl p-8" style={{ backgroundColor: 'white', border: '1px solid var(--border-soft)' }}>
              <TestimonialCard
                quote="Mediator reduced our conflict escalation by 40% and gave us the documentation we needed for difficult situations."
                author="Sarah Chen"
                role="VP People, TechCorp"
              />
            </div>
          </div>
        </div>
      </section>

      {/* For Leaders Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="order-2 md:order-1">
              <div className="rounded-2xl p-6" style={{ backgroundColor: 'var(--color-calm-50)', border: '1px solid var(--border-soft)' }}>
                <h4 className="font-semibold mb-4" style={{ color: 'var(--foreground)' }}>
                  Common Use Cases
                </h4>
                <div className="space-y-3">
                  {[
                    'Weekly 1-on-1s with structure',
                    'Performance conversations',
                    'Conflict resolution between team members',
                    'Feedback exchanges',
                    'Return-from-leave check-ins',
                    'Difficult conversations',
                  ].map((useCase) => (
                    <div key={useCase} className="flex items-center gap-3 p-3 rounded-lg" style={{ backgroundColor: 'white' }}>
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--color-calm-600)' }} />
                      <span className="text-sm" style={{ color: 'var(--foreground)' }}>{useCase}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="order-1 md:order-2">
              <span className="text-sm font-medium px-3 py-1 rounded-full" style={{ backgroundColor: 'var(--color-warm-100)', color: 'var(--color-calm-700)' }}>
                For Managers & Executives
              </span>
              <h2 className="text-3xl md:text-4xl font-bold mt-4 mb-6" style={{ color: 'var(--foreground)' }}>
                Conflict Doesn't Have to Mean Disconnection
              </h2>
              <p className="text-lg mb-6" style={{ color: 'var(--color-calm-500)' }}>
                Most managers avoid difficult conversations. Mediator gives you the structure to have them well—and build stronger relationships in the process.
              </p>
              <Link href="/" className="btn-primary">
                Explore Manager Templates
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4" style={{ backgroundColor: 'var(--color-calm-50)' }}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: 'var(--foreground)' }}>
              How Mediator Works
            </h2>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: 'var(--color-calm-500)' }}>
              Simple, structured, effective
            </p>
          </div>

          {/* Steps */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <StepCard
              number="1"
              title="Set Up"
              description="Choose a template or customize your conversation structure. Set turn duration and goals."
            />
            <StepCard
              number="2"
              title="Converse"
              description="Turn-taking timer ensures equal airtime. Real-time monitoring keeps things productive."
            />
            <StepCard
              number="3"
              title="Reflect"
              description="AI-generated summary captures key points. Private notes for personal reflection."
            />
          </div>

          {/* Feature grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <SmallFeature icon="🎙️" title="Real-time Transcript" />
            <SmallFeature icon="⚡" title="Trigger Detection" />
            <SmallFeature icon="📊" title="Speaking Analytics" />
            <SmallFeature icon="📄" title="PDF Export" />
            <SmallFeature icon="👀" title="Observer Mode" />
            <SmallFeature icon="📋" title="10+ Templates" />
            <SmallFeature icon="🧘" title="Breathing Exercises" />
            <SmallFeature icon="🔒" title="Privacy-First" />
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section id="security" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: 'var(--foreground)' }}>
              Security & Privacy
            </h2>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: 'var(--color-calm-500)' }}>
              Built for sensitive conversations
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <SecurityCard
              icon="🔒"
              title="End-to-End Encryption"
              description="Conversations encrypted at rest and in transit. Your data stays your data."
            />
            <SecurityCard
              icon="🛡️"
              title="GDPR & HIPAA Ready"
              description="Compliance-ready architecture with data residency options."
            />
            <SecurityCard
              icon="📋"
              title="Audit Logging"
              description="Complete audit trail for compliance and accountability."
            />
          </div>

          <div className="mt-12 text-center">
            <div className="inline-flex flex-wrap justify-center gap-4 text-sm" style={{ color: 'var(--color-calm-500)' }}>
              <span>• No conversation data used for AI training</span>
              <span>• User-controlled data retention</span>
              <span>• SOC 2 Type II compliance (in progress)</span>
              <span>• Optional on-premise deployment</span>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4" style={{ backgroundColor: 'var(--color-calm-50)' }}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: 'var(--foreground)' }}>
              Simple Pricing
            </h2>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: 'var(--color-calm-500)' }}>
              Free for personal use. Premium for teams.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <PricingCard
              name="Personal"
              price="Free"
              description="For individuals and families"
              features={[
                'Unlimited sessions',
                'Basic AI summaries',
                'PDF export',
                'Session recovery',
              ]}
              cta="Get Started"
              ctaLink="/"
            />
            <PricingCard
              name="Team"
              price="$15"
              period="/user/month"
              description="For teams and managers"
              features={[
                'Everything in Personal',
                'Team dashboard',
                '10+ conversation templates',
                'Speaking analytics',
                'Observer mode',
                'Priority support',
              ]}
              cta="Start Trial"
              ctaLink="/"
              highlighted
            />
            <PricingCard
              name="Enterprise"
              price="Custom"
              description="For organizations"
              features={[
                'Everything in Team',
                'SSO / SAML',
                'On-premise option',
                'Custom integrations',
                'Dedicated support',
                'SLA guarantee',
              ]}
              cta="Contact Sales"
              ctaLink="mailto:hello@mediator.app"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6" style={{ color: 'var(--foreground)' }}>
            Ready to Transform Your Team's Communication?
          </h2>
          <p className="text-lg mb-8" style={{ color: 'var(--color-calm-500)' }}>
            Join hundreds of teams having better conversations.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/" className="btn-primary px-8 py-3 text-lg">
              Try Free Session
            </Link>
            <button className="btn-secondary px-8 py-3 text-lg">
              Book a Demo
            </button>
          </div>
          <p className="mt-6 text-sm" style={{ color: 'var(--color-calm-400)' }}>
            Questions? <a href="mailto:hello@mediator.app" className="underline">hello@mediator.app</a>
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t" style={{ borderColor: 'var(--border-soft)' }}>
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--color-calm-100)' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="var(--color-calm-700)">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                  </svg>
                </div>
                <span className="font-semibold" style={{ color: 'var(--foreground)' }}>Mediator</span>
              </div>
              <p className="text-sm" style={{ color: 'var(--color-calm-500)' }}>
                Better conversations for better teams.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4" style={{ color: 'var(--foreground)' }}>Product</h4>
              <div className="space-y-2 text-sm" style={{ color: 'var(--color-calm-500)' }}>
                <p><a href="#features">Features</a></p>
                <p><a href="#pricing">Pricing</a></p>
                <p><a href="#security">Security</a></p>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4" style={{ color: 'var(--foreground)' }}>Resources</h4>
              <div className="space-y-2 text-sm" style={{ color: 'var(--color-calm-500)' }}>
                <p><a href="#">Documentation</a></p>
                <p><a href="#">Templates</a></p>
                <p><a href="#">Blog</a></p>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4" style={{ color: 'var(--foreground)' }}>Company</h4>
              <div className="space-y-2 text-sm" style={{ color: 'var(--color-calm-500)' }}>
                <p><a href="#">About</a></p>
                <p><a href="#">Privacy Policy</a></p>
                <p><a href="#">Terms of Service</a></p>
              </div>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t text-center text-sm" style={{ borderColor: 'var(--border-soft)', color: 'var(--color-calm-400)' }}>
            © {new Date().getFullYear()} Mediator. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

// Component definitions

function ProductPreview() {
  return (
    <div className="flex flex-col md:flex-row gap-8">
      {/* Participant cards */}
      <div className="flex gap-4 justify-center">
        <div className="w-24 text-center">
          <div className="w-16 h-16 rounded-full mx-auto mb-2 flex items-center justify-center text-2xl" style={{ backgroundColor: 'var(--color-calm-100)' }}>
            👤
          </div>
          <p className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>Alex</p>
          <p className="text-xs" style={{ color: 'var(--color-calm-500)' }}>Speaking</p>
        </div>
        <div className="w-24 text-center opacity-60">
          <div className="w-16 h-16 rounded-full mx-auto mb-2 flex items-center justify-center text-2xl" style={{ backgroundColor: 'var(--color-calm-50)' }}>
            👤
          </div>
          <p className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>Jordan</p>
          <p className="text-xs" style={{ color: 'var(--color-calm-500)' }}>Listening</p>
        </div>
      </div>

      {/* Timer */}
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="relative w-32 h-32">
          <svg className="w-full h-full transform -rotate-90">
            <circle cx="64" cy="64" r="56" stroke="var(--color-calm-100)" strokeWidth="8" fill="none" />
            <circle cx="64" cy="64" r="56" stroke="var(--color-calm-600)" strokeWidth="8" fill="none" strokeDasharray="264 352" strokeLinecap="round" />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>1:15</span>
          </div>
        </div>
        <p className="mt-4 text-sm" style={{ color: 'var(--color-calm-500)' }}>
          Share what you need to say
        </p>
      </div>

      {/* Speaking balance */}
      <div className="flex flex-col justify-center">
        <p className="text-xs mb-2" style={{ color: 'var(--color-calm-500)' }}>Speaking Balance</p>
        <div className="w-32 h-3 rounded-full overflow-hidden flex" style={{ backgroundColor: 'var(--color-calm-100)' }}>
          <div className="h-full" style={{ width: '55%', backgroundColor: 'var(--color-calm-700)' }} />
        </div>
        <div className="flex justify-between mt-1 text-xs" style={{ color: 'var(--color-calm-400)' }}>
          <span>55%</span>
          <span>45%</span>
        </div>
      </div>
    </div>
  );
}

function StatItem({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <p className="text-3xl md:text-4xl font-bold" style={{ color: 'var(--color-calm-700)' }}>{value}</p>
      <p className="text-sm mt-1" style={{ color: 'var(--color-calm-500)' }}>{label}</p>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="card hover:shadow-lg transition-shadow">
      <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ backgroundColor: 'var(--color-calm-100)' }}>
        {icon}
      </div>
      <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--foreground)' }}>{title}</h3>
      <p className="text-sm" style={{ color: 'var(--color-calm-500)' }}>{description}</p>
    </div>
  );
}

function CheckItem({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--color-safe-green)' }}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="white">
          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
        </svg>
      </div>
      <span style={{ color: 'var(--color-calm-600)' }}>{text}</span>
    </div>
  );
}

function TestimonialCard({ quote, author, role }: { quote: string; author: string; role: string }) {
  return (
    <div>
      <svg width="32" height="32" viewBox="0 0 24 24" fill="var(--color-calm-200)" className="mb-4">
        <path d="M6 17h3l2-4V7H5v6h3zm8 0h3l2-4V7h-6v6h3z" />
      </svg>
      <p className="text-lg mb-6" style={{ color: 'var(--foreground)' }}>"{quote}"</p>
      <div>
        <p className="font-medium" style={{ color: 'var(--foreground)' }}>{author}</p>
        <p className="text-sm" style={{ color: 'var(--color-calm-500)' }}>{role}</p>
      </div>
    </div>
  );
}

function StepCard({ number, title, description }: { number: string; title: string; description: string }) {
  return (
    <div className="text-center">
      <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold" style={{ backgroundColor: 'var(--color-calm-700)', color: 'white' }}>
        {number}
      </div>
      <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--foreground)' }}>{title}</h3>
      <p className="text-sm" style={{ color: 'var(--color-calm-500)' }}>{description}</p>
    </div>
  );
}

function SmallFeature({ icon, title }: { icon: string; title: string }) {
  return (
    <div className="p-4 rounded-xl text-center" style={{ backgroundColor: 'white' }}>
      <span className="text-2xl">{icon}</span>
      <p className="text-sm mt-2" style={{ color: 'var(--foreground)' }}>{title}</p>
    </div>
  );
}

function SecurityCard({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div className="card text-center">
      <span className="text-4xl">{icon}</span>
      <h3 className="text-lg font-semibold mt-4 mb-2" style={{ color: 'var(--foreground)' }}>{title}</h3>
      <p className="text-sm" style={{ color: 'var(--color-calm-500)' }}>{description}</p>
    </div>
  );
}

function PricingCard({
  name,
  price,
  period,
  description,
  features,
  cta,
  ctaLink,
  highlighted,
}: {
  name: string;
  price: string;
  period?: string;
  description: string;
  features: string[];
  cta: string;
  ctaLink: string;
  highlighted?: boolean;
}) {
  return (
    <div
      className={`card ${highlighted ? 'ring-2 ring-[var(--color-calm-600)]' : ''}`}
    >
      {highlighted && (
        <span className="inline-block text-xs font-medium px-3 py-1 rounded-full mb-4" style={{ backgroundColor: 'var(--color-calm-600)', color: 'white' }}>
          Most Popular
        </span>
      )}
      <h3 className="text-xl font-semibold" style={{ color: 'var(--foreground)' }}>{name}</h3>
      <div className="mt-4 mb-2">
        <span className="text-4xl font-bold" style={{ color: 'var(--foreground)' }}>{price}</span>
        {period && <span style={{ color: 'var(--color-calm-500)' }}>{period}</span>}
      </div>
      <p className="text-sm mb-6" style={{ color: 'var(--color-calm-500)' }}>{description}</p>
      <ul className="space-y-3 mb-8">
        {features.map((feature) => (
          <li key={feature} className="flex items-center gap-2 text-sm" style={{ color: 'var(--color-calm-600)' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="var(--color-safe-green)">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
            </svg>
            {feature}
          </li>
        ))}
      </ul>
      <Link
        href={ctaLink}
        className={`w-full block text-center py-3 rounded-xl font-medium ${highlighted ? 'btn-primary' : 'btn-secondary'}`}
      >
        {cta}
      </Link>
    </div>
  );
}

// Icons
function TimerIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="var(--color-calm-700)">
      <path d="M15 1H9v2h6V1zm-4 13h2V8h-2v6zm8.03-6.61l1.42-1.42c-.43-.51-.9-.99-1.41-1.41l-1.42 1.42A8.962 8.962 0 0012 4c-4.97 0-9 4.03-9 9s4.02 9 9 9 9-4.03 9-9c0-2.12-.74-4.07-1.97-5.61zM12 20c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="var(--color-calm-700)">
      <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z" />
    </svg>
  );
}

function SparkleIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="var(--color-calm-700)">
      <path d="M12 2L9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2z" />
    </svg>
  );
}
