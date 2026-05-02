import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Navigation } from "@/components/layout/Navigation";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  Search,
  Calendar,
  Building2,
  Briefcase,
  FileText,
  Loader2,
  Download,
  Clock,
  Trash2,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { exportQuestionsToPDF } from "@/utils/pdfExport";
import {
  getQuestionsLists,
  deleteQuestionsList,
} from "@/services/questionsService";
import { getInterviews, deleteInterview } from "@/services/interviewService";

interface Question {
  id?: number | string;
  questions_list_id?: number | string;
  category?: string;
  difficulty?: string;
  question: string;
  tips?: string;
  tip?: string;
  sampleAnswer?: string;
  sample_answer?: string;
  answer?: string;
  created_at?: string;
  updated_at?: string;
}

interface QuestionHistoryEntry {
  id: string;
  job_title: string | null;
  company: string | null;
  job_description: string | null;
  questions: Question[];
  created_at: string;
}

interface InterviewHistoryEntry {
  id: string;
  title: string;
  company: string | null;
  job_title: string | null;
  duration_seconds: number | null;
  score: number | null;
  created_at: string;
}

export default function QuestionHistory() {
  const navigate = useNavigate();
  const { userId } = useAuth();
  const { toast } = useToast();

  const [questionHistory, setQuestionHistory] = useState<QuestionHistoryEntry[]>(
    []
  );
  const [interviewHistory, setInterviewHistory] = useState<
    InterviewHistoryEntry[]
  >([]);

  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("questions");

  useEffect(() => {
    if (userId) {
      fetchHistory();
    } else {
      setIsLoading(false);
    }
  }, [userId]);

const fetchHistory = async () => {
  if (!userId) return;

  setIsLoading(true);

  try {
    const [questions, interviews] = await Promise.allSettled([
      getQuestionsLists(userId),
      getInterviews(userId),
    ]);

    if (questions.status === "fulfilled") {
      const payload = Array.isArray(questions.value) ? questions.value : [];

      const parsedQuestions: QuestionHistoryEntry[] = payload.map((entry: any) => ({
        id: String(entry.id),
        job_title: entry.job_title || null,
        company: entry.company_name || entry.company || null,
        job_description: entry.context_summary || entry.job_description || null,
        created_at: entry.created_at || new Date().toISOString(),
        questions: Array.isArray(entry.questions)
          ? entry.questions.map((q: any) => ({
              id: q.id,
              questions_list_id: q.questions_list_id,
              category: q.category || "General",
              difficulty: q.difficulty || "Medium",
              question: q.question || "",
              tips: q.tips || "",
              sampleAnswer: q.sampleAnswer || q.sample_answer || q.answer || "",
              answer: q.answer || "",
              created_at: q.created_at,
              updated_at: q.updated_at,
            }))
          : [],
      }));

      setQuestionHistory(parsedQuestions);
    } else {
      console.error("Failed to fetch questions history:", questions.reason);
      setQuestionHistory([]);
    }

    if (interviews.status === "fulfilled") {
      const interviewPayload = Array.isArray(interviews.value?.payload)
        ? interviews.value.payload
        : Array.isArray(interviews.value)
        ? interviews.value
        : [];

      setInterviewHistory(interviewPayload);
    } else {
      console.error("Failed to fetch interview history:", interviews.reason);
      setInterviewHistory([]);
    }
  } catch (error) {
    console.error("Error fetching history:", error);

    toast({
      title: "Error",
      description: "Failed to load history",
      variant: "destructive",
    });
  } finally {
    setIsLoading(false);
  }
};

  const filteredQuestionHistory = questionHistory.filter((entry) => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) return true;

    return (
      entry.company?.toLowerCase().includes(query) ||
      entry.job_title?.toLowerCase().includes(query) ||
      entry.job_description?.toLowerCase().includes(query) ||
      entry.questions.some((q) => q.question?.toLowerCase().includes(query))
    );
  });

  const filteredInterviewHistory = interviewHistory.filter((entry) => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) return true;

    return (
      entry.company?.toLowerCase().includes(query) ||
      entry.job_title?.toLowerCase().includes(query) ||
      entry.title?.toLowerCase().includes(query)
    );
  });

  const handleReviewQuestions = (entry: QuestionHistoryEntry) => {
    navigate("/interview-questions", {
      state: {
        questions: entry.questions,
        companyName: entry.company,
        jobTitle: entry.job_title,
        contextSummary: entry.job_description,
      },
    });
  };

  const handleExportQuestionsPDF = (entry: QuestionHistoryEntry) => {
    exportQuestionsToPDF({
      title: entry.job_title || "Interview Questions",
      company: entry.company,
      jobTitle: entry.job_title,
      questions: entry.questions.map((q) => ({
        question: q.question,
        type: q.category || "General",
        difficulty: q.difficulty || "Medium",
        tip: q.tips || q.tip || "",
        sampleAnswer: q.sampleAnswer || q.sample_answer || q.answer || "",
      })),
      createdAt: entry.created_at,
    });

    toast({
      title: "PDF Exported",
      description: "Your questions have been downloaded as a PDF",
    });
  };

  const handleDeleteQuestion = async (id: string) => {
    try {
      await deleteQuestionsList(id);
    } catch (error) {
      console.error("Error deleting question set:", error);
    }

    setQuestionHistory((prev) => prev.filter((q) => q.id !== id));

    toast({
      title: "Deleted",
      description: "Question set has been deleted",
    });
  };

  const handleDeleteInterviewEntry = async (id: string) => {
    try {
      await deleteInterview(id);
    } catch (error) {
      console.error("Error deleting interview:", error);
    }

    setInterviewHistory((prev) => prev.filter((i) => i.id !== id));

    toast({
      title: "Deleted",
      description: "Interview has been deleted",
    });
  };

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return "N/A";

    return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
  };

  const formatDate = (date: string) => {
    try {
      return format(new Date(date), "MMM d, yyyy 'at' h:mm a");
    } catch {
      return "Unknown date";
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <Navigation />

        <main className="pt-24 pb-16 px-4">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center gap-4 mb-8 animate-fade-in">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/prepare")}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </div>

            <div className="mb-8 animate-fade-in">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                History
              </h1>
              <p className="text-xl text-muted-foreground">
                View and manage your past questions and interviews
              </p>
            </div>

            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="mb-8"
            >
              <TabsList className="grid w-full max-w-md grid-cols-2">
                <TabsTrigger value="questions">Questions</TabsTrigger>
                <TabsTrigger value="interviews">Interviews</TabsTrigger>
              </TabsList>

              <Card className="bg-secondary/80 border-primary/20 shadow-card p-4 mt-6 animate-slide-up">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by company, job title, or question..."
                    className="pl-10 bg-input"
                  />
                </div>
              </Card>

              <TabsContent value="questions" className="mt-6">
                <p className="text-sm text-muted-foreground mb-4">
                  Debug: {questionHistory.length} question sets loaded
                </p>

                {isLoading ? (
                  <div className="flex items-center justify-center py-16">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  </div>
                ) : filteredQuestionHistory.length === 0 ? (
                  <Card className="bg-secondary/80 border-primary/20 shadow-card p-12 text-center animate-slide-up">
                    <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />

                    <h3 className="text-xl font-semibold mb-2">
                      No Questions Found
                    </h3>

                    <p className="text-muted-foreground mb-6">
                      {searchQuery
                        ? "No results match your search"
                        : "Generate your first set of interview questions to get started"}
                    </p>

                    <Button
                      variant="hero"
                      onClick={() => navigate("/prepare")}
                    >
                      Generate Questions
                    </Button>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {filteredQuestionHistory.map((entry, index) => (
                      <Card
                        key={entry.id}
                        className="bg-secondary/80 border-primary/20 shadow-card p-6 animate-slide-up"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex flex-wrap items-center gap-2 mb-2">
                              {entry.company && (
                                <Badge
                                  variant="secondary"
                                  className="flex items-center gap-1"
                                >
                                  <Building2 className="w-3 h-3" />
                                  {entry.company}
                                </Badge>
                              )}

                              {entry.job_title && (
                                <Badge
                                  variant="outline"
                                  className="flex items-center gap-1"
                                >
                                  <Briefcase className="w-3 h-3" />
                                  {entry.job_title}
                                </Badge>
                              )}

                              <Badge
                                variant="outline"
                                className="flex items-center gap-1"
                              >
                                <FileText className="w-3 h-3" />
                                {entry.questions.length} questions
                              </Badge>
                            </div>

                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Calendar className="w-4 h-4" />
                              {formatDate(entry.created_at)}
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleReviewQuestions(entry)}
                            >
                              <FileText className="w-4 h-4 mr-2" />
                              Review
                            </Button>

                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleExportQuestionsPDF(entry)}
                            >
                              <Download className="w-4 h-4 mr-2" />
                              PDF
                            </Button>

                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteQuestion(entry.id)}
                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="interviews" className="mt-6">
                {isLoading ? (
                  <div className="flex items-center justify-center py-16">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  </div>
                ) : filteredInterviewHistory.length === 0 ? (
                  <Card className="bg-secondary/80 border-primary/20 shadow-card p-12 text-center animate-slide-up">
                    <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />

                    <h3 className="text-xl font-semibold mb-2">
                      No Interviews Found
                    </h3>

                    <p className="text-muted-foreground mb-6">
                      {searchQuery
                        ? "No results match your search"
                        : "Complete your first mock interview to see it here"}
                    </p>

                    <Button
                      variant="hero"
                      onClick={() => navigate("/prepare")}
                    >
                      Start Interview
                    </Button>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {filteredInterviewHistory.map((entry, index) => (
                      <Card
                        key={entry.id}
                        className="bg-secondary/80 border-primary/20 shadow-card p-6 animate-slide-up"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex flex-wrap items-center gap-2 mb-2">
                              {entry.company && (
                                <Badge
                                  variant="secondary"
                                  className="flex items-center gap-1"
                                >
                                  <Building2 className="w-3 h-3" />
                                  {entry.company}
                                </Badge>
                              )}

                              {entry.job_title && (
                                <Badge
                                  variant="outline"
                                  className="flex items-center gap-1"
                                >
                                  <Briefcase className="w-3 h-3" />
                                  {entry.job_title}
                                </Badge>
                              )}

                              {entry.duration_seconds && (
                                <Badge
                                  variant="outline"
                                  className="flex items-center gap-1"
                                >
                                  <Clock className="w-3 h-3" />
                                  {formatDuration(entry.duration_seconds)}
                                </Badge>
                              )}
                            </div>

                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Calendar className="w-4 h-4" />
                              {formatDate(entry.created_at)}
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                navigate("/interviews-library", {
                                  state: { interviewId: entry.id },
                                })
                              }
                            >
                              <FileText className="w-4 h-4 mr-2" />
                              Review
                            </Button>

                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                handleDeleteInterviewEntry(entry.id)
                              }
                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}