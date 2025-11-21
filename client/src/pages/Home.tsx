import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Loader2, MapPin, Clock, CheckCircle2, Users, Zap, Radio, FolderOpen, Link2, 
  Building2, Globe, ArrowRight, TrendingUp, FileSpreadsheet, Mail, Phone, 
  MessageSquare, BarChart3, Shield, Smartphone, Calendar, Bell, MessageCircle, 
  Camera, ArrowLeftRight, FileText, Check, X
} from "lucide-react";
import { LogoImage } from "@/components/LogoImage";
import { Link } from "wouter";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function Home() {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const pricingPlans = [
    {
      name: "Trial",
      price: "Free",
      period: "14 days",
      description: "Perfect for testing and evaluation",
      features: [
        { text: "50 jobs per month", included: true },
        { text: "1 admin user", included: true },
        { text: "Real-time GPS tracking", included: true },
        { text: "Client portal access", included: true },
        { text: "Email notifications", included: true },
        { text: "Basic reporting", included: true },
        { text: "Priority support", included: false },
        { text: "Custom branding", included: false },
      ],
      cta: "Sign Up Now",
      popular: false,
    },
    {
      name: "Starter",
      price: "$99",
      period: "per month",
      description: "Ideal for small MSPs and growing teams",
      features: [
        { text: "100 jobs per month", included: true },
        { text: "Up to 3 admin users", included: true },
        { text: "Real-time GPS tracking", included: true },
        { text: "Client portal access", included: true },
        { text: "Email & SMS notifications", included: true },
        { text: "Advanced reporting", included: true },
        { text: "Priority support", included: true },
        { text: "Custom branding", included: false },
      ],
      cta: "Sign Up Now",
      popular: true,
    },
    {
      name: "Enterprise",
      price: "$399",
      period: "per month",
      description: "For large MSPs with unlimited needs",
      features: [
        { text: "Unlimited jobs", included: true },
        { text: "Unlimited admin users", included: true },
        { text: "Real-time GPS tracking", included: true },
        { text: "Client portal access", included: true },
        { text: "Email & SMS notifications", included: true },
        { text: "Advanced reporting & analytics", included: true },
        { text: "24/7 priority support", included: true },
        { text: "Custom branding & white-label", included: true },
      ],
      cta: "Sign Up Now",
      popular: false,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <LogoImage className="h-12" />
            <div className="hidden md:block">
              <p className="text-sm font-semibold text-foreground">FieldPulse Go</p>
              <p className="text-xs text-muted-foreground">Enterprise Field Service Platform for MSPs</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <a href="#pricing" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors hidden md:inline">
              Pricing
            </a>
            <a href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors hidden md:inline">
              Features
            </a>
            <ThemeToggle />
            {isAuthenticated ? (
              <Link href="/admin">
                <Button>Dashboard</Button>
              </Link>
            ) : (
              <Link href="/login">
                <Button variant="outline">Sign In</Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section - MSP Focused */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0A1E3D]/5 via-[#1C273A]/5 to-[#0A1E3D]/5 dark:from-[#0A1E3D]/20 dark:via-[#1C273A]/20 dark:to-[#0A1E3D]/20"></div>
        <div className="container mx-auto px-4 py-24 relative">
          <div className="max-w-5xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20 bg-primary/5 mb-6">
              <Radio className="h-4 w-4 text-primary animate-pulse" />
              <span className="text-sm font-medium text-primary">All-in-One Field Service Management SaaS</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold text-foreground mb-6 leading-tight">
              Transform Your MSP<br />
              <span className="text-primary">Field Service Operations</span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
              Give your clients the visibility and control they expect. Manage hundreds of engineers across multiple clients with complete end-to-end automation.
            </p>
            <div className="flex gap-4 justify-center flex-wrap mb-12">
              <Link href="/signup">
                <Button size="lg" className="text-lg px-8 py-6 gradient-orange text-white hover:shadow-lg hover:shadow-primary/50 transition-all">
                  <Zap className="h-5 w-5 mr-2" />
                  Start Free Trial
                </Button>
              </Link>
              <a href="#pricing">
                <Button size="lg" variant="outline" className="text-lg px-8 py-6 border-primary/30 hover:bg-primary/10">
                  View Pricing
                </Button>
              </a>
            </div>
            
            {/* Social Proof Bar */}
            <div className="flex items-center justify-center gap-8 flex-wrap text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                <span>500+ MSPs Trust FieldPulse</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                <span>50,000+ Jobs Dispatched Monthly</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                <span>99.9% Uptime SLA</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Client Experience - The Centerpiece */}
      <section id="features" className="container mx-auto px-4 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20 bg-primary/5 mb-4">
              <TrendingUp className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">Client Experience First</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Elevate Your Client Experience
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Happy clients renew contracts. FieldPulse gives your clients the visibility, control, and professionalism they expect from enterprise service delivery.
            </p>
          </div>

          {/* Three-Tier Value Proposition */}
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {/* For MSPs */}
            <Card className="border-primary/30 hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Building2 className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-2xl">For MSPs</CardTitle>
                <CardDescription>Your Operations Command Center</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-muted-foreground">Multi-tenant platform - manage all clients from one dashboard</p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-muted-foreground">Automated dispatch & assignment - reduce admin overhead by 70%</p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-muted-foreground">Real-time visibility into all field operations</p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-muted-foreground">Automated SLA tracking & reporting</p>
                </div>
              </CardContent>
            </Card>

            {/* For MSP Clients */}
            <Card className="border-accent/30 hover:border-accent/50 transition-colors">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-accent" />
                </div>
                <CardTitle className="text-2xl">For Your Clients</CardTitle>
                <CardDescription>Enterprise-Grade Transparency</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-accent mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-muted-foreground">Self-service portal - submit requests 24/7 without calling you</p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-accent mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-muted-foreground">Live tracking links - see engineer location and ETA in real-time</p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-accent mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-muted-foreground">Automatic notifications - no more "where are you?" calls</p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-accent mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-muted-foreground">Complete job history - searchable audit trail</p>
                </div>
              </CardContent>
            </Card>

            {/* For Engineers */}
            <Card className="border-primary/30 hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Smartphone className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-2xl">For Engineers</CardTitle>
                <CardDescription>Mobile-First Experience</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-muted-foreground">One-tap navigation to job sites with GPS</p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-muted-foreground">Complete job details and client info at their fingertips</p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-muted-foreground">Photo uploads and notes from the field</p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-muted-foreground">Automatic check-in/out with GPS verification</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Live Engineer Tracking */}
      <section className="bg-muted/30 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20 bg-primary/5 mb-4">
                <MapPin className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-primary">Real-Time Visibility</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
                Live Engineer Tracking
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Know exactly where every engineer is, in real-time. GPS tracking, accurate ETAs, and complete transparency for MSPs, clients, and end users.
              </p>
            </div>

            {/* Stats Bar */}
            <Card className="border-primary/30 bg-primary/5 mb-12">
              <CardContent className="py-8">
                <div className="grid md:grid-cols-4 gap-8 text-center">
                  <div>
                    <p className="text-3xl font-bold text-primary mb-2">90%</p>
                    <p className="text-sm text-muted-foreground">Reduction in "Where are you?" calls</p>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-primary mb-2">15min</p>
                    <p className="text-sm text-muted-foreground">Average ETA accuracy</p>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-primary mb-2">30%</p>
                    <p className="text-sm text-muted-foreground">Faster dispatch with closest engineer routing</p>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-primary mb-2">100%</p>
                    <p className="text-sm text-muted-foreground">GPS-verified arrival/departure times</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* End-to-End Workflow */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Complete End-to-End Solution
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Replace your entire field service stack with one integrated platform
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            <Card className="text-center border-primary/20">
              <CardHeader>
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-primary">1</span>
                </div>
                <CardTitle className="text-xl">Request Intake</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Client portals + public forms replace emails and phone calls
                </p>
              </CardContent>
            </Card>

            <Card className="text-center border-accent/20">
              <CardHeader>
                <div className="h-16 w-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-accent">2</span>
                </div>
                <CardTitle className="text-xl">Dispatch</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Automated routing and assignment replaces spreadsheets
                </p>
              </CardContent>
            </Card>

            <Card className="text-center border-primary/20">
              <CardHeader>
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-primary">3</span>
                </div>
                <CardTitle className="text-xl">Execute</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Real-time tracking replaces WhatsApp status updates
                </p>
              </CardContent>
            </Card>

            <Card className="text-center border-accent/20">
              <CardHeader>
                <div className="h-16 w-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-accent">4</span>
                </div>
                <CardTitle className="text-xl">Report</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Automated analytics replace manual reporting
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Replace Your Stack */}
      <section className="bg-muted/30 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
                Replace Your Entire Stack
              </h2>
              <p className="text-xl text-muted-foreground">
                Stop juggling multiple tools. One platform for everything.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <Card className="border-destructive/30">
                <CardHeader>
                  <CardTitle className="text-2xl text-destructive">❌ Before FieldPulse</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Mail className="h-5 w-5 text-destructive mt-0.5" />
                    <div>
                      <p className="font-medium text-foreground">Email/Phone for Requests</p>
                      <p className="text-sm text-muted-foreground">Lost emails, missed calls, no tracking</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <FileSpreadsheet className="h-5 w-5 text-destructive mt-0.5" />
                    <div>
                      <p className="font-medium text-foreground">Spreadsheets for Scheduling</p>
                      <p className="text-sm text-muted-foreground">Manual updates, version conflicts, errors</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <MessageSquare className="h-5 w-5 text-destructive mt-0.5" />
                    <div>
                      <p className="font-medium text-foreground">WhatsApp for Updates</p>
                      <p className="text-sm text-muted-foreground">Unprofessional, no audit trail</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <FileSpreadsheet className="h-5 w-5 text-destructive mt-0.5" />
                    <div>
                      <p className="font-medium text-foreground">Manual Reporting</p>
                      <p className="text-sm text-muted-foreground">Hours spent compiling data</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-primary/30">
                <CardHeader>
                  <CardTitle className="text-2xl text-primary">✅ With FieldPulse</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Link2 className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium text-foreground">Client Portals</p>
                      <p className="text-sm text-muted-foreground">Self-service 24/7, automatic tracking</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Zap className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium text-foreground">Dispatch Dashboard</p>
                      <p className="text-sm text-muted-foreground">Automated assignment, real-time view</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium text-foreground">Real-Time Tracking</p>
                      <p className="text-sm text-muted-foreground">Live GPS, automatic notifications</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <BarChart3 className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium text-foreground">Automated Analytics</p>
                      <p className="text-sm text-muted-foreground">One-click exports, scheduled reports</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
      <section className="bg-muted/30 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20 bg-primary/5 mb-4">
                <FolderOpen className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-primary">Client Experience Driver</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
                Projects: Dedicated Client Portals
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Give each client their own branded portal with dedicated request URLs, pre-configured sites, and complete visibility
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-12 items-center mb-12">
              <div className="space-y-6">
                <div className="space-y-3">
                  <h3 className="text-2xl font-bold text-foreground">Zero Friction for Clients</h3>
                  <p className="text-muted-foreground">
                    Clients click their saved link → select site from dropdown → submit request. Takes 30 seconds. No login required.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold text-primary">1</span>
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">Create Project</p>
                      <p className="text-sm text-muted-foreground">Set up client-specific project with branding</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold text-primary">2</span>
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">Add Sites</p>
                      <p className="text-sm text-muted-foreground">Upload locations via Excel or add manually</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold text-primary">3</span>
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">Share Link</p>
                      <p className="text-sm text-muted-foreground">Copy unique URL and send to client</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold text-primary">4</span>
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">Auto-Organize</p>
                      <p className="text-sm text-muted-foreground">Jobs automatically tag to correct project</p>
                    </div>
                  </div>
                </div>
              </div>

              <Card className="border-primary/20">
                <CardHeader>
                  <CardTitle className="text-xl">Real MSP Success Story</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground italic">
                    "We manage IT for 35 companies. Before FieldPulse, clients would email or call with requests - half got lost. Now each client has their own portal link bookmarked. Requests come in automatically, organized by client. Our admin time dropped 70%."
                  </p>
                  <div className="pt-4 border-t border-border">
                    <p className="font-semibold text-foreground">Sarah Chen</p>
                    <p className="text-sm text-muted-foreground">Operations Director, TechServe MSP</p>
                  </div>
                  <div className="grid grid-cols-3 gap-4 pt-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-primary">35</p>
                      <p className="text-xs text-muted-foreground">Clients</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-primary">70%</p>
                      <p className="text-xs text-muted-foreground">Time Saved</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-primary">98%</p>
                      <p className="text-xs text-muted-foreground">Client Satisfaction</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Live Communication Channel */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20 bg-primary/5 mb-4">
              <MessageSquare className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">Real-Time Collaboration</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Live Communication Channel
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Instant messaging between MSPs, clients, and engineers. No more phone tag, missed calls, or lost emails. Everything documented in one thread.
            </p>
          </div>

          {/* Communication Flow Diagram */}
          <div className="mb-16">
            <Card className="border-primary/20">
              <CardContent className="py-12">
                <div className="grid md:grid-cols-3 gap-8 items-center">
                  <div className="text-center">
                    <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <Building2 className="h-10 w-10 text-primary" />
                    </div>
                    <p className="font-bold text-lg text-foreground mb-2">MSP Dispatcher</p>
                    <p className="text-sm text-muted-foreground">Monitors all conversations<br />Provides oversight & support</p>
                  </div>
                  <div className="flex items-center justify-center">
                    <div className="flex flex-col items-center gap-2">
                      <ArrowLeftRight className="h-8 w-8 text-primary" />
                      <p className="text-xs font-semibold text-primary">LIVE MESSAGING</p>
                      <ArrowLeftRight className="h-8 w-8 text-primary" />
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="h-20 w-20 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
                      <Users className="h-10 w-10 text-accent" />
                    </div>
                    <p className="font-bold text-lg text-foreground mb-2">Client & Engineer</p>
                    <p className="text-sm text-muted-foreground">Direct communication<br />Instant updates & photos</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div>
              <h3 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
                <MessageCircle className="h-6 w-6 text-primary" />
                Communication Features
              </h3>
              <div className="space-y-4">
                <Card className="border-primary/20">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-3">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <MessageSquare className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground mb-1">Instant Messaging</p>
                        <p className="text-sm text-muted-foreground">Real-time chat between all parties - messages delivered instantly with read receipts</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-primary/20">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-3">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Camera className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground mb-1">Photo Sharing</p>
                        <p className="text-sm text-muted-foreground">Engineers send site photos, equipment issues, or completion proof directly in chat</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-primary/20">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-3">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <FileText className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground mb-1">Full Message History</p>
                        <p className="text-sm text-muted-foreground">Complete conversation archive - searchable, exportable, and permanently stored</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            <div>
              <h3 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
                <TrendingUp className="h-6 w-6 text-accent" />
                Client Experience Benefits
              </h3>
              <div className="space-y-4">

                <Card className="border-accent/20">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-6 w-6 text-accent flex-shrink-0" />
                      <div>
                        <p className="font-semibold text-foreground mb-1">Instant Clarifications</p>
                        <p className="text-sm text-muted-foreground">Client needs more info? Engineer has a question? Instant two-way communication resolves issues in minutes.</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-accent/20">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-6 w-6 text-accent flex-shrink-0" />
                      <div>
                        <p className="font-semibold text-foreground mb-1">Visual Proof</p>
                        <p className="text-sm text-muted-foreground">Engineers share photos of issues, progress, or completion. Clients see exactly what's happening on-site.</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-accent/20">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-6 w-6 text-accent flex-shrink-0" />
                      <div>
                        <p className="font-semibold text-foreground mb-1">MSP Oversight</p>
                        <p className="text-sm text-muted-foreground">MSP sees all conversations and can jump in if needed. Clients feel supported with backup always available.</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>

          {/* Impact Stats */}
          <Card className="border-primary/30 bg-primary/5">
            <CardContent className="py-8">
              <div className="grid md:grid-cols-4 gap-8 text-center">
                <div>
                  <p className="text-3xl font-bold text-primary mb-2">85%</p>
                  <p className="text-sm text-muted-foreground">Reduction in phone calls</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-primary mb-2">3min</p>
                  <p className="text-sm text-muted-foreground">Average response time</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-primary mb-2">100%</p>
                  <p className="text-sm text-muted-foreground">Communication documented</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-primary mb-2">95%</p>
                  <p className="text-sm text-muted-foreground">Client satisfaction with updates</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* SVR - Service Verification Report */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20 bg-primary/5 mb-4">
              <Shield className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">Transparency & Accountability</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Service Verification Reports (SVR)
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Complete transparency for clients and end users. Every job documented with proof of service, timestamps, and engineer verification.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center mb-12">
            <div className="space-y-6">
              <div className="space-y-3">
                <h3 className="text-2xl font-bold text-foreground">What's Included in SVR</h3>
                <p className="text-muted-foreground">
                  Every completed job generates a comprehensive Service Verification Report that provides complete documentation and accountability.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Engineer Details</p>
                    <p className="text-sm text-muted-foreground">Name, photo, contact information, and credentials of assigned engineer</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Clock className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Complete Timeline</p>
                    <p className="text-sm text-muted-foreground">Job created, dispatched, en route, arrived, and completed timestamps with duration</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <MapPin className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Location Verification</p>
                    <p className="text-sm text-muted-foreground">GPS coordinates of service location and engineer check-in/check-out points</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Work Documentation</p>
                    <p className="text-sm text-muted-foreground">Service notes, work performed, parts used, and completion status</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Users className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Digital Signatures</p>
                    <p className="text-sm text-muted-foreground">Client signature capture for proof of service completion and acceptance</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Photo Evidence</p>
                    <p className="text-sm text-muted-foreground">Before/after photos, equipment serial numbers, and visual documentation</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <Card className="border-accent/20">
                <CardHeader>
                  <CardTitle className="text-xl flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-accent" />
                    For Your Clients
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    <strong className="text-foreground">Complete Accountability:</strong> Clients see exactly when engineers arrived, how long they worked, and what was completed.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    <strong className="text-foreground">Audit Trail:</strong> Full documentation for compliance, billing disputes, and service level verification.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    <strong className="text-foreground">Instant Access:</strong> SVRs available immediately after job completion via client portal.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    <strong className="text-foreground">Export Ready:</strong> Download PDFs for records, share with stakeholders, attach to invoices.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-primary/20">
                <CardHeader>
                  <CardTitle className="text-xl flex items-center gap-2">
                    <Smartphone className="h-5 w-5 text-primary" />
                    For End Users
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    <strong className="text-foreground">Know Who's Coming:</strong> See engineer name, photo, and contact before arrival.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    <strong className="text-foreground">Track Progress:</strong> Real-time updates from dispatch to completion with exact timestamps.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    <strong className="text-foreground">Verify Work:</strong> Review service notes, photos, and documentation of work performed.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    <strong className="text-foreground">Confirm Completion:</strong> Digital signature ensures mutual agreement on service delivery.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          <Card className="border-primary/30 bg-primary/5">
            <CardContent className="py-8">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-foreground mb-4">Build Trust Through Transparency</h3>
                <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                  SVRs eliminate "he said, she said" disputes. Your clients get proof of service. End users get peace of mind. You get reduced complaints and faster payments.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Reporting & Export Capabilities */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20 bg-primary/5 mb-4">
              <BarChart3 className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">Business Intelligence</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              End-of-Month Reporting Made Easy
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              One-click job exports for billing. Automated reports for clients. Complete business intelligence.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-primary/20">
              <CardHeader>
                <FileSpreadsheet className="h-10 w-10 text-primary mb-4" />
                <CardTitle className="text-xl">Job Extraction</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Export by date range, client, project, or engineer. Excel/CSV formats ready for accounting systems.
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    Bulk data extraction
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    Custom date ranges
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    Per-client billing reports
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-accent/20">
              <CardHeader>
                <Calendar className="h-10 w-10 text-accent mb-4" />
                <CardTitle className="text-xl">Automated Reports</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Scheduled monthly reports per client. Service delivery summaries. SLA compliance tracking.
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-accent" />
                    Monthly summaries
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-accent" />
                    SLA compliance
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-accent" />
                    Performance metrics
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-primary/20">
              <CardHeader>
                <TrendingUp className="h-10 w-10 text-primary mb-4" />
                <CardTitle className="text-xl">Analytics Dashboard</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Response time analytics. Job completion rates. Engineer performance. Revenue tracking.
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    Real-time dashboards
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    Trend analysis
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    Revenue per client
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
      {/* Pricing Section */}
      <section id="pricing" className="container mx-auto px-4 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20 bg-primary/5 mb-4">
              <TrendingUp className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">Simple, Transparent Pricing</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Choose Your Plan
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Start with a free trial. Scale as you grow. No hidden fees.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {pricingPlans.map((plan, index) => (
              <Card 
                key={index} 
                className={`relative ${plan.popular ? 'border-primary border-2 shadow-lg' : 'border-2'}`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground px-4 py-1">
                      Most Popular
                    </Badge>
                  </div>
                )}
                <CardHeader className="text-center pb-8">
                  <CardTitle className="text-2xl mb-2">{plan.name}</CardTitle>
                  <div className="mb-2">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    {plan.price !== "Free" && (
                      <span className="text-muted-foreground">/{plan.period}</span>
                    )}
                  </div>
                  <CardDescription className="text-base">{plan.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <ul className="space-y-3">
                    {plan.features.map((feature, fIndex) => (
                      <li key={fIndex} className="flex items-start gap-3">
                        {feature.included ? (
                          <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                        ) : (
                          <X className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                        )}
                        <span className={feature.included ? "text-foreground" : "text-muted-foreground"}>
                          {feature.text}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <Link href="/signup">
                    <Button 
                      className="w-full" 
                      variant={plan.popular ? "default" : "outline"}
                      size="lg"
                    >
                      {plan.cta}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-12 text-center">
            <p className="text-muted-foreground">
              All plans include 14-day free trial • No credit card required for trial
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-muted/30 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Card className="bg-gradient-to-r from-orange-600 to-orange-500 border-0 text-white">
              <CardContent className="p-12 text-center">
                <h2 className="text-4xl font-bold mb-4">Ready to Transform Your Field Operations?</h2>
                <p className="text-xl mb-8 text-orange-50">
                  Join 500+ MSPs delivering enterprise-grade field service experiences.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/signup">
                    <Button size="lg" variant="secondary" className="text-lg px-8">
                      Start Free Trial
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                  <a href="#pricing">
                    <Button size="lg" variant="outline" className="text-lg px-8 bg-white/10 border-white/20 text-white hover:bg-white/20">
                      View Pricing
                    </Button>
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <LogoImage className="h-10 mb-4" />
              <p className="text-sm text-muted-foreground">
                Enterprise field service management platform for modern MSPs.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#features" className="hover:text-foreground">Features</a></li>
                <li><a href="#pricing" className="hover:text-foreground">Pricing</a></li>
                <li><Link href="/signup" className="hover:text-foreground">Sign Up</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground">About</a></li>
                <li><a href="#" className="hover:text-foreground">Contact</a></li>
                <li><a href="#" className="hover:text-foreground">Support</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-foreground">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t text-center text-sm text-muted-foreground">
            <p>© 2025 FieldPulse Go. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

