import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Loader2, MapPin, Clock, CheckCircle2, Navigation, XCircle } from "lucide-react";
import { APP_TITLE } from "@/const";
import { useRoute } from "wouter";
import { trpc } from "@/lib/trpc";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { SiteVisitReportForm, type SiteVisitReportData } from "@/components/SiteVisitReportForm";

export default function EngineerView() {
  const [match, params] = useRoute("/engineer/:token");
  const token = params?.token || "";
  const [engineerName, setEngineerName] = useState("");
  const [engineerEmail, setEngineerEmail] = useState("");
  const [engineerPhone, setEngineerPhone] = useState("");
  const [isTracking, setIsTracking] = useState(false);
  const [watchId, setWatchId] = useState<number | null>(null);
  const [showSVRForm, setShowSVRForm] = useState(false);

  const { data: job, isLoading, refetch } = trpc.jobs.getByToken.useQuery(
    { token },
    { enabled: !!token, refetchInterval: 10000 }
  );

  const acceptMutation = trpc.jobs.accept.useMutation({
    onSuccess: () => {
      toast.success("Job accepted successfully!");
      refetch();
    },
    onError: (error) => {
      toast.error(`Failed to accept job: ${error.message}`);
    },
  });

  const declineMutation = trpc.jobs.decline.useMutation({
    onSuccess: () => {
      toast.success("Job declined");
      refetch();
    },
    onError: (error) => {
      toast.error(`Failed to decline job: ${error.message}`);
    },
  });

  const createSVRMutation = trpc.svr.create.useMutation({
    onSuccess: () => {
      toast.success("Site Visit Report submitted! Job marked as completed.");
      setShowSVRForm(false);
      refetch();
    },
    onError: (error) => {
      toast.error(`Failed to submit SVR: ${error.message}`);
    },
  });

  const updateStatusMutation = trpc.jobs.updateStatus.useMutation({
    onSuccess: () => {
      toast.success("Status updated!");
      refetch();
    },
    onError: (error) => {
      toast.error(`Failed to update status: ${error.message}`);
    },
  });

  const addLocationMutation = trpc.jobs.addLocation.useMutation();

  const startTracking = (trackingType: "en_route" | "on_site") => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }

    const id = navigator.geolocation.watchPosition(
      (position) => {
        addLocationMutation.mutate({
          token,
          latitude: position.coords.latitude.toString(),
          longitude: position.coords.longitude.toString(),
          accuracy: position.coords.accuracy.toString(),
          trackingType,
        });
      },
      (error) => {
        console.error("Geolocation error:", error);
        toast.error("Failed to get location");
      },
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 5000,
      }
    );

    setWatchId(id);
    setIsTracking(true);
  };

  const stopTracking = () => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
      setIsTracking(false);
    }
  };

  const handleStatusChange = (status: "en_route" | "on_site" | "completed") => {
    if (status === "en_route") {
      updateStatusMutation.mutate({ token, status });
      startTracking("en_route");
    } else if (status === "on_site") {
      stopTracking();
      updateStatusMutation.mutate({ token, status });
      startTracking("on_site");
    } else if (status === "completed") {
      stopTracking();
      updateStatusMutation.mutate({ token, status });
    }
  };

  useEffect(() => {
    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [watchId]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="py-20 text-center">
            <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <p className="text-gray-600">Job not found or link is invalid</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const canAccept = job.status === "created" || job.status === "sent_to_engineer";
  const isAccepted = job.status === "accepted" || job.status === "en_route" || job.status === "on_site";
  const isCompleted = job.status === "completed";
  const isDeclined = job.status === "declined";

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">{APP_TITLE}</h1>
          <p className="text-sm text-gray-600">Field Engineer Portal</p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Job Acceptance Card */}
        {canAccept && (
          <Card className="mb-6 border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle>New Job Assignment</CardTitle>
              <CardDescription>Please review the job details and accept or decline</CardDescription>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  acceptMutation.mutate({
                    token,
                    engineerName,
                    engineerEmail: engineerEmail || undefined,
                    engineerPhone: engineerPhone || undefined,
                  });
                }}
                className="space-y-4"
              >
                <div>
                  <Label htmlFor="engineerName">Your Name *</Label>
                  <Input
                    id="engineerName"
                    value={engineerName}
                    onChange={(e) => setEngineerName(e.target.value)}
                    required
                  />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="engineerEmail">Email</Label>
                    <Input
                      id="engineerEmail"
                      type="email"
                      value={engineerEmail}
                      onChange={(e) => setEngineerEmail(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="engineerPhone">Phone</Label>
                    <Input
                      id="engineerPhone"
                      type="tel"
                      value={engineerPhone}
                      onChange={(e) => setEngineerPhone(e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <Button
                    type="submit"
                    className="flex-1"
                    disabled={acceptMutation.isPending}
                  >
                    {acceptMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Accept Job
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => {
                      const reason = prompt("Please provide a reason for declining (optional):");
                      declineMutation.mutate({ token, reason: reason || undefined });
                    }}
                    disabled={declineMutation.isPending}
                  >
                    {declineMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Decline
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Status Controls */}
        {isAccepted && !isCompleted && (
          <Card className="mb-6 border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Navigation className="h-5 w-5" />
                Job Status Controls
              </CardTitle>
              <CardDescription>Update your current status</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {job.status === "accepted" && (
                <Button
                  onClick={() => handleStatusChange("en_route")}
                  className="w-full"
                  disabled={updateStatusMutation.isPending}
                >
                  {updateStatusMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Start Journey (En Route)
                </Button>
              )}
              {job.status === "en_route" && (
                <Button
                  onClick={() => handleStatusChange("on_site")}
                  className="w-full"
                  disabled={updateStatusMutation.isPending}
                >
                  {updateStatusMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Arrived On Site
                </Button>
              )}
              {job.status === "on_site" && !showSVRForm && (
                <Button
                  onClick={() => setShowSVRForm(true)}
                  className="w-full"
                >
                  Complete Job & Submit Report
                </Button>
              )}
              {isTracking && (
                <p className="text-sm text-green-700 text-center">
                  📍 Location tracking active
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {/* SVR Form */}
        {showSVRForm && job.status === "on_site" && (
          <div className="mb-6">
            <SiteVisitReportForm
              jobId={job.id}
              engineerName={engineerName || job.engineerName || "Engineer"}
              onSubmit={(data: SiteVisitReportData) => {
                createSVRMutation.mutate({
                  token,
                  ...data,
                });
              }}
              onCancel={() => setShowSVRForm(false)}
              isSubmitting={createSVRMutation.isPending}
            />
          </div>
        )}

        {/* Completed Status */}
        {isCompleted && (
          <Card className="mb-6 border-green-200 bg-green-50">
            <CardContent className="py-8 text-center">
              <CheckCircle2 className="h-16 w-16 text-green-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-green-900 mb-2">Job Completed!</h3>
              <p className="text-green-700">Thank you for your service</p>
            </CardContent>
          </Card>
        )}

        {/* Declined Status */}
        {isDeclined && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardContent className="py-8 text-center">
              <XCircle className="h-16 w-16 text-red-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-red-900 mb-2">Job Declined</h3>
              <p className="text-red-700">This job has been declined</p>
            </CardContent>
          </Card>
        )}

        {/* Job Details */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-2xl mb-2">{job.siteName}</CardTitle>
                <CardDescription className="text-base">
                  Client: {job.clientName}
                </CardDescription>
              </div>
              <Badge variant={isCompleted ? "outline" : "default"}>
                {job.status.replace(/_/g, " ").toUpperCase()}
              </Badge>
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
                    <p className="font-medium">
                      <a href={`tel:${job.siteContactNumber}`} className="text-blue-600 hover:underline">
                        {job.siteContactNumber}
                      </a>
                    </p>
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
                {job.scheduledDateTime && (
                  <div>
                    <p className="text-gray-600">Scheduled Date & Time</p>
                    <p className="font-medium">{new Date(job.scheduledDateTime).toLocaleString()}</p>
                  </div>
                )}
                {job.hoursRequired && (
                  <div>
                    <p className="text-gray-600">Hours Required</p>
                    <p className="font-medium">{job.hoursRequired}</p>
                  </div>
                )}
                {job.projectName && (
                  <div>
                    <p className="text-gray-600">Project</p>
                    <p className="font-medium">{job.projectName}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Technical Requirements */}
            {(job.toolsRequired || job.scopeOfWork) && (
              <div className="border-t pt-4">
                <h3 className="font-semibold text-lg mb-3">Technical Requirements</h3>
                <div className="space-y-3 text-sm">
                  {job.toolsRequired && (
                    <div>
                      <p className="text-gray-600 font-medium">Tools Required</p>
                      <p className="whitespace-pre-line">{job.toolsRequired}</p>
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
                <p className="text-sm whitespace-pre-line bg-yellow-50 p-3 rounded border border-yellow-200">
                  {job.notes}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

