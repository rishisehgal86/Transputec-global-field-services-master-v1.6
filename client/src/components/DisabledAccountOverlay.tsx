import { AlertTriangle, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { useState } from "react";

interface DisabledAccountOverlayProps {
  reason: 'trial_expired' | 'subscription_cancelled';
  trialEndsAt?: Date | null;
}

export function DisabledAccountOverlay({ reason, trialEndsAt }: DisabledAccountOverlayProps) {
  const [isUpgrading, setIsUpgrading] = useState(false);
  const createCheckout = trpc.subscription.createCheckout.useMutation();

  const handleUpgrade = async (planTier: 'starter' | 'enterprise') => {
    setIsUpgrading(true);
    try {
      const result = await createCheckout.mutateAsync({ planTier });
      if (result.url) {
        window.location.href = result.url;
      }
    } catch (error) {
      console.error('Failed to create checkout:', error);
      setIsUpgrading(false);
    }
  };

  const title = reason === 'trial_expired' 
    ? 'Free Trial Expired' 
    : 'Account Suspended';

  const description = reason === 'trial_expired'
    ? `Your 14-day free trial ended on ${trialEndsAt ? new Date(trialEndsAt).toLocaleDateString() : 'recently'}. Upgrade to continue using FieldPulse Go.`
    : 'Your subscription was cancelled and your account is now suspended. Reactivate to regain access.';

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl shadow-2xl border-destructive/50">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
            {reason === 'trial_expired' ? (
              <AlertTriangle className="w-8 h-8 text-destructive" />
            ) : (
              <Lock className="w-8 h-8 text-destructive" />
            )}
          </div>
          <div>
            <CardTitle className="text-2xl font-bold">{title}</CardTitle>
            <CardDescription className="text-base mt-2">
              {description}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Pricing Plans */}
          <div className="grid md:grid-cols-2 gap-4">
            {/* Starter Plan */}
            <Card className="border-2 hover:border-primary transition-colors">
              <CardHeader>
                <CardTitle className="text-lg">Scale Plan</CardTitle>
                <div className="text-3xl font-bold">$99<span className="text-base font-normal text-muted-foreground">/mo</span></div>
                <CardDescription>Perfect for growing teams</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    <span>100 jobs per month</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    <span>Up to 3 admin users</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    <span>Unlimited field engineers</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    <span>Project management</span>
                  </li>
                </ul>
                <Button 
                  className="w-full" 
                  onClick={() => handleUpgrade('starter')}
                  disabled={isUpgrading}
                >
                  {isUpgrading ? 'Processing...' : 'Choose Scale'}
                </Button>
              </CardContent>
            </Card>

            {/* Enterprise Plan */}
            <Card className="border-2 border-primary bg-primary/5">
              <CardHeader>
                <div className="text-xs font-semibold text-primary mb-1">MOST POPULAR</div>
                <CardTitle className="text-lg">Professional Plan</CardTitle>
                <div className="text-3xl font-bold">$399<span className="text-base font-normal text-muted-foreground">/mo</span></div>
                <CardDescription>For large operations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    <span><strong>Unlimited</strong> jobs</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    <span><strong>Unlimited</strong> admin users</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    <span>Unlimited field engineers</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    <span>Priority support</span>
                  </li>
                </ul>
                <Button 
                  className="w-full" 
                  onClick={() => handleUpgrade('enterprise')}
                  disabled={isUpgrading}
                >
                  {isUpgrading ? 'Processing...' : 'Choose Professional'}
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="text-center text-sm text-muted-foreground">
            <p>All plans include real-time tracking, SVR reports, and mobile app access.</p>
            <p className="mt-1">Cancel anytime. No long-term contracts.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

