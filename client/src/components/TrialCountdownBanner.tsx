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
    <Alert variant={isUrgent ? "destructive" : "default"} className="mb-4">
      <div className="flex items-center gap-3">
        {isUrgent ? (
          <AlertCircle className="h-5 w-5" />
        ) : (
          <Clock className="h-5 w-5" />
        )}
        <AlertDescription className="flex-1 flex items-center justify-between">
          <span>
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
            <Button size="sm" variant={isUrgent ? "default" : "outline"}>
              Upgrade Now
            </Button>
          </Link>
        </AlertDescription>
      </div>
    </Alert>
  );
}

