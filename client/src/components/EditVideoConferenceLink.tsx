import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pencil, Check, X } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface EditVideoConferenceLinkProps {
  token: string;
  currentLink: string | null;
  onUpdate?: () => void;
}

export function EditVideoConferenceLink({ token, currentLink, onUpdate }: EditVideoConferenceLinkProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [linkValue, setLinkValue] = useState(currentLink || "");

  const updateMutation = trpc.jobs.updateVideoConferenceLink.useMutation({
    onSuccess: () => {
      toast.success("Video conference link updated!");
      setIsEditing(false);
      onUpdate?.();
    },
    onError: (error) => {
      toast.error(`Failed to update link: ${error.message}`);
    },
  });

  const handleSave = () => {
    updateMutation.mutate({
      token,
      videoConferenceLink: linkValue.trim() || null,
    });
  };

  const handleCancel = () => {
    setLinkValue(currentLink || "");
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="space-y-2">
        <div className="flex gap-2">
          <Input
            type="url"
            value={linkValue}
            onChange={(e) => setLinkValue(e.target.value)}
            placeholder="https://zoom.us/j/123456789 or https://teams.microsoft.com/..."
            className="flex-1"
          />
          <Button
            size="sm"
            onClick={handleSave}
            disabled={updateMutation.isPending}
          >
            <Check className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleCancel}
            disabled={updateMutation.isPending}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-xs text-gray-500">
          Leave empty to remove the video conference link
        </p>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {currentLink ? (
        <a
          href={currentLink}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline break-all flex-1"
        >
          {currentLink}
        </a>
      ) : (
        <span className="text-gray-500 italic">No video conference link set</span>
      )}
      <Button
        size="sm"
        variant="ghost"
        onClick={() => setIsEditing(true)}
      >
        <Pencil className="h-4 w-4" />
      </Button>
    </div>
  );
}

