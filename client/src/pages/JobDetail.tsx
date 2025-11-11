import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, ArrowLeft, MapPin, Clock, User, XCircle, CheckCircle2, Copy, Link as LinkIcon } from "lucide-react";
import { LogoImage } from "@/components/LogoImage";
import { useLocation } from "wouter";
import { Link, useRoute } from "wouter";
import { trpc } from "@/lib/trpc";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { LiveMap } from "@/components/LiveMap";
import { SiteVisitReportDisplay } from "@/components/SiteVisitReportDisplay";
import { EditVideoConferenceLink } from "@/components/EditVideoConferenceLink";
import { JobComments } from "@/components/JobComments";
import { CancelJobDialog } from "@/components/CancelJobDialog";

export default function JobDetail() {
  const { isAuthenticated, loading: authLoading } = useAuth({ redirectOnUnauthenticated: true });
  const [, setLocation] = useLocation();
  const [match, params] = useRoute("/admin/job/:id");
  const jobId = params?.id ? parseInt(params.id) : 0;
  const [eta, setEta] = useState<string | null>(null);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);

  const { data: job, isLoading, refetch } = trpc.jobs.getById.useQuery(
    { id: jobId },
    { enabled: !!jobId && isAuthenticated, refetchInterval: 5000 }
  );

  const { data: latestLocation } = trpc.jobs.getLatestLocation.useQuery(
    { token: job?.jobToken || "" },
    { enabled: !!job && (job.status === "en_route" || job.status === "on_site"), refetchInterval: 5000 }
  );

  const { data: svr } = trpc.svr.getByToken.useQuery(
    { token: job?.jobToken || "" },
    { enabled: !!job && job.status === "completed" }
  );

  const emailSVRMutation = trpc.svr.email.useMutation({
    onSuccess: () => {
      toast.success("Site Visit Report sent successfully!");
    },
    onError: (error) => {
      toast.error(`Failed to send SVR: ${error.message}`);
    },
  });

  const updateStatusMutation = trpc.jobs.updateStatus.useMutation({
    onSuccess: () => {
      toast.success("Job status updated!");
      refetch();
    },
    onError: (error) => {
      toast.error(`Failed to update status: ${error.message}`);
    },
  });

  const duplicateJobMutation = trpc.jobs.duplicate.useMutation({
    onSuccess: (data) => {
      toast.success("Job duplicated successfully!");
      // Navigate to create page with duplicate parameter
      setLocation(`/admin/create?duplicate=${job?.id}`);
    },
    onError: (error) => {
      toast.error(`Failed to duplicate job: ${error.message}`);
    },
  });

  const cancelJobMutation = trpc.jobs.cancel.useMutation({
    onSuccess: () => {
      toast.success("Job cancelled successfully!");
      setCancelDialogOpen(false);
      refetch();
    },
    onError: (error) => {
      toast.error(`Failed to cancel job: ${error.message}`);
    },
  });

  const handleCancelJob = (reason: string) => {
    if (!job) return;
    cancelJobMutation.mutate({
      jobId: job.id,
      reason,
      cancelledBy: "Admin", // In a real app, this would be the logged-in user's name
    });
  };

  const reassignJobMutation = trpc.jobs.reassign.useMutation({
    onSuccess: () => {
      toast.success("Job reassigned! New engineer link generated.");
      refetch();
    },
    onError: (error) => {
      toast.error(`Failed to reassign job: ${error.message}`);
    },
  });

  // Calculate ETA
  useEffect(() => {
    if (!job || !latestLocation) return;

    if (job.status === "en_route" && job.siteLatitude && job.siteLongitude) {
      // Calculate distance between engineer and site
      const engineerLat = parseFloat(latestLocation.latitude);
      const engineerLng = parseFloat(latestLocation.longitude);
      const siteLat = parseFloat(job.siteLatitude);
      const siteLng = parseFloat(job.siteLongitude);
      
      // Haversine formula for distance
      const R = 6371; // Earth radius in km
      const dLat = (siteLat - engineerLat) * Math.PI / 180;
      const dLon = (siteLng - engineerLng) * Math.PI / 180;
      const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(engineerLat * Math.PI / 180) * Math.cos(siteLat * Math.PI / 180) *
                Math.sin(dLon/2) * Math.sin(dLon/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      const distance = R * c;
      
      // Calculate ETA (40 km/h average speed)
      const avgSpeed = 40;
      const estimatedMinutes = Math.round((distance / avgSpeed) * 60);
      setEta(`~${estimatedMinutes} min (${distance.toFixed(1)} km)`);
    } else {
      setEta(null);
    }
  }, [latestLocation, job]);

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // SSO handles authentication - if not authenticated, useAuth will redirect to login
  if (!isAuthenticated) {
    return null;
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b bg-background">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center gap-4">
              <Link href="/admin">
                <LogoImage className="h-14 cursor-pointer hover:opacity-80 transition-opacity" />
              </Link>
              <div className="hidden md:block border-l border-border pl-4">
                <p className="text-sm font-medium text-muted-foreground">On-Demand Despatch Field Services Platform</p>
              </div>
            </div>
          </div>
        </header>
        <main className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="py-20 text-center">
              <p className="text-muted-foreground">Job not found</p>
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

  const canUpdateStatus = job.status !== "completed" && job.status !== "cancelled" && job.status !== "declined";

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-background sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <Link href="/admin">
              <LogoImage className="h-14 cursor-pointer hover:opacity-80 transition-opacity" />
            </Link>
            <div className="hidden md:block border-l border-border pl-4">
              <p className="text-sm font-medium text-muted-foreground">On-Demand Despatch Field Services Platform</p>
            </div>
          </div>
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

        {/* Live Tracking Map */}
        {(job.status === "en_route" || job.status === "on_site") && latestLocation && (
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Live Location Tracking
                  </CardTitle>
                  <CardDescription>Real-time engineer location</CardDescription>
                </div>
                {eta && job.status === "en_route" && (
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Estimated Arrival</p>
                    <p className="text-lg font-bold text-blue-600">{eta}</p>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] mb-2">
                <LiveMap
                  latitude={parseFloat(latestLocation.latitude)}
                  longitude={parseFloat(latestLocation.longitude)}
                  accuracy={latestLocation.accuracy ? parseFloat(latestLocation.accuracy) : undefined}
                  engineerName={job.engineerName || "Engineer"}
                  lastUpdate={new Date(latestLocation.timestamp)}
                  siteLatitude={job.siteLatitude ? parseFloat(job.siteLatitude) : undefined}
                  siteLongitude={job.siteLongitude ? parseFloat(job.siteLongitude) : undefined}
                  siteName={job.siteName}
                  showRecenterButton={true}
                />
              </div>
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <p>
                  Accuracy: ±{latestLocation.accuracy ? `${Math.round(parseFloat(latestLocation.accuracy))}m` : "N/A"}
                </p>
                <p>
                  Last Updated: {new Date(latestLocation.timestamp).toLocaleTimeString()}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

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
                {/* Shareable Links */}
                {job.jobToken && (
                  <div className="bg-background border border-gray-200 rounded-lg p-4">
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <LinkIcon className="h-4 w-4" />
                      Shareable Links
                    </h4>
                    <div className="space-y-3">
                      {/* Engineer Link */}
                      <div>
                        <label className="text-sm font-medium text-foreground block mb-1">
                          Engineer Job Link
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            readOnly
                            value={`${window.location.origin}/engineer/${job.jobToken}`}
                            className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded bg-background font-mono"
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              navigator.clipboard.writeText(`${window.location.origin}/engineer/${job.jobToken}`);
                              toast.success("Engineer link copied!");
                            }}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      {/* Client Tracking Link */}
                      <div>
                        <label className="text-sm font-medium text-foreground block mb-1">
                          Client Tracking Link
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            readOnly
                            value={`${window.location.origin}/track/${job.jobToken}`}
                            className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded bg-background font-mono"
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              navigator.clipboard.writeText(`${window.location.origin}/track/${job.jobToken}`);
                              toast.success("Client link copied!");
                            }}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Admin Controls */}
                {canUpdateStatus && (
                  <div className="bg-card border rounded-lg p-4">
                    <h4 className="font-semibold mb-3">Admin Controls</h4>
                    <div className="flex gap-2 flex-wrap">
                      {job.status === "pending_approval" && (
                        <>
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => updateStatusMutation.mutate({ token: job.jobToken, status: "approved" })}
                            disabled={updateStatusMutation.isPending}
                          >
                            <CheckCircle2 className="h-4 w-4 mr-1" />
                            Approve Request
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => {
                              if (confirm("Are you sure you want to reject this request?")) {
                                updateStatusMutation.mutate({ token: job.jobToken, status: "rejected" });
                              }
                            }}
                            disabled={updateStatusMutation.isPending}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Reject Request
                          </Button>
                        </>
                      )}
                      {job.status === "approved" && (
                        <div className="w-full">
                          <p className="text-sm text-foreground mb-2">This request has been approved. Assign an engineer and create the job.</p>
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => updateStatusMutation.mutate({ token: job.jobToken, status: "created" })}
                            disabled={updateStatusMutation.isPending}
                          >
                            Create Job & Send to Engineer
                          </Button>
                        </div>
                      )}
                      {job.status === "accepted" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateStatusMutation.mutate({ token: job.jobToken, status: "en_route" })}
                          disabled={updateStatusMutation.isPending}
                        >
                          Mark as En Route
                        </Button>
                      )}
                      {job.status === "en_route" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateStatusMutation.mutate({ token: job.jobToken, status: "on_site" })}
                          disabled={updateStatusMutation.isPending}
                        >
                          Mark as On Site
                        </Button>
                      )}
                      {(job.status === "on_site" || job.status === "en_route" || job.status === "accepted") && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateStatusMutation.mutate({ token: job.jobToken, status: "completed" })}
                          disabled={updateStatusMutation.isPending}
                        >
                          <CheckCircle2 className="h-4 w-4 mr-1" />
                          Mark as Completed
                        </Button>
                      )}
                      {job.status === "declined" && (
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => {
                            if (confirm("This will generate a new engineer link and reset the job status. Continue?")) {
                              reassignJobMutation.mutate({ jobId: job.id });
                            }
                          }}
                          disabled={reassignJobMutation.isPending}
                        >
                          <User className="h-4 w-4 mr-1" />
                          Reassign to Another Engineer
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => duplicateJobMutation.mutate({ jobId: job.id })}
                        disabled={duplicateJobMutation.isPending}
                      >
                        <Copy className="h-4 w-4 mr-1" />
                        Duplicate Job
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => setCancelDialogOpen(true)}
                        disabled={cancelJobMutation.isPending}
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Cancel Job
                      </Button>
                    </div>
                  </div>
                )}

                {/* Site Information */}
                <div>
                  <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Site Information
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    {job.siteId && (
                      <div>
                        <p className="text-muted-foreground">Site ID</p>
                        <p className="font-medium">{job.siteId}</p>
                      </div>
                    )}
                    {job.siteLocation && (
                      <div>
                        <p className="text-muted-foreground">Location</p>
                        <p className="font-medium">{job.siteLocation}</p>
                      </div>
                    )}
                    {job.siteAddress && (
                      <div className="md:col-span-2">
                        <p className="text-muted-foreground">Address</p>
                        <p className="font-medium whitespace-pre-line">{job.siteAddress}</p>
                      </div>
                    )}
                    {job.siteContactName && (
                      <div>
                        <p className="text-muted-foreground">Contact Name</p>
                        <p className="font-medium">{job.siteContactName}</p>
                      </div>
                    )}
                    {job.siteContactNumber && (
                      <div>
                        <p className="text-muted-foreground">Contact Number</p>
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
                        <p className="text-muted-foreground">Change Number</p>
                        <p className="font-medium">{job.changeNumber}</p>
                      </div>
                    )}
                    {job.incidentNumber && (
                      <div>
                        <p className="text-muted-foreground">Incident Number</p>
                        <p className="font-medium">{job.incidentNumber}</p>
                      </div>
                    )}
                    {job.projectName && (
                      <div>
                        <p className="text-muted-foreground">Project</p>
                        <p className="font-medium">{job.projectName}</p>
                      </div>
                    )}
                    {job.hoursRequired && (
                      <div>
                        <p className="text-muted-foreground">Hours Required</p>
                        <p className="font-medium">{job.hoursRequired}</p>
                      </div>
                    )}
                    {job.scheduledDateTime && (
                      <div>
                        <p className="text-muted-foreground">Scheduled Date & Time</p>
                        <p className="font-medium">{new Date(job.scheduledDateTime).toLocaleString()}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-muted-foreground">Down Time</p>
                      <p className="font-medium">{job.downTime ? "Yes" : "No"}</p>
                    </div>
                    <div className="md:col-span-2">
                      <p className="text-muted-foreground mb-2">Video Conference Link</p>
                      <EditVideoConferenceLink 
                        token={job.jobToken}
                        currentLink={job.videoConferenceLink}
                        onUpdate={refetch}
                      />
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
                          <p className="text-muted-foreground font-medium">Tools Required</p>
                          <p className="whitespace-pre-line">{job.toolsRequired}</p>
                        </div>
                      )}
                      {job.deviceDetails && (
                        <div>
                          <p className="text-muted-foreground font-medium">Device Details</p>
                          <p className="whitespace-pre-line">{job.deviceDetails}</p>
                        </div>
                      )}
                      {job.incidentDetails && (
                        <div>
                          <p className="text-muted-foreground font-medium">Incident/Change Details</p>
                          <p className="whitespace-pre-line">{job.incidentDetails}</p>
                        </div>
                      )}
                      {job.scopeOfWork && (
                        <div>
                          <p className="text-muted-foreground font-medium">Scope of Work</p>
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
                    <p className="text-muted-foreground">Name</p>
                    <p className="font-medium">{job.engineerName}</p>
                  </div>
                  {job.engineerEmail && (
                    <div>
                      <p className="text-muted-foreground">Email</p>
                      <p className="font-medium">{job.engineerEmail}</p>
                    </div>
                  )}
                  {job.engineerPhone && (
                    <div>
                      <p className="text-muted-foreground">Phone</p>
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
                  <p className="text-muted-foreground">Created</p>
                  <p className="font-medium">{new Date(job.createdAt).toLocaleString()}</p>
                </div>
                {job.acceptedAt && (
                  <div>
                    <p className="text-muted-foreground">Accepted</p>
                    <p className="font-medium">{new Date(job.acceptedAt).toLocaleString()}</p>
                  </div>
                )}
                {job.enRouteAt && (
                  <div>
                    <p className="text-muted-foreground">En Route</p>
                    <p className="font-medium">{new Date(job.enRouteAt).toLocaleString()}</p>
                  </div>
                )}
                {job.arrivedAt && (
                  <div>
                    <p className="text-muted-foreground">Arrived On Site</p>
                    <p className="font-medium">{new Date(job.arrivedAt).toLocaleString()}</p>
                    {job.enRouteAt && (
                      <p className="text-xs text-gray-500">
                        Travel time: {Math.round((new Date(job.arrivedAt).getTime() - new Date(job.enRouteAt).getTime()) / 60000)} minutes
                      </p>
                    )}
                  </div>
                )}
                {job.completedAt && (
                  <div>
                    <p className="text-muted-foreground">Completed</p>
                    <p className="font-medium">{new Date(job.completedAt).toLocaleString()}</p>
                    {job.arrivedAt && (
                      <p className="text-xs text-gray-500">
                        On-site time: {Math.round((new Date(job.completedAt).getTime() - new Date(job.arrivedAt).getTime()) / 60000)} minutes
                      </p>
                    )}
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
                      toast.success("Engineer link copied!");
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
                      toast.success("Client link copied!");
                    }}
                  >
                    Copy Client Link
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
        {/* Comments Section */}
        <div className="mb-6">
          <JobComments
            token={job.jobToken}
            authorName="Admin"
            authorType="admin"
            canComment={job.status !== "completed" && job.status !== "cancelled"}
          />
        </div>

        {/* Site Visit Report */}
        {job.status === "completed" && svr && (
          <div className="mb-6">
            <SiteVisitReportDisplay
              svr={svr}
              jobData={job}
              showEmailOption={true}
              onEmailSVR={(email) => {
                emailSVRMutation.mutate({
                  jobId: job.id,
                  recipientEmail: email,
                });
              }}
            />
          </div>
        )}
      </main>

      <CancelJobDialog
        open={cancelDialogOpen}
        onOpenChange={setCancelDialogOpen}
        onConfirm={handleCancelJob}
        isLoading={cancelJobMutation.isPending}
      />
    </div>
  );
}

