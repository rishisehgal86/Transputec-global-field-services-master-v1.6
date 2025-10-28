import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, MapPin, Clock, CheckCircle2, Eye, Brain, Globe, Shield, Zap, Users2 } from "lucide-react";
import { APP_LOGO, APP_TITLE } from "@/const";
import { Link } from "wouter";

export default function Home() {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0A192F]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A192F] via-[#112240] to-[#0A192F]">
      {/* Header */}
      <header className="border-b border-blue-900/30 bg-[#0A192F]/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 md:py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-white">
              <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
                <span className="text-white font-bold text-sm">T</span>
              </div>
              <span className="text-base md:text-xl font-bold">Transputec Field Services</span>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-6 text-sm text-gray-300">
              <span className="flex items-center gap-1">
                <Shield className="h-4 w-4" />
                ISO 27001
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle2 className="h-4 w-4" />
                ITIL Certified
              </span>
              <span className="flex items-center gap-1">
                <Globe className="h-4 w-4" />
                40+ Countries
              </span>
            </div>
            {isAuthenticated ? (
              <Link href="/admin">
                <Button variant="outline" className="border-blue-500 text-blue-400 hover:bg-blue-500 hover:text-white">
                  Admin Dashboard
                </Button>
              </Link>
            ) : (
              <Link href="/login">
                <Button variant="outline" className="border-blue-500 text-blue-400 hover:bg-blue-500 hover:text-white">
                  Sign In
                </Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-12 md:py-20 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="text-white">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Real Engineers.<br />
              Real Speed.<br />
              Real Results.
            </h1>
            <p className="text-lg md:text-xl text-gray-300 mb-8 leading-relaxed">
              Get on-site IT field engineers—anywhere, anytime. From London to Dubai, 
              Transputec's real-time dispatch and tracking platform connects you with certified 
              engineers, monitors every step, and ensures every job is delivered perfectly on time.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/request">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white text-lg px-8 py-6 rounded-xl w-full sm:w-auto">
                  Request an Engineer
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="border-2 border-blue-500 text-blue-400 hover:bg-blue-500 hover:text-white text-lg px-8 py-6 rounded-xl w-full sm:w-auto">
                View Platform Demo
              </Button>
            </div>
            
            {/* Trust Bar */}
            <div className="mt-8 md:mt-12 pt-6 md:pt-8 border-t border-blue-900/30">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 text-center">
                <div>
                  <div className="text-2xl md:text-3xl font-bold text-blue-400">ISO 27001</div>
                  <div className="text-xs md:text-sm text-gray-400 mt-1">Certified</div>
                </div>
                <div>
                  <div className="text-2xl md:text-3xl font-bold text-blue-400">ITIL</div>
                  <div className="text-xs md:text-sm text-gray-400 mt-1">Certified</div>
                </div>
                <div>
                  <div className="text-2xl md:text-3xl font-bold text-blue-400">24/7</div>
                  <div className="text-xs md:text-sm text-gray-400 mt-1">NOC</div>
                </div>
                <div>
                  <div className="text-2xl md:text-3xl font-bold text-blue-400">GPS</div>
                  <div className="text-xs md:text-sm text-gray-400 mt-1">Live Tracking</div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Hero Illustration */}
          <div className="relative hidden lg:block">
            <div className="relative w-full h-[500px] bg-gradient-to-br from-blue-900/20 to-purple-900/20 rounded-3xl p-8 backdrop-blur-sm border border-blue-500/20">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAwIiBoZWlnaHQ9IjYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDU5LCAxMzAsIDI0NiwgMC4xKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-30"></div>
              <div className="relative z-10 flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="w-32 h-32 mx-auto mb-6 bg-blue-600 rounded-full flex items-center justify-center shadow-2xl shadow-blue-500/50">
                    <Users2 className="h-16 w-16 text-white" />
                  </div>
                  <div className="text-white text-lg font-semibold">Global Engineer Network</div>
                  <div className="text-gray-400 text-sm mt-2">40+ Countries • Real-Time Dispatch</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Transputec */}
      <section className="container mx-auto px-4 py-12 md:py-20">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Why Choose Transputec?</h2>
          <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto">
            <span className="text-blue-400 font-semibold">Smart. Visible. Global.</span> Transputec Field Services combines human expertise with intelligent automation. 
            We make managing IT incidents, rollouts, and installations faster, transparent, and stress-free.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {/* Feature Cards */}
          <Card className="bg-white/5 border-blue-500/20 backdrop-blur-sm hover:bg-white/10 transition-all">
            <CardHeader>
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-4">
                <MapPin className="h-6 w-6 text-white" />
              </div>
              <CardTitle className="text-white">Live Location Tracking</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-gray-300">
                Track engineer progress live, from dispatch to on-site work, with GPS precision.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-green-500/20 backdrop-blur-sm hover:bg-white/10 transition-all">
            <CardHeader>
              <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mb-4">
                <Clock className="h-6 w-6 text-white" />
              </div>
              <CardTitle className="text-white">Automated Time & SLA Tracking</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-gray-300">
                Travel time, site arrival, and completion auto-logged for transparent reporting and accurate billing.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-purple-500/20 backdrop-blur-sm hover:bg-white/10 transition-all">
            <CardHeader>
              <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mb-4">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <CardTitle className="text-white">Instant Job Acceptance</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-gray-300">
                Engineers receive secure job notifications and can confirm assignments in seconds.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-orange-500/20 backdrop-blur-sm hover:bg-white/10 transition-all">
            <CardHeader>
              <div className="w-12 h-12 bg-orange-600 rounded-lg flex items-center justify-center mb-4">
                <Eye className="h-6 w-6 text-white" />
              </div>
              <CardTitle className="text-white">Client Visibility Dashboard</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-gray-300">
                Clients receive live updates, proof of work, photos, and digital sign-offs in one central portal.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-blue-500/20 backdrop-blur-sm hover:bg-white/10 transition-all">
            <CardHeader>
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-4">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <CardTitle className="text-white">AI-Powered Dispatch</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-gray-300">
                Automatically assigns the best engineer based on location, skills, and SLA urgency.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-indigo-500/20 backdrop-blur-sm hover:bg-white/10 transition-all">
            <CardHeader>
              <div className="w-12 h-12 bg-indigo-600 rounded-lg flex items-center justify-center mb-4">
                <Globe className="h-6 w-6 text-white" />
              </div>
              <CardTitle className="text-white">Global Network</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-gray-300">
                Vetted engineers across Europe, Middle East & Asia-Pacific. 40+ countries, one standard of excellence.
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* How It Works */}
      <section className="container mx-auto px-4 py-12 md:py-20">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">How It Works</h2>
          <p className="text-lg md:text-xl text-gray-300">Four simple steps to perfect service delivery</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 text-white text-2xl font-bold">
              1
            </div>
            <h3 className="text-lg md:text-xl font-semibold text-white mb-2">Submit Request</h3>
            <p className="text-sm md:text-base text-gray-400">Via portal, API, or WhatsApp</p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 text-white text-2xl font-bold">
              2
            </div>
            <h3 className="text-lg md:text-xl font-semibold text-white mb-2">Engineer Assigned</h3>
            <p className="text-sm md:text-base text-gray-400">AI matches the best resource by skill and location</p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 text-white text-2xl font-bold">
              3
            </div>
            <h3 className="text-lg md:text-xl font-semibold text-white mb-2">Track Progress</h3>
            <p className="text-sm md:text-base text-gray-400">Live map view, arrival alerts, job photos</p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 text-white text-2xl font-bold">
              4
            </div>
            <h3 className="text-lg md:text-xl font-semibold text-white mb-2">Job Complete</h3>
            <p className="text-sm md:text-base text-gray-400">Digital sign-off, billing summary, and SLA audit</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-12 md:py-20">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl md:rounded-3xl p-8 md:p-12 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Ready to Get Started?</h2>
          <p className="text-lg md:text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join global brands who trust Transputec for their field service needs
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/request">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8 py-6 rounded-xl w-full sm:w-auto">
                Request an Engineer
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white hover:text-blue-600 text-lg px-8 py-6 rounded-xl w-full sm:w-auto">
              Contact Sales
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-blue-900/30 bg-[#0A192F]/80 mt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-gray-400 text-sm">
            <p>&copy; 2025 Transputec Ltd. | ISO 27001 | GDPR Compliant | Global IT Service Provider</p>
            <div className="flex gap-6">
              <Link href="/login" className="hover:text-blue-400 transition-colors">Client Portal</Link>
              <Link href="/admin" className="hover:text-blue-400 transition-colors">Admin</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

