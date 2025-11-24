import { ReactNode } from "react";
import { trpc } from "@/lib/trpc";
import { DisabledAccountOverlay } from "./DisabledAccountOverlay";
import { TrialCountdownBanner } from "./TrialCountdownBanner";
import { Loader2 } from "lucide-react";

interface AccountStatusWrapperProps {
  children: ReactNode;
}

/**
 * Wrapper component that checks account status and shows:
 * - Trial countdown banner for active trial users
 * - Disabled account overlay for expired/cancelled accounts
 * - Normal content for active paid accounts
 */
export function AccountStatusWrapper({ children }: AccountStatusWrapperProps) {
  const { data: status, isLoading } = trpc.subscription.getStatus.useQuery();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!status) {
    return <>{children}</>;
  }

  // Check if account is disabled
  const isDisabled = !status.isActive;
  
  // Determine reason for disabled state
  const disabledReason = status.trial?.isExpired 
    ? 'trial_expired' 
    : 'subscription_cancelled';

  // Show disabled overlay if account is inactive
  if (isDisabled) {
    return (
      <>
        {/* Grey out background content */}
        <div className="pointer-events-none opacity-30 blur-sm">
          {children}
        </div>
        {/* Show upgrade overlay */}
        <DisabledAccountOverlay 
          reason={disabledReason}
          trialEndsAt={status.trialEndsAt}
        />
      </>
    );
  }

  // Show trial countdown for active trial users (always show from day 1)
  const showTrialBanner = 
    status.trial?.isOnTrial && 
    !status.trial?.isExpired && 
    status.trial?.daysRemaining !== null; // Show for entire trial period

  return (
    <>
      {showTrialBanner && status.trial?.daysRemaining !== null && status.trialEndsAt && (
        <div className="sticky top-0 z-40">
          <TrialCountdownBanner 
            daysRemaining={status.trial.daysRemaining}
            trialEndsAt={new Date(status.trialEndsAt)}
          />
        </div>
      )}
      {children}
    </>
  );
}

