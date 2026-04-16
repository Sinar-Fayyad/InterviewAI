import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Navigation } from "@/components/layout/Navigation";
import { BackButton } from "@/components/layout/BackButton";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FileSignature, Upload, Sparkles, CheckCircle, Plus, Wand2, Building2, Briefcase, Globe, Loader2, Edit2, Download, Copy } from "lucide-react";
import { extractTextFromPdf } from "@/utils/pdfTextExtract";
import { downloadCoverLetterPdf, type CoverLetterData } from "@/components/documents/CoverLetterDocument";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { fetchProfile } from "@/services/profileService";
import { generateCoverLetter, optimizeCoverLetter, type CoverLetterType } from "@/services/documentService";

export default function CoverLetter() {
  const [mode, setMode] = useState<"choose" | "generate" | "optimize">("choose");
  const [coverLetterText, setCoverLetterText] = useState("");
  const [coverLetterFile, setCoverLetterFile] = useState<File | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [isExtractingText, setIsExtractingText] = useState(false);
  const [generatedCoverLetter, setGeneratedCoverLetter] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  
  const [companyName, setCompanyName] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [coverLetterType, setCoverLetterType] = useState<CoverLetterType>("solicited");
  const [platform, setPlatform] = useState("");
  const [managerName, setManagerName] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  
  const { toast } = useToast();
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

  const handleModeSelection = (selectedMode: "generate" | "optimize") => {
    if (selectedMode === "generate" && !hasProfile) {
      toast({
        title: "Complete Your Profile",
        description: "Please fill out your profile information to generate documents.",
        variant: "destructive",
      });
      navigate("/profile");
      return;
    }
    setMode(selectedMode);
  };

  const handleFileUpload = async (file: File | null) => {
    if (!file) return;
    if (file.type !== "application/pdf") {
      toast({ title: "Invalid File Type", description: "Please upload a PDF file.", variant: "destructive" });
      return;
    }
    setCoverLetterFile(file);
    setIsExtractingText(true);
    try {
      const text = await extractTextFromPdf(file);
      setCoverLetterText(text);
      toast({ title: "File Uploaded", description: `Text extracted from ${file.name} successfully.` });
    } catch {
      toast({ title: "Extraction Failed", description: "Could not extract text from the PDF. Please paste your text manually.", variant: "destructive" });
      setCoverLetterFile(null);
      setCoverLetterText("");
    } finally {
      setIsExtractingText(false);
    }
  };

  const handleGenerateCoverLetter = async () => {
    if (!companyName.trim()) {
      toast({ title: "Missing Information", description: "Please enter the company name.", variant: "destructive" });
      return;
    }
    if (!jobTitle.trim()) {
      toast({ title: "Missing Information", description: "Please enter the job title/position.", variant: "destructive" });
      return;
    }
    if (coverLetterType === "solicited" && !platform.trim()) {
      toast({ title: "Missing Information", description: "Please enter the platform where you saw the job opportunity.", variant: "destructive" });
      return;
    }

    if (!userId) return;
    setIsGenerating(true);
    
    try {
      const result = await generateCoverLetter(userId, {
        company_name: companyName,
        job_title: jobTitle,
        cover_letter_type: coverLetterType,
        platform: coverLetterType === "solicited" ? platform : undefined,
        job_description: coverLetterType === "solicited" ? jobDescription : undefined,
        contact_name: managerName || undefined,
      });
      
      setGeneratedCoverLetter(result?.cover_letter || result?.text || JSON.stringify(result));
      setIsEditing(false);
      toast({ title: "Cover Letter Generated", description: `Your ${coverLetterType} cover letter for ${companyName} is ready!` });
    } catch (error: any) {
      toast({ title: "Generation Failed", description: error.message || "Failed to generate cover letter.", variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleOptimizeCoverLetter = async () => {
    if (!coverLetterText && !coverLetterFile) {
      toast({ title: "Missing Content", description: "Please upload a PDF or paste your cover letter text.", variant: "destructive" });
      return;
    }
    if (!userId) return;

    setIsOptimizing(true);
    try {
      const result = await optimizeCoverLetter(userId, {
        old_cover_letter: coverLetterText,
        company_name: companyName || "Company",
        job_title: jobTitle || "Position",
      });
      
      setGeneratedCoverLetter(result?.cover_letter || result?.text || JSON.stringify(result));
      setIsEditing(false);
      toast({ title: "Cover Letter Optimized", description: "Your cover letter has been enhanced!" });
    } catch (error: any) {
      toast({ title: "Optimization Failed", description: error.message || "Failed to optimize cover letter.", variant: "destructive" });
    } finally {
      setIsOptimizing(false);
    }
  };

  if (mode === "choose") {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="pt-24 pb-16 px-4">
          <div className="max-w-4xl mx-auto">
            <BackButton className="mb-6" />
            <div className="mb-12 animate-fade-in text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-card/50 backdrop-blur-sm mb-6">
                <FileSignature className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">Cover Letter</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">Cover Letter</h1>
              <p className="text-xl text-muted-foreground">Choose an option to get started</p>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <Card
                className="bg-secondary/80 border-primary/20 shadow-card p-8 hover:shadow-glow transition-smooth cursor-pointer group"
                onClick={() => handleModeSelection("generate")}
              >
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-primary/70 p-0.5 mb-6">
                  <div className="w-full h-full rounded-xl bg-secondary flex items-center justify-center">
                    <Plus className="w-7 h-7 text-primary" />
                  </div>
                </div>
                <h3 className="text-2xl font-semibold mb-3">Generate New Cover Letter</h3>
                <p className="text-muted-foreground mb-6">Create a personalized cover letter for your target company using AI</p>
                <Button variant="outline" className="w-full group-hover:bg-primary group-hover:text-primary-foreground">Get Started</Button>
              </Card>
              <Card
                className="bg-secondary/80 border-primary/20 shadow-card p-8 hover:shadow-glow transition-smooth cursor-pointer group"
                onClick={() => handleModeSelection("optimize")}
              >
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-accent to-accent/70 p-0.5 mb-6">
                  <div className="w-full h-full rounded-xl bg-secondary flex items-center justify-center">
                    <Wand2 className="w-7 h-7 text-primary" />
                  </div>
                </div>
                <h3 className="text-2xl font-semibold mb-3">Optimize Existing Cover Letter</h3>
                <p className="text-muted-foreground mb-6">Enhance your current cover letter with AI-powered suggestions</p>
                <Button variant="outline" className="w-full group-hover:bg-primary group-hover:text-primary-foreground">Get Started</Button>
              </Card>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (mode === "generate") {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="pt-24 pb-16 px-4">
          <div className="max-w-4xl mx-auto">
            <Button variant="ghost" onClick={() => setMode("choose")} className="mb-6">← Back</Button>
            <div className="mb-12 text-center">
              <h1 className="text-4xl font-bold mb-4">Generate Cover Letter</h1>
              <p className="text-xl text-muted-foreground">Create a personalized cover letter for your target company</p>
            </div>

            <div className="flex flex-col gap-8">
              <Card className="bg-secondary/80 border-primary/20 shadow-card p-8 max-w-3xl mx-auto w-full">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-accent to-accent/70 p-0.5 mb-6 mx-auto">
                  <div className="w-full h-full rounded-xl bg-secondary flex items-center justify-center">
                    <FileSignature className="w-7 h-7 text-primary" />
                  </div>
                </div>
                <h3 className="text-2xl font-semibold mb-3 text-center">Cover Letter Details</h3>
                <p className="text-muted-foreground mb-6 text-center">Fill in the details below to generate your cover letter.</p>

                <div className="space-y-4 mb-6">
                  <div className="space-y-2">
                    <Label htmlFor="companyName" className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-primary" /> Company Name *
                    </Label>
                    <Input id="companyName" value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="e.g., Google, Microsoft" className="bg-input" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="jobTitle" className="flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-primary" /> Job Title / Position *
                    </Label>
                    <Input id="jobTitle" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} placeholder="e.g., Software Engineer, Product Manager" className="bg-input" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="coverLetterType">Type of Cover Letter</Label>
                    <select id="coverLetterType" value={coverLetterType} onChange={(e) => setCoverLetterType(e.target.value as CoverLetterType)} className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                      <option value="solicited">Solicited (Responding to a job posting)</option>
                      <option value="unsolicited">Unsolicited (Cold outreach)</option>
                    </select>
                  </div>
                  {coverLetterType === "solicited" && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="platform" className="flex items-center gap-2">
                          <Globe className="w-4 h-4 text-primary" /> Platform / Where You Saw the Job *
                        </Label>
                        <Input id="platform" value={platform} onChange={(e) => setPlatform(e.target.value)} placeholder="e.g., LinkedIn, Indeed, Company Website" className="bg-input" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="jobDescription">Job Description</Label>
                        <Textarea id="jobDescription" value={jobDescription} onChange={(e) => setJobDescription(e.target.value)} placeholder="Paste the job description here..." className="bg-input min-h-[120px]" />
                      </div>
                    </>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="managerName">Hiring Manager Name (Optional)</Label>
                    <Input id="managerName" value={managerName} onChange={(e) => setManagerName(e.target.value)} placeholder="e.g., John Smith" className="bg-input" />
                  </div>
                </div>

                <Button variant="hero" size="lg" className="w-full" onClick={handleGenerateCoverLetter} disabled={isGenerating}>
                  {isGenerating ? (<><Loader2 className="w-5 h-5 mr-2 animate-spin" />Generating...</>) : (<><Sparkles className="w-5 h-5 mr-2" />Generate Cover Letter</>)}
                </Button>
              </Card>

              {generatedCoverLetter && !isGenerating && (
                <Card className="bg-secondary/80 border-primary/20 shadow-card p-6 max-w-3xl mx-auto w-full">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold">Generated Cover Letter</h3>
                  </div>
                  {isEditing ? (
                    <Textarea value={generatedCoverLetter} onChange={(e) => setGeneratedCoverLetter(e.target.value)} className="min-h-[400px] resize-none" />
                  ) : (
                    <div className="bg-muted/50 rounded-lg p-4 min-h-[400px]">
                      <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">{generatedCoverLetter}</pre>
                    </div>
                  )}
                  <div className="flex flex-wrap gap-3 mt-4">
                    <Button variant="outline" size="sm" onClick={() => setIsEditing(!isEditing)}>
                      <Edit2 className="w-4 h-4 mr-2" />{isEditing ? "Preview" : "Edit"}
                    </Button>
                    <Button variant="outline" size="sm" onClick={async () => {
                      const coverLetterData: CoverLetterData = {
                        senderName: "[Your Name]", senderEmail: "", senderPhone: "", senderLocation: "",
                        recipientName: managerName || undefined, companyName: companyName || "Company",
                        jobTitle: jobTitle || "Position", platform: platform || undefined,
                        date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
                        paragraphs: generatedCoverLetter.split('\n\n').filter(p => p.trim() && !p.startsWith('Dear') && !p.startsWith('Sincerely'))
                      };
                      await downloadCoverLetterPdf(coverLetterData, `cover_letter_${companyName.replace(/\s+/g, '_')}.pdf`);
                      toast({ title: "Downloaded", description: "Cover letter has been downloaded as PDF." });
                    }}>
                      <Download className="w-4 h-4 mr-2" />Download as PDF
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => { navigator.clipboard.writeText(generatedCoverLetter); toast({ title: "Copied", description: "Cover letter copied to clipboard" }); }}>
                      <Copy className="w-4 h-4 mr-2" />Copy to Clipboard
                    </Button>
                  </div>
                </Card>
              )}
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Optimize mode
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="pt-24 pb-16 px-4">
        <div className="max-w-4xl mx-auto">
          <Button variant="ghost" onClick={() => setMode("choose")} className="mb-6">← Back</Button>
          <div className="mb-12 text-center">
            <h1 className="text-4xl font-bold mb-4">Optimize Your Cover Letter</h1>
            <p className="text-xl text-muted-foreground">Upload a PDF or paste your text to get AI-powered optimization</p>
          </div>

          <Card className="p-8 max-w-3xl mx-auto">
            <div className="space-y-6">
              <div className="space-y-4 mb-4">
                <div className="space-y-2">
                  <Label htmlFor="optCompany" className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-primary" /> Company Name
                  </Label>
                  <Input id="optCompany" value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="e.g., Google" className="bg-input" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="optJob" className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-primary" /> Job Title
                  </Label>
                  <Input id="optJob" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} placeholder="e.g., Software Engineer" className="bg-input" />
                </div>
              </div>
              <div className="flex items-center justify-center">
                <div className="text-center">
                  <input type="file" accept="application/pdf" onChange={(e) => handleFileUpload(e.target.files?.[0] || null)} className="hidden" id="cover-upload" />
                  <label htmlFor="cover-upload">
                    <Button variant="outline" size="lg" className="cursor-pointer" asChild>
                      <span><Upload className="w-5 h-5 mr-2" />Upload PDF</span>
                    </Button>
                  </label>
                  {coverLetterFile && (
                    <p className="mt-3 text-sm text-muted-foreground flex items-center justify-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />{coverLetterFile.name}
                    </p>
                  )}
                </div>
              </div>
              <div className="relative">
                <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
                <div className="relative flex justify-center text-xs uppercase"><span className="bg-background px-2 text-muted-foreground">Or paste text</span></div>
              </div>
              <Textarea value={coverLetterText} onChange={(e) => { setCoverLetterText(e.target.value); setCoverLetterFile(null); }} placeholder="Paste your cover letter text here..." className="min-h-[300px]" disabled={!!coverLetterFile || isExtractingText} />
              {isExtractingText && (
                <p className="text-sm text-muted-foreground flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" />Extracting text from PDF...</p>
              )}
              <Button variant="hero" size="lg" className="w-full" disabled={(!coverLetterText && !coverLetterFile) || isOptimizing || isExtractingText} onClick={handleOptimizeCoverLetter}>
                {isOptimizing ? (<><Loader2 className="w-5 h-5 mr-2 animate-spin" />Optimizing...</>) : (<><Sparkles className="w-5 h-5 mr-2" />Optimize Cover Letter</>)}
              </Button>
            </div>
          </Card>

          {generatedCoverLetter && (
            <Card className="bg-secondary/80 border-primary/20 shadow-card p-6 max-w-2xl mx-auto mt-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold">Optimized Cover Letter</h3>
              </div>
              {isEditing ? (
                <Textarea value={generatedCoverLetter} onChange={(e) => setGeneratedCoverLetter(e.target.value)} className="min-h-[400px] resize-none" />
              ) : (
                <div className="bg-muted/50 rounded-lg p-4 min-h-[400px]">
                  <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">{generatedCoverLetter}</pre>
                </div>
              )}
              <div className="flex flex-wrap gap-3 mt-4">
                <Button variant="outline" size="sm" onClick={() => setIsEditing(!isEditing)}>
                  <Edit2 className="w-4 h-4 mr-2" />{isEditing ? "Preview" : "Edit"}
                </Button>
                <Button variant="outline" size="sm" onClick={async () => {
                  const coverLetterData: CoverLetterData = {
                    senderName: "[Your Name]", senderEmail: "", senderPhone: "", senderLocation: "",
                    companyName: companyName || "Company", jobTitle: jobTitle || "Position",
                    date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
                    paragraphs: generatedCoverLetter.split('\n\n').filter(p => p.trim() && !p.startsWith('Dear') && !p.startsWith('Sincerely') && !p.startsWith('Best regards'))
                  };
                  await downloadCoverLetterPdf(coverLetterData, 'optimized_cover_letter.pdf');
                  toast({ title: "Downloaded", description: "Cover letter has been downloaded as PDF." });
                }}>
                  <Download className="w-4 h-4 mr-2" />Download as PDF
                </Button>
                <Button variant="outline" size="sm" onClick={() => { navigator.clipboard.writeText(generatedCoverLetter); toast({ title: "Copied", description: "Cover letter copied to clipboard" }); }}>
                  <Copy className="w-4 h-4 mr-2" />Copy to Clipboard
                </Button>
              </div>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
