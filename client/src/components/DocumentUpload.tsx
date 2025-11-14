import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Upload, X, FileText } from "lucide-react";
import { toast } from "sonner";

interface DocumentUploadProps {
  onFileSelect: (file: {
    fileName: string;
    fileData: string;
    fileType: string;
    mimeType: string;
    documentType: string;
    description: string;
  }) => void;
  onRemove?: () => void;
  showPreview?: boolean;
  selectedFile?: {
    fileName: string;
    documentType: string;
    description: string;
  } | null;
}

export function DocumentUpload({
  onFileSelect,
  onRemove,
  showPreview = true,
  selectedFile,
}: DocumentUploadProps) {
  const [documentType, setDocumentType] = useState<string>("other");
  const [description, setDescription] = useState<string>("");

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size must be less than 10MB");
      return;
    }

    // Validate file type
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
      "image/jpeg",
      "image/png",
    ];

    if (!allowedTypes.includes(file.type)) {
      toast.error("Only PDF, DOC, DOCX, TXT, JPG, and PNG files are allowed");
      return;
    }

    // Convert to base64
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      const base64Data = base64.split(",")[1]; // Remove data:mime;base64, prefix

      onFileSelect({
        fileName: file.name,
        fileData: base64Data,
        fileType: file.name.split(".").pop() || "unknown",
        mimeType: file.type,
        documentType,
        description,
      });

      toast.success("File selected successfully");
    };

    reader.onerror = () => {
      toast.error("Failed to read file");
    };

    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-4 border rounded-lg p-4">
      <div className="space-y-2">
        <Label htmlFor="document-type">Document Type</Label>
        <Select value={documentType} onValueChange={setDocumentType}>
          <SelectTrigger id="document-type">
            <SelectValue placeholder="Select document type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="instruction_guide">Instruction Guide</SelectItem>
            <SelectItem value="task_list">Task List</SelectItem>
            <SelectItem value="reference">Reference Document</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description (Optional)</Label>
        <Textarea
          id="description"
          placeholder="Brief description of the document..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="file-upload">Select File</Label>
        <div className="flex items-center gap-2">
          <Input
            id="file-upload"
            type="file"
            accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
            onChange={handleFileChange}
            className="flex-1"
          />
        </div>
        <p className="text-xs text-muted-foreground">
          Supported formats: PDF, DOC, DOCX, TXT, JPG, PNG (Max 10MB)
        </p>
      </div>

      {showPreview && selectedFile && (
        <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">{selectedFile.fileName}</p>
              <p className="text-xs text-muted-foreground">
                {selectedFile.documentType.replace("_", " ")}
                {selectedFile.description && ` - ${selectedFile.description}`}
              </p>
            </div>
          </div>
          {onRemove && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onRemove}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

