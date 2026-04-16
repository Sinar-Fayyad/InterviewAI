import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Navigation } from "@/components/layout/Navigation";
import { ArrowLeft } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, RefreshCw, Download, ChevronDown, ChevronUp, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { addQuestionsList } from "@/services/questionsService";
import jsPDF from "jspdf";

interface Question {
  id: number;
  category: string;
  difficulty: string;
  question: string;
  tips: string;
  sampleAnswer?: string;
}

interface LocationState {
  questions?: Question[];
  companyName?: string;
  jobTitle?: string;
  contextSummary?: string;
}

export default function InterviewQuestions() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const { userId } = useAuth();
  const state = location.state as LocationState | null;
  
  const [questions, setQuestions] = useState<Question[]>(state?.questions || []);
  const [companyName] = useState(state?.companyName || "");
  const [jobTitle] = useState(state?.jobTitle || "");
  const [contextSummary] = useState(state?.contextSummary || "");
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [loading, setLoading] = useState(!state?.questions);
  const [isGeneratingNew, setIsGeneratingNew] = useState(false);

  useEffect(() => {
    if (!state?.questions) {
      setLoading(false);
    }
  }, [state]);

  const handleStartMock = () => {
    navigate("/mock-interview", { state: { questions, companyName, jobTitle } });
  };

  const handleViewHistory = () => {
    navigate("/question-history");
  };

  const handleGenerateNew = async () => {
    if (!companyName || !jobTitle || !userId) {
      toast({ title: "Missing Information", description: "Company name and job title are required to generate new questions", variant: "destructive" });
      navigate("/prepare");
      return;
    }

    setIsGeneratingNew(true);
    try {
      const result = await addQuestionsList(userId, {
        company_name: companyName,
        job_title: jobTitle,
        context_summary: contextSummary,
      });
      
      setQuestions(result?.questions || []);
      toast({ title: "New Questions Generated", description: `Generated ${result?.questions?.length || 0} new questions` });
    } catch (error) {
      toast({ title: "Error", description: "Failed to generate new questions", variant: "destructive" });
    } finally {
      setIsGeneratingNew(false);
    }
  };

  const handleCopyQA = () => {
    const text = questions.map((q, i) => 
      `Q${i + 1}: ${q.question}\nCategory: ${q.category} | Difficulty: ${q.difficulty}\nTips: ${q.tips}${q.sampleAnswer ? `\nSample Answer: ${q.sampleAnswer}` : ''}\n`
    ).join("\n");
    navigator.clipboard.writeText(text);
    toast({ title: "Copied!", description: "Questions and answers copied to clipboard" });
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const contentWidth = pageWidth - margin * 2;
    let yPos = 20;

    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    const title = companyName && jobTitle ? `Interview Questions - ${companyName}` : "Interview Questions";
    doc.text(title, margin, yPos);
    yPos += 10;

    if (jobTitle) {
      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100);
      doc.text(jobTitle, margin, yPos);
      yPos += 15;
    } else {
      yPos += 10;
    }

    doc.setTextColor(0);
    questions.forEach((q, index) => {
      if (yPos > 250) { doc.addPage(); yPos = 20; }
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      const questionText = `${index + 1}. ${q.question}`;
      const lines = doc.splitTextToSize(questionText, contentWidth);
      doc.text(lines, margin, yPos);
      yPos += lines.length * 5 + 3;

      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100);
      doc.text(`Category: ${q.category}  |  Difficulty: ${q.difficulty}`, margin, yPos);
      yPos += 5;

      if (q.tips) {
        doc.setFontSize(9);
        doc.setFont("helvetica", "italic");
        doc.setTextColor(80);
        const tipLines = doc.splitTextToSize(`Tips: ${q.tips}`, contentWidth);
        doc.text(tipLines, margin, yPos);
        yPos += tipLines.length * 4 + 3;
      }

      if (q.sampleAnswer) {
        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(60);
        const answerLines = doc.splitTextToSize(`Sample Answer: ${q.sampleAnswer}`, contentWidth);
        doc.text(answerLines, margin, yPos);
        yPos += answerLines.length * 4 + 5;
      }

      doc.setTextColor(0);
      yPos += 8;
    });

    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text(`Page ${i} of ${pageCount} - Generated by InterviewAI`, pageWidth / 2, 290, { align: "center" });
    }

    const safeCompany = companyName ? companyName.replace(/[^a-z0-9]/gi, "_") : "Questions";
    const safeJob = jobTitle ? jobTitle.replace(/[^a-z0-9]/gi, "_") : "";
    doc.save(`Interview_Questions_${safeCompany}${safeJob ? `_${safeJob}` : ''}.pdf`);
    toast({ title: "Exported!", description: "PDF downloaded successfully" });
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case "easy": return "bg-green-500/10 text-green-600 border-green-500/20";
      case "medium": return "bg-yellow-500/10 text-yellow-600 border-yellow-500/20";
      case "hard": return "bg-red-500/10 text-red-600 border-red-500/20";
      default: return "";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="pt-24 pb-16 px-4 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-page-solid">
      <Navigation />
      <main className="pt-24 pb-16 px-4">
        <div className="max-w-4xl mx-auto">
          <Button variant="ghost" size="sm" onClick={() => window.history.back()} className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />Back
          </Button>
          <div className="mb-12 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-card/50 backdrop-blur-sm mb-6">
              <Sparkles className="w-4 h-4 text-accent" />
              <span className="text-sm font-medium">AI Generated Questions</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Your Interview Questions</h1>
            <p className="text-xl text-muted-foreground">
              {companyName && jobTitle ? `${questions.length} questions for ${jobTitle} at ${companyName}` : `${questions.length} personalized questions based on your job description`}
            </p>
          </div>

          {questions.length > 0 && (
            <div className="flex flex-wrap gap-4 mb-8">
              <Button variant="outline" size="lg" onClick={handleGenerateNew} disabled={isGeneratingNew}>
                {isGeneratingNew ? (<><RefreshCw className="w-4 h-4 mr-2 animate-spin" />Generating...</>) : (<><RefreshCw className="w-4 h-4 mr-2" />Generate New</>)}
              </Button>
              <Button variant="outline" size="lg" onClick={handleExportPDF}><Download className="w-4 h-4 mr-2" />Export</Button>
              <Button variant="outline" size="lg" onClick={handleCopyQA}><Copy className="w-4 h-4 mr-2" />Copy Q&A</Button>
            </div>
          )}

          {questions.length > 0 ? (
            <div className="space-y-6">
              {questions.map((q, index) => (
                <Card key={q.id} className="bg-secondary/80 border-primary/20 shadow-card p-6 animate-slide-up hover:shadow-glow transition-smooth" style={{ animationDelay: `${index * 100}ms` }}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex gap-2">
                      <Badge variant="secondary">{q.category}</Badge>
                      <Badge variant="outline" className={getDifficultyColor(q.difficulty)}>{q.difficulty}</Badge>
                    </div>
                    <span className="text-muted-foreground text-sm">Q{index + 1}</span>
                  </div>
                  <h3 className="text-lg font-semibold mb-4 leading-relaxed">{q.question}</h3>
                  <div className="bg-muted/50 rounded-lg p-4 mb-4">
                    <p className="text-sm text-muted-foreground"><strong className="text-foreground">💡 Tips: </strong>{q.tips}</p>
                  </div>
                  {q.sampleAnswer && (
                    <div className="mb-4">
                      <Button variant="ghost" size="sm" onClick={() => setExpandedId(expandedId === q.id ? null : q.id)} className="mb-2">
                        {expandedId === q.id ? (<><ChevronUp className="w-4 h-4 mr-2" />Hide Sample Answer</>) : (<><ChevronDown className="w-4 h-4 mr-2" />Show Sample Answer</>)}
                      </Button>
                      {expandedId === q.id && (
                        <div className="bg-primary/5 rounded-lg p-4 animate-slide-up">
                          <p className="text-sm leading-relaxed">{q.sampleAnswer}</p>
                        </div>
                      )}
                    </div>
                  )}
                </Card>
              ))}
            </div>
          ) : (
            <Card className="bg-secondary/80 border-primary/20 shadow-card p-12 text-center">
              <Sparkles className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Questions Yet</h3>
              <p className="text-muted-foreground mb-6">Generate interview questions from a job description to get started</p>
              <Button variant="hero" onClick={() => navigate('/prepare')}>Generate Questions</Button>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
