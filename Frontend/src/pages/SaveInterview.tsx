import { useState, useEffect } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Video, Save, Trash2, Loader2, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { generateFeedback, endInterview, deleteInterview } from "@/services/interviewService";

interface LocationState {
  videoBlob?: Blob;
  interviewId?: string;
  companyName?: string;
  jobTitle?: string;
  duration?: number;
}

interface Feedback {
  score?: number;
  strengths?: string[];
  weaknesses?: string[];
  suggestions?: string[];
}

export default function SaveInterview() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const state = location.state as LocationState | null;
  const { toast } = useToast();
  
  const interviewId = searchParams.get("id") || state?.interviewId || "";
  const videoBlob = state?.videoBlob;
  const companyName = state?.companyName || "";
  const jobTitle = state?.jobTitle || "";
  const duration = state?.duration || 0;
  
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [isLoadingFeedback, setIsLoadingFeedback] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDiscarding, setIsDiscarding] = useState(false);
  const [interviewTitle, setInterviewTitle] = useState(
    jobTitle ? `Interview for ${jobTitle}` : "Mock Interview"
  );
  const [feedbackError, setFeedbackError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFeedbackData = async () => {
      if (!interviewId) {
        setFeedbackError("No interview ID provided");
        setIsLoadingFeedback(false);
        return;
      }
      try {
        const data = await generateFeedback(interviewId);
        setFeedback(data);
      } catch (error) {
        console.error("Error fetching feedback:", error);
        setFeedbackError("Failed to generate feedback");
      } finally {
        setIsLoadingFeedback(false);
      }
    };
    fetchFeedbackData();
  }, [interviewId]);

  const handleSave = async () => {
    if (!interviewTitle.trim()) {
      toast({ title: "Title Required", description: "Please enter a title for this interview", variant: "destructive" });
      return;
    }
    setIsSaving(true);
    try {
      const formData = new FormData();
      formData.append("interview_id", interviewId);
      formData.append("interview_title", interviewTitle);
      if (videoBlob) {
        const videoFile = new File([videoBlob], `interview_${interviewId}.webm`, { type: "video/webm" });
        formData.append("video", videoFile);
      }
      if (feedback) formData.append("feedback", JSON.stringify(feedback));

      await endInterview(interviewId, formData);
      toast({ title: "Interview Saved", description: "Your interview has been saved to the library" });
      navigate("/interviews-library");
    } catch (error) {
      console.error("Error saving interview:", error);
      toast({ title: "Error", description: "Failed to save interview. Please try again.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDiscard = async () => {
    setIsDiscarding(true);
    try {
      await deleteInterview(interviewId);
      toast({ title: "Interview Discarded", description: "The interview recording has been deleted" });
      navigate("/");
    } catch (error) {
      console.error("Error discarding interview:", error);
      toast({ title: "Error", description: "Failed to discard interview.", variant: "destructive" });
    } finally {
      setIsDiscarding(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-3xl w-full">
          <Card className="bg-secondary/80 border-primary/20 shadow-card p-8">
            <h2 className="text-2xl font-bold mb-6 text-center">Interview Complete</h2>
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <div className="flex flex-col items-center justify-center">
                {isLoadingFeedback ? (
                  <div className="flex flex-col items-center gap-4"><Loader2 className="w-16 h-16 animate-spin text-primary" /><p className="text-muted-foreground">Generating feedback...</p></div>
                ) : feedbackError ? (
                  <div className="flex flex-col items-center gap-4 text-destructive"><AlertCircle className="w-16 h-16" /><p>{feedbackError}</p></div>
                ) : (
                  <>
                    <div className="relative w-40 h-40">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle cx="80" cy="80" r="70" fill="none" stroke="currentColor" strokeWidth="12" className="text-muted" />
                        <circle cx="80" cy="80" r="70" fill="none" stroke="currentColor" strokeWidth="12" strokeLinecap="round" className="text-primary" strokeDasharray={`${(feedback?.score || 0) * 4.4} 440`} />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-4xl font-bold">{feedback?.score || 0}</span>
                        <span className="text-sm text-muted-foreground">Score</span>
                      </div>
                    </div>
                    <p className="mt-4 text-center text-muted-foreground">{companyName && jobTitle ? `${jobTitle} at ${companyName}` : "Mock Interview"}</p>
                    <p className="text-sm text-muted-foreground">Duration: {formatTime(duration)}</p>
                  </>
                )}
              </div>
              <div className="space-y-6">
                {isLoadingFeedback ? (
                  <div className="space-y-4">{[1, 2, 3].map((i) => (<div key={i} className="h-20 bg-muted/50 rounded-lg animate-pulse" />))}</div>
                ) : feedback && !feedbackError ? (
                  <>
                    {feedback.strengths && feedback.strengths.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-2 flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" />Strengths</h4>
                        <ul className="space-y-1 text-sm text-muted-foreground">{feedback.strengths.map((item, idx) => (<li key={idx} className="flex items-start gap-2"><span className="text-green-500">•</span>{item}</li>))}</ul>
                      </div>
                    )}
                    {feedback.weaknesses && feedback.weaknesses.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-2 flex items-center gap-2"><XCircle className="w-4 h-4 text-red-500" />Areas for Improvement</h4>
                        <ul className="space-y-1 text-sm text-muted-foreground">{feedback.weaknesses.map((item, idx) => (<li key={idx} className="flex items-start gap-2"><span className="text-red-500">•</span>{item}</li>))}</ul>
                      </div>
                    )}
                    {feedback.suggestions && feedback.suggestions.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-2 flex items-center gap-2"><AlertCircle className="w-4 h-4 text-yellow-500" />Suggestions</h4>
                        <ul className="space-y-1 text-sm text-muted-foreground">{feedback.suggestions.map((item, idx) => (<li key={idx} className="flex items-start gap-2"><span className="text-yellow-500">•</span>{item}</li>))}</ul>
                      </div>
                    )}
                  </>
                ) : null}
              </div>
            </div>
            {videoBlob && (
              <div className="p-4 rounded-lg bg-muted/50 flex items-center gap-3 mb-6">
                <Video className="w-5 h-5 text-primary" /><span>Recording captured ({(videoBlob.size / 1024 / 1024).toFixed(2)} MB)</span>
              </div>
            )}
            <div className="mb-6">
              <label className="text-sm font-medium mb-2 block">Interview Title</label>
              <Input value={interviewTitle} onChange={(e) => setInterviewTitle(e.target.value)} placeholder="Enter a title for this interview" className="text-lg" />
            </div>
            <div className="flex gap-3">
              <Button variant="hero" size="lg" onClick={handleSave} disabled={isSaving || isDiscarding} className="flex-1">
                {isSaving ? (<><Loader2 className="w-5 h-5 mr-2 animate-spin" />Saving...</>) : (<><Save className="w-5 h-5 mr-2" />Save Interview</>)}
              </Button>
              <Button variant="outline" size="lg" onClick={handleDiscard} disabled={isSaving || isDiscarding} className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground">
                {isDiscarding ? (<><Loader2 className="w-5 h-5 mr-2 animate-spin" />Discarding...</>) : (<><Trash2 className="w-5 h-5 mr-2" />Discard</>)}
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
}
