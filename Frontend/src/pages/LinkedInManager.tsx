import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Navigation } from "@/components/layout/Navigation";
import { BackButton } from "@/components/layout/BackButton";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useErrorHandler } from "@/hooks/useErrorHandler";
import { Linkedin, Sparkles, Calendar, Send, Upload, X, Edit2, Loader2, CalendarDays } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { createLinkedinPost, postToLinkedin, schedulePost} from "@/services/linkedinService";

export default function LinkedInManager() {
  const navigate = useNavigate();
  const { userId } = useAuth();
  const [topic, setTopic] = useState("");
  const [description, setDescription] = useState("");
  const [generatedPost, setGeneratedPost] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  const [isScheduling, setIsScheduling] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [showSchedulePicker, setShowSchedulePicker] = useState(false);
  const [scheduleDateTime, setScheduleDateTime] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { error, hideError, handleError } = useErrorHandler();

 const handleGenerate = async () => {
  if (!topic.trim()) {
    toast({
      title: "Missing topic",
      description: "Please provide a topic for your LinkedIn post.",
      variant: "destructive",
    });
    return;
  }

  setIsGenerating(true);

  try {
    const result = await createLinkedinPost({
      title: topic,
      description: description.trim() || topic,
    });

    setGeneratedPost(result?.content || "");
    setIsEditing(false);

    toast({
      title: "Post Generated!",
      description: "Review your AI-generated LinkedIn post below.",
    });
  } catch (err) {
    handleError(err, "Failed to generate post. Please try again.");
  } finally {
    setIsGenerating(false);
  }
};

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({ title: "File too large", description: "Please upload an image smaller than 5MB.", variant: "destructive" });
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => { setUploadedImage(e.target?.result as string); toast({ title: "Image uploaded", description: "Your image has been added to the post." }); };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => { setUploadedImage(null); if (fileInputRef.current) fileInputRef.current.value = ""; };

  const handlePostNow = async () => {
    if (!generatedPost.trim()) { toast({ title: "No content", description: "Please generate a post first.", variant: "destructive" }); return; }
    if (!userId) return;
    setIsPosting(true);
    try {
      await postToLinkedin(userId, { text: generatedPost });
      toast({ title: "Posted Successfully!", description: "Your post has been published to LinkedIn." });
      setGeneratedPost(""); setTopic(""); setUploadedImage(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      handleError(err, "Failed to post. Please try again.");
    } finally {
      setIsPosting(false);
    }
  };

  const handleScheduleClick = () => {
    if (!generatedPost.trim()) { toast({ title: "No content", description: "Please generate a post first.", variant: "destructive" }); return; }
    setShowSchedulePicker(true);
  };

  const handleScheduleConfirm = async () => {
    if (!scheduleDateTime) { toast({ title: "Select date and time", description: "Please choose when to schedule your post.", variant: "destructive" }); return; }
    if (!userId) return;
    setIsScheduling(true);
    setShowSchedulePicker(false);
    try {
      await schedulePost(userId, { text: generatedPost, scheduled_at: scheduleDateTime, media: uploadedImage || undefined });
      const dateObj = new Date(scheduleDateTime);
      const scheduledDate = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const scheduledTime = dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
      toast({ title: "Scheduled Successfully!", description: `Your post will be published on ${scheduledDate} at ${scheduledTime}.` });
      setGeneratedPost(""); setTopic(""); setUploadedImage(null); setScheduleDateTime("");
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      handleError(err, "Failed to schedule. Please try again.");
    } finally {
      setIsScheduling(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="pt-24 pb-16 px-4">
        <div className="max-w-6xl mx-auto">
          <BackButton className="mb-6" />
          <div className="mb-12 animate-fade-in">
            <div className="flex items-center justify-between mb-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-card/50 backdrop-blur-sm">
                <Linkedin className="w-4 h-4 text-accent" /><span className="text-sm font-medium">LinkedIn Content Manager</span>
              </div>
              <Button variant="outline" onClick={() => navigate("/linkedin-scheduled-posts")} className="gap-2">
                <CalendarDays className="w-4 h-4" />Scheduled Posts
              </Button>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">LinkedIn Post Generator</h1>
            <p className="text-xl text-muted-foreground">Create engaging LinkedIn posts with AI assistance and schedule them for optimal reach</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Card className="gradient-card border-border shadow-card p-6">
                <h3 className="font-semibold mb-4">Create New Post</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Topic or Keywords</label>
                    <Input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g., Career Growth, Tech Innovation, Leadership" />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Additional Context (Optional)</label>
                    <Textarea placeholder="Add any specific points you want to include..." className="min-h-[100px]" />
                  </div>
                  <Button variant="hero" className="w-full" onClick={handleGenerate} disabled={isGenerating}>
                    {isGenerating ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin" />Generating Post...</>) : (<><Sparkles className="w-4 h-4 mr-2" />Generate Post</>)}
                  </Button>
                </div>
              </Card>

              {generatedPost && (
                <Card className="gradient-card border-border shadow-card p-6 animate-slide-up">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold">Generated Post</h3>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => setIsEditing(!isEditing)}><Edit2 className="w-4 h-4 mr-2" />{isEditing ? "Preview" : "Edit"}</Button>
                      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                      <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}><Upload className="w-4 h-4 mr-2" />Upload Image</Button>
                    </div>
                  </div>
                  {uploadedImage && (
                    <div className="relative mb-4">
                      <img src={uploadedImage} alt="Post image" className="w-full max-h-64 object-cover rounded-lg" />
                      <Button variant="destructive" size="sm" className="absolute top-2 right-2" onClick={handleRemoveImage}><X className="w-4 h-4" /></Button>
                    </div>
                  )}
                  {isEditing ? (
                  <Textarea
  value={description}
  onChange={(e) => setDescription(e.target.value)}
  placeholder="Add any specific points you want to include..."
  className="min-h-[100px]"
/>
                  ) : (
                    <div className="bg-muted/30 rounded-lg p-4 mb-4 min-h-[150px]"><p className="whitespace-pre-wrap">{generatedPost}</p></div>
                  )}
                  <div className="flex gap-3">
                    <Button variant="accent" className="flex-1" onClick={handlePostNow} disabled={isPosting || isScheduling}>
                      {isPosting ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin" />Posting...</>) : (<><Send className="w-4 h-4 mr-2" />Post Now</>)}
                    </Button>
                    <Button variant="outline" className="flex-1" onClick={handleScheduleClick} disabled={isPosting || isScheduling}>
                      {isScheduling ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin" />Scheduling...</>) : (<><Calendar className="w-4 h-4 mr-2" />Schedule</>)}
                    </Button>
                  </div>
                  {showSchedulePicker && (
                    <div className="mt-4 p-4 border border-border rounded-lg bg-muted/20">
                      <label className="text-sm font-medium mb-2 block">Select Date & Time</label>
                      <div className="flex gap-3">
                        <Input type="datetime-local" value={scheduleDateTime} onChange={(e) => setScheduleDateTime(e.target.value)} className="flex-1" min={new Date().toISOString().slice(0, 16)} />
                        <Button onClick={handleScheduleConfirm}>Confirm</Button>
                        <Button variant="ghost" onClick={() => setShowSchedulePicker(false)}>Cancel</Button>
                      </div>
                    </div>
                  )}
                </Card>
              )}
            </div>

            <div className="space-y-6">
              <Card className="gradient-card border-border shadow-card p-6">
                <h3 className="font-semibold mb-4">Posting Tips</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex gap-2"><span className="text-accent">•</span><span>Best times: 7-9 AM, 12-1 PM</span></li>
                  <li className="flex gap-2"><span className="text-accent">•</span><span>Use 3-5 relevant hashtags</span></li>
                  <li className="flex gap-2"><span className="text-accent">•</span><span>Add images for 2x engagement</span></li>
                  <li className="flex gap-2"><span className="text-accent">•</span><span>Ask questions to boost comments</span></li>
                </ul>
              </Card>
            </div>
          </div>
        </div>
      </main>
      {/* <ErrorPopup isOpen={error.isOpen} onClose={hideError} title={error.title} message={error.message} onRetry={error.onRetry} /> */}
    </div>
  );
}
