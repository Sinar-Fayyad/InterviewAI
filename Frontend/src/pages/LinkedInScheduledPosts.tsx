import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { Navigation } from "@/components/layout/Navigation";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { BackButton } from "@/components/layout/BackButton";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  CalendarDays,
  Edit2,
  Trash2,
  Send,
  Loader2,
  X,
  Check,
  Upload,
  ImageIcon,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { getPosts, updatePost, deletePost } from "@/services/postService";
import { postToLinkedin } from "@/services/linkedinService";

interface BackendPost {
  id: number | string;
  body?: string;
  content?: string;
  title?: string;
  scheduled_at?: string;
  media?: string | null;
}

interface ScheduledPost {
  id: string;
  content: string;
  scheduled_at: string;
  scheduledDate: string;
  scheduledTime: string;
  image?: string;
}

const pad = (value: number) => String(value).padStart(2, "0");

const parseBackendDate = (value?: string) => {
  if (!value) return null;

  /*
    Laravel may return:
    2026-05-03 20:30:00
    or
    2026-05-03T20:30:00.000000Z

    JS Date understands the T version better, so we normalize spaces to T.
  */
  const normalized = value.includes("T") ? value : value.replace(" ", "T");
  const date = new Date(normalized);

  if (Number.isNaN(date.getTime())) return null;

  return date;
};

