import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Upload, Download, MapPin, Trash2, Plus } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { SiteLocationMap } from "@/components/SiteLocationMap";

interface ProjectSitesProps {
  projectId: string;
}

export default function ProjectSites({ projectId }: ProjectSitesProps) {
  const [uploading, setUploading] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingLocationSiteId, setEditingLocationSiteId] = useState<number | null>(null);
  const [editingSite, setEditingSite] = useState<any>(null);
  
  // Fetch sites
  const { data: sites, isLoading, refetch } = trpc.projects.getSites.useQuery({ projectId });
  
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
        toast.success(`Successfully imported ${result.imported} sites`);
        if (result.errors.length > 0) {
          toast.warning(`${result.errors.length} sites had issues: ${result.errors.join(', ')}`);
        }
        refetch();
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
      refetch();
    },
    onError: (error) => {
      toast.error(`Failed to delete site: ${error.message}`);
    },
  });
  
  // Update site location mutation
  const updateLocationMutation = trpc.projects.updateSiteLocation.useMutation({
    onSuccess: () => {
      toast.success("Site location updated successfully");
      setEditingLocationSiteId(null);
      setEditingSite(null);
      refetch();
    },
    onError: (error) => {
      toast.error(`Failed to update location: ${error.message}`);
    },
  });
  
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setUploading(true);
    
    // Read file as base64
    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target?.result as string;
      const fileData = base64.split(',')[1]; // Remove data:... prefix
      
      uploadSitesMutation.mutate({
        projectId,
        fileData,
      });
    };
    reader.readAsDataURL(file);
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
          
          <Label htmlFor="site-upload" className="cursor-pointer">
            <Button
              variant="default"
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
            id="site-upload"
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
                      {site.latitude && site.longitude && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                          ✓ Geo-located
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
    </Card>
  );
}

