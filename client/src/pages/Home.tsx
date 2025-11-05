import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, MapPin, Clock, CheckCircle2, Users } from "lucide-react";
import { APP_LOGO, APP_TITLE } from "@/const";
import { Link } from "wouter";

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {APP_LOGO && <img src={APP_LOGO} alt="Logo" className="h-8" />}
            <h1 className="text-xl font-bold text-gray-900">{APP_TITLE}</h1>
          </div>
          <div>
            {isAuthenticated ? (
              <Link href="/admin">
                <Button>Admin Dashboard</Button>
              </Link>
            ) : (
              <Link href="/login">
                <Button>Admin Login</Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl font-bold text-gray-900 mb-6">
            Field Engineer Dispatch & Tracking
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Real-time tracking and management for on-demand IT field service engineers. 
            Streamline dispatch, monitor progress, and ensure timely service delivery.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/request">
              <Button size="lg" className="text-lg px-8 py-6">
                Request Service
              </Button>
            </Link>
            {isAuthenticated && (
              <Link href="/admin">
                <Button size="lg" variant="outline" className="text-lg px-8 py-6">
                  Admin Dashboard
                </Button>
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          <Card>
            <CardHeader>
              <MapPin className="h-10 w-10 text-blue-600 mb-2" />
              <CardTitle>Live Location Tracking</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Track engineer location in real-time during travel and on-site work with GPS precision.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Clock className="h-10 w-10 text-green-600 mb-2" />
              <CardTitle>Time Tracking</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Automatic tracking of travel time, arrival, and on-site duration for accurate billing.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CheckCircle2 className="h-10 w-10 text-purple-600 mb-2" />
              <CardTitle>Job Acceptance</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Engineers receive job details via secure link and can accept or decline assignments instantly.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Users className="h-10 w-10 text-orange-600 mb-2" />
              <CardTitle>Client Visibility</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Clients get real-time updates and can track engineer progress via shareable tracking links.
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white mt-20">
        <div className="container mx-auto px-4 py-8 text-center text-gray-600">
          <p>&copy; 2025 Transputec. Global IT Service Provider.</p>
        </div>
      </footer>
    </div>
  );
}

