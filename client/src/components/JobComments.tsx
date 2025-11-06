import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { MessageSquare, Send, User } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface JobCommentsProps {
  token: string;
  authorName: string;
  authorType: "engineer" | "client" | "admin";
  canComment?: boolean;
}

export function JobComments({ token, authorName, authorType, canComment = true }: JobCommentsProps) {
  const [newComment, setNewComment] = useState("");

  const { data: comments = [], refetch } = trpc.jobs.getComments.useQuery(
    { token },
    { refetchInterval: 5000 } // Refresh every 5 seconds for real-time updates
  );

  const addCommentMutation = trpc.jobs.addComment.useMutation({
    onSuccess: () => {
      toast.success("Comment posted!");
      setNewComment("");
      refetch();
    },
    onError: (error) => {
      toast.error(`Failed to post comment: ${error.message}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) {
      toast.error("Comment cannot be empty");
      return;
    }

    addCommentMutation.mutate({
      token,
      authorName,
      authorType,
      comment: newComment.trim(),
    });
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
            <Button
              type="submit"
              disabled={addCommentMutation.isPending || !newComment.trim()}
              className="w-full"
            >
              <Send className="h-4 w-4 mr-2" />
              {addCommentMutation.isPending ? "Posting..." : "Post Comment"}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}

