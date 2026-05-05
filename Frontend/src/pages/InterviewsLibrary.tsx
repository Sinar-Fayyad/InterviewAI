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
  MessageSquare,
  CheckCircle,
  XCircle,
  Lightbulb,
  FileText,
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

  user_id?: string | number;
  context_summary?: string | null;
  transcript?: string | null;

  recording_url?: string | null;
  video_path?: string | null;
  video_url?: string | null;

  question_count?: number | null;
  updated_at?: string | null;
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

const scoreColor = (score: number) => {
  if (score >= 80) return "text-green-500";
  if (score >= 50) return "text-yellow-500";
  return "text-red-500";
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

      const normalizedData = Array.isArray(data)
        ? data.map((interview) => ({
            ...interview,
            id: String(interview.id),
            recording_url:
              interview.recording_url ||
              interview.video_url ||
              interview.video_path ||
              null,
          }))
        : [];

      setInterviews(normalizedData);
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

    if (
      existingInterview?.recording_url ||
      existingInterview?.video_url ||
      existingInterview?.transcript
    ) {
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
                recording_url:
                  detailedInterview.video_url ||
                  detailedInterview.recording_url ||
                  detailedInterview.video_path ||
                  interview.recording_url ||
                  null,
                video_url:
                  detailedInterview.video_url ||
                  interview.video_url ||
                  null,
                video_path:
                  detailedInterview.video_path ||
                  interview.video_path ||
                  null,
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

      if (expandedId === id) {
        setExpandedId(null);
      }

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

  const getScore = (feedback: string | Feedback | null) => {
    const parsedFeedback = parseFeedback(feedback);
    return parsedFeedback?.score;
  };

  const getVideoSource = (interview: InterviewArchive) => {
    return (
      interview.recording_url ||
      interview.video_url ||
      interview.video_path ||
      null
    );
  };

  const renderTranscript = (transcript?: string | null) => {
    if (!transcript) return null;

    const lines = transcript
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    if (lines.length === 0) return null;

    return (
      <Card className="bg-secondary/80 border-primary/20 shadow-card p-5">
        <h4 className="font-semibold mb-4 flex items-center gap-2">
          <FileText className="w-4 h-4 text-primary" />
          Transcript
        </h4>

        <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
          {lines.map((line, index) => {
            const lower = line.toLowerCase();

            if (lower.startsWith("question")) {
              return (
                <div
                  key={index}
                  className="rounded-lg bg-primary/5 border border-primary/10 p-3"
                >
                  <p className="text-xs font-semibold text-primary mb-1">
                    Question
                  </p>
                  <p className="text-sm text-foreground">
                    {line.replace(/^question\d*:\s*/i, "")}
                  </p>
                </div>
              );
            }

            if (lower.startsWith("answer")) {
              const answerText = line.replace(/^answer\d*:\s*/i, "");

              return (
                <div
                  key={index}
                  className="rounded-lg bg-background/70 border border-border p-3"
                >
                  <p className="text-xs font-semibold text-muted-foreground mb-1">
                    Answer
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {answerText || "No answer provided"}
                  </p>
                </div>
              );
            }

            if (lower.startsWith("emotion")) {
              return null;
            }

            return (
              <p key={index} className="text-sm text-muted-foreground">
                {line}
              </p>
            );
          })}
        </div>
      </Card>
    );
  };

  const renderExpandedContent = (interview: InterviewArchive) => {
    const parsedFeedback = parseFeedback(interview.feedback);
    const score = parsedFeedback?.score || 0;
    const videoSource = getVideoSource(interview);

    return (
      <div className="mt-6 space-y-6 animate-slide-up">
        {loadingDetailsId === String(interview.id) ? (
          <div className="flex items-center justify-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : (
          <>
            {/* Video section - old working style */}
            {videoSource ? (
              <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                <video
                  src={videoSource}
                  controls
                  preload="metadata"
                  className="w-full h-full"
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

            {!parsedFeedback ? (
              <Card className="bg-secondary/80 border-primary/20 shadow-card p-5">
                <p className="text-sm text-muted-foreground">
                  No feedback available
                </p>
              </Card>
            ) : (
              <>
                {/* Score + Summary full width */}
                <Card className="bg-secondary/80 border-primary/20 shadow-card p-6">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                    <div className="relative w-28 h-28 shrink-0">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle
                          cx="56"
                          cy="56"
                          r="48"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="10"
                          className="text-muted"
                        />
                        <circle
                          cx="56"
                          cy="56"
                          r="48"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="10"
                          strokeLinecap="round"
                          className={scoreColor(score)}
                          strokeDasharray={`${score * 3.015} 301.5`}
                        />
                      </svg>

                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span
                          className={`text-3xl font-bold ${scoreColor(score)}`}
                        >
                          {score}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          Score
                        </span>
                      </div>
                    </div>

                    <div className="flex-1">
                      <h4 className="font-semibold mb-2 flex items-center gap-2 text-base">
                        <MessageSquare className="w-4 h-4 text-blue-500" />
                        Overall Summary
                      </h4>

                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {parsedFeedback.summary || "No summary available"}
                      </p>
                    </div>
                  </div>
                </Card>

                {/* Strengths + Weaknesses */}
                <div className="grid md:grid-cols-2 gap-4">
                  {parsedFeedback.strengths &&
                    parsedFeedback.strengths.length > 0 && (
                      <Card className="bg-secondary/80 border-green-500/20 shadow-card p-5">
                        <h4 className="font-semibold mb-3 flex items-center gap-2 text-green-500">
                          <CheckCircle className="w-4 h-4" />
                          Strengths
                        </h4>

                        <ul className="space-y-2">
                          {parsedFeedback.strengths.map((item, index) => (
                            <li
                              key={index}
                              className="flex items-start gap-2 text-sm text-muted-foreground"
                            >
                              <span className="text-green-500 mt-0.5">•</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </Card>
                    )}

                  {parsedFeedback.weaknesses &&
                    parsedFeedback.weaknesses.length > 0 && (
                      <Card className="bg-secondary/80 border-red-500/20 shadow-card p-5">
                        <h4 className="font-semibold mb-3 flex items-center gap-2 text-red-500">
                          <XCircle className="w-4 h-4" />
                          Areas for Improvement
                        </h4>

                        <ul className="space-y-2">
                          {parsedFeedback.weaknesses.map((item, index) => (
                            <li
                              key={index}
                              className="flex items-start gap-2 text-sm text-muted-foreground"
                            >
                              <span className="text-red-500 mt-0.5">•</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </Card>
                    )}
                </div>

                {/* Suggestions */}
                {parsedFeedback.suggestions &&
                  parsedFeedback.suggestions.length > 0 && (
                    <Card className="bg-secondary/80 border-yellow-500/20 shadow-card p-5">
                      <h4 className="font-semibold mb-3 flex items-center gap-2 text-yellow-500">
                        <Lightbulb className="w-4 h-4" />
                        Suggestions
                      </h4>

                    <ul className="space-y-2">
  {parsedFeedback.suggestions.map((item, index) => (
    <li
      key={index}
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

            {renderTranscript(interview.transcript)}
          </>
        )}
      </div>
    );
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
              Review your past mock interviews, recordings, and AI feedback
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
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-3 mb-2">
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

                            {interview.created_at && (
                              <span className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                {new Date(
                                  interview.created_at
                                ).toLocaleDateString()}
                              </span>
                            )}

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

                      {isExpanded && renderExpandedContent(interview)}
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