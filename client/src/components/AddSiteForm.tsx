import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, MapPin } from "lucide-react";
import { toast } from "sonner";

interface AddSiteFormProps {
  projectId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export function AddSiteForm({ projectId, onSuccess, onCancel }: AddSiteFormProps) {
  const [formData, setFormData] = useState({
    siteName: "",
    siteAddress: "",
    city: "",
    postalCode: "",
    country: "",
    contactName: "",
    contactPhone: "",
    contactEmail: "",
    notes: "",
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    
    setIsSubmitting(true);
    
    try {
      // The backend will automatically geocode the address
      const response = await fetch("/api/trpc/projects.addSite", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          projectId,
          ...formData,
        }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to create site");
      }
      
      toast.success("Site added successfully");
      onSuccess();
    } catch (error) {
      console.error("Error adding site:", error);
      toast.error(error instanceof Error ? error.message : "Failed to add site");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4">
        {/* Site Name */}
        <div className="space-y-2">
          <Label htmlFor="siteName">
            Site Name <span className="text-destructive">*</span>
          </Label>
          <Input
            id="siteName"
            name="siteName"
            value={formData.siteName}
            onChange={handleChange}
            placeholder="e.g., Buckingham Palace"
            required
          />
        </div>

        {/* Site Address */}
        <div className="space-y-2">
          <Label htmlFor="siteAddress">
            Address <span className="text-destructive">*</span>
          </Label>
          <Input
            id="siteAddress"
            name="siteAddress"
            value={formData.siteAddress}
            onChange={handleChange}
            placeholder="e.g., Westminster, London"
            required
          />
          <p className="text-xs text-muted-foreground">
            <MapPin className="h-3 w-3 inline mr-1" />
            Coordinates will be automatically geocoded from this address
          </p>
        </div>

        {/* City, Postal Code, and Country */}
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
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Adding Site...
            </>
          ) : (
            "Add Site"
          )}
        </Button>
      </div>
    </form>
  );
}

