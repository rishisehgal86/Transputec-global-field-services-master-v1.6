import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, MapPin, Clock, CheckCircle2, Users, Zap, Radio, FolderOpen, Link2, Building2, Globe } from "lucide-react";
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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <LogoImage className="h-16" />
            <div className="hidden md:block border-l border-border pl-3">
              <p className="text-sm font-medium text-muted-foreground">On-Demand Despatch Field Services Platform</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            {isAuthenticated ? (
              <Link href="/admin">
                <Button className="btn-pulse-glow">Admin Dashboard</Button>
              </Link>
            ) : (
              <Link href="/login">
                <Button className="btn-pulse-glow">Admin Login</Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section with FieldPulse Go Design Language */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0A1E3D]/5 via-[#1C273A]/5 to-[#0A1E3D]/5 dark:from-[#0A1E3D]/20 dark:via-[#1C273A]/20 dark:to-[#0A1E3D]/20"></div>
        <div className="container mx-auto px-4 py-24 relative">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20 bg-primary/5 mb-6">
              <Radio className="h-4 w-4 text-primary animate-pulse" />
              <span className="text-sm font-medium text-primary">Live Field Operations</span>
            </div>
            <h2 className="text-5xl md:text-6xl font-bold text-foreground mb-6">
              Instant Field Coverage.<br />
              <span className="text-primary">Always in Sync.</span>
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Deploy engineers on demand, track arrivals live, and stay ahead with real-time visibility. 
              FieldPulse Go keeps your field operations in perfect rhythm.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link href="/request">
                <Button size="lg" className="text-lg px-8 py-6 gradient-orange text-white hover:shadow-lg hover:shadow-primary/50 transition-all">
                  <Zap className="h-5 w-5 mr-2" />
                  Request Service
                </Button>
              </Link>
              {isAuthenticated && (
                <Link href="/admin">
                  <Button size="lg" variant="outline" className="text-lg px-8 py-6 border-primary/30 hover:bg-primary/10">
                    Admin Dashboard
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Projects Feature Section - Comprehensive Description */}
      <section className="container mx-auto px-4 py-20 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20 bg-primary/5 mb-4">
              <FolderOpen className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">Project Management</span>
            </div>
            <h3 className="text-4xl font-bold text-foreground mb-4">Organize Jobs with Projects</h3>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Create projects to organize jobs and generate unique request links for clients
            </p>
          </div>

          {/* What Are Projects */}
          <Card className="mb-8 border-primary/20">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                <FolderOpen className="h-6 w-6 text-primary" />
                What Are Projects?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                Projects are organizational containers that group related jobs together. Each project can represent a client, contract, service agreement, or facility portfolio. Projects enable you to manage multiple clients or service contracts with complete separation and dedicated workflows.
              </p>
              <div className="grid md:grid-cols-2 gap-4 mt-6">
                <div className="p-4 rounded-lg bg-primary/5 border border-primary/10">
                  <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-primary" />
                    Multi-Client Management
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Separate projects for each client you serve. Track work, billing, and performance metrics independently per client.
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-accent/5 border border-accent/10">
                  <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                    <Link2 className="h-5 w-5 text-accent" />
                    Unique Request Links
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Each project generates a dedicated public request form URL that clients can bookmark and use to submit service requests directly.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Key Features Grid */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card className="border-primary/20">
              <CardHeader>
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
                  <MapPin className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="text-lg">Site Library Management</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm">
                  Pre-load service locations with GPS coordinates. Bulk upload hundreds of sites via Excel template. Sites are reusable across all jobs in the project.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-accent/20">
              <CardHeader>
                <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center mb-2">
                  <Globe className="h-5 w-5 text-accent" />
                </div>
                <CardTitle className="text-lg">Automatic Geocoding</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm">
                  Addresses are automatically converted to GPS coordinates for accurate tracking and ETA calculations. Geo-validation ensures data quality.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-primary/20">
              <CardHeader>
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
                  <Link2 className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="text-lg">Client Self-Service</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm">
                  Clients submit requests via dedicated portal URLs without login. Jobs automatically associate with the correct project and organization.
                </CardDescription>
              </CardContent>
            </Card>
          </div>

          {/* Real-World Use Cases */}
          <Card className="mb-8 border-accent/20">
            <CardHeader>
              <CardTitle className="text-2xl">Real-World Use Cases</CardTitle>
              <CardDescription>See how different industries leverage projects</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <h4 className="font-semibold text-foreground flex items-center gap-2">
                  <span className="h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm">1</span>
                  IT Managed Service Provider (MSP)
                </h4>
                <p className="text-sm text-muted-foreground pl-8">
                  An MSP manages IT infrastructure for 20 companies. They create 20 projects (one per client), upload each client's office locations, and share unique request links with each IT manager. Clients submit tickets directly, jobs are automatically organized by client, and monthly billing reports are generated per project.
                </p>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold text-foreground flex items-center gap-2">
                  <span className="h-6 w-6 rounded-full bg-accent/10 text-accent flex items-center justify-center text-sm">2</span>
                  Facilities Management Company
                </h4>
                <p className="text-sm text-muted-foreground pl-8">
                  A company maintains HVAC, electrical, and plumbing for a corporate campus. They create separate projects for each service type ("HVAC Maintenance Contract", "Electrical Emergency Services", "Plumbing Preventive Maintenance") with the same 30 building sites. Each department gets their own request link, engineers see the contract type, and billing is separated by service category.
                </p>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold text-foreground flex items-center gap-2">
                  <span className="h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm">3</span>
                  Telecommunications Field Services
                </h4>
                <p className="text-sm text-muted-foreground pl-8">
                  A telecom provider manages network equipment installations. They create a project "5G Tower Rollout - Region North" with 100 tower sites pre-loaded. Field engineers receive jobs with exact tower locations, GPS tracking shows proximity to sites, ETA calculations are based on tower coordinates, and the client portal displays installation progress across all sites.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Benefits Table */}
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="text-2xl">Key Benefits</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-foreground">Complete Data Isolation</p>
                    <p className="text-sm text-muted-foreground">Each project's jobs, sites, and data remain completely separate</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-foreground">Branded Client Portals</p>
                    <p className="text-sm text-muted-foreground">Each client gets their own dedicated request URL to bookmark</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-foreground">Bulk Site Management</p>
                    <p className="text-sm text-muted-foreground">Upload hundreds of sites at once via Excel template</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-foreground">Automatic Job Association</p>
                    <p className="text-sm text-muted-foreground">Jobs submitted via project links auto-tag to correct project</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-foreground">Project-Based Reporting</p>
                    <p className="text-sm text-muted-foreground">Export and analyze data per client or contract</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-foreground">GPS-Validated Sites</p>
                    <p className="text-sm text-muted-foreground">Automatic geocoding ensures accurate tracking and ETAs</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Core Features with Navy Blue and Orange */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h3 className="text-3xl font-bold text-foreground mb-3">Every Heartbeat of Your Field, Visualised Live</h3>
          <p className="text-muted-foreground text-lg">Fast. Smart. Reliable.</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          <Card className="border-primary/20 hover:border-primary/50 transition-all hover:shadow-lg">
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                <MapPin className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Live Dispatch Control</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Assign engineers instantly and track their location in real-time with GPS precision during travel and on-site work.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border-accent/20 hover:border-accent/50 transition-all hover:shadow-lg">
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-accent/10 flex items-center justify-center mb-3">
                <Clock className="h-6 w-6 text-accent" />
              </div>
              <CardTitle>Geo Presence Verification</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Automatic tracking of travel time, arrival timestamps, and on-site duration for accurate billing and SLA compliance.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border-primary/20 hover:border-primary/50 transition-all hover:shadow-lg">
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                <CheckCircle2 className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Instant Job Acceptance</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Engineers receive job details via secure link and can accept or decline assignments instantly from any device.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border-accent/20 hover:border-accent/50 transition-all hover:shadow-lg">
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-accent/10 flex items-center justify-center mb-3">
                <Users className="h-6 w-6 text-accent" />
              </div>
              <CardTitle>Client Visibility</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Clients get real-time updates and can track engineer progress via shareable tracking links with live ETA calculations.
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer with Orange Accent */}
      <footer className="relative overflow-hidden mt-20">
        <div className="absolute inset-0 bg-primary/5"></div>
        <div className="relative border-t bg-background">
          <div className="container mx-auto px-4 py-8 text-center">
            <p className="text-muted-foreground mb-2">&copy; 2025 FieldPulse Go</p>
            <p className="text-sm text-primary font-medium">Instant Coverage. Always in Sync.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

