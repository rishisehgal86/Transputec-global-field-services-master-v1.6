import { useRoute } from "wouter";
import RequestService from "./RequestService";
import { trpc } from "@/lib/trpc";
import { Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

/**
 * Project-specific job request page
 * URL: /request/:projectId
 * Automatically assigns jobs to the specified project
 */
export default function ProjectRequest() {
  const [, params] = useRoute("/request/:projectId");
  const projectId = params?.projectId;

  // Verify project exists and is active
  const { data: verificationResult, isLoading, error } = trpc.projects.verify.useQuery(
    { projectId: projectId || "" },
    { enabled: !!projectId }
  );

  const { data: project } = trpc.projects.getByProjectId.useQuery(
    { projectId: projectId || "" },
    { enabled: !!projectId && verificationResult?.isValid }
  );

  if (!projectId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="max-w-md">
          <CardContent className="py-12 text-center">
            <h2 className="text-xl font-bold mb-2">Invalid Project Link</h2>
            <p className="text-gray-600 mb-4">No project ID specified in the URL</p>
            <Link href="/request">
              <Button>Go to General Request Form</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !verificationResult?.isValid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="max-w-md">
          <CardContent className="py-12 text-center">
            <h2 className="text-xl font-bold mb-2">Project Not Found</h2>
            <p className="text-gray-600 mb-4">
              The project "{projectId}" does not exist or is no longer active
            </p>
            <Link href="/request">
              <Button>Go to General Request Form</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Render the request service form with project context
  return (
    <div>
      {project && (
        <div className="bg-blue-50 border-b border-blue-200 py-3">
          <div className="container mx-auto px-4">
            <p className="text-sm text-blue-900">
              <strong>Project:</strong> {project.name} ({project.projectId})
              {project.clientName && ` • Client: ${project.clientName}`}
            </p>
          </div>
        </div>
      )}
      <RequestService projectId={projectId} />
    </div>
  );
}