const toDateInputValue = (value?: string) => {
  const date = parseBackendDate(value);
  if (!date) return "";

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate()
  )}`;
};

const toTimeInputValue = (value?: string) => {
  const date = parseBackendDate(value);
  if (!date) return "";

  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

const formatDisplayDate = (value?: string) => {
  const date = parseBackendDate(value);
  if (!date) return "No date";

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
};

const formatDisplayTime = (value?: string) => {
  const date = parseBackendDate(value);
  if (!date) return "";

  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const toLaravelDateTime = (date: string, time: string) => {
  if (!date || !time) return "";

  const normalizedTime = time.length === 5 ? `${time}:00` : time;

  /*
    This matches the backend-friendly format:
    2026-05-03 20:30:00
  */
  return `${date} ${normalizedTime}`;
};

export default function LinkedInScheduledPosts() {
  const { userId } = useAuth();
  const { toast } = useToast();

  const [posts, setPosts] = useState<ScheduledPost[]>([]);
  const [loading, setLoading] = useState(true);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editTime, setEditTime] = useState("");
  const [editImage, setEditImage] = useState<string | undefined>(undefined);

  const [sendingId, setSendingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchPosts = async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const data = await getPosts(userId);

      const mapped: ScheduledPost[] = (data || []).map((post: BackendPost) => {
        const scheduledAt = post.scheduled_at || "";

        return {
          id: String(post.id),
          content: post.body || post.content || "",
          scheduled_at: scheduledAt,
          scheduledDate: toDateInputValue(scheduledAt),
          scheduledTime: toTimeInputValue(scheduledAt),
          image: post.media || undefined,
        };
      });

      setPosts(mapped);
    } catch (error: any) {
      console.error("Error fetching posts:", error?.response?.data || error);

      toast({
        title: "Error",
        description:
          error?.response?.data?.message ||
          "Failed to fetch scheduled posts.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [userId]);

  const handleEdit = (post: ScheduledPost) => {
    setEditingId(post.id);
    setEditContent(post.content);
    setEditDate(post.scheduledDate);
    setEditTime(post.scheduledTime);
    setEditImage(post.image);
  };

  const handleImageUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onloadend = () => {
      setEditImage(reader.result as string);
    };

    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setEditImage(undefined);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSaveEdit = async (postId: string) => {
    if (!editContent.trim()) {
      toast({
        title: "No content",
        description: "Post content cannot be empty.",
        variant: "destructive",
      });
      return;
    }

    if (!editDate || !editTime) {
      toast({
        title: "Missing schedule",
        description: "Please select both date and time.",
        variant: "destructive",
      });
      return;
    }

    setSavingId(postId);

    try {
      const scheduledAt = toLaravelDateTime(editDate, editTime);

      await updatePost(postId, {
        body: editContent,
        scheduled_at: scheduledAt,
        media: editImage ?? null,
      });

      setPosts((currentPosts) =>
        currentPosts.map((post) =>
          post.id === postId
            ? {
                ...post,
                content: editContent,
                scheduled_at: scheduledAt,
                scheduledDate: editDate,
                scheduledTime: editTime,
                image: editImage,
              }
            : post
        )
      );

      setEditingId(null);
      setEditContent("");
      setEditDate("");
      setEditTime("");
      setEditImage(undefined);

      toast({
        title: "Post Updated",
        description: "Your scheduled post has been updated.",
      });
    } catch (error: any) {
      console.error("Error updating post:", error?.response?.data || error);

      toast({
        title: "Error",
        description:
          error?.response?.data?.message || "Failed to update post.",
        variant: "destructive",
      });
    } finally {
      setSavingId(null);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditContent("");
    setEditDate("");
    setEditTime("");
    setEditImage(undefined);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDelete = async (postId: string) => {
    setDeletingId(postId);

    try {
      await deletePost(postId);

      setPosts((currentPosts) =>
        currentPosts.filter((post) => post.id !== postId)
      );

      toast({
        title: "Post Deleted",
        description: "Your scheduled post has been removed.",
      });
    } catch (error: any) {
      console.error("Error deleting post:", error?.response?.data || error);

      toast({
        title: "Error",
        description:
          error?.response?.data?.message ||
          "Failed to delete post. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
    }
  };

  const handleSendNow = async (postId: string) => {
    if (!userId) return;

    const post = posts.find((item) => item.id === postId);

    if (!post) {
      toast({
        title: "Post not found",
        description: "This scheduled post could not be found.",
        variant: "destructive",
      });
      return;
    }

    setSendingId(postId);

    try {
      await postToLinkedin(userId, {
        text: post.content,
       // media: post.image ?? null,
      });

      /*
        Important:
        After posting immediately, remove the scheduled post from backend too.
        Otherwise it may appear again after refresh or publish again later.
      */
      await deletePost(postId);

      setPosts((currentPosts) =>
        currentPosts.filter((item) => item.id !== postId)
      );

      toast({
        title: "Posted Successfully!",
        description: "Your post has been published to LinkedIn.",
      });
    } catch (error: any) {
      console.error("Error posting now:", error?.response?.data || error);

      toast({
        title: "Error",
        description:
          error?.response?.data?.message ||
          "Failed to post. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSendingId(null);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <Navigation />

        <main className="pt-24 pb-16 px-4">
          <div className="max-w-4xl mx-auto">
            <BackButton to="/linkedin-posts" className="mb-6" />

            <div className="mb-8 animate-fade-in">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-card/50 backdrop-blur-sm mb-6">
                <CalendarDays className="w-4 h-4 text-accent" />
                <span className="text-sm font-medium">Scheduled Posts</span>
              </div>

              <h1 className="text-3xl md:text-4xl font-bold mb-2">
                Scheduled LinkedIn Posts
              </h1>

              <p className="text-muted-foreground">
                Manage your upcoming LinkedIn posts
              </p>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              </div>
            ) : posts.length === 0 ? (
              <Card className="gradient-card border-border shadow-card p-8 text-center">
                <CalendarDays className="w-12 h-12 text-muted-foreground mx-auto mb-4" />

                <h3 className="text-lg font-semibold mb-2">
                  No Scheduled Posts
                </h3>

                <p className="text-muted-foreground">
                  You have not scheduled any posts yet.
                </p>
              </Card>
            ) : (
              <div className="space-y-4">
                {posts.map((post) => {
                  const isEditing = editingId === post.id;
                  const isSending = sendingId === post.id;
                  const isDeleting = deletingId === post.id;
                  const isSaving = savingId === post.id;
                  const isBusy = isSending || isDeleting || isSaving;

                  return (
                    <Card
                      key={post.id}
                      className="gradient-card border-border shadow-card p-6"
                    >
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">
                            {formatDisplayDate(post.scheduled_at)}
                          </Badge>

                          <span className="text-sm text-muted-foreground">
                            {formatDisplayTime(post.scheduled_at)}
                          </span>
                        </div>

                        {!isEditing && (
                          <div className="flex flex-wrap gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(post)}
                              disabled={isBusy}
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>

                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(post.id)}
                              disabled={isBusy}
                            >
                              {isDeleting ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Trash2 className="w-4 h-4" />
                              )}
                            </Button>

                            <Button
                              variant="accent"
                              size="sm"
                              onClick={() => handleSendNow(post.id)}
                              disabled={isBusy}
                            >
                              {isSending ? (
                                <>
                                  <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                                  Sending...
                                </>
                              ) : (
                                <>
                                  <Send className="w-4 h-4 mr-1" />
                                  Send Now
                                </>
                              )}
                            </Button>
                          </div>
                        )}
                      </div>

                      {isEditing ? (
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Scheduled Date</Label>
                              <Input
                                type="date"
                                value={editDate}
                                onChange={(event) =>
                                  setEditDate(event.target.value)
                                }
                              />
                            </div>

                            <div className="space-y-2">
                              <Label>Scheduled Time</Label>
                              <Input
                                type="time"
                                value={editTime}
                                onChange={(event) =>
                                  setEditTime(event.target.value)
                                }
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label>Post Image</Label>

                            {editImage ? (
                              <div className="relative">
                                <img
                                  src={editImage}
                                  alt="Post"
                                  className="w-full max-h-48 object-cover rounded-lg"
                                />

                                <div className="absolute top-2 right-2 flex gap-2">
                                  <Button
                                    variant="secondary"
                                    size="sm"
                                    onClick={() =>
                                      fileInputRef.current?.click()
                                    }
                                    className="bg-background/80 backdrop-blur-sm"
                                  >
                                    <Upload className="w-4 h-4 mr-1" />
                                    Replace
                                  </Button>

                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={handleRemoveImage}
                                    className="bg-destructive/80 backdrop-blur-sm"
                                  >
                                    <X className="w-4 h-4 mr-1" />
                                    Remove
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <div
                                className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
                                onClick={() => fileInputRef.current?.click()}
                              >
                                <ImageIcon className="w-8 h-8 text-muted-foreground mx-auto mb-2" />

                                <p className="text-sm text-muted-foreground">
                                  Click to upload an image
                                </p>
                              </div>
                            )}

                            <input
                              ref={fileInputRef}
                              type="file"
                              accept="image/*"
                              onChange={handleImageUpload}
                              className="hidden"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label>Post Content</Label>

                            <Textarea
                              value={editContent}
                              onChange={(event) =>
                                setEditContent(event.target.value)
                              }
                              className="min-h-[120px]"
                            />
                          </div>

                          <div className="flex gap-2 justify-end">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={handleCancelEdit}
                              disabled={isSaving}
                            >
                              <X className="w-4 h-4 mr-1" />
                              Cancel
                            </Button>

                            <Button
                              size="sm"
                              onClick={() => handleSaveEdit(post.id)}
                              disabled={isSaving}
                            >
                              {isSaving ? (
                                <>
                                  <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                                  Saving...
                                </>
                              ) : (
                                <>
                                  <Check className="w-4 h-4 mr-1" />
                                  Save Changes
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <>
                          {post.image && (
                            <img
                              src={post.image}
                              alt="Post"
                              className="w-full max-h-48 object-cover rounded-lg mb-4"
                            />
                          )}

                          <p className="text-sm whitespace-pre-wrap">
                            {post.content}
                          </p>
                        </>
                      )}
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}