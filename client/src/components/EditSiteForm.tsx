import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import type { ProjectSite } from "../../../drizzle/schema";

interface EditSiteFormProps {
  site: ProjectSite;
  onSuccess: () => void;
  onCancel: () => void;
  onGeocodeFailure?: () => void;
}

export default function EditSiteForm({ site, onSuccess, onCancel, onGeocodeFailure }: EditSiteFormProps) {
  const [formData, setFormData] = useState({
    siteName: site.siteName || "",
    siteAddress: site.siteAddress || "",
    city: site.city || "",
    postalCode: site.postalCode || "",
    country: site.country || "",
    contactName: site.contactName || "",
    contactPhone: site.contactPhone || "",
    contactEmail: site.contactEmail || "",
    notes: site.notes || "",
  });
  
  // Track if address fields have changed
  const addressChanged = 
    formData.siteAddress !== (site.siteAddress || "") ||
    formData.city !== (site.city || "") ||
    formData.postalCode !== (site.postalCode || "") ||
    formData.country !== (site.country || "");

  const geocodeSiteMutation = trpc.projects.geocodeSite.useMutation({
    onSuccess: () => {
      toast.success("Site geocoded successfully");
      onSuccess();
    },
    onError: (error) => {
      console.error("Error geocoding site:", error);
      toast.warning(`Site updated but automatic geocoding failed`);
      // Call the geocode failure callback to show address selection dialog
      if (onGeocodeFailure) {
        onGeocodeFailure();
      } else {
        onSuccess(); // Fallback: close dialog if no callback provided
      }
    },
  });

  const updateSiteMutation = trpc.projects.updateSite.useMutation({
    onSuccess: () => {
      toast.success("Site updated successfully");
      // If address changed, automatically geocode
      if (addressChanged) {
        toast.info("Geocoding updated address...");
        geocodeSiteMutation.mutate({ siteId: site.id });
      } else {
        onSuccess();
      }
    },
    onError: (error) => {
      console.error("Error updating site:", error);
      toast.error(`Failed to update site: ${error.message}`);
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.siteName.trim()) {
      toast.error("Site name is required");
      return;
    }
    
    if (!formData.siteAddress.trim()) {
      toast.error("Site address is required");
      return;
    }
    
    updateSiteMutation.mutate({
      siteId: site.id,
      siteName: formData.siteName,
      siteAddress: formData.siteAddress,
      city: formData.city || undefined,
      postalCode: formData.postalCode || undefined,
      country: formData.country || undefined,
      contactName: formData.contactName || undefined,
      contactPhone: formData.contactPhone || undefined,
      contactEmail: formData.contactEmail || undefined,
      notes: formData.notes || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4">
        {/* Site Name */}
        <div className="space-y-2">
          <Label htmlFor="siteName">Site Name *</Label>
          <Input
            id="siteName"
            name="siteName"
            value={formData.siteName}
            onChange={handleChange}
            placeholder="e.g., Main Office"
            required
          />
        </div>

        {/* Site Address */}
        <div className="space-y-2">
          <Label htmlFor="siteAddress">Site Address *</Label>
          <Input
            id="siteAddress"
            name="siteAddress"
            value={formData.siteAddress}
            onChange={handleChange}
            placeholder="e.g., 123 Main Street"
            required
          />
        </div>

        {/* City, Postal Code, Country */}
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              name="city"
              value={formData.city}
              onChange={handleChange}
              placeholder="e.g., London"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="postalCode">Postal Code</Label>
            <Input
              id="postalCode"
              name="postalCode"
              value={formData.postalCode}
              onChange={handleChange}
              placeholder="e.g., SW1A 1AA"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="country">Country</Label>
            <Input
              id="country"
              name="country"
              value={formData.country}
              onChange={handleChange}
              placeholder="e.g., United Kingdom"
            />
          </div>
        </div>

        {/* Contact Information */}
        <div className="space-y-2">
          <Label htmlFor="contactName">Contact Name</Label>
          <Input
            id="contactName"
            name="contactName"
            value={formData.contactName}
            onChange={handleChange}
            placeholder="e.g., John Smith"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="contactPhone">Contact Phone</Label>
            <Input
              id="contactPhone"
              name="contactPhone"
              value={formData.contactPhone}
              onChange={handleChange}
              placeholder="e.g., +44 20 1234 5678"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="contactEmail">Contact Email</Label>
            <Input
              id="contactEmail"
              name="contactEmail"
              type="email"
              value={formData.contactEmail}
              onChange={handleChange}
              placeholder="e.g., contact@example.com"
            />
          </div>
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            placeholder="Additional information about this site..."
            rows={3}
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 justify-end pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={updateSiteMutation.isPending}>
          Cancel
        </Button>
        <Button type="submit" disabled={updateSiteMutation.isPending}>
          {updateSiteMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Updating...
            </>
          ) : (
            "Update Site"
          )}
        </Button>
      </div>
    </form>
  );
}

