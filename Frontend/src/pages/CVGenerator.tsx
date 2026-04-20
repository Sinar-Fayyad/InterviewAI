import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Navigation } from "@/components/layout/Navigation";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FileText, Upload, Sparkles, CheckCircle, Wand2, Loader2, Linkedin, Github } from "lucide-react";
import { extractTextFromPdf } from "@/utils/pdfTextExtract";
import { useToast } from "@/hooks/use-toast";
import { useErrorHandler } from "@/hooks/useErrorHandler";
import { useAuth } from "@/hooks/useAuth";
import { fetchProfile } from "@/services/profileService";
import { generateResume, optimizeResume } from "@/services/documentService";

export default function CVGenerator() {
  const [mode, setMode] = useState<"choose" | "generate" | "optimize">("choose");
  const [cvText, setCvText] = useState("");
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [isExtractingText, setIsExtractingText] = useState(false);
  const { userId } = useAuth();
  const navigate = useNavigate();
  const [hasProfile, setHasProfile] = useState<boolean | null>(null);

  useEffect(() => {
    const checkProfile = async () => {
      if (!userId) return;
      try {
        const data = await fetchProfile(userId);
        setHasProfile(!!(data && data.full_name && data.email));
      } catch {
        setHasProfile(false);
      }
    };
    checkProfile();
  }, [userId]);

  const handleFileUpload = async (file: File | null) => {
    if (!file) return;
    if (file.type !== "application/pdf") {
      toast({ title: "Invalid File Type", description: "Please upload a PDF file.", variant: "destructive" });
      return;
    }
    setCvFile(file);
    setIsExtractingText(true);
    try {
      const text = await extractTextFromPdf(file);
      setCvText(text);
      toast({ title: "File Uploaded", description: `Text extracted from ${file.name} successfully.` });
    } catch {
      toast({ title: "Extraction Failed", description: "Could not extract text from the PDF. Please paste your text manually.", variant: "destructive" });
      setCvFile(null);
      setCvText("");
    } finally {
      setIsExtractingText(false);
    }
  };

  const { handleError } = useErrorHandler();
  const { toast } = useToast();

  const handleGenerateCV = async () => {
    if (!hasProfile) {
      toast({ title: "Complete Your Profile", description: "Please fill out your profile information to generate documents.", variant: "destructive" });
      navigate("/profile");
      return;
    }
    if (!userId) return;

    setIsGenerating(true);
    try {
      const result = await generateResume(userId, {
        linkedin_account: linkedinUrl || undefined,
        github_account: githubUrl || undefined,
      });
      toast({ title: "Resume Generated", description: "Your Resume has been generated successfully." });
      navigate("/cv-output", { state: { cvData: result } });
    } catch (error) {
      console.error("Error generating CV:", error);
      handleError(error, "Resume Generation");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleOptimizeCV = async () => {
    if (!cvText && !cvFile) {
      toast({ title: "Missing Content", description: "Please upload a PDF or paste your Resume text.", variant: "destructive" });
      return;
    }
    if (!userId) return;

    setIsOptimizing(true);
    try {
      const result = await optimizeResume(userId, {
        old_resume: cvText,
        linkedin_account: linkedinUrl || undefined,
        github_account: githubUrl || undefined,
      });
      toast({ title: "Resume Optimized", description: "Your Resume has been enhanced with AI-powered improvements." });
      navigate("/cv-output", { state: { cvData: result } });
    } catch (error) {
      console.error("Error optimizing CV:", error);
      handleError(error, "Resume Optimization");
    } finally {
      setIsOptimizing(false);
    }
  };

  const OptionalProfilesSection = () => (
    <div className="border border-border rounded-lg p-4 space-y-4">
      <p className="text-sm font-medium text-muted-foreground">Optional Profiles</p>
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-sm">
            <Linkedin className="w-4 h-4" />
            LinkedIn Profile (optional)
          </Label>
          <Input value={linkedinUrl} onChange={(e) => setLinkedinUrl(e.target.value)} placeholder="https://linkedin.com/in/yourname" />
        </div>
        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-sm">
            <Github className="w-4 h-4" />
            GitHub Profile (optional)
          </Label>
          <Input value={githubUrl} onChange={(e) => setGithubUrl(e.target.value)} placeholder="https://github.com/yourname" />
        </div>
      </div>
    </div>
  );

  // Choose mode
  if (mode === "choose") {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-page-solid">
          <Navigation />
          <main className="pt-24 pb-16 px-4">
            <div className="max-w-4xl mx-auto">
              <Button variant="ghost" onClick={() => navigate("/")} className="mb-6">← Back</Button>
              <div className="mb-12 animate-fade-in text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-card/50 backdrop-blur-sm mb-6">
                  <FileText className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium">Resume Generator</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-bold mb-4">Resume Generator</h1>
                <p className="text-xl text-muted-foreground">Choose an option to get started</p>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="bg-card border border-border shadow-card p-8 hover:shadow-glow transition-smooth cursor-pointer group" onClick={() => setMode("generate")}>
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-primary/70 p-0.5 mb-6">
                    <div className="w-full h-full rounded-xl bg-card flex items-center justify-center"><FileText className="w-7 h-7 text-primary" /></div>
                  </div>
                  <h3 className="text-2xl font-semibold mb-3">Generate New Resume</h3>
                  <p className="text-muted-foreground mb-6">Create a professional Resume from your profile information using AI</p>
                  <Button variant="outline" className="w-full group-hover:bg-primary group-hover:text-primary-foreground">Get Started</Button>
                </Card>
                <Card className="bg-card border border-border shadow-card p-8 hover:shadow-glow transition-smooth cursor-pointer group" onClick={() => setMode("optimize")}>
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-accent to-accent/70 p-0.5 mb-6">
                    <div className="w-full h-full rounded-xl bg-card flex items-center justify-center"><Wand2 className="w-7 h-7 text-primary" /></div>
                  </div>
                  <h3 className="text-2xl font-semibold mb-3">Optimize Existing Resume</h3>
                  <p className="text-muted-foreground mb-6">Enhance your current Resume with AI-powered suggestions</p>
                  <Button variant="outline" className="w-full group-hover:bg-primary group-hover:text-primary-foreground">Get Started</Button>
                </Card>
              </div>
            </div>
          </main>
        </div>
      </ProtectedRoute>
    );
  }

  // Generate mode
  if (mode === "generate") {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-page-solid">
          <Navigation />
          <main className="pt-24 pb-16 px-4">
            <div className="max-w-4xl mx-auto">
              <Button variant="ghost" onClick={() => setMode("choose")} className="mb-6">← Back</Button>
              <div className="mb-12 text-center">
                <h1 className="text-4xl font-bold mb-4">Generate New Resume</h1>
                <p className="text-xl text-muted-foreground">We'll use your profile information to create a professional Resume</p>
              </div>
              <Card className="p-8 max-w-3xl mx-auto border border-border">
                <div className="space-y-6">
                  <p className="text-muted-foreground text-center">Your Resume will be generated based on your profile data. Optionally add your social profiles below.</p>
                  <OptionalProfilesSection />
                  <Button variant="hero" size="lg" className="w-full" onClick={handleGenerateCV} disabled={isGenerating}>
                    {isGenerating ? (<><Loader2 className="w-5 h-5 mr-2 animate-spin" />Generating...</>) : (<><Sparkles className="w-5 h-5 mr-2" />Generate Resume</>)}
                  </Button>
                </div>
              </Card>
            </div>
          </main>
        </div>
      </ProtectedRoute>
    );
  }

  // Optimize mode
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-page-solid">
        <Navigation />
        <main className="pt-24 pb-16 px-4">
          <div className="max-w-4xl mx-auto">
            <Button variant="ghost" onClick={() => setMode("choose")} className="mb-6">← Back</Button>
            <div className="mb-12 text-center">
              <h1 className="text-4xl font-bold mb-4">Optimize Your Resume</h1>
              <p className="text-xl text-muted-foreground">Upload a PDF or paste your text to get AI-powered optimization</p>
            </div>
            <Card className="p-8 max-w-3xl mx-auto border border-border">
              <div className="space-y-6">
                <div className="flex items-center justify-center">
                  <div className="text-center">
                    <input type="file" accept="application/pdf" onChange={(e) => handleFileUpload(e.target.files?.[0] || null)} className="hidden" id="cv-upload" />
                    <label htmlFor="cv-upload">
                      <Button variant="outline" size="lg" className="cursor-pointer" asChild>
                        <span className="bg-primary text-primary-foreground"><Upload className="w-5 h-5 mr-2" />Upload PDF</span>
                      </Button>
                    </label>
                    {cvFile && (
                      <p className="mt-3 text-sm text-muted-foreground flex items-center justify-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />{cvFile.name}
                      </p>
                    )}
                  </div>
                </div>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
                  <div className="relative flex justify-center text-xs uppercase"><span className="bg-card px-2 text-muted-foreground">Or paste text</span></div>
                </div>
                <Textarea value={cvText} onChange={(e) => { setCvText(e.target.value); setCvFile(null); }} placeholder="Paste your Resume text here..." className="min-h-[300px]" disabled={!!cvFile || isExtractingText} />
                {isExtractingText && (
                  <p className="text-sm text-muted-foreground flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" />Extracting text from PDF...</p>
                )}
                <OptionalProfilesSection />
                <Button variant="hero" size="lg" className="w-full" disabled={(!cvText && !cvFile) || isOptimizing || isExtractingText} onClick={handleOptimizeCV}>
                  {isOptimizing ? (<><Loader2 className="w-5 h-5 mr-2 animate-spin" />Optimizing...</>) : (<><Sparkles className="w-5 h-5 mr-2" />Optimize Resume</>)}
                </Button>
              </div>
            </Card>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
