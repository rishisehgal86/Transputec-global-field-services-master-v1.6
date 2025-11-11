import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle } from "lucide-react";

interface CancelJobDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (reason: string) => void;
  isLoading?: boolean;
}

const CANCELLATION_REASONS = [
  { value: "client_request", label: "Client Request" },
  { value: "engineer_unavailable", label: "Engineer Unavailable" },
  { value: "duplicate", label: "Duplicate Request" },
  { value: "incorrect_details", label: "Incorrect Details" },
  { value: "resolved_remotely", label: "Issue Resolved Remotely" },
  { value: "out_of_scope", label: "Out of Scope" },
  { value: "client_unresponsive", label: "Client Unresponsive" },
  { value: "other", label: "Other" },
];

export function CancelJobDialog({
  open,
  onOpenChange,
  onConfirm,
  isLoading = false,
}: CancelJobDialogProps) {
  const [selectedReason, setSelectedReason] = useState<string>("");
  const [customReason, setCustomReason] = useState<string>("");

  const handleConfirm = () => {
    const reason = selectedReason === "other" ? customReason : 
                   CANCELLATION_REASONS.find(r => r.value === selectedReason)?.label || "";
    
    if (reason) {
      onConfirm(reason);
      // Reset form
      setSelectedReason("");
      setCustomReason("");
    }
  };

  const isValid = selectedReason && (selectedReason !== "other" || customReason.trim());

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertCircle className="h-5 w-5" />
            Cancel Job
          </DialogTitle>
          <DialogDescription>
            Please select a reason for cancelling this job. All parties (client, engineer, and admin) will be notified via email.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="reason">Cancellation Reason *</Label>
            <Select value={selectedReason} onValueChange={setSelectedReason}>
              <SelectTrigger id="reason">
                <SelectValue placeholder="Select a reason..." />
              </SelectTrigger>
              <SelectContent>
                {CANCELLATION_REASONS.map((reason) => (
                  <SelectItem key={reason.value} value={reason.value}>
                    {reason.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedReason === "other" && (
            <div className="space-y-2">
              <Label htmlFor="custom-reason">Please specify *</Label>
              <Textarea
                id="custom-reason"
                placeholder="Enter the reason for cancellation..."
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                rows={3}
              />
            </div>
          )}

          <div className="rounded-md bg-yellow-50 dark:bg-yellow-950 p-3 text-sm text-yellow-800 dark:text-yellow-200">
            <p className="font-medium">Warning:</p>
            <p>This action cannot be undone. The job status will be permanently set to cancelled.</p>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Keep Job
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={!isValid || isLoading}
          >
            {isLoading ? "Cancelling..." : "Cancel Job"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

