import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Loader2, MapPin, Clock, User, CheckCircle2, Navigation2, XCircle, Building2, Phone, Mail, Calendar, Timer, RefreshCw, History, Printer } from "lucide-react";
import { LogoImage } from "@/components/LogoImage";
import { DualTimeDisplay, CompactDualTime } from "@/components/DualTimeDisplay";
import { useRoute } from "wouter";
import { trpc } from "@/lib/trpc";
import { useEffect, useState } from "react";
import { LiveMap } from "@/components/LiveMap";
import { SiteVisitReportDisplay } from "@/components/SiteVisitReportDisplay";
import { EditVideoConferenceLink } from "@/components/EditVideoConferenceLink";
import { JobComments } from "@/components/JobComments";
import "../print.css";


export default function ClientTracker() {
  const [match, params] = useRoute("/track/:token");
  const token = params?.token || "";
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const { data: job, isLoading, refetch } = trpc.jobs.getByToken.useQuery(
    { token },
    { 
      enabled: !!token, 
      refetchInterval: 5000
    }
  );

  useEffect(() => {
    if (job) {
      setLastUpdated(new Date());
    }
  }, [job]);

  const { data: latestLocation } = trpc.jobs.getLatestLocation.useQuery(
    { token },
    { enabled: !!token && (job?.status === "en_route" || job?.status === "on_site"), refetchInterval: 5000 }
  );

  const { data: statusHistory } = trpc.jobs.getStatusHistory.useQuery(
    { token },
    { enabled: !!token }
  );

  const { data: svr } = trpc.svr.getByToken.useQuery(
    { token },
    { enabled: !!token && job?.status === "completed" }
  );

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your service request...</p>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="py-20 text-center">
            <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Request Not Found</h2>
            <p className="text-muted-foreground">The tracking link is invalid or the request has been removed.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getStatusInfo = (status: string) => {
    const statusMap: Record<string, { icon: any; label: string; color: string; bgColor: string; description: string }> = {
      pending_approval: { 
        icon: Clock, 
        label: "Pending Review", 
        color: "text-yellow-700", 
        bgColor: "bg-yellow-100 border-yellow-300",
        description: "Your request is being reviewed by our team"
      },
      approved: { 
        icon: CheckCircle2, 
        label: "Approved", 
        color: "text-green-700", 
        bgColor: "bg-green-100 border-green-300",
        description: "Request approved, engineer will be assigned soon"
      },
      assigned: { 
        icon: User, 
        label: "Engineer Assigned", 
        color: "text-blue-700", 
        bgColor: "bg-blue-100 border-blue-300",
        description: "An engineer has been assigned to your request"
      },
      accepted: { 
        icon: CheckCircle2, 
        label: "Accepted", 
        color: "text-green-700", 
        bgColor: "bg-green-100 border-green-300",
        description: "Engineer has accepted the assignment"
      },
      en_route: { 
        icon: Navigation2, 
        label: "En Route", 
        color: "text-purple-700", 
        bgColor: "bg-purple-100 border-purple-300",
        description: "Engineer is traveling to your location"
      },
      on_site: { 
        icon: MapPin, 
        label: "On Site", 
        color: "text-indigo-700", 
        bgColor: "bg-indigo-100 border-indigo-300",
        description: "Engineer is working at your location"
      },
      completed: { 
        icon: CheckCircle2, 
        label: "Completed", 
        color: "text-green-700", 
        bgColor: "bg-green-100 border-green-300",
        description: "Service has been completed successfully"
      },
      rejected: { 
        icon: XCircle, 
        label: "Rejected", 
        color: "text-red-700", 
        bgColor: "bg-red-100 border-red-300",
        description: "Request was not approved"
      },
    };
    return statusMap[status] || statusMap.pending_approval;
  };

  const statusInfo = getStatusInfo(job.status);
  const StatusIcon = statusInfo.icon;

  // Calculate time on site
  const getTimeOnSite = () => {
    if (!job.arrivedAt) return null;
    const arrived = new Date(job.arrivedAt);
    const now = job.completedAt ? new Date(job.completedAt) : new Date();
    const diffMs = now.getTime() - arrived.getTime();
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  // Calculate ETA
  const getETA = () => {
    if (!latestLocation || !job.siteLatitude || !job.siteLongitude) return null;
    
    const R = 6371; // Earth's radius in km
    const dLat = (parseFloat(job.siteLatitude) - parseFloat(latestLocation.latitude)) * Math.PI / 180;
    const dLon = (parseFloat(job.siteLongitude) - parseFloat(latestLocation.longitude)) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(parseFloat(latestLocation.latitude) * Math.PI / 180) * 
              Math.cos(parseFloat(job.siteLatitude) * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    
    const avgSpeed = 40; // km/h average speed
    const etaMinutes = Math.round((distance / avgSpeed) * 60);
    
    if (etaMinutes < 5) return "Arriving soon";
    if (etaMinutes < 60) return `${etaMinutes} minutes`;
    const hours = Math.floor(etaMinutes / 60);
    const mins = etaMinutes % 60;
    return `${hours}h ${mins}m`;
  };

  // Removed formatDateTime - now using DualTimeDisplay component

  const timeOnSite = getTimeOnSite();
  const eta = job.status === "en_route" ? getETA() : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <header className="border-b bg-background shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <LogoImage className="h-14" />
              <div className="hidden md:block border-l border-border pl-4">
                <p className="text-sm font-medium text-muted-foreground">On-Demand Despatch Field Services Platform</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <RefreshCw className="h-4 w-4" />
                <span>Updated {Math.floor((new Date().getTime() - lastUpdated.getTime()) / 1000)}s ago</span>
              </div>
              <Button
                onClick={handlePrint}
                variant="outline"
                size="sm"
                className="flex items-center gap-2 print:hidden"
              >
                <Printer className="h-4 w-4" />
                Print
              </Button>
            </div>
          </div>
        </div>
      </header>
      <main className="container mx-auto px-4 py-6 max-w-6xl" id="tracker-content">
        {/* Status Banner */}
        <Card className={`mb-6 border-2 ${statusInfo.bgColor}`}>
          <CardContent className="py-6">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-full bg-background ${statusInfo.color}`}>
                <StatusIcon className="h-8 w-8" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-foreground mb-1">{statusInfo.label}</h2>
                <p className="text-foreground">{statusInfo.description}</p>
              </div>
              {job.status === "en_route" && eta && (
                <div className="text-right">
                  <div className="text-sm text-muted-foreground">ETA</div>
                  <div className="text-2xl font-bold text-purple-700">{eta}</div>
                </div>
              )}
              {job.status === "on_site" && timeOnSite && (
                <div className="text-right">
                  <div className="text-sm text-muted-foreground">Time on Site</div>
                  <div className="text-2xl font-bold text-indigo-700">{timeOnSite}</div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Live Tracking Map */}
            {(job.status === "en_route" || job.status === "on_site") && latestLocation && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Live Location Tracking
                  </CardTitle>
                  <CardDescription>
                    Real-time engineer location updates every 5 seconds
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <LiveMap
                    latitude={parseFloat(latestLocation.latitude)}
                    longitude={parseFloat(latestLocation.longitude)}
                    accuracy={latestLocation.accuracy ? parseFloat(latestLocation.accuracy) : undefined}
                    siteLatitude={job.siteLatitude ? parseFloat(job.siteLatitude) : undefined}
                    siteLongitude={job.siteLongitude ? parseFloat(job.siteLongitude) : undefined}
                    siteName={job.siteName}
                    showRecenterButton={true}
                  />
                </CardContent>
              </Card>
            )}

            {/* Service Details */}
            <Card>
              <CardHeader>
                <CardTitle>Service Request Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="text-sm font-medium text-gray-500 mb-1">Issue Description</div>
                  <p className="text-foreground">{job.incidentDetails || "No description provided"}</p>
                </div>

                <Separator />

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm font-medium text-gray-500 mb-1">Estimated Hours</div>
                    <p className="text-foreground font-semibold">{job.hoursRequired || "Not specified"}</p>
                  </div>
                  {job.scheduledDateTime && (
                    <div>
                      <div className="text-sm font-medium text-gray-500 mb-1">Scheduled Date & Time</div>
                      <DualTimeDisplay date={job.scheduledDateTime} timezone={job.timezone} showIcon={false} />
                    </div>
                  )}
                </div>

                {job.scopeOfWork && (
                  <>
                    <Separator />
                    <div>
                      <div className="text-sm font-medium text-gray-500 mb-1">Scope of Work</div>
                      <p className="text-foreground">{job.scopeOfWork}</p>
                    </div>
                  </>
                )}

                <>
                  <Separator />
                  <div>
                    <div className="text-sm font-medium text-gray-500 mb-2">Video Conference Link</div>
                    <EditVideoConferenceLink 
                      token={job.jobToken}
                      currentLink={job.videoConferenceLink}
                      onUpdate={refetch}
                    />
                  </div>
                </>

                {job.notes && (
                  <>
                    <Separator />
                    <div>
                      <div className="text-sm font-medium text-gray-500 mb-1">Additional Notes</div>
                      <p className="text-foreground">{job.notes}</p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Status History */}
            {statusHistory && statusHistory.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <History className="h-5 w-5" />
                    Status History
                  </CardTitle>
                  <CardDescription>
                    Timeline of all status changes
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {statusHistory.map((history, index) => {
                      const historyStatusInfo = getStatusInfo(history.status);
                      const HistoryIcon = historyStatusInfo.icon;
                      return (
                        <div key={history.id} className="flex gap-4">
                          <div className="flex flex-col items-center">
                            <div className={`p-2 rounded-full ${historyStatusInfo.bgColor}`}>
                              <HistoryIcon className={`h-4 w-4 ${historyStatusInfo.color}`} />
                            </div>
                            {index < statusHistory.length - 1 && (
                              <div className="w-0.5 h-full bg-gray-200 my-1" />
                            )}
                          </div>
                          <div className="flex-1 pb-4">
                            <div className="font-semibold text-foreground">{historyStatusInfo.label}</div>
                            <div className="text-sm">
                              <CompactDualTime date={history.timestamp} timezone={job.timezone} />
                            </div>
                            {history.engineerName && (
                              <div className="text-sm text-foreground mt-1">
                                <span className="font-medium">Engineer:</span> {history.engineerName}
                                {history.engineerEmail && (
                                  <span className="text-muted-foreground"> ({history.engineerEmail})</span>
                                )}
                                {history.emailSent !== undefined && (
                                  <span className="ml-2">
                                    {history.emailSent ? (
                                      <span className="text-green-600">✓ Email sent</span>
                                    ) : (
                                      <span className="text-orange-600">⚠ Email failed</span>
                                    )}
                                  </span>
                                )}
                              </div>
                            )}
                            {history.notes && (
                              <div className="text-sm text-foreground mt-1">{history.notes}</div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
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
                <CardContent>
                  <div className="text-lg font-semibold text-foreground">{job.engineerName}</div>
                  {job.acceptedAt && (
                    <div className="text-sm text-muted-foreground mt-1">
                      Accepted {formatDateTime(job.acceptedAt)}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Site Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Site Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <div className="text-sm font-medium text-gray-500">Site Name</div>
                  <div className="text-foreground font-semibold">{job.siteName}</div>
                </div>
                {job.siteAddress && (
                  <div>
                    <div className="text-sm font-medium text-gray-500">Address</div>
                    <div className="text-foreground">{job.siteAddress}</div>
                  </div>
                )}
                {job.siteId && (
                  <div>
                    <div className="text-sm font-medium text-gray-500">Site ID</div>
                    <div className="text-foreground">{job.siteId}</div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {job.siteContactName && (
                  <div>
                    <div className="text-sm font-medium text-gray-500">Site Contact</div>
                    <div className="text-foreground">{job.siteContactName}</div>
                  </div>
                )}
                {job.siteContactNumber && (
                  <div>
                    <div className="text-sm font-medium text-gray-500">Phone</div>
                    <a href={`tel:${job.siteContactNumber}`} className="text-blue-600 hover:underline">
                      {job.siteContactNumber}
                    </a>
                  </div>
                )}
                {job.clientEmail && (
                  <div>
                    <div className="text-sm font-medium text-gray-500">Email</div>
                    <a href={`mailto:${job.clientEmail}`} className="text-blue-600 hover:underline">
                      {job.clientEmail}
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Timeline
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <div className="font-medium text-gray-500">Submitted</div>
                  <CompactDualTime date={job.createdAt} timezone={job.timezone} />
                </div>
                {job.acceptedAt && (
                  <div>
                    <div className="font-medium text-gray-500">Accepted</div>
                    <CompactDualTime date={job.acceptedAt} timezone={job.timezone} />
                  </div>
                )}
                {job.enRouteAt && (
                  <div>
                    <div className="font-medium text-gray-500">En Route</div>
                    <CompactDualTime date={job.enRouteAt} timezone={job.timezone} />
                  </div>
                )}
                {job.arrivedAt && (
                  <div>
                    <div className="font-medium text-gray-500">Arrived On Site</div>
                    <CompactDualTime date={job.arrivedAt} timezone={job.timezone} />
                  </div>
                )}
                {job.completedAt && (
                  <div>
                    <div className="font-medium text-gray-500">Completed</div>
                    <CompactDualTime date={job.completedAt} timezone={job.timezone} />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Comments Section */}
        <div className="container mx-auto px-4 py-6">
          <JobComments
            token={token}
            authorName={job.clientName}
            authorType="client"
            canComment={job.status !== "completed" && job.status !== "cancelled"}
          />
        </div>

        {/* Site Visit Report */}
        {job.status === "completed" && svr && (
          <div className="container mx-auto px-4 py-6">
            <SiteVisitReportDisplay
              svr={svr}
              jobData={job}
              showEmailOption={false}
            />
          </div>
        )}
      </main>
    </div>
  );
}

