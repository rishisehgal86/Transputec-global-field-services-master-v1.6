import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, MapPin, Clock, CheckCircle2, Users, Zap, Radio } from "lucide-react";
import { APP_LOGO, APP_TITLE } from "@/const";
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
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {APP_LOGO && <img src={APP_LOGO} alt="FieldPulse Go Logo" className="h-10" />}
            <h1 className="text-xl font-bold text-foreground">{APP_TITLE}</h1>
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
        <div className="absolute inset-0 bg-gradient-to-br from-[#0A1E3D] via-[#1C273A] to-[#0A1E3D] opacity-5 dark:opacity-20"></div>
        <div className="container mx-auto px-4 py-24 relative">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20 bg-primary/5 mb-6">
              <Radio className="h-4 w-4 text-primary animate-pulse" />
              <span className="text-sm font-medium text-primary">Live Field Operations</span>
            </div>
            <h2 className="text-5xl md:text-6xl font-bold text-foreground mb-6">
              Instant Field Coverage.<br />
              <span className="gradient-pulse bg-clip-text text-transparent">Always in Sync.</span>
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Deploy engineers on demand, track arrivals live, and stay ahead with real-time visibility. 
              FieldPulse Go keeps your field operations in perfect rhythm.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link href="/request">
                <Button size="lg" className="text-lg px-8 py-6 gradient-pulse text-white hover:shadow-lg hover:shadow-primary/50 transition-all">
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

      {/* Features with FieldPulse Go Color Palette */}
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

      {/* Footer with Gradient */}
      <footer className="relative overflow-hidden mt-20">
        <div className="absolute inset-0 gradient-pulse opacity-10"></div>
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

