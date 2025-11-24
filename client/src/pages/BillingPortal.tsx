import { useState } from 'react';
import { useLocation, Link } from 'wouter';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, CreditCard, TrendingUp, Users, Briefcase, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { LogoImage } from '@/components/LogoImage';

export default function BillingPortal() {
  const [, setLocation] = useLocation();
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [isOpeningPortal, setIsOpeningPortal] = useState(false);

  // Fetch subscription status
  const { data: subscription, isLoading, refetch } = trpc.subscription.getStatus.useQuery();

  // Mutations
  const createCheckout = trpc.subscription.createCheckout.useMutation({
    onSuccess: (data) => {
      // Redirect to Stripe checkout
      if (data.url) {
        window.location.href = data.url;
      }
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to start checkout');
      setIsUpgrading(false);
    },
  });

  const createPortalSession = trpc.subscription.createPortalSession.useMutation({
    onSuccess: (data) => {
      // Open Stripe customer portal in new tab
      if (data.url) {
        window.open(data.url, '_blank');
      }
      setIsOpeningPortal(false);
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to open billing portal');
      setIsOpeningPortal(false);
    },
  });

  const cancelSubscription = trpc.subscription.cancelSubscription.useMutation({
    onSuccess: () => {
      toast.success('Subscription cancelled successfully');
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to cancel subscription');
    },
  });

  const handleUpgrade = (planTier: 'starter' | 'enterprise') => {
    setIsUpgrading(true);
    createCheckout.mutate({ planTier });
  };

  const handleManagePayment = () => {
    setIsOpeningPortal(true);
    createPortalSession.mutate();
  };

  const handleCancelSubscription = () => {
    const message = `⚠️ CANCEL SUBSCRIPTION - ACCOUNT WILL BE CLOSED

Are you sure you want to cancel your subscription?

⚠️ Important:
• Your subscription will remain active until the end of your current billing period (${subscription?.billingCycleEnd ? new Date(subscription.billingCycleEnd).toLocaleDateString() : 'billing cycle end'})
• After that date, your organization account will be CLOSED and DEACTIVATED
• All users will lose access to the system
• You will need to contact support to reactivate your account
• All data will be retained but inaccessible until reactivation

This action cannot be undone automatically. Do you want to proceed?`;
    
    if (confirm(message)) {
      cancelSubscription.mutate();
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b bg-card">
          <div className="container mx-auto flex items-center justify-between py-6">
            <div className="flex items-center gap-4">
              <Link href="/">
                <LogoImage className="h-14 cursor-pointer hover:opacity-80 transition-opacity" alt="FieldPulse Go" />
              </Link>
              <div className="hidden md:flex items-center gap-4 border-l pl-4">
                <span className="text-sm font-medium text-muted-foreground">
                  On-Demand Despatch Field Services Platform
                </span>
              </div>
            </div>
            <Button variant="outline" onClick={() => setLocation('/admin')}>
              Back to Dashboard
            </Button>
          </div>
        </header>

        <main className="container mx-auto py-8">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </main>
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b bg-card">
          <div className="container mx-auto flex items-center justify-between py-6">
            <div className="flex items-center gap-4">
              <Link href="/">
                <LogoImage className="h-14 cursor-pointer hover:opacity-80 transition-opacity" alt="FieldPulse Go" />
              </Link>
            </div>
            <Button variant="outline" onClick={() => setLocation('/admin')}>
              Back to Dashboard
            </Button>
          </div>
        </header>

        <main className="container mx-auto py-8">
          <Card>
            <CardHeader>
              <CardTitle>Error Loading Subscription</CardTitle>
              <CardDescription>Unable to load subscription information</CardDescription>
            </CardHeader>
          </Card>
        </main>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string }> = {
      active: { variant: 'default', label: 'Active' },
      trialing: { variant: 'secondary', label: 'Trial' },
      past_due: { variant: 'destructive', label: 'Past Due' },
      canceled: { variant: 'outline', label: 'Cancelled' },
      incomplete: { variant: 'outline', label: 'Incomplete' },
    };

    const config = statusMap[status] || { variant: 'outline' as const, label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getPlanName = (tier: string) => {
    const planNames: Record<string, string> = {
      trial: 'Free Trial',
      starter: 'Scale Plan',
      enterprise: 'Professional Plan',
    };
    return planNames[tier] || tier;
  };

  const getPlanPrice = (tier: string) => {
    const prices: Record<string, string> = {
      trial: '$0/month',
      starter: '$99/month',
      enterprise: '$399/month',
    };
    return prices[tier] || 'Custom';
  };

  const isUnlimited = (value: number) => value === -1;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto flex items-center justify-between py-6">
          <div className="flex items-center gap-4">
            <Link href="/">
              <LogoImage className="h-14 cursor-pointer hover:opacity-80 transition-opacity" alt="FieldPulse Go" />
            </Link>
            <div className="hidden md:flex items-center gap-4 border-l pl-4">
              <span className="text-sm font-medium text-muted-foreground">
                On-Demand Despatch Field Services Platform
              </span>
            </div>
          </div>
          <Button variant="outline" onClick={() => setLocation('/admin')}>
            Back to Dashboard
          </Button>
        </div>
      </header>

      <main className="container mx-auto py-8 space-y-8">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold">Billing & Subscription</h1>
          <p className="text-muted-foreground mt-2">
            Manage your subscription, view usage, and update payment methods
          </p>
        </div>

        {/* Current Plan Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">{getPlanName(subscription.planTier || 'trial')}</CardTitle>
                <CardDescription className="text-lg mt-1">
                  {getPlanPrice(subscription.planTier || 'trial')}
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                {getStatusBadge(subscription.subscriptionStatus)}
                {subscription.cancelAtPeriodEnd && (
                  <Badge variant="destructive">Cancels {subscription.billingCycleEnd ? new Date(subscription.billingCycleEnd).toLocaleDateString() : 'soon'}</Badge>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Usage Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-3 p-4 border rounded-lg">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Briefcase className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Jobs This Month</p>
                  <p className="text-2xl font-bold">
                    {subscription.currentMonthJobCount}
                    {!isUnlimited(subscription.monthlyJobLimit || 0) && (
                      <span className="text-sm text-muted-foreground font-normal">
                        {' '}/ {subscription.monthlyJobLimit}
                      </span>
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 border rounded-lg">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Admin Users</p>
                  <p className="text-2xl font-bold">
                    {subscription.adminUserCount || 0}
                    {!isUnlimited(subscription.maxAdminUsers) && (
                      <span className="text-sm text-muted-foreground font-normal">
                        {' '}/ {subscription.maxAdminUsers}
                      </span>
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 border rounded-lg">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Billing Cycle</p>
                  <p className="text-sm font-medium">
                    {subscription.billingCycleEnd
                      ? `Renews ${new Date(subscription.billingCycleEnd).toLocaleDateString()}`
                      : 'N/A'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-4 border rounded-lg">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <CreditCard className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Account Created</p>
                  <p className="text-sm font-medium">
                    {subscription.createdAt
                      ? new Date(subscription.createdAt).toLocaleDateString()
                      : 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3">
              {subscription.stripeCustomerId && (
                <Button
                  onClick={handleManagePayment}
                  disabled={isOpeningPortal}
                  variant="outline"
                >
                  {isOpeningPortal ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Opening...
                    </>
                  ) : (
                    <>
                      <CreditCard className="mr-2 h-4 w-4" />
                      Manage Payment Methods
                      <ExternalLink className="ml-2 h-3 w-3" />
                    </>
                  )}
                </Button>
              )}

              {subscription.planTier === 'trial' && (
                <>
                  <Button
                    onClick={() => handleUpgrade('starter')}
                    disabled={isUpgrading}
                  >
                    {isUpgrading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      'Upgrade to Scale'
                    )}
                  </Button>
                  <Button
                    onClick={() => handleUpgrade('enterprise')}
                    disabled={isUpgrading}
                    variant="outline"
                  >
                    {isUpgrading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      'Upgrade to Professional'
                    )}
                  </Button>
                </>
              )}

              {subscription.planTier === 'starter' && (
                <Button
                  onClick={handleManagePayment}
                  disabled={isOpeningPortal}
                >
                  {isOpeningPortal ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Opening Portal...
                    </>
                  ) : (
                    <>
                      <TrendingUp className="mr-2 h-4 w-4" />
                      Upgrade to Professional
                    </>
                  )}
                </Button>
              )}

              {subscription.stripeSubscriptionId && subscription.subscriptionStatus === 'active' && !subscription.cancelAtPeriodEnd && (
                <Button
                  onClick={handleCancelSubscription}
                  variant="destructive"
                  disabled={cancelSubscription.isPending}
                >
                  {cancelSubscription.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Cancelling...
                    </>
                  ) : (
                    'Cancel Subscription'
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Plan Comparison */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Available Plans</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Trial Plan */}
            <Card className={subscription.planTier === 'trial' ? 'border-primary' : ''}>
              <CardHeader>
                <CardTitle>Free Trial</CardTitle>
                <CardDescription className="text-2xl font-bold text-foreground">
                  $0<span className="text-sm font-normal text-muted-foreground">/month</span>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2 text-sm">
                  <li>✓ 14 days trial</li>
                  <li>✓ 50 jobs per month</li>
                  <li>✓ 1 admin user</li>
                  <li>✓ All core features</li>
                  <li>✓ Email support</li>
                </ul>
                {subscription.planTier === 'trial' && (
                  <Badge variant="default" className="w-full justify-center">Current Plan</Badge>
                )}
              </CardContent>
            </Card>

            {/* Scale Plan */}
            <Card className={subscription.planTier === 'starter' ? 'border-primary' : ''}>
              <CardHeader>
                <CardTitle>Scale</CardTitle>
                <CardDescription className="text-2xl font-bold text-foreground">
                  $99<span className="text-sm font-normal text-muted-foreground">/month</span>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2 text-sm">
                  <li>✓ 100 jobs per month</li>
                  <li>✓ 3 admin users</li>
                  <li>✓ All core features</li>
                  <li>✓ Priority email support</li>
                  <li>✓ Advanced reporting</li>
                </ul>
                {subscription.planTier === 'starter' ? (
                  <Badge variant="default" className="w-full justify-center">Current Plan</Badge>
                ) : subscription.planTier === 'trial' ? (
                  <Button
                    className="w-full"
                    onClick={() => handleUpgrade('starter')}
                    disabled={isUpgrading}
                  >
                    Upgrade to Scale
                  </Button>
                ) : null}
              </CardContent>
            </Card>

            {/* Professional Plan */}
            <Card className={subscription.planTier === 'enterprise' ? 'border-primary' : ''}>
              <CardHeader>
                <CardTitle>Professional</CardTitle>
                <CardDescription className="text-2xl font-bold text-foreground">
                  $399<span className="text-sm font-normal text-muted-foreground">/month</span>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2 text-sm">
                  <li>✓ Unlimited jobs</li>
                  <li>✓ Unlimited admin users</li>
                  <li>✓ All features</li>
                  <li>✓ Priority support</li>
                  <li>✓ Dedicated account manager</li>
                </ul>
                {subscription.planTier === 'enterprise' ? (
                  <Badge variant="default" className="w-full justify-center">Current Plan</Badge>
                ) : subscription.planTier === 'starter' ? (
                  <Button
                    className="w-full"
                    onClick={handleManagePayment}
                    disabled={isOpeningPortal}
                  >
                    Upgrade to Professional
                  </Button>
                ) : (
                  <Button
                    className="w-full"
                    onClick={() => handleUpgrade('enterprise')}
                    disabled={isUpgrading}
                  >
                    Upgrade to Professional
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}

