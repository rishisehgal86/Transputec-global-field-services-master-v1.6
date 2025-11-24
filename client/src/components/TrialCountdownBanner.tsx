import { AlertCircle, Clock } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

interface TrialCountdownBannerProps {
  daysRemaining: number;
  trialEndsAt: Date;
}

export function TrialCountdownBanner({ daysRemaining, trialEndsAt }: TrialCountdownBannerProps) {
  const isUrgent = daysRemaining <= 3;
  const endDate = new Date(trialEndsAt).toLocaleDateString();

  return (
    <Alert variant={isUrgent ? "destructive" : "default"} className="border-l-4 rounded-none">
      <div className="flex items-center gap-4 py-1">
        {isUrgent ? (
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
        ) : (
          <Clock className="h-5 w-5 flex-shrink-0" />
        )}
        <AlertDescription className="flex-1 flex items-center justify-between gap-4">
          <span className="text-base">
            {daysRemaining === 0 ? (
              <strong>Your trial expires today!</strong>
            ) : daysRemaining === 1 ? (
              <strong>Your trial expires tomorrow ({endDate})</strong>
            ) : (
              <>
                <strong>{daysRemaining} days</strong> remaining in your free trial (expires {endDate})
              </>
            )}
          </span>
          <Link href="/settings/billing">
            <Button size="sm" variant={isUrgent ? "default" : "outline"} className="flex-shrink-0">
              Upgrade Now
            </Button>
          </Link>
        </AlertDescription>
      </div>
    </Alert>
  );
}

