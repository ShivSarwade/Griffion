import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Shield, Zap, Lock, Users, Download, Check } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold">Griffion</span>
          </div>
          <nav className="flex items-center gap-4">
            <Link href="#features" className="text-sm font-medium hover:text-primary">
              Features
            </Link>
            <Link href="#pricing" className="text-sm font-medium hover:text-primary">
              Pricing
            </Link>
            <Link href="/configure">
              <Button>Start Configuring</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl font-bold mb-6">
          Deploy Authentication in Minutes,
          <br />
          <span className="text-primary">Not Weeks</span>
        </h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          A configurable authentication microservice that includes secure login, 2FA,
          role management, and password recovery. Ready to deploy with zero configuration.
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/configure">
            <Button size="lg" className="text-lg px-8">
              Get Started <Zap className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <Link href="#features">
            <Button size="lg" variant="outline" className="text-lg px-8">
              Learn More
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-8 max-w-3xl mx-auto mt-16">
          <div>
            <div className="text-4xl font-bold text-primary">&lt; 30 min</div>
            <div className="text-sm text-muted-foreground">Setup Time</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-primary">95%</div>
            <div className="text-sm text-muted-foreground">Success Rate</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-primary">Zero</div>
            <div className="text-sm text-muted-foreground">Configuration</div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="bg-muted/50 py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Everything You Need for Authentication
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Lock className="h-10 w-10 text-primary" />}
              title="Secure by Default"
              description="JWT-based authentication, bcrypt password hashing, and HTTPS enforcement out of the box."
            />
            <FeatureCard
              icon={<Shield className="h-10 w-10 text-primary" />}
              title="Two-Factor Auth"
              description="Optional 2FA via SMS or Email OTP to add an extra layer of security."
            />
            <FeatureCard
              icon={<Users className="h-10 w-10 text-primary" />}
              title="Role Management"
              description="Built-in RBAC with customizable roles, groups, and permissions."
            />
            <FeatureCard
              icon={<Zap className="h-10 w-10 text-primary" />}
              title="Auto Setup"
              description="One command setup: npm start handles dependencies, DB, and admin user creation."
            />
            <FeatureCard
              icon={<Download className="h-10 w-10 text-primary" />}
              title="Instant Download"
              description="Configure, purchase, and download your ready-to-deploy microservice immediately."
            />
            <FeatureCard
              icon={<Check className="h-10 w-10 text-primary" />}
              title="Admin Panel"
              description="Optional UI for managing users, roles, and viewing audit logs."
            />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid md:grid-cols-4 gap-8">
            <StepCard number="1" title="Configure" description="Choose your auth features in our simple wizard" />
            <StepCard number="2" title="Purchase" description="One-time payment, instant access" />
            <StepCard number="3" title="Download" description="Get your configured microservice package" />
            <StepCard number="4" title="Deploy" description="Run npm start and you're live!" />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary text-primary-foreground py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join developers who've saved weeks of development time
          </p>
          <Link href="/configure">
            <Button size="lg" variant="secondary" className="text-lg px-8">
              Start Configuring Now
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>&copy; 2025 Griffion. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="bg-card p-6 rounded-lg border">
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
}

function StepCard({ number, title, description }: { number: string; title: string; description: string }) {
  return (
    <div className="text-center">
      <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
        {number}
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
