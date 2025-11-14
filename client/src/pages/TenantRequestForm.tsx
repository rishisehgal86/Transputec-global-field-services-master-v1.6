import { useParams } from "wouter";
import { trpc } from "@/lib/trpc";
import { Loader2 } from "lucide-react";
import RequestService from "./RequestService";

/**
 * Wrapper component for tenant-specific request forms
 * Extracts organization slug from URL and passes organizationId to RequestService
 */
export default function TenantRequestForm() {
  const params = useParams();
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
  
  // Pass organizationId to RequestService
  return <RequestService organizationId={organization.id} />;
}

