import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, MapPin, Search } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

interface AddressSelectionDialogProps {
  open: boolean;
  onClose: () => void;
  initialAddress: string;
  onAddressSelected: (latitude: number, longitude: number, displayName: string) => void;
  siteName: string;
}

export default function AddressSelectionDialog({
  open,
  onClose,
  initialAddress,
  onAddressSelected,
  siteName,
}: AddressSelectionDialogProps) {
  const [searchQuery, setSearchQuery] = useState(initialAddress);
  const [selectedAddress, setSelectedAddress] = useState<{
    latitude: string;
    longitude: string;
    displayName: string;
  } | null>(null);

  const { data: suggestions, isLoading, refetch } = trpc.projects.searchAddresses.useQuery(
    { address: searchQuery, limit: 15 },
    { enabled: false } // Don't auto-fetch, only on button click
  );

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      toast.error("Please enter an address to search");
      return;
    }
    refetch();
  };

  const handleSelect = () => {
    if (!selectedAddress) {
      toast.error("Please select an address from the list");
      return;
    }

    onAddressSelected(
      parseFloat(selectedAddress.latitude),
      parseFloat(selectedAddress.longitude),
      selectedAddress.displayName
    );
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Find Address for "{siteName}"</DialogTitle>
          <DialogDescription>
            The automatic geocoding couldn't find this address. Please search and select the correct location.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search Input */}
          <div className="space-y-2">
            <Label htmlFor="address-search">Search Address</Label>
            <div className="flex gap-2">
              <Input
                id="address-search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Enter address to search..."
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleSearch();
                  }
                }}
              />
              <Button
                onClick={handleSearch}
                disabled={isLoading}
                variant="secondary"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Results */}
          {suggestions && suggestions.length > 0 && (
            <div className="space-y-2">
              <Label>Select the correct address:</Label>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {suggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedAddress?.displayName === suggestion.displayName
                        ? "border-primary bg-primary/10"
                        : "hover:bg-accent"
                    }`}
                    onClick={() => setSelectedAddress({
                      latitude: suggestion.latitude || '',
                      longitude: suggestion.longitude || '',
                      displayName: suggestion.displayName || ''
                    })}
                  >
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 mt-1 text-muted-foreground flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{suggestion.displayName}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Type: {suggestion.type} • Coordinates: {suggestion.latitude}, {suggestion.longitude}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {suggestions && suggestions.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <MapPin className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No addresses found</p>
              <p className="text-sm">Try a different search term</p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSelect}
            disabled={!selectedAddress}
          >
            Use Selected Address
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

