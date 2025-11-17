import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Building2, Check, Loader2, MapPin, Plus } from "lucide-react";
import { Link } from "wouter";
import { APP_LOGO, APP_TITLE } from "@/const";
import { DualTimeDisplay } from "@/components/DualTimeDisplay";
import { estimateTimezoneFromLongitude, getTimezoneAbbreviation, getTimezoneOffset, convertLocalTimeToUTC, getUTCPreviewText } from "@/lib/timezone";

interface ProjectRequestFormProps {
  projectId: string;
  project: any;
  organizationId: number;
}

export default function ProjectRequestForm({ projectId, project, organizationId }: ProjectRequestFormProps) {
  const [submitting, setSubmitting] = useState(false);
  const [requestSubmitted, setRequestSubmitted] = useState(false);
  const [siteMode, setSiteMode] = useState<'existing' | 'new' | null>(null);
  const [selectedSite, setSelectedSite] = useState<any | null>(null);
  const [detectedTimezone, setDetectedTimezone] = useState<string | null>(null);
  const [scheduledDateTime, setScheduledDateTime] = useState<string>("");

  // Fetch project sites (using public endpoint since no auth)
  const { data: projectSites, isLoading: sitesLoading } = trpc.projects.getSitesPublic.useQuery(
    { projectId },
    { enabled: !!projectId }
  );

  const createJobMutation = trpc.jobs.createRequest.useMutation({
    onSuccess: () => {
      setRequestSubmitted(true);
      toast.success("Service request submitted successfully!");
    },
    onError: (error) => {
      toast.error(`Failed to submit request: ${error.message}`);
      setSubmitting(false);
    },
  });

  // Update timezone when a site is selected
  useEffect(() => {
    if (siteMode === 'existing' && selectedSite) {
      // Get timezone from selected site coordinates
      if (selectedSite.longitude) {
        const tz = estimateTimezoneFromLongitude(selectedSite.longitude);
        setDetectedTimezone(tz);
      }
    } else if (siteMode === 'new') {
      // For new sites, use user's timezone as fallback until address is geocoded
      const userTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      setDetectedTimezone(userTz);
    }
  }, [siteMode, selectedSite]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);

    const formData = new FormData(e.currentTarget);

    // Validation
    if (!siteMode) {
      toast.error("Please select a site option");
      setSubmitting(false);
      return;
    }

    if (siteMode === 'existing' && !selectedSite) {
      toast.error("Please select a site from the list");
      setSubmitting(false);
      return;
    }

    if (siteMode === 'new') {
      const siteName = formData.get("siteName") as string;
      const siteAddress = formData.get("siteAddress") as string;
      if (!siteName || !siteAddress) {
        toast.error("Please provide site name and address");
        setSubmitting(false);
        return;
      }
    }

    createJobMutation.mutate({
      organizationId,
      projectId,
      clientName: formData.get("clientName") as string,
      clientEmail: formData.get("clientEmail") as string,
      siteName: siteMode === 'existing' ? selectedSite.siteName : (formData.get("siteName") as string),
      siteAddress: siteMode === 'existing' ? selectedSite.siteAddress : (formData.get("siteAddress") as string),
      siteLatitude: siteMode === 'existing' ? (selectedSite.latitude || "") : "",
      siteLongitude: siteMode === 'existing' ? (selectedSite.longitude || "") : "",
      siteContactName: formData.get("contactName") as string,
      siteContactNumber: formData.get("contactPhone") as string,
      incidentDetails: formData.get("issueDescription") as string,
      scheduledDateTime: scheduledDateTime && detectedTimezone ? convertLocalTimeToUTC(scheduledDateTime, detectedTimezone) : (scheduledDateTime ? new Date(scheduledDateTime) : undefined),
      timezone: detectedTimezone || undefined,
      hoursRequired: formData.get("hoursRequired") as string,
      downTime: formData.get("downTime") === "on",
      createNewSite: siteMode === 'new',
      selectedProjectSiteId: siteMode === 'existing' ? selectedSite?.id : undefined,
      videoConferenceLink: formData.get("videoConferenceLink") as string || undefined,
      notes: formData.get("notes") as string || undefined,
    });
  };

  if (requestSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <header className="border-b bg-white shadow-sm">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <Link href="/" className="flex items-center gap-3">
                {APP_LOGO && <img src={APP_LOGO} alt={APP_TITLE} className="h-10" />}
                <span className="text-xl font-bold">{APP_TITLE}</span>
              </Link>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-16 max-w-2xl text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
            <Check className="h-10 w-10 text-green-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Request Submitted Successfully!</h2>
          <p className="text-gray-600 mb-8">
            Thank you for your service request. Our team will review it and assign an engineer shortly.
            You will receive a confirmation email with tracking details.
          </p>
          <Button onClick={() => window.location.reload()}>Submit Another Request</Button>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <header className="border-b bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              {APP_LOGO && <img src={APP_LOGO} alt={APP_TITLE} className="h-10" />}
              <span className="text-xl font-bold">{APP_TITLE}</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Project Banner */}
        <div className="mb-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-3">
            <Building2 className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
            <div>
              <h2 className="text-xl font-bold text-blue-900">{project.projectName}</h2>
              {project.description && (
                <p className="text-sm text-blue-700 mt-1">{project.description}</p>
              )}
              <p className="text-xs text-blue-600 mt-2">Project ID: {project.projectId}</p>
            </div>
          </div>
        </div>

        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle>Project Service Request</CardTitle>
            <CardDescription>
              Submit a service request for this project. Fields marked with * are required.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Client Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Client Information</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="clientName">Your Company/Organization Name *</Label>
                    <Input id="clientName" name="clientName" required placeholder="e.g., Acme Corporation" />
                  </div>
                  <div>
                    <Label htmlFor="clientEmail">Your Email Address *</Label>
                    <Input 
                      id="clientEmail" 
                      name="clientEmail" 
                      type="email" 
                      required 
                      placeholder="your.email@company.com" 
                    />
                  </div>
                  <div>
                    <Label htmlFor="clientPhone">Your Phone Number *</Label>
                    <Input 
                      id="clientPhone" 
                      name="clientPhone" 
                      type="tel" 
                      required 
                      placeholder="+44 20 1234 5678" 
                    />
                  </div>
                </div>
              </div>

              {/* Site Selection */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Select Project Site *</h3>
                
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    type="button"
                    variant={siteMode === 'existing' ? 'default' : 'outline'}
                    className="h-auto py-4 justify-start"
                    onClick={() => {
                      setSiteMode('existing');
                      setSelectedSite(null);
                    }}
                    disabled={sitesLoading || !projectSites || projectSites.length === 0}
                  >
                    <Building2 className="h-5 w-5 mr-2" />
                    <div className="text-left">
                      <div className="font-semibold">Select Existing Site</div>
                      <div className="text-xs opacity-80">
                        {sitesLoading ? "Loading..." : `${projectSites?.length || 0} sites available`}
                      </div>
                    </div>
                  </Button>

                  <Button
                    type="button"
                    variant={siteMode === 'new' ? 'default' : 'outline'}
                    className="h-auto py-4 justify-start"
                    onClick={() => {
                      setSiteMode('new');
                      setSelectedSite(null);
                    }}
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    <div className="text-left">
                      <div className="font-semibold">Add New Site</div>
                      <div className="text-xs opacity-80">Create a new site location</div>
                    </div>
                  </Button>
                </div>

                {/* Existing Site Selector */}
                {siteMode === 'existing' && projectSites && projectSites.length > 0 && (
                  <div className="space-y-3">
                    <Label>Choose Site from List *</Label>
                    <Select
                      value={selectedSite?.id?.toString() || ""}
                      onValueChange={(value) => {
                        const site = projectSites.find((s: any) => s.id.toString() === value);
                        setSelectedSite(site);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a site..." />
                      </SelectTrigger>
                      <SelectContent>
                        {projectSites.map((site: any) => (
                          <SelectItem key={site.id} value={site.id.toString()}>
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4" />
                              <div>
                                <div className="font-medium">{site.siteName}</div>
                                <div className="text-xs text-muted-foreground">{site.siteAddress}</div>
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {selectedSite && (
                      <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-start gap-2">
                          <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-green-900">{selectedSite.siteName}</p>
                            <p className="text-sm text-green-700 mt-1">{selectedSite.siteAddress}</p>
                            {selectedSite.contactName && (
                              <p className="text-xs text-green-600 mt-1">
                                Contact: {selectedSite.contactName}
                                {selectedSite.contactPhone && ` • ${selectedSite.contactPhone}`}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* New Site Form */}
                {siteMode === 'new' && (
                  <div className="space-y-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-700">
                      This site will be added to the project's site library for future requests.
                    </p>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="siteName">Site/Location Name *</Label>
                        <Input id="siteName" name="siteName" required placeholder="e.g., Main Office" />
                      </div>
                      <div>
                        <Label htmlFor="siteId">Site ID (Optional)</Label>
                        <Input id="siteId" name="siteId" placeholder="e.g., LON-001" />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="siteAddress">Full Site Address *</Label>
                      <Input 
                        id="siteAddress" 
                        name="siteAddress" 
                        required 
                        placeholder="123 Business St, London, UK, SW1A 1AA" 
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* On-Site Contact */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">On-Site Contact</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="contactName">Contact Name *</Label>
                    <Input id="contactName" name="contactName" required placeholder="John Smith" />
                  </div>
                  <div>
                    <Label htmlFor="contactPhone">Contact Phone *</Label>
                    <Input id="contactPhone" name="contactPhone" type="tel" required placeholder="+44 20 1234 5678" />
                  </div>
                  <div>
                    <Label htmlFor="contactEmail">Contact Email (Optional)</Label>
                    <Input id="contactEmail" name="contactEmail" type="email" placeholder="john@company.com" />
                  </div>
                </div>
              </div>

              {/* Service Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Service Details</h3>
                <div>
                  <Label htmlFor="issueDescription">Issue Description *</Label>
                  <Textarea 
                    id="issueDescription" 
                    name="issueDescription" 
                    required 
                    rows={4}
                    placeholder="Describe the issue or service required in detail..."
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="scheduledDateTime">Preferred Date & Time *</Label>
                    {detectedTimezone && (
                      <p className="text-sm text-muted-foreground mb-1">
                        Enter time in <span className="font-medium">{getTimezoneAbbreviation(detectedTimezone)}</span> {getTimezoneOffset(detectedTimezone)}
                      </p>
                    )}
                    <Input 
                      id="scheduledDateTime" 
                      name="scheduledDateTime" 
                      type="datetime-local" 
                      required
                      value={scheduledDateTime}
                      onChange={(e) => setScheduledDateTime(e.target.value)}
                    />
                    {scheduledDateTime && detectedTimezone && (
                      <p className="text-xs text-muted-foreground mt-1">
                        UTC equivalent: {getUTCPreviewText(scheduledDateTime, detectedTimezone)}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="hoursRequired">Estimated Hours Required *</Label>
                    <Input 
                      id="hoursRequired" 
                      name="hoursRequired" 
                      required 
                      placeholder="e.g., 2-4 hours" 
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox id="downTime" name="downTime" />
                  <Label htmlFor="downTime" className="cursor-pointer">
                    This is a critical issue causing downtime
                  </Label>
                </div>


              </div>

              {/* Additional Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Additional Information</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="skillsRequired">Skills/Expertise Required (Optional)</Label>
                    <Input 
                      id="skillsRequired" 
                      name="skillsRequired" 
                      placeholder="e.g., Network engineer, CCTV specialist" 
                    />
                  </div>
                  <div>
                    <Label htmlFor="equipmentNeeded">Equipment Needed (Optional)</Label>
                    <Input 
                      id="equipmentNeeded" 
                      name="equipmentNeeded" 
                      placeholder="e.g., Laptop, testing tools" 
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="accessInstructions">Site Access Instructions (Optional)</Label>
                  <Textarea 
                    id="accessInstructions" 
                    name="accessInstructions" 
                    rows={2}
                    placeholder="Parking, security procedures, key codes, etc."
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox id="remoteSupport" name="remoteSupport" />
                  <Label htmlFor="remoteSupport" className="cursor-pointer">
                    Remote support option available
                  </Label>
                </div>

                <div>
                  <Label htmlFor="videoConferenceLink">Video Conference Link (Optional)</Label>
                  <Input 
                    id="videoConferenceLink" 
                    name="videoConferenceLink" 
                    placeholder="https://meet.google.com/..." 
                  />
                </div>

                <div>
                  <Label htmlFor="notes">Additional Notes (Optional)</Label>
                  <Textarea 
                    id="notes" 
                    name="notes" 
                    rows={3}
                    placeholder="Any other relevant information..."
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <Button type="submit" className="w-full" size="lg" disabled={submitting}>
                  {submitting ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Submitting Request...
                    </>
                  ) : (
                    "Submit Service Request"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

