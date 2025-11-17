import { useRoute } from "wouter";
import { trpc } from "@/lib/trpc";
import { Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import ProjectRequestForm from "./ProjectRequestForm";

export default function ProjectRequest() {
  // Extract projectId from URL
  const [, params] = useRoute<{ projectId: string }>("/project-request/:projectId");
  
  if (!params || !params.projectId) {
    return <div className="min-h-screen flex items-center justify-center">Invalid project link</div>;
  }
  
  const projectId = params.projectId;

  // Load project details
  const { data: project, isLoading, error } = trpc.projects.getByProjectIdPublic.useQuery(
    { projectId: projectId! },
    { enabled: !!projectId }
  );

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading project details...</p>
        </div>
      </div>
    );
  }

  // Error state - invalid project ID
  if (!projectId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md mx-auto text-center p-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Invalid Project Link</h1>
          <p className="text-gray-600 mb-6">No project ID specified in the URL</p>
          <Link href="/">
            <Button>Go to General Request Form</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Error state - project not found or inactive
  if (error || !project) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md mx-auto text-center p-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Project Not Found</h1>
          <p className="text-gray-600 mb-6">
            {error?.message || "This project does not exist or is no longer active"}
          </p>
          <Link href="/">
            <Button>Go to General Request Form</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Success - render the project request form
  return (
    <ProjectRequestForm 
      projectId={projectId} 
      project={project} 
      organizationId={project.organizationId}
    />
  );
}

