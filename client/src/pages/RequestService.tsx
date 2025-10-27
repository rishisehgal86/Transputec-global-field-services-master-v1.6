import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Check, MapPin, Search, Building2 } from "lucide-react";
import { APP_TITLE } from "@/const";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { toast } from "sonner";

export default function RequestService() {
  const [searching, setSearching] = useState(false);
  const [addressSuggestions, setAddressSuggestions] = useState<any[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<string>("");
  const [siteCoordinates, setSiteCoordinates] = useState<{ lat: string; lng: string } | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [requestSubmitted, setRequestSubmitted] = useState(false);

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
    onSuccess: () => {
      setRequestSubmitted(true);
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
    setSiteCoordinates({ lat: suggestion.latitude, lng: suggestion.longitude });
    setAddressSuggestions([]);
    toast.success("Address selected and coordinates captured!");
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const scheduledDateTimeStr = formData.get("scheduledDateTime") as string;
    
    if (!selectedAddress || !siteCoordinates) {
      toast.error("Please search and select a site address");
      return;
    }
    
    createRequestMutation.mutate({
      clientName: formData.get("clientName") as string,
      siteName: formData.get("siteName") as string,
      siteAddress: selectedAddress,
      siteLatitude: siteCoordinates.lat,
      siteLongitude: siteCoordinates.lng,
      siteContactName: formData.get("siteContactName") as string,
      siteContactNumber: formData.get("siteContactNumber") as string,
      incidentDetails: formData.get("incidentDetails") as string,
      scheduledDateTime: scheduledDateTimeStr ? new Date(scheduledDateTimeStr) : undefined,
      hoursRequired: formData.get("hoursRequired") as string,
      downTime: formData.get("downTime") === "on",
      // Optional fields
      siteId: formData.get("siteId") as string || undefined,
      changeNumber: formData.get("changeNumber") as string || undefined,
      incidentNumber: formData.get("incidentNumber") as string || undefined,
      projectName: formData.get("projectName") as string || undefined,
      toolsRequired: formData.get("toolsRequired") as string || undefined,
      deviceDetails: formData.get("deviceDetails") as string || undefined,
      scopeOfWork: formData.get("scopeOfWork") as string || undefined,
      notes: formData.get("notes") as string || undefined,
    });
  };

  if (requestSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <header className="border-b bg-white shadow-sm">
          <div className="container mx-auto px-4 py-4">
            <Link href="/">
              <h1 className="text-2xl font-bold text-gray-900 cursor-pointer hover:text-blue-600">
                {APP_TITLE}
              </h1>
            </Link>
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
                Your service request has been sent to Transputec for review
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">What happens next?</h3>
                <ol className="list-decimal list-inside space-y-2 text-sm text-blue-800">
                  <li>Transputec admin will review your request</li>
                  <li>Once approved, an engineer will be assigned</li>
                  <li>You'll receive updates on the engineer's progress</li>
                  <li>Track the service in real-time via the tracking link</li>
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="border-b bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <Link href="/">
            <h1 className="text-2xl font-bold text-gray-900 cursor-pointer hover:text-blue-600">
              {APP_TITLE}
            </h1>
          </Link>
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
                <div>
                  <Label htmlFor="clientName">Your Company/Organization Name *</Label>
                  <Input id="clientName" name="clientName" required placeholder="e.g., Acme Corporation" />
                </div>
              </div>

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

                {/* Address Search */}
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
                  {selectedAddress && (
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

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="scheduledDateTime">Preferred Date & Time *</Label>
                    <Input 
                      id="scheduledDateTime" 
                      name="scheduledDateTime" 
                      type="datetime-local" 
                      required 
                    />
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
                  disabled={createRequestMutation.isPending || !selectedAddress} 
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
  );
}

