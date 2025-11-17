import { useState, useRef, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Upload, Download, MapPin, Trash2, Plus, Pencil, Navigation } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { SiteLocationMap } from "@/components/SiteLocationMap";
import AddSiteForm from "@/components/AddSiteForm";
import EditSiteForm from "@/components/EditSiteForm";
import AddressSelectionDialog from "@/components/AddressSelectionDialog";

interface ProjectSitesProps {
  projectId: string;
}

export default function ProjectSites({ projectId }: ProjectSitesProps) {
  // DEBUG: Log projectId to verify it's correct
  console.log('[ProjectSites] Component mounted/updated with projectId:', projectId);
  console.log('[ProjectSites] ProjectId type:', typeof projectId);
  console.log('[ProjectSites] ProjectId length:', projectId?.length);
  
  // Use ref to always have the current projectId value (fixes closure bug)
  const projectIdRef = useRef(projectId);
  useEffect(() => {
    projectIdRef.current = projectId;
    console.log('[ProjectSites] Updated projectIdRef.current to:', projectId);
  }, [projectId]);
  
  const [uploading, setUploading] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingLocationSiteId, setEditingLocationSiteId] = useState<number | null>(null);
  const [editingSite, setEditingSite] = useState<any>(null);
  const [showAddressDialog, setShowAddressDialog] = useState(false);
  const [addressDialogSite, setAddressDialogSite] = useState<any>(null);
  
  // Fetch sites
  const utils = trpc.useUtils();
  const { data: sites, isLoading, refetch } = trpc.projects.getSites.useQuery({ projectId });
  
  // Debug logging
  console.log('[ProjectSites] Component rendered for projectId:', projectId);
  console.log('[ProjectSites] isLoading:', isLoading);
  console.log('[ProjectSites] sites data:', sites);
  console.log('[ProjectSites] sites length:', sites?.length);
  
  // Download template mutation
  const downloadTemplateMutation = trpc.projects.downloadSiteTemplate.useMutation({
    onSuccess: (data) => {
      // Convert base64 to blob and download
      const byteCharacters = atob(data.data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = data.filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success("Template downloaded successfully");
    },
    onError: (error) => {
      toast.error(`Failed to download template: ${error.message}`);
    },
  });
  
  // Upload sites mutation
  const uploadSitesMutation = trpc.projects.uploadSites.useMutation({
    onSuccess: (result) => {
      if (result.success) {
        let message = 'Import successful';
        if (result.skipped && result.skipped > 0) {
          message += ` (${result.skipped} duplicate${result.skipped !== 1 ? 's' : ''} skipped)`;
        }
        toast.success(message);
        if (result.errors.length > 0) {
          toast.warning(`${result.errors.length} issue${result.errors.length !== 1 ? 's' : ''}: ${result.errors.slice(0, 3).join(', ')}${result.errors.length > 3 ? '...' : ''}`);
        }
        utils.projects.getSites.invalidate({ projectId });
      } else {
        toast.error(`Import failed: ${result.errors.join(', ')}`);
      }
      setUploading(false);
    },
    onError: (error) => {
      toast.error(`Upload failed: ${error.message}`);
      setUploading(false);
    },
  });
  
  // Delete site mutation
  const deleteSiteMutation = trpc.projects.deleteSite.useMutation({
    onSuccess: () => {
      toast.success("Site deleted successfully");
      // Invalidate and refetch the sites query
      utils.projects.getSites.invalidate({ projectId });
    },
    onError: (error) => {
      toast.error(`Failed to delete site: ${error.message}`);
    },
  });
  
  // Geocode site mutation
  const geocodeSiteMutation = trpc.projects.geocodeSite.useMutation({
    onSuccess: () => {
      toast.success("Site geocoded successfully");
      utils.projects.getSites.invalidate({ projectId });
    },
    onError: (error) => {
      toast.error(`Automatic geocoding failed: ${error.message}`);
      // Show address selection dialog
      if (addressDialogSite) {
        setShowAddressDialog(true);
      }
    },
  });
  
  // Update site location mutation
  const updateLocationMutation = trpc.projects.updateSiteLocation.useMutation({
    onSuccess: () => {
      toast.success("Site location updated successfully");
      setEditingLocationSiteId(null);
      setEditingSite(null);
      utils.projects.getSites.invalidate({ projectId });
    },
    onError: (error) => {
      toast.error(`Failed to update location: ${error.message}`);
    },
  });
  
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    console.log('File selected:', file.name, file.type, file.size);
    
    setUploading(true);
    
    // Read file as base64
    const reader = new FileReader();
    
    reader.onerror = () => {
      console.error('FileReader error:', reader.error);
      toast.error('Failed to read file');
      setUploading(false);
    };
    
    reader.onload = async (event) => {
      try {
        const base64 = event.target?.result as string;
        if (!base64) {
          throw new Error('Failed to read file content');
        }
        
        const fileData = base64.split(',')[1]; // Remove data:... prefix
        
        // BUGFIX: Use projectIdRef.current to get the CURRENT projectId value
        // This fixes the closure bug where projectId was stuck on the first value
        const currentProjectId = projectIdRef.current;
        
        console.log('[ProjectSites Upload] ===== FRONTEND UPLOAD START =====');
        console.log('[ProjectSites Upload] ProjectId from ref:', currentProjectId);
        console.log('[ProjectSites Upload] ProjectId length:', currentProjectId.length);
        console.log('[ProjectSites Upload] ProjectId type:', typeof currentProjectId);
        console.log('[ProjectSites Upload] File size:', fileData.length, 'bytes');
        
        // Show alert to user so they can see which project is being uploaded to
        const confirmUpload = window.confirm(
          `You are about to upload sites to project: "${currentProjectId}"\n\n` +
          `Click OK to proceed with upload.`
        );
        
        if (!confirmUpload) {
          setUploading(false);
          return;
        }
        
        uploadSitesMutation.mutate({
          projectId: currentProjectId,
          fileData,
        });
      } catch (error) {
        console.error('Upload error:', error);
        toast.error(`Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        setUploading(false);
      }
    };
    
    reader.readAsDataURL(file);
    
    // Reset input so same file can be selected again
    e.target.value = '';
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Project Sites</CardTitle>
        <CardDescription>
          Manage predefined sites for this project. Upload sites in bulk using Excel or add them individually.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Upload Controls */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => downloadTemplateMutation.mutate()}
            disabled={downloadTemplateMutation.isPending}
          >
            {downloadTemplateMutation.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Download className="h-4 w-4 mr-2" />
            )}
            Download Template
          </Button>
          
          <Button
            variant="default"
            onClick={() => setShowAddDialog(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Site Manually
          </Button>
          
          <Label htmlFor={`site-upload-${projectId}`} className="cursor-pointer">
            <Button
              variant="outline"
              disabled={uploading}
              asChild
            >
              <span>
                {uploading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4 mr-2" />
                )}
                Upload Sites
              </span>
            </Button>
          </Label>
          <Input
            id={`site-upload-${projectId}`}
            type="file"
            accept=".xlsx,.xls"
            className="hidden"
            onChange={handleFileUpload}
            disabled={uploading}
          />
        </div>
        
        {/* Sites List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : sites && sites.length > 0 ? (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">{sites.length} site(s) configured</p>
            <div className="grid gap-2 max-h-96 overflow-y-auto">
              {sites.map((site) => (
                <div
                  key={site.id}
                  className="flex items-start justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <h4 className="font-medium">{site.siteName}</h4>
                      {site.latitude && site.longitude ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                          ✓ Geo-located
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                          ⚠ Missing coordinates
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{site.siteAddress}</p>
                    {(site.city || site.postalCode || site.country) && (
                      <p className="text-xs text-muted-foreground">
                        {site.city}{site.postalCode && `, ${site.postalCode}`}{site.country && `, ${site.country}`}
                      </p>
                    )}
                    {site.contactName && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Contact: {site.contactName}
                        {site.contactPhone && ` • ${site.contactPhone}`}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-1">
                    {/* Show Geocode button only if coordinates are missing */}
                    {(!site.latitude || !site.longitude) && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setAddressDialogSite(site);
                          geocodeSiteMutation.mutate({ siteId: site.id });
                        }}
                        disabled={geocodeSiteMutation.isPending}
                        title="Geocode address to get coordinates"
                      >
                        <Navigation className="h-4 w-4 text-yellow-600" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setEditingSite(site);
                        setShowEditDialog(true);
                      }}
                      title="Edit site details"
                    >
                      <Pencil className="h-4 w-4 text-muted-foreground" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setEditingLocationSiteId(site.id);
                        setEditingSite(site);
                      }}
                      title="Edit location on map"
                    >
                      <MapPin className="h-4 w-4 text-primary" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        if (confirm(`Delete site "${site.siteName}"?`)) {
                          deleteSiteMutation.mutate({ siteId: site.id });
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <MapPin className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No sites configured yet</p>
            <p className="text-sm">Download the template and upload your sites</p>
          </div>
        )}
      </CardContent>
      
      {/* Location Editor Dialog */}
      <Dialog open={editingLocationSiteId !== null} onOpenChange={(open) => {
        if (!open) {
          setEditingLocationSiteId(null);
          setEditingSite(null);
        }
      }}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Edit Site Location</DialogTitle>
            <DialogDescription>
              Click on the map or drag the marker to set the exact location for this site.
            </DialogDescription>
          </DialogHeader>
          {editingSite && (
            <SiteLocationMap
              initialLat={editingSite.latitude}
              initialLng={editingSite.longitude}
              siteName={editingSite.siteName}
              onLocationChange={(lat, lng) => {
                updateLocationMutation.mutate({
                  siteId: editingSite.id,
                  latitude: lat,
                  longitude: lng,
                });
              }}
              onCancel={() => {
                setEditingLocationSiteId(null);
                setEditingSite(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
      
      {/* Manual Site Creation Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add Site Manually</DialogTitle>
            <DialogDescription>
              Enter site details below. Coordinates will be automatically geocoded from the address.
            </DialogDescription>
          </DialogHeader>
          <AddSiteForm
            projectId={projectId}
            onSuccess={() => {
              setShowAddDialog(false);
              refetch();
              toast.success("Site added successfully");
            }}
            onCancel={() => setShowAddDialog(false)}
          />
        </DialogContent>
      </Dialog>
      
      {/* Edit Site Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Site Details</DialogTitle>
            <DialogDescription>
              Update site information below. Changes will be saved immediately.
            </DialogDescription>
          </DialogHeader>
          {editingSite && (
            <EditSiteForm
              site={editingSite}
              onSuccess={() => {
                setShowEditDialog(false);
                setEditingSite(null);
                refetch();
              }}
              onCancel={() => {
                setShowEditDialog(false);
                setEditingSite(null);
              }}
              onGeocodeFailure={() => {
                // Show address selection dialog
                setAddressDialogSite(editingSite);
                setShowAddressDialog(true);
                setShowEditDialog(false);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
      
      {/* Address Selection Dialog */}
      {addressDialogSite && (
        <AddressSelectionDialog
          open={showAddressDialog}
          onClose={() => {
            setShowAddressDialog(false);
            setAddressDialogSite(null);
          }}
          initialAddress={`${addressDialogSite.siteAddress}, ${addressDialogSite.city || ''} ${addressDialogSite.postalCode || ''} ${addressDialogSite.country || ''}`.trim()}
          siteName={addressDialogSite.siteName}
          onAddressSelected={(latitude, longitude, displayName) => {
            updateLocationMutation.mutate({
              siteId: addressDialogSite.id,
              latitude,
              longitude,
            });
            setShowAddressDialog(false);
            setAddressDialogSite(null);
          }}
        />
      )}
    </Card>
  );
}

