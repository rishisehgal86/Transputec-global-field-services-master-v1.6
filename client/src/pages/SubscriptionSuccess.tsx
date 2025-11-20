import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { LogoImage } from '@/components/LogoImage';

export default function SubscriptionSuccess() {
  const [, setLocation] = useLocation();
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    // Get session_id from URL query params
    const params = new URLSearchParams(window.location.search);
    const id = params.get('session_id');
    setSessionId(id);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto flex items-center justify-between py-6">
          <div className="flex items-center gap-4">
            <LogoImage className="h-14" alt="FieldPulse Go" />
            <div className="hidden md:flex items-center gap-4 border-l pl-4">
              <span className="text-sm font-medium text-muted-foreground">
                On-Demand Despatch Field Services Platform
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto py-16">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <CheckCircle2 className="h-16 w-16 text-green-500" />
              </div>
              <CardTitle className="text-3xl">Subscription Activated!</CardTitle>
              <CardDescription className="text-lg mt-2">
                Your payment was successful and your subscription is now active
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-muted p-4 rounded-lg">
                <h3 className="font-semibold mb-2">What happens next?</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>✓ Your subscription has been activated immediately</li>
                  <li>✓ You now have access to all features of your plan</li>
                  <li>✓ A confirmation email has been sent to your email address</li>
                  <li>✓ You can manage your subscription anytime from the billing portal</li>
                </ul>
              </div>

              {sessionId && (
                <div className="text-xs text-muted-foreground bg-muted p-3 rounded font-mono">
                  Session ID: {sessionId}
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  className="flex-1" 
                  onClick={() => setLocation('/admin')}
                >
                  Go to Dashboard
                </Button>
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => setLocation('/admin/billing')}
                >
                  View Billing Portal
                </Button>
              </div>

              <div className="text-center text-sm text-muted-foreground">
                <p>Need help? Contact support at support@fieldpulse.io</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

