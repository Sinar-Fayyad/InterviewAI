import { useState, useEffect, useRef } from "react";
import { Navigation } from "@/components/layout/Navigation";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { BackButton } from "@/components/layout/BackButton";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { CalendarDays, Edit2, Trash2, Send, Loader2, X, Check, Upload, ImageIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { getPosts, updatePost, deletePost } from "@/services/postService";
import { postToLinkedin } from "@/services/linkedinService";

interface ScheduledPost {
  id: string;
  content: string;
  body?: string;
  title?: string;
  scheduledDate: string;
  scheduledTime: string;
  scheduled_at?: string;
  image?: string;
  media?: string;
}

export default function LinkedInScheduledPosts() {
  const { userId } = useAuth();
  const [posts, setPosts] = useState<ScheduledPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editTime, setEditTime] = useState("");
  const [editImage, setEditImage] = useState<string | undefined>(undefined);
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (userId) fetchPosts();
  }, [userId]);

  const fetchPosts = async () => {
    if (!userId) return;
    try {
      const data = await getPosts(userId);
      const mapped = (data || []).map((p: any) => ({
        id: p.id,
        content: p.body || p.content || "",
        scheduledDate: p.scheduled_at ? new Date(p.scheduled_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : "",
        scheduledTime: p.scheduled_at ? new Date(p.scheduled_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : "",
        image: p.media || undefined,
      }));
      setPosts(mapped);
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (post: ScheduledPost) => {
    setEditingId(post.id); setEditContent(post.content); setEditDate(post.scheduledDate); setEditTime(post.scheduledTime); setEditImage(post.image);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) { const reader = new FileReader(); reader.onloadend = () => setEditImage(reader.result as string); reader.readAsDataURL(file); }
  };

  const handleRemoveImage = () => { setEditImage(undefined); if (fileInputRef.current) fileInputRef.current.value = ""; };

  const handleSaveEdit = async (postId: string) => {
    try {
      await updatePost(postId, { body: editContent, media: editImage });
      setPosts(posts.map(p => p.id === postId ? { ...p, content: editContent, scheduledDate: editDate, scheduledTime: editTime, image: editImage } : p));
      setEditingId(null);
      toast({ title: "Post Updated", description: "Your scheduled post has been updated." });
    } catch { toast({ title: "Error", description: "Failed to update post.", variant: "destructive" }); }
  };

  const handleCancelEdit = () => { setEditingId(null); setEditContent(""); setEditDate(""); setEditTime(""); setEditImage(undefined); };

  const handleDelete = async (postId: string) => {
    setDeletingId(postId);
    try {
      await deletePost(postId);
      setPosts(posts.filter(p => p.id !== postId));
      toast({ title: "Post Deleted", description: "Your scheduled post has been removed." });
    } catch { toast({ title: "Error", description: "Failed to delete post. Please try again.", variant: "destructive" }); }
    finally { setDeletingId(null); }
  };

  const handleSendNow = async (postId: string) => {
    if (!userId) return;
    setSendingId(postId);
    try {
      const post = posts.find(p => p.id === postId);
      await postToLinkedin(userId, { text: post?.content || "" });
      setPosts(posts.filter(p => p.id !== postId));
      toast({ title: "Posted Successfully!", description: "Your post has been published to LinkedIn." });
    } catch { toast({ title: "Error", description: "Failed to post. Please try again.", variant: "destructive" }); }
    finally { setSendingId(null); }
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
                <CalendarDays className="w-4 h-4 text-accent" /><span className="text-sm font-medium">Scheduled Posts</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">Scheduled LinkedIn Posts</h1>
              <p className="text-muted-foreground">Manage your upcoming LinkedIn posts</p>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-muted-foreground" /></div>
            ) : posts.length === 0 ? (
              <Card className="gradient-card border-border shadow-card p-8 text-center">
                <CalendarDays className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Scheduled Posts</h3>
                <p className="text-muted-foreground">You haven't scheduled any posts yet.</p>
              </Card>
            ) : (
              <div className="space-y-4">
                {posts.map((post) => (
                  <Card key={post.id} className="gradient-card border-border shadow-card p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{post.scheduledDate}</Badge>
                        <span className="text-sm text-muted-foreground">{post.scheduledTime}</span>
                      </div>
                      {editingId !== post.id && (
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => handleEdit(post)} disabled={sendingId === post.id || deletingId === post.id}><Edit2 className="w-4 h-4" /></Button>
                          <Button variant="outline" size="sm" onClick={() => handleDelete(post.id)} disabled={sendingId === post.id || deletingId === post.id}>
                            {deletingId === post.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                          </Button>
                          <Button variant="accent" size="sm" onClick={() => handleSendNow(post.id)} disabled={sendingId === post.id || deletingId === post.id}>
                            {sendingId === post.id ? (<><Loader2 className="w-4 h-4 mr-1 animate-spin" />Sending...</>) : (<><Send className="w-4 h-4 mr-1" />Send Now</>)}
                          </Button>
                        </div>
                      )}
                    </div>
                    {editingId === post.id ? (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2"><Label>Scheduled Date</Label><Input type="date" value={editDate} onChange={(e) => setEditDate(e.target.value)} /></div>
                          <div className="space-y-2"><Label>Scheduled Time</Label><Input type="time" value={editTime} onChange={(e) => setEditTime(e.target.value)} /></div>
                        </div>
                        <div className="space-y-2">
                          <Label>Post Image</Label>
                          {editImage ? (
                            <div className="relative">
                              <img src={editImage} alt="Post image" className="w-full max-h-48 object-cover rounded-lg" />
                              <div className="absolute top-2 right-2 flex gap-2">
                                <Button variant="secondary" size="sm" onClick={() => fileInputRef.current?.click()} className="bg-background/80 backdrop-blur-sm"><Upload className="w-4 h-4 mr-1" />Replace</Button>
                                <Button variant="destructive" size="sm" onClick={handleRemoveImage} className="bg-destructive/80 backdrop-blur-sm"><X className="w-4 h-4 mr-1" />Remove</Button>
                              </div>
                            </div>
                          ) : (
                            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors" onClick={() => fileInputRef.current?.click()}>
                              <ImageIcon className="w-8 h-8 text-muted-foreground mx-auto mb-2" /><p className="text-sm text-muted-foreground">Click to upload an image</p>
                            </div>
                          )}
                          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                        </div>
                        <div className="space-y-2"><Label>Post Content</Label><Textarea value={editContent} onChange={(e) => setEditContent(e.target.value)} className="min-h-[120px]" /></div>
                        <div className="flex gap-2 justify-end">
                          <Button variant="ghost" size="sm" onClick={handleCancelEdit}><X className="w-4 h-4 mr-1" />Cancel</Button>
                          <Button size="sm" onClick={() => handleSaveEdit(post.id)}><Check className="w-4 h-4 mr-1" />Save Changes</Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        {post.image && <img src={post.image} alt="Post image" className="w-full max-h-48 object-cover rounded-lg mb-4" />}
                        <p className="text-sm whitespace-pre-wrap">{post.content}</p>
                      </>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
