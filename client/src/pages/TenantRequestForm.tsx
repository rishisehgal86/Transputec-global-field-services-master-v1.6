import { useParams } from "wouter";
import { trpc } from "@/lib/trpc";
import { Loader2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import RequestService from "./RequestService";

/**
 * Wrapper component for tenant-specific request forms
 * Extracts organization slug from URL and passes organizationId to RequestService
 */
export default function TenantRequestForm() {
  const params = useParams<{ orgSlug: string }>();
  const orgSlug = params.orgSlug;
  
  // Fetch organization by slug to get organizationId
  const { data: organization, isLoading, error } = trpc.organizations.getBySlug.useQuery(
    { slug: orgSlug || "" },
    { enabled: !!orgSlug }
  );
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (error || !organization) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive mb-2">Invalid Request Link</h1>
          <p className="text-muted-foreground">
            The organization link you're trying to access is invalid or has expired.
          </p>
        </div>
      </div>
    );
  }
  
  // Check if organization has exceeded job limit
  const isUnlimited = (organization.monthlyJobLimit ?? 0) === -1;
  const limitExceeded = !isUnlimited && (organization.currentMonthJobCount ?? 0) >= (organization.monthlyJobLimit ?? 0);
  
  if (limitExceeded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-lg">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="rounded-full bg-destructive/10 p-3">
                <AlertTriangle className="h-8 w-8 text-destructive" />
              </div>
            </div>
            <CardTitle className="text-2xl">Service Request Unavailable</CardTitle>
            <CardDescription className="text-base mt-2">
              {organization.name} has reached their monthly job limit
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm text-muted-foreground text-center">
                This organization has used all <strong>{organization.monthlyJobLimit} jobs</strong> available in their current subscription plan this month.
              </p>
            </div>
            <div className="text-center space-y-2">
              <p className="text-sm font-medium">What can you do?</p>
              <p className="text-sm text-muted-foreground">
                Please contact the administrator at <strong>{organization.name}</strong> to request a plan upgrade.
              </p>
            </div>
            <div className="pt-4 text-center text-xs text-muted-foreground">
              Job limits reset at the beginning of each billing cycle.
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // Pass organizationId to RequestService
  return <RequestService organizationId={organization.id} />;
}

