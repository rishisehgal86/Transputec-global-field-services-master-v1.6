import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertTriangle, TrendingUp } from 'lucide-react';
import { Link } from 'wouter';

interface UsageWarningBannerProps {
  currentJobs: number;
  jobLimit: number;
  planTier: string;
}

export function UsageWarningBanner({ currentJobs, jobLimit, planTier }: UsageWarningBannerProps) {
  const isUnlimited = jobLimit === -1;
  
  // Don't show banner for unlimited plans
  if (isUnlimited) {
    return null;
  }

  const usagePercentage = (currentJobs / jobLimit) * 100;
  const jobsRemaining = jobLimit - currentJobs;
  
  // Show critical warning when limit exceeded
  if (currentJobs >= jobLimit) {
    return (
      <Alert variant="destructive" className="mb-6">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Job Limit Reached</AlertTitle>
        <AlertDescription className="flex items-center justify-between">
          <span>
            You've used all {jobLimit} jobs in your {planTier} plan. 
            Upgrade to continue creating jobs.
          </span>
          <Link href="/admin/billing">
            <Button variant="outline" size="sm" className="ml-4">
              <TrendingUp className="h-4 w-4 mr-2" />
              Upgrade Plan
            </Button>
          </Link>
        </AlertDescription>
      </Alert>
    );
  }
  
  // Show warning at 80% usage
  if (usagePercentage >= 80) {
    return (
      <Alert className="mb-6 border-yellow-500 bg-yellow-50 dark:bg-yellow-950">
        <AlertTriangle className="h-4 w-4 text-yellow-600" />
        <AlertTitle className="text-yellow-800 dark:text-yellow-200">
          Approaching Job Limit
        </AlertTitle>
        <AlertDescription className="flex items-center justify-between text-yellow-700 dark:text-yellow-300">
          <span>
            You have {jobsRemaining} jobs remaining out of {jobLimit} this month.
            {usagePercentage >= 95 && ' Consider upgrading soon.'}
          </span>
          <Link href="/admin/billing">
            <Button variant="outline" size="sm" className="ml-4">
              View Plans
            </Button>
          </Link>
        </AlertDescription>
      </Alert>
    );
  }
  
  return null;
}

