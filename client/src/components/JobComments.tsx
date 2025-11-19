import { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { MessageSquare, Send, User, Paperclip, X, Image as ImageIcon, Video } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface JobCommentsProps {
  token: string;
  authorName: string;
  authorType: "engineer" | "client" | "admin";
  canComment?: boolean;
}

interface MediaFile {
  url: string;
  type: 'image' | 'video';
  filename: string;
  size: number;
  mimeType: string;
}

export function JobComments({ token, authorName, authorType, canComment = true }: JobCommentsProps) {
  const [newComment, setNewComment] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadedMedia, setUploadedMedia] = useState<MediaFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: comments = [], refetch } = trpc.jobs.getComments.useQuery(
    { token },
    { refetchInterval: 5000 } // Refresh every 5 seconds for real-time updates
  );
  
  // Get job details for upload
  const { data: job, isLoading: jobLoading } = trpc.jobs.getByToken.useQuery({ token });

  const uploadMediaMutation = trpc.upload.uploadMedia.useMutation();

  const addCommentMutation = trpc.jobs.addComment.useMutation({
    onSuccess: () => {
      toast.success("Comment posted!");
      setNewComment("");
      setSelectedFiles([]);
      setUploadedMedia([]);
      refetch();
    },
    onError: (error) => {
      toast.error(`Failed to post comment: ${error.message}`);
    },
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    // Validate file types
    const validFiles = files.filter(file => {
      const isImage = file.type.startsWith('image/');
      const isVideo = file.type.startsWith('video/');
      return isImage || isVideo;
    });
    
    if (validFiles.length !== files.length) {
      toast.error("Some files were skipped. Only images and videos are allowed.");
    }
    
    // Check file sizes
    const oversizedFiles = validFiles.filter(file => {
      const isImage = file.type.startsWith('image/');
      const maxSize = isImage ? 10 * 1024 * 1024 : 100 * 1024 * 1024; // 10MB for images, 100MB for videos
      return file.size > maxSize;
    });
    
    if (oversizedFiles.length > 0) {
      toast.error("Some files are too large. Max: 10MB for images, 100MB for videos.");
      return;
    }
    
    setSelectedFiles(prev => [...prev, ...validFiles]);
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() && selectedFiles.length === 0) {
      toast.error("Please add a comment or attach files");
      return;
    }
    
    try {
      setIsUploading(true);
      
      // Upload files first if any
      const uploadedFiles: MediaFile[] = [];
      
      // If there are files to upload, we need job data
      if (selectedFiles.length > 0 && !job) {
        toast.error("Unable to upload files. Please wait for job data to load.");
        setIsUploading(false);
        return;
      }
      
      for (const file of selectedFiles) {
        try {
          // Convert file to base64
          const base64Data = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
              const result = reader.result as string;
              // Remove data URL prefix
              const base64 = result.split(',')[1];
              resolve(base64);
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
          });
          
          const mediaFile = await uploadMediaMutation.mutateAsync({
            jobId: job!.id,
            filename: file.name,
            mimeType: file.type,
            base64Data,
          });
          
          uploadedFiles.push(mediaFile);
          toast.success(`Uploaded ${file.name}`);
        } catch (error) {
          console.error('File upload error:', error);
          toast.error(`Failed to upload ${file.name}`);
        }
      }
      
      // Post comment with attachments
      await addCommentMutation.mutateAsync({
        token,
        authorName,
        authorType,
        comment: newComment.trim() || "(Shared media)",
        attachments: uploadedFiles.length > 0 ? uploadedFiles : undefined,
      });
      
      // Success handled by mutation's onSuccess callback
    } catch (error) {
      console.error('Submit error:', error);
      toast.error("Failed to post comment");
    } finally {
      setIsUploading(false);
    }
  };

  const getAuthorBadgeColor = (type: string) => {
    switch (type) {
      case "engineer":
        return "bg-blue-100 text-blue-800";
      case "client":
        return "bg-green-100 text-green-800";
      case "admin":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Comments & Updates
        </CardTitle>
        <CardDescription>
          Communication thread visible to engineer, admin, and client
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Comments List */}
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {comments.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No comments yet. Be the first to add one!</p>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="border-l-4 border-gray-200 pl-4 py-2">
                <div className="flex items-center gap-2 mb-1">
                  <User className="h-4 w-4 text-gray-400" />
                  <span className="font-semibold text-sm">{comment.authorName}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${getAuthorBadgeColor(comment.authorType)}`}>
                    {comment.authorType}
                  </span>
                  <span className="text-xs text-gray-500 ml-auto">
                    {new Date(comment.createdAt).toLocaleString()}
                  </span>
                </div>
                <p className="text-gray-700 whitespace-pre-wrap">{comment.comment}</p>
                
                {/* Display attachments */}
                {comment.attachments && (() => {
                  try {
                    const attachments = JSON.parse(comment.attachments) as MediaFile[];
                    return attachments.length > 0 && (
                      <div className="mt-2 grid grid-cols-2 gap-2">
                        {attachments.map((file, idx) => (
                          <a
                            key={idx}
                            href={file.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="border rounded-lg p-2 hover:bg-gray-50 transition-colors"
                          >
                            <div className="flex items-center gap-2">
                              {file.type === 'image' ? (
                                <ImageIcon className="h-4 w-4 text-blue-500" />
                              ) : (
                                <Video className="h-4 w-4 text-purple-500" />
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{file.filename}</p>
                                <p className="text-xs text-gray-500">
                                  {(file.size / 1024 / 1024).toFixed(2)} MB
                                </p>
                              </div>
                            </div>
                            {file.type === 'image' && (
                              <img
                                src={file.url}
                                alt={file.filename}
                                className="mt-2 w-full h-32 object-cover rounded"
                              />
                            )}
                          </a>
                        ))}
                      </div>
                    );
                  } catch (e) {
                    return null;
                  }
                })()}
              </div>
            ))
          )}
        </div>

        {/* Add Comment Form */}
        {canComment && (
          <form onSubmit={handleSubmit} className="border-t pt-4">
            <Textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment or update..."
              rows={3}
              className="mb-2"
            />
            
            {/* File Upload */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              multiple
              onChange={handleFileSelect}
              className="hidden"
            />
            
            {/* Selected Files Preview */}
            {selectedFiles.length > 0 && (
              <div className="mb-2 space-y-2">
                {selectedFiles.map((file, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded border">
                    {file.type.startsWith('image/') ? (
                      <ImageIcon className="h-4 w-4 text-blue-500" />
                    ) : (
                      <Video className="h-4 w-4 text-purple-500" />
                    )}
                    <span className="text-sm flex-1 truncate">{file.name}</span>
                    <span className="text-xs text-gray-500">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
            
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
              >
                <Paperclip className="h-4 w-4 mr-2" />
                Attach Files
              </Button>
            <Button
              type="submit"
              disabled={addCommentMutation.isPending || isUploading || (!newComment.trim() && selectedFiles.length === 0)}
              className="flex-1"
            >
              <Send className="h-4 w-4 mr-2" />
              {isUploading ? "Uploading..." : addCommentMutation.isPending ? "Posting..." : "Post Comment"}
            </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
}

