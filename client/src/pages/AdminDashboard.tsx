import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, ExternalLink, MapPin } from "lucide-react";
import { APP_TITLE } from "@/const";
import { Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";

export default function AdminDashboard() {
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const { data: jobs, isLoading } = trpc.jobs.list.useQuery();

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    setLocation("/login");
    return null;
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline", label: string }> = {
      pending_approval: { variant: "secondary", label: "Pending Approval" },
      approved: { variant: "default", label: "Approved" },
      rejected: { variant: "destructive", label: "Rejected" },
      created: { variant: "secondary", label: "Created" },
      sent_to_engineer: { variant: "secondary", label: "Sent to Engineer" },
      accepted: { variant: "default", label: "Accepted" },
      declined: { variant: "destructive", label: "Declined" },
      en_route: { variant: "default", label: "En Route" },
      on_site: { variant: "default", label: "On Site" },
      completed: { variant: "outline", label: "Completed" },
      cancelled: { variant: "destructive", label: "Cancelled" },
    };
    const config = variants[status] || { variant: "secondary" as const, label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b bg-white sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <Link href="/">
                <h1 className="text-2xl font-bold text-gray-900 cursor-pointer hover:text-blue-600">
                  {APP_TITLE}
                </h1>
              </Link>
              <p className="text-sm text-gray-600">Admin Dashboard</p>
            </div>
            <Link href="/admin/create">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create New Job
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Field Service Jobs</h2>
          <p className="text-gray-600">Manage and track all dispatch requests</p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : jobs && jobs.length > 0 ? (
          <div className="grid gap-4">
            {jobs.map((job) => (
              <Card key={job.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <CardTitle className="text-xl">{job.siteName}</CardTitle>
                        {getStatusBadge(job.status)}
                      </div>
                      <CardDescription>
                        <div className="space-y-1">
                          <p><strong>Client:</strong> {job.clientName}</p>
                          {job.siteLocation && <p><strong>Location:</strong> {job.siteLocation}</p>}
                          {job.projectName && <p><strong>Project:</strong> {job.projectName}</p>}
                          {job.scheduledDateTime && (
                            <p><strong>Scheduled:</strong> {new Date(job.scheduledDateTime).toLocaleString()}</p>
                          )}
                        </div>
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      {job.status === "pending_approval" && (
                        <>
                          <Button 
                            variant="default" 
                            size="sm"
                            onClick={() => window.location.href = `/admin/job/${job.id}`}
                          >
                            Review Request
                          </Button>
                        </>
                      )}
                      {job.status !== "pending_approval" && (
                        <Link href={`/admin/job/${job.id}`}>
                          <Button variant="outline" size="sm">
                            <MapPin className="h-4 w-4 mr-1" />
                            View Details
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    {job.engineerName && (
                      <div>
                        <p className="text-gray-600">Engineer</p>
                        <p className="font-medium">{job.engineerName}</p>
                      </div>
                    )}
                    {job.acceptedAt && (
                      <div>
                        <p className="text-gray-600">Accepted At</p>
                        <p className="font-medium">{new Date(job.acceptedAt).toLocaleString()}</p>
                      </div>
                    )}
                    {job.completedAt && (
                      <div>
                        <p className="text-gray-600">Completed At</p>
                        <p className="font-medium">{new Date(job.completedAt).toLocaleString()}</p>
                      </div>
                    )}
                  </div>
                  
                  {job.status === "accepted" || job.status === "created" || job.status === "sent_to_engineer" ? (
                    <div className="mt-4 pt-4 border-t space-y-2">
                      <p className="text-sm font-medium text-gray-700">Share Links:</p>
                      <div className="flex gap-2 flex-wrap">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            const url = `${window.location.origin}/engineer/${job.jobToken}`;
                            navigator.clipboard.writeText(url);
                          }}
                        >
                          <ExternalLink className="h-3 w-3 mr-1" />
                          Copy Engineer Link
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            const url = `${window.location.origin}/track/${job.jobToken}`;
                            navigator.clipboard.writeText(url);
                          }}
                        >
                          <ExternalLink className="h-3 w-3 mr-1" />
                          Copy Client Link
                        </Button>
                      </div>
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-20 text-center">
              <p className="text-gray-600 mb-4">No jobs created yet</p>
              <Link href="/admin/create">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Job
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}

