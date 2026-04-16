import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navigation } from "@/components/layout/Navigation";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { BackButton } from "@/components/layout/BackButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ArrowRight, Sparkles, Building2, Briefcase, Loader2, History, Video, Search, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { researchCompany, startInterview } from "@/services/interviewService";
import { addQuestionsList } from "@/services/questionsService";

export default function Prepare() {
  const navigate = useNavigate();
  const { userId } = useAuth();
  const [companyName, setCompanyName] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [isResearching, setIsResearching] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isStartingMock, setIsStartingMock] = useState(false);
  const [contextSummary, setContextSummary] = useState("");
  const { toast } = useToast();

  const validateInputs = () => {
    if (!companyName.trim() || !jobTitle.trim()) {
      toast({
        title: "Missing information",
        description: "Please provide both company name and job title to continue.",
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  const handleResearchCompany = async () => {
    if (!validateInputs()) return;
    setIsResearching(true);
    try {
      const result = await researchCompany(companyName, jobTitle);
      setContextSummary(result?.context_summary || result || "Research completed successfully.");
      toast({ title: "Research Complete!", description: "Company research has been gathered." });
    } catch (error) {
      console.error("Error researching company:", error);
      toast({ title: "Research Failed", description: "Failed to research company. Please try again.", variant: "destructive" });
    } finally {
      setIsResearching(false);
    }
  };

  const handleGenerateQuestions = async () => {
    if (!validateInputs() || !userId) return;
    setIsGenerating(true);
    try {
      const result = await addQuestionsList(userId, {
        company_name: companyName,
        job_title: jobTitle,
        context_summary: contextSummary,
      });
      const questions = result?.questions || [];
      toast({ title: "Questions Generated!", description: `${questions.length} personalized interview questions are ready.` });
      navigate("/interview-questions", { state: { questions, companyName, jobTitle, contextSummary } });
    } catch (error) {
      console.error("Error generating questions:", error);
      toast({ title: "Generation Failed", description: "Failed to generate questions. Please try again.", variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleStartMockInterview = async () => {
    if (!validateInputs() || !userId) return;
    setIsStartingMock(true);
    try {
      const result = await startInterview(userId, {
        company_name: companyName,
        job_title: jobTitle,
        context_summary: contextSummary,
      });
      toast({ title: "Interview Starting!", description: "Your mock interview is ready." });
      navigate("/mock-interview", {
        state: {
          companyName,
          jobTitle,
          contextSummary,
          interviewId: result?.interview_id || result?.id,
        },
      });
    } catch (error) {
      console.error("Error starting mock interview:", error);
      toast({ title: "Failed to Start", description: "Failed to start mock interview. Please try again.", variant: "destructive" });
    } finally {
      setIsStartingMock(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <Navigation />
      
      <main className="pt-24 pb-16 px-4">
        <div className="max-w-4xl mx-auto">
          <BackButton className="mb-6" />
          {/* Header */}
          <div className="text-center mb-12 animate-fade-in">
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-card/50 backdrop-blur-sm">
                <Sparkles className="w-4 h-4 text-accent" />
                <span className="text-sm font-medium">Interview Preparation</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/question-history")}
                className="flex items-center gap-2"
              >
                <History className="w-4 h-4" />
                History
              </Button>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Interview Preparation
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Enter company details to research and generate tailored interview questions.
            </p>
          </div>

          {/* Form Card */}
          <Card className="bg-secondary/80 border-border shadow-card p-8 animate-slide-up">
            <div className="space-y-6">
              {/* Company Name & Job Title */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <label className="flex items-center gap-2 text-sm font-medium">
                    <Building2 className="w-4 h-4 text-primary" />
                    Company Name *
                  </label>
                  <Input
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="e.g., Google, Microsoft"
                    className="bg-input"
                  />
                </div>
                <div className="space-y-3">
                  <label className="flex items-center gap-2 text-sm font-medium">
                    <Briefcase className="w-4 h-4 text-primary" />
                    Job Title *
                  </label>
                  <Input
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    placeholder="e.g., Senior Software Engineer"
                    className="bg-input"
                  />
                </div>
              </div>

              {/* Research Company Button */}
              {!contextSummary && (
                <Button
                  variant="hero"
                  size="lg"
                  className="w-full group"
                  onClick={handleResearchCompany}
                  disabled={isResearching}
                >
                  {isResearching ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin mr-2" />
                      Researching...
                    </>
                  ) : (
                    <>
                      <Search className="w-5 h-5 mr-2" />
                      Research Company
                      <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </Button>
              )}

              {/* Context Summary Preview */}
              {contextSummary && (
                <div className="space-y-4">
                  <div className="space-y-3">
                    <label className="flex items-center gap-2 text-sm font-medium">
                      <FileText className="w-4 h-4 text-primary" />
                      Research Summary
                    </label>
                    <div className="bg-muted/50 rounded-lg p-4 border border-border">
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {contextSummary}
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <Button
                      variant="hero"
                      size="lg"
                      className="w-full group"
                      onClick={handleGenerateQuestions}
                      disabled={isGenerating || isStartingMock}
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin mr-2" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-5 h-5 mr-2" />
                          Generate Questions
                          <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                    </Button>

                    <Button
                      variant="outline"
                      size="lg"
                      className="w-full group border-primary/30 hover:bg-primary hover:text-primary-foreground"
                      onClick={handleStartMockInterview}
                      disabled={isGenerating || isStartingMock}
                    >
                      {isStartingMock ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin mr-2" />
                          Starting...
                        </>
                      ) : (
                        <>
                          <Video className="w-5 h-5 mr-2" />
                          Start Mock Interview
                          <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Info Cards */}
          <div className="grid md:grid-cols-3 gap-6 mt-12">
            {[
              { icon: "🎯", title: "Personalized", desc: "Questions tailored to your specific role" },
              { icon: "🎥", title: "Mock Practice", desc: "AI-powered interview simulation" },
              { icon: "⚡", title: "Instant", desc: "Get results in seconds" },
            ].map((item, i) => (
              <Card key={i} className="p-6 text-center border-border bg-card/50 backdrop-blur-sm animate-slide-up"
                    style={{ animationDelay: `${i * 100}ms` }}>
                <div className="text-4xl mb-3">{item.icon}</div>
                <h3 className="font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </main>
      </div>
    </ProtectedRoute>
  );
}
