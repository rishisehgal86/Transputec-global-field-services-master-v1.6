import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, ArrowLeft, Copy, Check, MapPin, Search } from "lucide-react";
import { LogoImage } from "@/components/LogoImage";
import { Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { toast } from "sonner";

export default function CreateJob() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [copiedEngineer, setCopiedEngineer] = useState(false);
  const [copiedClient, setCopiedClient] = useState(false);
  const [createdLinks, setCreatedLinks] = useState<{ engineer: string; client: string } | null>(null);
  const [siteCoordinates, setSiteCoordinates] = useState<{ lat: string; lng: string } | null>(null);
  const [searching, setSearching] = useState(false);
  const [addressSuggestions, setAddressSuggestions] = useState<any[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [manualProjectId, setManualProjectId] = useState("");
  const [verifyingProject, setVerifyingProject] = useState(false);
  const [projectValid, setProjectValid] = useState<boolean | null>(null);
  const [siteSelectionMode, setSiteSelectionMode] = useState<'existing' | 'new' | null>(null);
  const [selectedProjectSite, setSelectedProjectSite] = useState<any | null>(null);
  
  // Fetch project sites after verification
  const { data: projectSites } = trpc.projects.getSites.useQuery(
    { projectId: manualProjectId || "" },
    { enabled: !!manualProjectId && projectValid === true }
  );
  
  // Check if duplicating a job
  const urlParams = new URLSearchParams(window.location.search);
  const duplicateJobId = urlParams.get('duplicate') ? parseInt(urlParams.get('duplicate')!) : null;
  
  // Fetch job data if duplicating
  const { data: duplicateJob } = trpc.jobs.getById.useQuery(
    { id: duplicateJobId! },
    { enabled: !!duplicateJobId && isAuthenticated }
  );

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

  const createJobMutation = trpc.jobs.create.useMutation({
    onSuccess: (data) => {
      const engineerLink = `${window.location.origin}/engineer/${data.jobToken}`;
      const clientLink = `${window.location.origin}/track/${data.jobToken}`;
      setCreatedLinks({ engineer: engineerLink, client: clientLink });
      toast.success("Job created successfully!");
    },
    onError: (error) => {
      toast.error(`Failed to create job: ${error.message}`);
    },
  });

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

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const scheduledDateTimeStr = formData.get("scheduledDateTime") as string;
    
    createJobMutation.mutate({
      siteName: formData.get("siteName") as string,
      siteId: formData.get("siteId") as string || undefined,
      siteLocation: formData.get("siteLocation") as string || undefined,
      siteAddress: selectedAddress || (formData.get("siteAddress") as string) || undefined,
      siteLatitude: siteCoordinates?.lat || undefined,
      siteLongitude: siteCoordinates?.lng || undefined,
      siteContactName: formData.get("siteContactName") as string || undefined,
      siteContactNumber: formData.get("siteContactNumber") as string || undefined,
      changeNumber: formData.get("changeNumber") as string || undefined,
      incidentNumber: formData.get("incidentNumber") as string || undefined,
      projectName: formData.get("projectName") as string || undefined,
      downTime: formData.get("downTime") === "on",
      scheduledDateTime: scheduledDateTimeStr ? new Date(scheduledDateTimeStr) : undefined,
      hoursRequired: formData.get("hoursRequired") as string || undefined,
      toolsRequired: formData.get("toolsRequired") as string || undefined,
      deviceDetails: formData.get("deviceDetails") as string || undefined,
      incidentDetails: formData.get("incidentDetails") as string || undefined,
      scopeOfWork: formData.get("scopeOfWork") as string || undefined,
      coveredByCOI: formData.get("coveredByCOI") === "on",
      notes: formData.get("notes") as string || undefined,
      clientName: formData.get("clientName") as string,
      projectId: manualProjectId && projectValid ? manualProjectId : undefined,
      createNewSite: siteSelectionMode === 'new' && !!(manualProjectId && projectValid),
      selectedProjectSiteId: siteSelectionMode === 'existing' ? selectedProjectSite?.id : undefined,
    });
  };

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
    setSiteCoordinates({ lat: suggestion.latitude, lng: suggestion.longitude });
    setAddressSuggestions([]);
    toast.success("Address selected and coordinates captured!");
  };

  const copyToClipboard = (text: string, type: "engineer" | "client") => {
    navigator.clipboard.writeText(text);
    if (type === "engineer") {
      setCopiedEngineer(true);
      setTimeout(() => setCopiedEngineer(false), 2000);
    } else {
      setCopiedClient(true);
      setTimeout(() => setCopiedClient(false), 2000);
    }
    toast.success("Link copied to clipboard!");
  };

  if (createdLinks) {
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

        <main className="container mx-auto px-4 py-8 max-w-2xl">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl text-green-600 flex items-center gap-2">
                <Check className="h-6 w-6" />
                Job Created Successfully!
              </CardTitle>
              <CardDescription>Share these links with the engineer and client</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Engineer Link</Label>
                <div className="flex gap-2">
                  <Input value={createdLinks.engineer} readOnly className="font-mono text-sm" />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => copyToClipboard(createdLinks.engineer, "engineer")}
                  >
                    {copiedEngineer ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
                <p className="text-sm text-gray-600">
                  Send this link to the field engineer to accept and track the job
                </p>
              </div>

              <div className="space-y-2">
                <Label>Client Tracking Link</Label>
                <div className="flex gap-2">
                  <Input value={createdLinks.client} readOnly className="font-mono text-sm" />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => copyToClipboard(createdLinks.client, "client")}
                  >
                    {copiedClient ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
                <p className="text-sm text-gray-600">
                  Share this link with the client to track real-time progress
                </p>
              </div>

              <div className="flex gap-2 pt-4">
                <Button onClick={() => setLocation("/admin/create")} variant="outline" className="flex-1">
                  Create Another Job
                </Button>
                <Button onClick={() => setLocation("/admin")} className="flex-1">
                  Back to Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

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

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6">
          <Link href="/admin">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Create New Field Service Job</CardTitle>
            <CardDescription>Fill in the dispatch request details</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Client Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Client Information</h3>
                <div>
                  <Label htmlFor="clientName">Client Name *</Label>
                  <Input id="clientName" name="clientName" required defaultValue={duplicateJob?.clientName || ""} />
                </div>
              </div>

              {/* Project Assignment (Optional) */}
              <div className="space-y-4">
                <div className="border-b pb-2">
                  <h3 className="text-lg font-semibold">Specific Project Assignment (Optional)</h3>
                  <p className="text-sm text-muted-foreground mt-1">Use this to assign your request to a specific pre-existing project</p>
                </div>
                <div>
                  <Label htmlFor="manualProjectId">Project ID</Label>
                  <div className="flex gap-2">
                    <Input
                      id="manualProjectId"
                      value={manualProjectId}
                      onChange={(e) => {
                        setManualProjectId(e.target.value.toUpperCase());
                        setProjectValid(null);
                      }}
                      placeholder="Enter Project Name for Specific Project Tickets"
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
                                  setSelectedAddress(site.address || '');
                                  setSiteCoordinates({
                                    lat: site.latitude || '',
                                    lng: site.longitude || ''
                                  });
                                }
                              }}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select a site..." />
                              </SelectTrigger>
                              <SelectContent>
                                {projectSites.map((site: any) => (
                                  <SelectItem key={site.id} value={site.id.toString()}>
                                    {site.siteName} - {site.address}
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
                  {projectValid === false && (
                    <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm font-medium text-red-900">
                        Invalid project ID. Please check and try again.
                      </p>
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    If you have a project ID, enter it above and click Verify. Leave blank if not applicable.
                  </p>
                </div>
              </div>

              {/* Site Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Site Information</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="siteName">Site Name *</Label>
                    <Input id="siteName" name="siteName" required defaultValue={duplicateJob?.siteName || ""} />
                  </div>
                  <div>
                    <Label htmlFor="siteId">Site ID</Label>
                    <Input id="siteId" name="siteId" defaultValue={duplicateJob?.siteId || ""} />
                  </div>
                </div>
                <div>
                  <Label htmlFor="siteLocation">Site Location/City</Label>
                  <Input id="siteLocation" name="siteLocation" defaultValue={duplicateJob?.siteLocation || ""} />
                </div>
                
                {/* Address Search */}
                <div>
                  <Label htmlFor="addressSearch">Site Address Search</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      id="addressSearch"
                      placeholder="Enter address to search..."
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
                  {selectedAddress && (
                    <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-green-900">Selected Address:</p>
                          <p className="text-sm text-green-700 mt-1">{selectedAddress}</p>
                          {siteCoordinates && (
                            <p className="text-xs text-green-600 mt-1">
                              Coordinates: {parseFloat(siteCoordinates.lat).toFixed(6)}, {parseFloat(siteCoordinates.lng).toFixed(6)}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <Input
                    type="hidden"
                    name="siteAddress"
                    value={selectedAddress}
                  />
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Site Contact</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="siteContactName">Contact Name</Label>
                    <Input id="siteContactName" name="siteContactName" defaultValue={duplicateJob?.siteContactName || ""} />
                  </div>
                  <div>
                    <Label htmlFor="siteContactNumber">Contact Number</Label>
                    <Input id="siteContactNumber" name="siteContactNumber" type="tel" defaultValue={duplicateJob?.siteContactNumber || ""} />
                  </div>
                </div>
              </div>

              {/* Job Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Job Details</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="changeNumber">Change Number</Label>
                    <Input id="changeNumber" name="changeNumber" defaultValue={duplicateJob?.changeNumber || ""} />
                  </div>
                  <div>
                    <Label htmlFor="incidentNumber">Incident Number</Label>
                    <Input id="incidentNumber" name="incidentNumber" defaultValue={duplicateJob?.incidentNumber || ""} />
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="projectName">Project Name</Label>
                    <Input id="projectName" name="projectName" defaultValue={duplicateJob?.projectName || ""} />
                  </div>
                  <div>
                    <Label htmlFor="hoursRequired">Hours Required</Label>
                    <Input id="hoursRequired" name="hoursRequired" defaultValue={duplicateJob?.hoursRequired || ""} />
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="scheduledDateTime">Scheduled Date & Time</Label>
                    <Input id="scheduledDateTime" name="scheduledDateTime" type="datetime-local" />
                  </div>
                  <div className="flex items-center space-x-2 pt-8">
                    <Checkbox id="downTime" name="downTime" defaultChecked={duplicateJob?.downTime || false} />
                    <Label htmlFor="downTime" className="cursor-pointer">Down Time</Label>
                  </div>
                </div>
              </div>

              {/* Technical Requirements */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Technical Requirements</h3>
                <div>
                  <Label htmlFor="toolsRequired">Tools Required</Label>
                  <Textarea id="toolsRequired" name="toolsRequired" rows={2} defaultValue={duplicateJob?.toolsRequired || ""} />
                </div>
                <div>
                  <Label htmlFor="deviceDetails">Device Details for T-Shoot</Label>
                  <Textarea id="deviceDetails" name="deviceDetails" rows={2} defaultValue={duplicateJob?.deviceDetails || ""} />
                </div>
                <div>
                  <Label htmlFor="incidentDetails">Incident/Change Details</Label>
                  <Textarea id="incidentDetails" name="incidentDetails" rows={3} defaultValue={duplicateJob?.incidentDetails || ""} />
                </div>
                <div>
                  <Label htmlFor="scopeOfWork">Scope of Work / Activities</Label>
                  <Textarea id="scopeOfWork" name="scopeOfWork" rows={3} defaultValue={duplicateJob?.scopeOfWork || ""} />
                </div>
              </div>

              {/* Additional Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Additional Information</h3>
                <div className="flex items-center space-x-2">
                  <Checkbox id="coveredByCOI" name="coveredByCOI" defaultChecked />
                  <Label htmlFor="coveredByCOI" className="cursor-pointer">
                    Despatch Engineer Covered by FieldPulse Go COI
                  </Label>
                </div>
                <div>
                  <Label htmlFor="notes">Notes (Delivery Tracking, Special Instructions)</Label>
                  <Textarea id="notes" name="notes" rows={3} defaultValue={duplicateJob?.notes || ""} />
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" disabled={createJobMutation.isPending} className="flex-1">
                  {createJobMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating Job...
                    </>
                  ) : (
                    "Create Job"
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

