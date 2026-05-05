import { useState, useEffect } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Video, Save, Trash2, Loader2, CheckCircle, XCircle, AlertCircle, MessageSquare, Lightbulb } from "lucide-react";
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
  score?:       number;
  summary?:     string;
  strengths?:   string[];
  weaknesses?:  string[];
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
        const feedbackData = data?.feedback ?? data;
        setFeedback(feedbackData);
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
    if (!videoBlob) {
      toast({ title: "No Recording", description: "No video recording found to save.", variant: "destructive" });
      return;
    }
    setIsSaving(true);
    try {
      const formData = new FormData();
      const videoFile = new File([videoBlob], `interview_${interviewId}.webm`, { type: "video/webm" });
      formData.append("video", videoFile);
      formData.append("interview_title", interviewTitle);
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

  const scoreColor = (score: number) => {
    if (score >= 80) return "text-green-500";
    if (score >= 60) return "text-yellow-500";
    return "text-red-500";
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background py-12 px-4">
        <div className="max-w-4xl mx-auto space-y-6">

          <h2 className="text-3xl font-bold text-center">Interview Complete</h2>

          {/* Loading state */}
          {isLoadingFeedback && (
            <Card className="bg-secondary/80 border-primary/20 shadow-card p-12 flex flex-col items-center gap-4">
              <Loader2 className="w-16 h-16 animate-spin text-primary" />
              <p className="text-muted-foreground text-lg">Generating your feedback...</p>
            </Card>
          )}

          {/* Error state */}
          {!isLoadingFeedback && feedbackError && (
            <Card className="bg-secondary/80 border-destructive/20 shadow-card p-8 flex flex-col items-center gap-4 text-destructive">
              <AlertCircle className="w-16 h-16" />
              <p>{feedbackError}</p>
            </Card>
          )}

          {/* Feedback content */}
          {!isLoadingFeedback && feedback && !feedbackError && (
            <>
              {/* Score + Summary side by side at the top */}
              <Card className="bg-secondary/80 border-primary/20 shadow-card p-6">
                <div className="flex items-center gap-6">
                  {/* Score circle */}
                  <div className="relative w-28 h-28 shrink-0">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle cx="56" cy="56" r="48" fill="none" stroke="currentColor" strokeWidth="10" className="text-muted" />
                      <circle cx="56" cy="56" r="48" fill="none" stroke="currentColor" strokeWidth="10" strokeLinecap="round"
                        className={scoreColor(feedback.score || 0)}
                        strokeDasharray={`${(feedback.score || 0) * 3.015} 301.5`}
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className={`text-3xl font-bold ${scoreColor(feedback.score || 0)}`}>{feedback.score || 0}</span>
                      <span className="text-xs text-muted-foreground">Score</span>
                    </div>
                  </div>

                  {/* Summary */}
                  {feedback.summary && (
                    <div className="flex-1">
                      <h4 className="font-semibold mb-2 flex items-center gap-2 text-base">
                        <MessageSquare className="w-4 h-4 text-blue-500" />
                        Overall Summary
                      </h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">{feedback.summary}</p>
                    </div>
                  )}
                </div>
              </Card>

              {/* Strengths + Weaknesses side by side */}
              <div className="grid md:grid-cols-2 gap-4">
                {/* Strengths */}
                {feedback.strengths && feedback.strengths.length > 0 && (
                  <Card className="bg-secondary/80 border-green-500/20 shadow-card p-5">
                    <h4 className="font-semibold mb-3 flex items-center gap-2 text-green-500">
                      <CheckCircle className="w-4 h-4" />Strengths
                    </h4>
                    <ul className="space-y-2">
                      {feedback.strengths.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <span className="text-green-500 mt-0.5">•</span>{item}
                        </li>
                      ))}
                    </ul>
                  </Card>
                )}

                {/* Weaknesses */}
                {feedback.weaknesses && feedback.weaknesses.length > 0 && (
                  <Card className="bg-secondary/80 border-red-500/20 shadow-card p-5">
                    <h4 className="font-semibold mb-3 flex items-center gap-2 text-red-500">
                      <XCircle className="w-4 h-4" />Areas for Improvement
                    </h4>
                    <ul className="space-y-2">
                      {feedback.weaknesses.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <span className="text-red-500 mt-0.5">•</span>{item}
                        </li>
                      ))}
                    </ul>
                  </Card>
                )}
              </div>

              {/* Suggestions — full width below */}
              {feedback.suggestions && feedback.suggestions.length > 0 && (
                <Card className="bg-secondary/80 border-yellow-500/20 shadow-card p-5">
                  <h4 className="font-semibold mb-3 flex items-center gap-2 text-yellow-500">
                    <Lightbulb className="w-4 h-4" />Suggestions
                  </h4>
                 
    <ul className="space-y-2">
      {feedback.suggestions.map((item, idx) => (
        <li
          key={idx}
          className="flex items-start gap-2 text-sm text-muted-foreground"
        >
          <span className="text-yellow-500 mt-0.5 shrink-0">•</span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
                </Card>
              )}
            </>
          )}

          {/* Save card */}
          <Card className="bg-secondary/80 border-primary/20 shadow-card p-6 space-y-4">
            {/* Video info */}
            {videoBlob && (
              <div className="p-3 rounded-lg bg-muted/50 flex items-center gap-3">
                <Video className="w-4 h-4 text-primary" />
                <span className="text-sm">Recording ready ({(videoBlob.size / 1024 / 1024).toFixed(2)} MB · {formatTime(duration)})</span>
              </div>
            )}

            {/* Title input */}
            <div>
              <label className="text-sm font-medium mb-2 block">Interview Title</label>
              <Input
                value={interviewTitle}
                onChange={(e) => setInterviewTitle(e.target.value)}
                placeholder="Enter a title for this interview"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button variant="hero" size="lg" onClick={handleSave} disabled={isSaving || isDiscarding || !videoBlob} className="flex-1">
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