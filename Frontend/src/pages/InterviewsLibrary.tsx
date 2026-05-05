import { useState, useEffect } from "react";
import { Navigation } from "@/components/layout/Navigation";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { BackButton } from "@/components/layout/BackButton";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import {
  Video,
  Calendar,
  Clock,
  Star,
  Play,
  ChevronDown,
  ChevronUp,
  Trash2,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  getInterviews,
  getInterview,
  deleteInterview,
} from "@/services/interviewService";

interface Feedback {
  summary?: string;
  score?: number;
  strengths?: string[];
  weaknesses?: string[];
  suggestions?: string[];
}

interface InterviewArchive {
  id: string;
  interview_title: string;
  company_name: string;
  job_title: string;
  created_at: string;
  feedback: string | Feedback | null;

  transcript?: string | null;
  video_path?: string | null;
  video_url?: string | null;
  question_count?: number | null;
}

const parseFeedback = (feedback: string | Feedback | null): Feedback | null => {
  if (!feedback) return null;

  if (typeof feedback === "object") {
    return feedback;
  }

  try {
    return JSON.parse(feedback);
  } catch (error) {
    console.error("Invalid feedback JSON:", error);
    return null;
  }
};

const InterviewsLibrary = () => {
  const { userId } = useAuth();
  const { toast } = useToast();

  const [interviews, setInterviews] = useState<InterviewArchive[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [loadingDetailsId, setLoadingDetailsId] = useState<string | null>(null);

  useEffect(() => {
    if (userId) {
      fetchInterviewsData();
    }
  }, [userId]);

  const fetchInterviewsData = async () => {
    if (!userId) return;

    setLoading(true);

    try {
      const data = await getInterviews(userId);
      setInterviews(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching interviews:", error);

      toast({
        title: "Error",
        description: "Failed to load interview archives",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExpand = async (interviewId: string) => {
    if (expandedId === interviewId) {
      setExpandedId(null);
      return;
    }

    setExpandedId(interviewId);

    const existingInterview = interviews.find(
      (interview) => String(interview.id) === String(interviewId)
    );

    if (existingInterview?.video_url || existingInterview?.transcript) {
      return;
    }

    setLoadingDetailsId(interviewId);

    try {
      const detailedInterview = await getInterview(interviewId);

      setInterviews((prev) =>
        prev.map((interview) =>
          String(interview.id) === String(interviewId)
            ? {
                ...interview,
                ...detailedInterview,
                id: String(detailedInterview.id),
              }
            : interview
        )
      );
    } catch (error) {
      console.error("Error fetching interview details:", error);

      toast({
        title: "Error",
        description: "Failed to load interview details",
        variant: "destructive",
      });
    } finally {
      setLoadingDetailsId(null);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteInterview(id);

      setInterviews((prev) =>
        prev.filter((interview) => String(interview.id) !== String(id))
      );

      toast({
        title: "Deleted",
        description: "Interview removed from library",
      });
    } catch (error) {
      console.error("Error deleting interview:", error);

      toast({
        title: "Error",
        description: "Failed to delete interview",
        variant: "destructive",
      });
    }
  };

  const renderFeedback = (feedback: string | Feedback | null) => {
    const parsedFeedback = parseFeedback(feedback);

    if (!parsedFeedback) {
      return (
        <p className="text-sm text-muted-foreground">No feedback available</p>
      );
    }

    return (
      <div className="space-y-4">
        {parsedFeedback.score !== undefined && (
          <div>
            <span className="text-sm font-medium">Score:</span>
            <p className="text-sm text-muted-foreground">
              {parsedFeedback.score}/100
            </p>
          </div>
        )}

        {parsedFeedback.summary && (
          <div>
            <span className="text-sm font-medium">Summary:</span>
            <p className="text-sm text-muted-foreground">
              {parsedFeedback.summary}
            </p>
          </div>
        )}

        {parsedFeedback.strengths && parsedFeedback.strengths.length > 0 && (
          <div>
            <span className="text-sm font-medium">Strengths:</span>
            <ul className="list-disc list-inside text-sm text-muted-foreground">
              {parsedFeedback.strengths.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>
        )}

        {parsedFeedback.weaknesses && parsedFeedback.weaknesses.length > 0 && (
          <div>
            <span className="text-sm font-medium">Weaknesses:</span>
            <ul className="list-disc list-inside text-sm text-muted-foreground">
              {parsedFeedback.weaknesses.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>
        )}

        {parsedFeedback.suggestions && parsedFeedback.suggestions.length > 0 && (
          <div>
            <span className="text-sm font-medium">Suggestions:</span>
            <ul className="list-disc list-inside text-sm text-muted-foreground">
              {parsedFeedback.suggestions.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };

  const renderEmotionAnalysis = (transcript?: string | null) => {
    if (!transcript) {
      return (
        <p className="text-sm text-muted-foreground">
          No emotion data available
        </p>
      );
    }

    const emotionLines = transcript
      .split("\n")
      .filter((line) => line.toLowerCase().startsWith("emotion"));

    if (emotionLines.length === 0) {
      return (
        <p className="text-sm text-muted-foreground">
          No emotion data available
        </p>
      );
    }

    return (
      <div className="space-y-2">
        {emotionLines.map((line, index) => (
          <div key={index} className="text-sm text-muted-foreground">
            {line}
          </div>
        ))}
      </div>
    );
  };

  const getScore = (feedback: string | Feedback | null) => {
    const parsedFeedback = parseFeedback(feedback);
    return parsedFeedback?.score;
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <Navigation />

        <main className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <BackButton className="mb-6" />

          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Interviews Library</h1>
            <p className="text-muted-foreground">
              Review your past mock interviews, recordings, AI feedback, and
              emotion analysis
            </p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : interviews.length === 0 ? (
            <Card className="bg-secondary/80 border-primary/20 shadow-card p-12 text-center">
              <Video className="w-16 h-16 text-muted-foreground mx-auto mb-4" />

              <h3 className="text-xl font-semibold mb-2">No interviews yet</h3>

              <p className="text-muted-foreground mb-4">
                Complete a mock interview to see it here
              </p>

              <Button
                variant="hero"
                onClick={() => {
                  window.location.href = "/mock-interview";
                }}
              >
                Start Mock Interview
              </Button>
            </Card>
          ) : (
            <div className="space-y-4">
              {interviews.map((interview) => {
                const score = getScore(interview.feedback);
                const isExpanded = expandedId === String(interview.id);

                return (
                  <Card
                    key={interview.id}
                    className="bg-secondary/80 border-primary/20 shadow-card overflow-hidden"
                  >
                    <div className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold">
                              {interview.interview_title || "Mock Interview"}
                            </h3>

                            {score !== undefined && (
                              <Badge
                                variant="secondary"
                                className="flex items-center gap-1"
                              >
                                <Star className="w-3 h-3" />
                                {score}/100
                              </Badge>
                            )}
                          </div>

                          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                            {interview.job_title && (
                              <span>{interview.job_title}</span>
                            )}

                            {interview.company_name && (
                              <span>@ {interview.company_name}</span>
                            )}

                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {new Date(interview.created_at).toLocaleDateString()}
                            </span>

                            {interview.question_count && (
                              <span className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                {interview.question_count} questions
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleExpand(String(interview.id))}
                          >
                            {isExpanded ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </Button>

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>

                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Delete Interview?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will permanently remove this interview
                                  from your library.
                                </AlertDialogDescription>
                              </AlertDialogHeader>

                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() =>
                                    handleDelete(String(interview.id))
                                  }
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="mt-6 space-y-6 animate-slide-up">
                          {loadingDetailsId === String(interview.id) ? (
                            <div className="flex items-center justify-center py-10">
                              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                            </div>
                          ) : (
                            <>
                              {interview.video_url ? (
                                <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                                  <video
                                    src={interview.video_url}
                                    controls
                                    preload="metadata"
                                    className="w-full h-full object-contain"
                                  />
                                </div>
                              ) : (
                                <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                                  <div className="text-center text-muted-foreground">
                                    <Play className="w-12 h-12 mx-auto mb-2" />
                                    <p>Recording not available</p>
                                  </div>
                                </div>
                              )}

                              <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                  <h4 className="font-semibold mb-3">
                                    AI Feedback
                                  </h4>

                                  <div className="bg-muted/50 rounded-lg p-4 min-h-[120px]">
                                    {renderFeedback(interview.feedback)}
                                  </div>
                                </div>

                                <div>
                                  <h4 className="font-semibold mb-3">
                                    Emotion Analysis
                                  </h4>

                                  <div className="bg-muted/50 rounded-lg p-4 min-h-[120px]">
                                    {renderEmotionAnalysis(interview.transcript)}
                                  </div>
                                </div>
                              </div>

                              {interview.transcript && (
                                <div>
                                  <h4 className="font-semibold mb-3">
                                    Transcript
                                  </h4>

                                  <div className="bg-muted/50 rounded-lg p-4 max-h-64 overflow-y-auto">
                                    <p className="text-sm whitespace-pre-wrap">
                                      {interview.transcript}
                                    </p>
                                  </div>
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
};

export default InterviewsLibrary;
