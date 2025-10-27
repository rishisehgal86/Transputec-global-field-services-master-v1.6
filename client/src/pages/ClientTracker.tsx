import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, MapPin, Clock, User, CheckCircle2, Navigation2, XCircle } from "lucide-react";
import { APP_TITLE } from "@/const";
import { useRoute } from "wouter";
import { trpc } from "@/lib/trpc";
import { useEffect, useState } from "react";
import { LiveMap } from "@/components/LiveMap";

export default function ClientTracker() {
  const [match, params] = useRoute("/track/:token");
  const token = params?.token || "";


  const { data: job, isLoading, refetch } = trpc.jobs.getByToken.useQuery(
    { token },
    { enabled: !!token, refetchInterval: 5000 }
  );

  const { data: latestLocation } = trpc.jobs.getLatestLocation.useQuery(
    { token },
    { enabled: !!token && (job?.status === "en_route" || job?.status === "on_site"), refetchInterval: 5000 }
  );



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

  const getStatusInfo = (status: string) => {
    const statusMap: Record<string, { icon: any; label: string; color: string; description: string }> = {
      created: {
        icon: Clock,
        label: "Created",
        color: "text-gray-600",
        description: "Job has been created and is awaiting engineer assignment",
      },
      sent_to_engineer: {
        icon: Clock,
        label: "Sent to Engineer",
        color: "text-blue-600",
        description: "Job details have been sent to the field engineer",
      },
      accepted: {
        icon: CheckCircle2,
        label: "Accepted",
        color: "text-green-600",
        description: "Engineer has accepted the job and will start soon",
      },
      en_route: {
        icon: Navigation2,
        label: "En Route",
        color: "text-blue-600",
        description: "Engineer is traveling to the site",
      },
      on_site: {
        icon: MapPin,
        label: "On Site",
        color: "text-purple-600",
        description: "Engineer has arrived and is working on site",
      },
      completed: {
        icon: CheckCircle2,
        label: "Completed",
        color: "text-green-600",
        description: "Job has been completed successfully",
      },
      declined: {
        icon: XCircle,
        label: "Declined",
        color: "text-red-600",
        description: "Engineer has declined this job",
      },
    };

    return statusMap[status] || statusMap.created;
  };

  const statusInfo = getStatusInfo(job.status);
  const StatusIcon = statusInfo.icon;

  const calculateDuration = (start: Date | null, end: Date | null) => {
    if (!start || !end) return null;
    const diff = new Date(end).getTime() - new Date(start).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const travelTime = calculateDuration(job.enRouteAt, job.arrivedAt);
  const onSiteTime = calculateDuration(job.arrivedAt, job.completedAt);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">{APP_TITLE}</h1>
          <p className="text-sm text-gray-600">Job Tracking Portal</p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Status Banner */}
        <Card className="mb-6 border-2">
          <CardContent className="py-6">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-full bg-gray-100 ${statusInfo.color}`}>
                <StatusIcon className="h-8 w-8" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-1">{statusInfo.label}</h2>
                <p className="text-gray-600">{statusInfo.description}</p>
              </div>
              {(job.status === "en_route" || job.status === "on_site") && (
                <div className="text-right">
                  <p className="text-sm text-gray-600">Last Updated</p>
                  <p className="font-medium">{latestLocation ? new Date(latestLocation.timestamp).toLocaleTimeString() : "N/A"}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Map */}
          <div className="lg:col-span-2">
            {(job.status === "en_route" || job.status === "on_site") && latestLocation ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Live Location Tracking
                  </CardTitle>
                  <CardDescription>Real-time engineer location</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[500px]">
                    <LiveMap
                      latitude={parseFloat(latestLocation.latitude)}
                      longitude={parseFloat(latestLocation.longitude)}
                      accuracy={latestLocation.accuracy ? parseFloat(latestLocation.accuracy) : undefined}
                      engineerName={job.engineerName || "Engineer"}
                      lastUpdate={new Date(latestLocation.timestamp)}
                    />
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    Accuracy: ±{latestLocation.accuracy ? `${Math.round(parseFloat(latestLocation.accuracy))}m` : "N/A"}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="py-20 text-center">
                  <MapPin className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">
                    {job.status === "completed"
                      ? "Job completed - tracking ended"
                      : "Location tracking will begin when engineer starts journey"}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Engineer Info */}
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
                  {job.engineerPhone && (
                    <div>
                      <p className="text-gray-600">Phone</p>
                      <p className="font-medium">
                        <a href={`tel:${job.engineerPhone}`} className="text-blue-600 hover:underline">
                          {job.engineerPhone}
                        </a>
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Timeline
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <p className="text-gray-600">Job Created</p>
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
                    <p className="text-gray-600">Started Journey</p>
                    <p className="font-medium">{new Date(job.enRouteAt).toLocaleString()}</p>
                  </div>
                )}
                {job.arrivedAt && (
                  <div>
                    <p className="text-gray-600">Arrived On Site</p>
                    <p className="font-medium">{new Date(job.arrivedAt).toLocaleString()}</p>
                    {travelTime && (
                      <p className="text-xs text-gray-500">Travel time: {travelTime}</p>
                    )}
                  </div>
                )}
                {job.completedAt && (
                  <div>
                    <p className="text-gray-600">Completed</p>
                    <p className="font-medium">{new Date(job.completedAt).toLocaleString()}</p>
                    {onSiteTime && (
                      <p className="text-xs text-gray-500">On-site time: {onSiteTime}</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Site Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Site Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div>
                  <p className="text-gray-600">Site Name</p>
                  <p className="font-medium">{job.siteName}</p>
                </div>
                {job.siteLocation && (
                  <div>
                    <p className="text-gray-600">Location</p>
                    <p className="font-medium">{job.siteLocation}</p>
                  </div>
                )}
                {job.scheduledDateTime && (
                  <div>
                    <p className="text-gray-600">Scheduled</p>
                    <p className="font-medium">{new Date(job.scheduledDateTime).toLocaleString()}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}

