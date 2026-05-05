import { useState, useEffect } from "react";
import { Navigation } from "@/components/layout/Navigation";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { BackButton } from "@/components/layout/BackButton";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Video, Calendar, Clock, Star, Play, ChevronDown, ChevronUp, Trash2 } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { getInterviews, deleteInterview } from "@/services/interviewService";

interface InterviewArchive {
  id: string;
  title: string;
  job_title: string | null;
  company: string | null;
  recording_url: string | null;
  duration_seconds: number | null;
  feedback: unknown;
  emotion_analysis: unknown;
  transcript: string | null;
  score: number | null;
  created_at: string;
}

const InterviewsLibrary = () => {
  const { userId } = useAuth();
  const { toast } = useToast();
  const [interviews, setInterviews] = useState<InterviewArchive[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    if (userId) fetchInterviewsData();
  }, [userId]);

  const fetchInterviewsData = async () => {
    if (!userId) return;
    try {
      const data = await getInterviews(userId);
      setInterviews(data || []);
    } catch (error) {
      console.error("Error fetching interviews:", error);
      toast({ title: "Error", description: "Failed to load interview archives", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteInterview(id);
      setInterviews(interviews.filter(i => i.id !== id));
      toast({ title: "Deleted", description: "Interview removed from library" });
    } catch (error) {
      console.error("Error deleting interview:", error);
      toast({ title: "Error", description: "Failed to delete interview", variant: "destructive" });
    }
  };

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return "N/A";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <BackButton className="mb-6" />
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Interviews Library</h1>
            <p className="text-muted-foreground">Review your past mock interviews and feedback</p>
          </div>
          {loading ? (
            <div className="flex items-center justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>
          ) : interviews.length === 0 ? (
            <Card className="bg-secondary/80 border-primary/20 shadow-card p-12 text-center">
              <Video className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No interviews yet</h3>
              <p className="text-muted-foreground mb-4">Complete a mock interview to see it here</p>
              <Button variant="hero" onClick={() => window.location.href = "/mock-interview"}>Start Mock Interview</Button>
            </Card>
          ) : (
            <div className="space-y-4">
              {interviews.map((interview) => (
                <Card key={interview.id} className="bg-secondary/80 border-primary/20 shadow-card overflow-hidden">
                  <div className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold">{interview.title}</h3>
                          {interview.score && <Badge variant="secondary" className="flex items-center gap-1"><Star className="w-3 h-3" />{interview.score}/100</Badge>}
                        </div>
                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                          {interview.job_title && <span>{interview.job_title}</span>}
                          {interview.company && <span>@ {interview.company}</span>}
                          <span className="flex items-center gap-1"><Calendar className="w-4 h-4" />{new Date(interview.created_at).toLocaleDateString()}</span>
                          <span className="flex items-center gap-1"><Clock className="w-4 h-4" />{formatDuration(interview.duration_seconds)}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" onClick={() => setExpandedId(expandedId === interview.id ? null : interview.id)}>
                          {expandedId === interview.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild><Button variant="ghost" size="sm" className="text-destructive hover:text-destructive"><Trash2 className="w-4 h-4" /></Button></AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader><AlertDialogTitle>Delete Interview?</AlertDialogTitle><AlertDialogDescription>This will permanently remove this interview from your library.</AlertDialogDescription></AlertDialogHeader>
                            <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => handleDelete(interview.id)}>Delete</AlertDialogAction></AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                    {expandedId === interview.id && (
                      <div className="mt-6 space-y-6 animate-slide-up">
                        {interview.recording_url ? (
                          <div className="aspect-video bg-muted rounded-lg overflow-hidden"><video src={interview.recording_url} controls className="w-full h-full" /></div>
                        ) : (
                          <div className="aspect-video bg-muted rounded-lg flex items-center justify-center"><div className="text-center text-muted-foreground"><Play className="w-12 h-12 mx-auto mb-2" /><p>Recording not available</p></div></div>
                        )}
                        <div className="grid md:grid-cols-2 gap-6">
                          <div><h4 className="font-semibold mb-3">AI Feedback</h4><div className="bg-muted/50 rounded-lg p-4 space-y-3">
                            {interview.feedback && typeof interview.feedback === 'object' && Object.keys(interview.feedback as object).length > 0 ? Object.entries(interview.feedback as Record<string, unknown>).map(([key, value]) => (<div key={key}><span className="text-sm font-medium capitalize">{key.replace(/_/g, " ")}:</span><p className="text-sm text-muted-foreground">{String(value)}</p></div>)) : <p className="text-sm text-muted-foreground">No feedback available</p>}
                          </div></div>
                          <div><h4 className="font-semibold mb-3">Emotion Analysis</h4><div className="bg-muted/50 rounded-lg p-4 space-y-3">
                            {interview.emotion_analysis && typeof interview.emotion_analysis === 'object' && Object.keys(interview.emotion_analysis as object).length > 0 ? Object.entries(interview.emotion_analysis as Record<string, unknown>).map(([key, value]) => (<div key={key} className="flex justify-between items-center"><span className="text-sm capitalize">{key}</span><Badge variant="outline">{String(value)}%</Badge></div>)) : <p className="text-sm text-muted-foreground">No emotion data available</p>}
                          </div></div>
                        </div>
                        {interview.transcript && (<div><h4 className="font-semibold mb-3">Transcript</h4><div className="bg-muted/50 rounded-lg p-4 max-h-48 overflow-y-auto"><p className="text-sm whitespace-pre-wrap">{interview.transcript}</p></div></div>)}
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
};

export default InterviewsLibrary;
