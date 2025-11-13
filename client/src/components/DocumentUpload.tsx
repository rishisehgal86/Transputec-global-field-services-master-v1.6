import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Upload, File, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { storagePut } from "../../../storage/index";

interface DocumentUploadProps {
  jobId?: number;
  onUploadComplete?: () => void;
  uploadedBy: string; // 'client', 'admin', 'engineer'
}

export function DocumentUpload({ jobId, onUploadComplete, uploadedBy }: DocumentUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [description, setDescription] = useState("");
  const [uploading, setUploading] = useState(false);

  const uploadMutation = trpc.jobs.uploadDocument.useMutation();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (16MB limit)
      if (file.size > 16 * 1024 * 1024) {
        toast.error("File size must be less than 16MB");
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !jobId) return;

    setUploading(true);
    try {
      // Read file as ArrayBuffer
      const arrayBuffer = await selectedFile.arrayBuffer();
      const buffer = new Uint8Array(arrayBuffer);

      // Upload to S3
      const fileKey = `job-${jobId}/documents/${Date.now()}-${selectedFile.name}`;
      const { url } = await storagePut(fileKey, buffer, selectedFile.type);

      // Save to database
      await uploadMutation.mutateAsync({
        jobId,
        fileName: selectedFile.name,
        fileUrl: url,
        fileKey,
        fileSize: selectedFile.size,
        mimeType: selectedFile.type,
        uploadedBy,
        description: description || undefined,
      });

      toast.success("Document uploaded successfully");
      setSelectedFile(null);
      setDescription("");
      onUploadComplete?.();
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload document");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="document">Upload Document</Label>
        <div className="mt-2 flex items-center gap-2">
          <Input
            id="document"
            type="file"
            onChange={handleFileSelect}
            accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.jpg,.jpeg,.png"
            className="flex-1"
          />
          {selectedFile && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setSelectedFile(null)}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Supported: PDF, Word, Excel, Images (Max 16MB)
        </p>
      </div>

      {selectedFile && (
        <>
          <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
            <File className="h-5 w-5 text-primary" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{selectedFile.name}</p>
              <p className="text-xs text-muted-foreground">
                {(selectedFile.size / 1024).toFixed(1)} KB
              </p>
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of this document..."
              className="mt-1"
              rows={2}
            />
          </div>

          <Button
            type="button"
            onClick={handleUpload}
            disabled={uploading}
            className="w-full"
          >
            {uploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Upload Document
              </>
            )}
          </Button>
        </>
      )}
    </div>
  );
}

interface DocumentListProps {
  jobId: number;
  canDelete?: boolean;
}

export function DocumentList({ jobId, canDelete = false }: DocumentListProps) {
  const { data: documents, refetch } = trpc.jobs.getDocuments.useQuery({ jobId });
  const deleteMutation = trpc.jobs.deleteDocument.useMutation();

  const handleDelete = async (documentId: number) => {
    if (!confirm("Are you sure you want to delete this document?")) return;

    try {
      await deleteMutation.mutateAsync({ documentId });
      toast.success("Document deleted");
      refetch();
    } catch (error) {
      toast.error("Failed to delete document");
    }
  };

  if (!documents || documents.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">No documents uploaded yet.</p>
    );
  }

  return (
    <div className="space-y-2">
      {documents.map((doc) => (
        <div
          key={doc.id}
          className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
        >
          <File className="h-5 w-5 text-primary flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <a
              href={doc.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium hover:underline truncate block"
            >
              {doc.fileName}
            </a>
            {doc.description && (
              <p className="text-xs text-muted-foreground mt-0.5">{doc.description}</p>
            )}
            <p className="text-xs text-muted-foreground mt-0.5">
              Uploaded by {doc.uploadedBy} • {new Date(doc.createdAt).toLocaleDateString()}
            </p>
          </div>
          {canDelete && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleDelete(doc.id)}
              disabled={deleteMutation.isPending}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      ))}
    </div>
  );
}

