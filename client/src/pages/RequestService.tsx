import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Check, MapPin, Search, Building2 } from "lucide-react";
import { LogoImage } from "@/components/LogoImage";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { toast } from "sonner";
import { SEO } from "@/components/SEO";
import { StructuredData } from "@/components/StructuredData";
import { estimateTimezoneFromLongitude, getTimezoneAbbreviation, getTimezoneOffset, formatInUTC, convertLocalTimeToUTC, getUTCPreviewText } from "@/lib/timezone";

export default function RequestService({ projectId, project, organizationId }: { projectId?: string; project?: any; organizationId?: number }) {
  // SEO metadata
  const pageTitle = project?.name 
    ? `Request Service - ${project.name}` 
    : "Request Field Service";
  const pageDescription = project?.description 
    ? `Submit a service request for ${project.name}. ${project.description}` 
    : "Submit a field service request. Our team will dispatch a qualified engineer to your location.";

  const [searching, setSearching] = useState(false);
  const [addressSuggestions, setAddressSuggestions] = useState<any[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<string>("");
  const [siteCoordinates, setSiteCoordinates] = useState<{ lat: string; lng: string } | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [requestSubmitted, setRequestSubmitted] = useState(false);
  const [trackingToken, setTrackingToken] = useState<string | null>(null);
  const [manualProjectId, setManualProjectId] = useState("");
  const [verifyingProject, setVerifyingProject] = useState(false);
  const [projectValid, setProjectValid] = useState<boolean | null>(null);
  const [selectedSiteId, setSelectedSiteId] = useState<number | null>(null);
  const [siteSelectionMode, setSiteSelectionMode] = useState<'existing' | 'new' | null>(null);
  const [selectedProjectSite, setSelectedProjectSite] = useState<any | null>(null);
  const [detectedTimezone, setDetectedTimezone] = useState<string | null>(null);
  const [scheduledDateTime, setScheduledDateTime] = useState<string>("");
  const [bookingType, setBookingType] = useState<'full_day' | 'hourly'>('full_day');
  const [estimatedHours, setEstimatedHours] = useState<string>("");
  const [estimatedDays, setEstimatedDays] = useState<string>("");
  const [requestedStartTime, setRequestedStartTime] = useState<string>("");
  const [isTimeFlexible, setIsTimeFlexible] = useState<boolean>(false);
  const [hasProjectCode, setHasProjectCode] = useState<boolean | null>(null);
  
  // Fetch project sites after verification or if provided via URL
  const effectiveProjectId = manualProjectId && projectValid ? manualProjectId : projectId;
  const { data: projectSites } = trpc.projects.getSites.useQuery(
    { projectId: effectiveProjectId || "" },
    { enabled: !!effectiveProjectId }
  );
  
  // Verify project ID mutation
  const verifyProjectMutation = trpc.projects.verifyPublic.useMutation({
    onSuccess: (data) => {
      setProjectValid(data.isValid);
      setVerifyingProject(false);
      if (data.isValid) {
        toast.success("Project ID verified");
      } else {
        toast.error("Invalid project ID");
      }
    },
    onError: () => {
      setProjectValid(false);
      setVerifyingProject(false);
      toast.error("Failed to verify project ID");
    },
  });

  const searchMutation = trpc.geocoding.search.useMutation({
    onSuccess: (data) => {
      if (data && data.length > 0) {
        setAddressSuggestions(data);
        toast.success(`Found ${data.length} address${data.length > 1 ? 'es' : ''}`);
      } else {
        setAddressSuggestions([]);
        toast.error("No addresses found. Try a different search.");
      }
      setSearching(false);
    },
    onError: (error) => {
      toast.error(`Search failed: ${error.message}`);
      setSearching(false);
      setAddressSuggestions([]);
    },
  });

  const createRequestMutation = trpc.jobs.createRequest.useMutation({
    onSuccess: (data) => {
      setRequestSubmitted(true);
      setTrackingToken(data.trackingToken);
      toast.success("Service request submitted successfully!");
    },
    onError: (error) => {
      toast.error(`Failed to submit request: ${error.message}`);
    },
  });

  const handleSearchAddress = () => {
    if (!searchQuery || searchQuery.trim().length === 0) {
      toast.error("Please enter an address to search");
      return;
    }
    
    setSearching(true);
    setAddressSuggestions([]);
    setSelectedAddress("");
    setSiteCoordinates(null);
    searchMutation.mutate({ address: searchQuery, limit: 5 });
  };

  const handleSelectAddress = (suggestion: any) => {
    setSelectedAddress(suggestion.displayName);
    const coords = { lat: suggestion.latitude, lng: suggestion.longitude };
    setSiteCoordinates(coords);
    setAddressSuggestions([]);
    // Detect and set timezone
    const tz = estimateTimezoneFromLongitude(coords.lng);
    setDetectedTimezone(tz);
    toast.success("Address selected and coordinates captured!");
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    // Use state values for controlled inputs instead of FormData
    const scheduledDateTimeStr = scheduledDateTime;
    // Combine date and time if time is provided
    const fullDateTimeStr = scheduledDateTimeStr && requestedStartTime && !isTimeFlexible
      ? `${scheduledDateTimeStr}T${requestedStartTime}`
      : scheduledDateTimeStr;
    
    // When adding new site to project, allow submission even without search
    // The address will be captured from the search input
    const isAddingNewSite = siteSelectionMode === 'new' && (manualProjectId && projectValid);
    const isUsingExistingSite = siteSelectionMode === 'existing' && selectedProjectSite;
    
    if (!isAddingNewSite && !isUsingExistingSite && !selectedAddress) {
      toast.error("Please search and select a site address");
      return;
    }
    
    // Use selected address if available, otherwise use search query for new sites
    const finalAddress = selectedAddress || (isAddingNewSite ? searchQuery : '');
    const finalCoordinates = siteCoordinates || { lat: '', lng: '' };
    
    if (!finalAddress) {
      toast.error("Please enter a site address");
      return;
    }
    
    const effectiveProjectId = projectId || (manualProjectId && projectValid ? manualProjectId : undefined);
    
    createRequestMutation.mutate({
      clientName: formData.get("clientName") as string,
      clientEmail: formData.get("clientEmail") as string,
      siteName: formData.get("siteName") as string,
      siteAddress: finalAddress,
      siteLatitude: finalCoordinates.lat,
      siteLongitude: finalCoordinates.lng,
      siteContactName: formData.get("siteContactName") as string,
      siteContactNumber: formData.get("siteContactNumber") as string,
      incidentDetails: formData.get("incidentDetails") as string,
      scheduledDateTime: fullDateTimeStr && detectedTimezone ? convertLocalTimeToUTC(fullDateTimeStr, detectedTimezone) : (fullDateTimeStr ? new Date(fullDateTimeStr) : undefined),
      hoursRequired: formData.get("hoursRequired") as string,
      downTime: formData.get("downTime") === "on",
      timezone: finalCoordinates.lng ? estimateTimezoneFromLongitude(finalCoordinates.lng) : 'Europe/London', // Determine timezone from site location, default to GMT
      // Booking fields removed - multi-day and hourly estimation no longer supported
      // Optional fields
      siteId: formData.get("siteId") as string || undefined,
      changeNumber: formData.get("changeNumber") as string || undefined,
      incidentNumber: formData.get("incidentNumber") as string || undefined,
      projectName: formData.get("projectName") as string || undefined,
      toolsRequired: formData.get("toolsRequired") as string || undefined,
      deviceDetails: formData.get("deviceDetails") as string || undefined,
      projectId: effectiveProjectId,
      organizationId: organizationId,
      scopeOfWork: formData.get("scopeOfWork") as string || undefined,
      videoConferenceLink: formData.get("videoConferenceLink") as string || undefined,
      notes: formData.get("notes") as string || undefined,
      // Site creation info for new sites
      createNewSite: siteSelectionMode === 'new' && !!effectiveProjectId,
      selectedProjectSiteId: siteSelectionMode === 'existing' ? selectedProjectSite?.id : undefined,
    });
  };

  if (requestSubmitted) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b bg-background shadow-sm">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center gap-4">
              <Link href="/">
                <LogoImage className="h-14 cursor-pointer hover:opacity-80 transition-opacity" />
              </Link>
              <div className="hidden md:block border-l border-border pl-4">
                <p className="text-sm font-medium text-muted-foreground">On-Demand Despatch Field Services Platform</p>
              </div>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-16 max-w-2xl">
          <Card className="shadow-xl">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <Check className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle className="text-2xl text-green-600">
                Request Submitted Successfully!
              </CardTitle>
              <CardDescription className="text-base mt-2">
                Your service request has been sent to FieldPulse Go for review
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {trackingToken && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="font-semibold text-green-900 mb-2 flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Track Your Request
                  </h3>
                  <p className="text-sm text-green-800 mb-3">
                    Use this link to track your service request in real-time:
                  </p>
                  <div className="flex gap-2">
                    <Input
                      readOnly
                      value={`${window.location.origin}/track/${trackingToken}`}
                      className="font-mono text-sm bg-white"
                    />
                    <Button
                      variant="outline"
                      onClick={() => {
                        navigator.clipboard.writeText(`${window.location.origin}/track/${trackingToken}`);
                        toast.success("Tracking link copied to clipboard!");
                      }}
                    >
                      Copy
                    </Button>
                  </div>
                  <div className="mt-3">
                    <Link href={`/track/${trackingToken}`}>
                      <Button className="w-full" variant="default">
                        Open Tracking Page
                      </Button>
                    </Link>
                  </div>
                </div>
              )}

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">What happens next?</h3>
                <ol className="list-decimal list-inside space-y-2 text-sm text-blue-800">
                  <li>FieldPulse Go admin will review your request</li>
                  <li>Once approved, an engineer will be assigned</li>
                  <li>You'll receive updates on the engineer's progress</li>
                  <li>A confirmation email with tracking link has been sent to you</li>
                </ol>
              </div>

              <div className="text-center pt-4">
                <Link href="/request">
                  <Button variant="outline" className="mr-2">
                    Submit Another Request
                  </Button>
                </Link>
                <Link href="/">
                  <Button>
                    Back to Home
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <>
      <SEO 
        title={pageTitle}
        description={pageDescription}
        keywords={[
          "field service request",
          "engineer dispatch",
          "service booking",
          "maintenance request",
          "technical support"
        ]}
        noindex={true} // Request forms should not be indexed
      />
      <StructuredData type="service" />
      
      <div className="min-h-screen bg-background">
      <header className="border-b bg-background shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <Link href="/">
              <LogoImage className="h-14 cursor-pointer hover:opacity-80 transition-opacity" />
            </Link>
            <div className="hidden md:block border-l border-border pl-4">
              <p className="text-sm font-medium text-muted-foreground">On-Demand Despatch Field Services Platform</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
            <Building2 className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Request Field Service</h2>
          <p className="text-gray-600">
            Submit your IT field service request and we'll assign an engineer to assist you
          </p>
        </div>

        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle>Service Request Form</CardTitle>
            <CardDescription>
              Please provide details about your service requirements. Fields marked with * are required.
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
                </div>
              </div>

              {/* Project Assignment (Optional) - Only show if not already assigned via URL */}
              {!projectId && (
                <div className="space-y-4">
                  <div className="border-b pb-2">
                    <h3 className="text-lg font-semibold">Specific Project Assignment (Optional)</h3>
                    <p className="text-sm text-muted-foreground mt-1">Use this to assign your request to a specific pre-existing project</p>
                  </div>
                  
                  {/* Question: Do you have a project code? */}
                  <div>
                    <Label>Do you have a specific project code?</Label>
                    <div className="flex gap-4 mt-2">
                      <Button
                        type="button"
                        variant={hasProjectCode === true ? "default" : "outline"}
                        onClick={() => {
                          setHasProjectCode(true);
                          setManualProjectId("");
                          setProjectValid(null);
                        }}
                        className="flex-1"
                      >
                        Yes
                      </Button>
                      <Button
                        type="button"
                        variant={hasProjectCode === false ? "default" : "outline"}
                        onClick={() => {
                          setHasProjectCode(false);
                          setManualProjectId("");
                          setProjectValid(null);
                          setSiteSelectionMode(null);
                          setSelectedProjectSite(null);
                        }}
                        className="flex-1"
                      >
                        No
                      </Button>
                    </div>
                  </div>

                  {/* Show Project ID input only if user selected Yes */}
                  {hasProjectCode === true && (
                  <div>
                    <Label htmlFor="manualProjectId">Project Code</Label>
                    <div className="flex gap-2">
                      <Input
                        id="manualProjectId"
                        value={manualProjectId}
                        onChange={(e) => {
                          setManualProjectId(e.target.value.toUpperCase());
                          setProjectValid(null);
                        }}
                        placeholder="ENTER PROJECT NAME FOR SPECIFIC PROJECT TICKETS"
                        className="uppercase"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          if (manualProjectId.trim()) {
                            setVerifyingProject(true);
                            verifyProjectMutation.mutate({ projectId: manualProjectId });
                          } else {
                            toast.error("Please enter a project ID");
                          }
                        }}
                        disabled={!manualProjectId.trim() || verifyingProject}
                      >
                        {verifyingProject ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          "Verify"
                        )}
                      </Button>
                    </div>
                    {projectValid === false && (
                      <p className="text-xs text-red-600 mt-1">Invalid project code. Please check and try again.</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">If you have a project ID, enter it above and click Verify. Leave blank if not applicable.</p>
                    {projectValid === true && (
                      <>
                        <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                          <div className="flex items-center gap-2">
                            <Check className="h-5 w-5 text-green-600" />
                            <p className="text-sm font-medium text-green-900">
                              Project ID verified successfully
                            </p>
                          </div>
                        </div>
                        
                        {/* Site Selection for Verified Project */}
                        <div className="mt-4 space-y-3">
                          <Label>Select Project Site</Label>
                          <div className="grid gap-2">
                            <Button
                              type="button"
                              variant={siteSelectionMode === 'existing' ? 'default' : 'outline'}
                              className="justify-start"
                              onClick={() => {
                                setSiteSelectionMode('existing');
                                setSelectedProjectSite(null);
                              }}
                            >
                              Select from Existing Sites ({projectSites?.length || 0})
                            </Button>
                            <Button
                              type="button"
                              variant={siteSelectionMode === 'new' ? 'default' : 'outline'}
                              className="justify-start"
                              onClick={() => {
                                setSiteSelectionMode('new');
                                setSelectedProjectSite(null);
                              }}
                            >
                              Add New Site to Project
                            </Button>
                          </div>
                          
                          {/* Existing Site Dropdown */}
                          {siteSelectionMode === 'existing' && projectSites && projectSites.length > 0 && (
                            <div>
                              <Label htmlFor="projectSiteSelect">Choose Site</Label>
                              <Select
                                value={selectedProjectSite?.id?.toString() || ''}
                                onValueChange={(value) => {
                                  const site = projectSites.find(s => s.id === Number(value));
                                  if (site) {
                                    setSelectedProjectSite(site);
                                    // Auto-populate address fields
                                    setSelectedAddress(site.siteAddress || '');
                                    const coords = {
                                      lat: site.latitude || '',
                                      lng: site.longitude || ''
                                    };
                                    setSiteCoordinates(coords);
                                    // Detect and set timezone
                                    if (coords.lng) {
                                      const tz = estimateTimezoneFromLongitude(coords.lng);
                                      setDetectedTimezone(tz);
                                    }
                                  }
                                }}
                              >
                                <SelectTrigger className="w-full">
                                  <SelectValue placeholder="Select a site..." />
                                </SelectTrigger>
                                <SelectContent>
                                   {projectSites.map((site: any) => (
                                     <SelectItem key={site.id} value={site.id.toString()}>
                                       {site.siteName} - {site.siteAddress}
                                     </SelectItem>
                                   ))}
                                </SelectContent>
                              </Select>
                              {selectedProjectSite && (
                                <p className="text-xs text-green-600 mt-1">
                                  ✓ Site selected: {selectedProjectSite.siteName}
                                </p>
                              )}
                            </div>
                          )}
                          
                          {siteSelectionMode === 'existing' && (!projectSites || projectSites.length === 0) && (
                            <p className="text-sm text-muted-foreground">
                              No sites found for this project. Please add a new site.
                            </p>
                          )}
                          
                          {siteSelectionMode === 'new' && (
                            <p className="text-sm text-muted-foreground">
                              Fill in the site information below. This site will be added to the project's site list.
                            </p>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                  )}
                </div>
              )}

              {/* Site Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Site Information</h3>
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

                {/* Site Selection - Conditional based on project settings */}
                {project?.restrictToSites && projectSites ? (
                  /* Predefined Site Selector */
                  <div>
                    <Label htmlFor="siteSelector">Select Site *</Label>
                    <Select
                      value={selectedSiteId?.toString() || ""}
                      onValueChange={(value) => {
                        const siteId = parseInt(value);
                        const site = projectSites.find(s => s.id === siteId);
                        if (site) {
                          setSelectedSiteId(siteId);
                          setSelectedAddress(site.siteAddress);
                          setSiteCoordinates({
                            lat: site.latitude ?? '',
                            lng: site.longitude ?? '',
                          });
                        }
                      }}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Choose a site from the list" />
                      </SelectTrigger>
                      <SelectContent>
                        {projectSites.filter(site => site.latitude && site.longitude).map((site) => (
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
                    
                    {/* Selected Site Display */}
                    {selectedSiteId && projectSites.find(s => s.id === selectedSiteId) && (
                      <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-start gap-2">
                          <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-green-900">
                              {projectSites.find(s => s.id === selectedSiteId)?.siteName}
                            </p>
                            <p className="text-sm text-green-700 mt-1">
                              {projectSites.find(s => s.id === selectedSiteId)?.siteAddress}
                            </p>
                            {projectSites.find(s => s.id === selectedSiteId)?.contactName && (
                              <p className="text-xs text-green-600 mt-1">
                                Contact: {projectSites.find(s => s.id === selectedSiteId)?.contactName}
                                {projectSites.find(s => s.id === selectedSiteId)?.contactPhone && 
                                  ` • ${projectSites.find(s => s.id === selectedSiteId)?.contactPhone}`}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  /* Standard Address Search - Only show if not using existing project site */
                  (siteSelectionMode !== 'existing' || !selectedProjectSite) && (
                    <div>
                    <Label htmlFor="addressSearch">Site Address *</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      id="addressSearch"
                      placeholder="Enter full address to search..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleSearchAddress();
                        }
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleSearchAddress}
                      disabled={searching}
                    >
                      {searching ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Search className="h-4 w-4 mr-2" />
                      )}
                      Search
                    </Button>
                  </div>

                  {/* Address Suggestions */}
                  {addressSuggestions.length > 0 && (
                    <div className="mt-2 border rounded-lg bg-white shadow-lg max-h-64 overflow-y-auto">
                      <div className="p-2 bg-gray-50 border-b text-sm font-medium text-gray-700">
                        Select an address:
                      </div>
                      {addressSuggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => handleSelectAddress(suggestion)}
                          className="w-full text-left px-3 py-2 hover:bg-blue-50 border-b last:border-b-0 transition-colors"
                        >
                          <div className="flex items-start gap-2">
                            <MapPin className="h-4 w-4 mt-1 text-blue-600 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {suggestion.displayName}
                              </p>
                              <p className="text-xs text-gray-500 capitalize">
                                {suggestion.type}
                              </p>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Selected Address Display */}
                  {selectedAddress && !project?.restrictToSites && (
                    <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-green-900">Selected Address:</p>
                          <p className="text-sm text-green-700 mt-1">{selectedAddress}</p>
                        </div>
                      </div>
                    </div>
                  )}
                    </div>
                  )
                )}
              </div>

              {/* Contact Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">On-Site Contact</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="siteContactName">Contact Name *</Label>
                    <Input id="siteContactName" name="siteContactName" required placeholder="John Smith" />
                  </div>
                  <div>
                    <Label htmlFor="siteContactNumber">Contact Phone Number *</Label>
                    <Input 
                      id="siteContactNumber" 
                      name="siteContactNumber" 
                      type="tel" 
                      required 
                      placeholder="+44 20 1234 5678" 
                    />
                  </div>
                </div>
              </div>

              {/* Service Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Service Requirements</h3>
                
                <div>
                  <Label htmlFor="incidentDetails">What needs to be done? *</Label>
                  <Textarea 
                    id="incidentDetails" 
                    name="incidentDetails" 
                    rows={4} 
                    required
                    placeholder="Please describe the issue or work required in detail..."
                  />
                </div>

                {/* Booking Type Selection */}
                <div className="space-y-2">
                  <Label htmlFor="bookingType">Booking Type *</Label>
                  <Select value={bookingType} onValueChange={(value: any) => setBookingType(value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select booking type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full_day">Full Day (8 hours standard)</SelectItem>
                      <SelectItem value="hourly">Hourly (specify hours)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    {bookingType === 'full_day' && 'Standard 8-hour workday'}
                    {bookingType === 'hourly' && 'Any number of hours (1-20+ hours)'}
                  </p>
                </div>

                {/* Conditional Fields Based on Booking Type */}
                {bookingType === 'hourly' && (
                  <div className="space-y-2">
                    <Label htmlFor="estimatedHours">Estimated Hours *</Label>
                    <Input 
                      id="estimatedHours" 
                      name="estimatedHours" 
                      type="number"
                      min="1"
                      step="0.5"
                      required
                      value={estimatedHours}
                      onChange={(e) => setEstimatedHours(e.target.value)}
                      placeholder="e.g., 4.5" 
                    />
                    <p className="text-xs text-muted-foreground">Enter any number of hours (can be 1-20+ hours)</p>
                  </div>
                )}

                {/* Multi-day option removed */}
                {false && (
                  <div className="space-y-2">
                    <Label htmlFor="estimatedDays">Number of Days *</Label>
                    <Input 
                      id="estimatedDays" 
                      name="estimatedDays" 
                      type="number"
                      min="2"
                      required
                      value={estimatedDays}
                      onChange={(e) => setEstimatedDays(e.target.value)}
                      placeholder="e.g., 3" 
                    />
                    <p className="text-xs text-muted-foreground">Enter number of consecutive days required</p>
                  </div>
                )}

                {/* Preferred Start Date */}
                <div className="space-y-2">
                  <Label htmlFor="scheduledDateTime">Preferred Start Date *</Label>
                  {detectedTimezone && (
                    <p className="text-sm text-muted-foreground">
                      Enter date in <span className="font-medium">{getTimezoneAbbreviation(detectedTimezone)}</span> {getTimezoneOffset(detectedTimezone)}
                    </p>
                  )}
                  <Input 
                    id="scheduledDateTime" 
                    name="scheduledDateTime" 
                    type="date" 
                    required
                    value={scheduledDateTime}
                    onChange={(e) => setScheduledDateTime(e.target.value)}
                  />
                </div>

                {/* Preferred Start Time */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="requestedStartTime">Preferred Start Time</Label>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="timeFlexible" 
                        checked={isTimeFlexible}
                        onCheckedChange={(checked) => {
                          setIsTimeFlexible(checked as boolean);
                          if (checked) setRequestedStartTime("");
                        }}
                      />
                      <label htmlFor="timeFlexible" className="text-sm text-muted-foreground cursor-pointer">
                        Time is flexible
                      </label>
                    </div>
                  </div>
                  
                  <Select 
                    value={requestedStartTime} 
                    onValueChange={setRequestedStartTime}
                    disabled={isTimeFlexible}
                  >
                    <SelectTrigger id="requestedStartTime" className={isTimeFlexible ? "opacity-50" : ""}>
                      <SelectValue placeholder="Select preferred start time" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[300px]">
                      {/* Generate all 24 hours in 30-minute intervals */}
                      {Array.from({ length: 48 }, (_, i) => {
                        const hour = Math.floor(i / 2);
                        const minute = (i % 2) * 30;
                        const timeValue = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
                        const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
                        const period = hour < 12 ? 'AM' : 'PM';
                        const displayTime = `${displayHour}:${minute.toString().padStart(2, '0')} ${period}`;
                        return (
                          <SelectItem key={timeValue} value={timeValue}>
                            {displayTime}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                  
                  {!isTimeFlexible && (
                    <p className="text-xs text-muted-foreground">Select your preferred start time</p>
                  )}
                  {isTimeFlexible && (
                    <p className="text-xs text-muted-foreground">No specific time required - we'll coordinate with you</p>
                  )}
                  {requestedStartTime && !isTimeFlexible && scheduledDateTime && detectedTimezone && (
                    <p className="text-xs text-muted-foreground mt-1">
                      UTC equivalent: {getUTCPreviewText(`${scheduledDateTime}T${requestedStartTime}`, detectedTimezone)}
                    </p>
                  )}
                </div>

                {/* Keep the old hoursRequired field for backward compatibility but make it optional */}
                <input type="hidden" name="hoursRequired" value={bookingType === 'hourly' ? estimatedHours : '8 hours'} />

                <div className="flex items-center space-x-2">
                  <Checkbox id="downTime" name="downTime" />
                  <Label htmlFor="downTime" className="cursor-pointer">
                    This is a critical issue causing downtime
                  </Label>
                </div>
              </div>

              {/* Optional Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Additional Information (Optional)</h3>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="changeNumber">Change Number</Label>
                    <Input id="changeNumber" name="changeNumber" placeholder="CHG-12345" />
                  </div>
                  <div>
                    <Label htmlFor="incidentNumber">Incident Number</Label>
                    <Input id="incidentNumber" name="incidentNumber" placeholder="INC-67890" />
                  </div>
                </div>

                <div>
                  <Label htmlFor="projectName">Project Name</Label>
                  <Input id="projectName" name="projectName" placeholder="Network Upgrade Project" />
                </div>

                {/* Project Code Question (only show if not already provided via URL) */}
                {!projectId && (
                  <div className="space-y-4">
                    <div>
                      <Label>Do you have a specific project code?</Label>
                      <div className="flex gap-4 mt-2">
                        <Button
                          type="button"
                          variant={hasProjectCode === true ? "default" : "outline"}
                          onClick={() => {
                            setHasProjectCode(true);
                            setManualProjectId("");
                            setProjectValid(null);
                          }}
                          className="flex-1"
                        >
                          Yes
                        </Button>
                        <Button
                          type="button"
                          variant={hasProjectCode === false ? "default" : "outline"}
                          onClick={() => {
                            setHasProjectCode(false);
                            setManualProjectId("");
                            setProjectValid(null);
                          }}
                          className="flex-1"
                        >
                          No
                        </Button>
                      </div>
                    </div>

                    {/* Show Project ID input only if user selected Yes */}
                    {hasProjectCode === true && (
                      <div>
                        <Label htmlFor="manualProjectId">Project Code</Label>
                        <div className="flex gap-2">
                          <Input 
                            id="manualProjectId" 
                            value={manualProjectId}
                            onChange={(e) => {
                              setManualProjectId(e.target.value.toUpperCase());
                              setProjectValid(null);
                            }}
                            placeholder="e.g., BRAMBLES" 
                            className={projectValid === false ? "border-red-500" : projectValid === true ? "border-green-500" : ""}
                          />
                          {manualProjectId && (
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => {
                                setVerifyingProject(true);
                                verifyProjectMutation.mutate({ projectId: manualProjectId });
                              }}
                              disabled={verifyingProject}
                            >
                              {verifyingProject ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : projectValid ? (
                                <Check className="h-4 w-4 text-green-600" />
                              ) : (
                                "Verify"
                              )}
                            </Button>
                          )}
                        </div>
                        {projectValid === false && (
                          <p className="text-xs text-red-600 mt-1">Invalid project code. Please check and try again.</p>
                        )}
                        {projectValid === true && (
                          <p className="text-xs text-green-600 mt-1">✓ Project code verified</p>
                        )}
                      </div>
                    )}
                  </div>
                )}

                <div>
                  <Label htmlFor="toolsRequired">Special Tools or Equipment Needed</Label>
                  <Textarea 
                    id="toolsRequired" 
                    name="toolsRequired" 
                    rows={2}
                    placeholder="e.g., Fiber optic testing equipment, ladder..."
                  />
                </div>

                <div>
                  <Label htmlFor="deviceDetails">Device/Equipment Details</Label>
                  <Textarea 
                    id="deviceDetails" 
                    name="deviceDetails" 
                    rows={2}
                    placeholder="e.g., Cisco Router Model XYZ, Serial: ABC123..."
                  />
                </div>

                <div>
                  <Label htmlFor="scopeOfWork">Detailed Scope of Work</Label>
                  <Textarea 
                    id="scopeOfWork" 
                    name="scopeOfWork" 
                    rows={3}
                    placeholder="Detailed breakdown of activities to be performed..."
                  />
                </div>

                <div>
                  <Label htmlFor="videoConferenceLink">Video Conference Link (Optional)</Label>
                  <Input 
                    id="videoConferenceLink" 
                    name="videoConferenceLink" 
                    type="url"
                    placeholder="https://zoom.us/j/123456789 or https://teams.microsoft.com/..."
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    If remote support is needed, provide a video conference link (Zoom, Teams, etc.)
                  </p>
                </div>

                <div>
                  <Label htmlFor="notes">Additional Notes</Label>
                  <Textarea 
                    id="notes" 
                    name="notes" 
                    rows={2}
                    placeholder="Any other information that might be helpful..."
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button 
                  type="submit" 
                  disabled={createRequestMutation.isPending} 
                  className="flex-1"
                >
                  {createRequestMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
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
    </>
  );
}

