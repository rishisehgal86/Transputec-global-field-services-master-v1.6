import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, ArrowLeft, MapPin, Clock, User } from "lucide-react";
import { APP_TITLE, getLoginUrl } from "@/const";
import { Link, useRoute } from "wouter";
import { trpc } from "@/lib/trpc";

export default function JobDetail() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [match, params] = useRoute("/admin/job/:id");
  const jobId = params?.id ? parseInt(params.id) : 0;

  const { data: job, isLoading } = trpc.jobs.getById.useQuery(
    { id: jobId },
    { enabled: !!jobId && isAuthenticated }
  );

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    window.location.href = getLoginUrl();
    return null;
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="border-b bg-white">
          <div className="container mx-auto px-4 py-4">
            <Link href="/admin">
              <h1 className="text-2xl font-bold text-gray-900 cursor-pointer">{APP_TITLE}</h1>
            </Link>
          </div>
        </header>
        <main className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="py-20 text-center">
              <p className="text-gray-600">Job not found</p>
              <Link href="/admin">
                <Button className="mt-4">Back to Dashboard</Button>
              </Link>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline", label: string }> = {
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
      <header className="border-b bg-white sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <Link href="/admin">
            <h1 className="text-2xl font-bold text-gray-900 cursor-pointer hover:text-blue-600">
              {APP_TITLE}
            </h1>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-6">
          <Link href="/admin">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Job Details */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl mb-2">{job.siteName}</CardTitle>
                    <CardDescription className="text-base">
                      Client: {job.clientName}
                    </CardDescription>
                  </div>
                  {getStatusBadge(job.status)}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Site Information */}
                <div>
                  <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Site Information
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    {job.siteId && (
                      <div>
                        <p className="text-gray-600">Site ID</p>
                        <p className="font-medium">{job.siteId}</p>
                      </div>
                    )}
                    {job.siteLocation && (
                      <div>
                        <p className="text-gray-600">Location</p>
                        <p className="font-medium">{job.siteLocation}</p>
                      </div>
                    )}
                    {job.siteAddress && (
                      <div className="md:col-span-2">
                        <p className="text-gray-600">Address</p>
                        <p className="font-medium whitespace-pre-line">{job.siteAddress}</p>
                      </div>
                    )}
                    {job.siteContactName && (
                      <div>
                        <p className="text-gray-600">Contact Name</p>
                        <p className="font-medium">{job.siteContactName}</p>
                      </div>
                    )}
                    {job.siteContactNumber && (
                      <div>
                        <p className="text-gray-600">Contact Number</p>
                        <p className="font-medium">{job.siteContactNumber}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Job Details */}
                <div className="border-t pt-4">
                  <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Job Details
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    {job.changeNumber && (
                      <div>
                        <p className="text-gray-600">Change Number</p>
                        <p className="font-medium">{job.changeNumber}</p>
                      </div>
                    )}
                    {job.incidentNumber && (
                      <div>
                        <p className="text-gray-600">Incident Number</p>
                        <p className="font-medium">{job.incidentNumber}</p>
                      </div>
                    )}
                    {job.projectName && (
                      <div>
                        <p className="text-gray-600">Project</p>
                        <p className="font-medium">{job.projectName}</p>
                      </div>
                    )}
                    {job.hoursRequired && (
                      <div>
                        <p className="text-gray-600">Hours Required</p>
                        <p className="font-medium">{job.hoursRequired}</p>
                      </div>
                    )}
                    {job.scheduledDateTime && (
                      <div>
                        <p className="text-gray-600">Scheduled Date & Time</p>
                        <p className="font-medium">{new Date(job.scheduledDateTime).toLocaleString()}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-gray-600">Down Time</p>
                      <p className="font-medium">{job.downTime ? "Yes" : "No"}</p>
                    </div>
                  </div>
                </div>

                {/* Technical Requirements */}
                {(job.toolsRequired || job.deviceDetails || job.incidentDetails || job.scopeOfWork) && (
                  <div className="border-t pt-4">
                    <h3 className="font-semibold text-lg mb-3">Technical Requirements</h3>
                    <div className="space-y-3 text-sm">
                      {job.toolsRequired && (
                        <div>
                          <p className="text-gray-600 font-medium">Tools Required</p>
                          <p className="whitespace-pre-line">{job.toolsRequired}</p>
                        </div>
                      )}
                      {job.deviceDetails && (
                        <div>
                          <p className="text-gray-600 font-medium">Device Details</p>
                          <p className="whitespace-pre-line">{job.deviceDetails}</p>
                        </div>
                      )}
                      {job.incidentDetails && (
                        <div>
                          <p className="text-gray-600 font-medium">Incident/Change Details</p>
                          <p className="whitespace-pre-line">{job.incidentDetails}</p>
                        </div>
                      )}
                      {job.scopeOfWork && (
                        <div>
                          <p className="text-gray-600 font-medium">Scope of Work</p>
                          <p className="whitespace-pre-line">{job.scopeOfWork}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Notes */}
                {job.notes && (
                  <div className="border-t pt-4">
                    <h3 className="font-semibold text-lg mb-2">Notes</h3>
                    <p className="text-sm whitespace-pre-line">{job.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Engineer & Timeline */}
          <div className="space-y-6">
            {/* Engineer Information */}
            {job.engineerName && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Engineer
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div>
                    <p className="text-gray-600">Name</p>
                    <p className="font-medium">{job.engineerName}</p>
                  </div>
                  {job.engineerEmail && (
                    <div>
                      <p className="text-gray-600">Email</p>
                      <p className="font-medium">{job.engineerEmail}</p>
                    </div>
                  )}
                  {job.engineerPhone && (
                    <div>
                      <p className="text-gray-600">Phone</p>
                      <p className="font-medium">{job.engineerPhone}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Timeline */}
            <Card>
              <CardHeader>
                <CardTitle>Timeline</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <p className="text-gray-600">Created</p>
                  <p className="font-medium">{new Date(job.createdAt).toLocaleString()}</p>
                </div>
                {job.acceptedAt && (
                  <div>
                    <p className="text-gray-600">Accepted</p>
                    <p className="font-medium">{new Date(job.acceptedAt).toLocaleString()}</p>
                  </div>
                )}
                {job.enRouteAt && (
                  <div>
                    <p className="text-gray-600">En Route</p>
                    <p className="font-medium">{new Date(job.enRouteAt).toLocaleString()}</p>
                  </div>
                )}
                {job.arrivedAt && (
                  <div>
                    <p className="text-gray-600">Arrived On Site</p>
                    <p className="font-medium">{new Date(job.arrivedAt).toLocaleString()}</p>
                  </div>
                )}
                {job.completedAt && (
                  <div>
                    <p className="text-gray-600">Completed</p>
                    <p className="font-medium">{new Date(job.completedAt).toLocaleString()}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Share Links */}
            {(job.status === "created" || job.status === "sent_to_engineer" || job.status === "accepted") && (
              <Card>
                <CardHeader>
                  <CardTitle>Share Links</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => {
                      const url = `${window.location.origin}/engineer/${job.jobToken}`;
                      navigator.clipboard.writeText(url);
                    }}
                  >
                    Copy Engineer Link
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => {
                      const url = `${window.location.origin}/track/${job.jobToken}`;
                      navigator.clipboard.writeText(url);
                    }}
                  >
                    Copy Client Link
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

