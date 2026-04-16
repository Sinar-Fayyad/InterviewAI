import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Navigation } from "@/components/layout/Navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Download, Edit2, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { CVPreview } from "@/components/documents/CVPreview";
import { downloadCVPdf, type CVData } from "@/components/documents/CVDocument";

export default function CVOutput() {
  const [mode, setMode] = useState<"preview" | "edit">("preview");
  const [cvData, setCvData] = useState<CVData | null>(null);
  const [editData, setEditData] = useState<CVData | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const state = location.state as { cvData?: CVData } | null;
    if (state?.cvData) {
      setCvData(state.cvData);
    } else {
      navigate("/cv-generator");
    }
  }, [location.state, navigate]);

  const handleDownloadPdf = async () => {
    if (!cvData) return;
    try {
      await downloadCVPdf(cvData, `${cvData.fullName.replace(/\s+/g, '_')}_Resume.pdf`);
      toast({ title: "Downloaded", description: "Your Resume has been downloaded as a PDF." });
    } catch (error) {
      toast({ title: "Download Failed", description: "Failed to generate PDF. Please try again.", variant: "destructive" });
    }
  };

  const handleEdit = () => {
    if (cvData) { setEditData({ ...cvData }); setMode("edit"); }
  };

  const handlePreviewFromEdit = () => {
    if (editData) { setCvData({ ...editData }); setMode("preview"); }
  };

  const updateEditField = (field: keyof CVData, value: any) => {
    if (editData) setEditData({ ...editData, [field]: value });
  };

  const handleBack = () => window.history.back();

  if (!cvData) return null;

  if (mode === "edit" && editData) {
    return (
      <div className="min-h-screen bg-page-solid">
        <Navigation />
        <main className="pt-24 pb-16 px-4">
          <div className="max-w-4xl mx-auto">
            <Button variant="ghost" onClick={handleBack} className="mb-6">← Back</Button>
            <div className="mb-8 text-center">
              <h1 className="text-3xl font-bold mb-2">Edit Your Resume</h1>
              <p className="text-muted-foreground">Make changes to your Resume below</p>
            </div>
            <Card className="p-6 border border-border mb-6">
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>Full Name</Label><Input value={editData.fullName} onChange={(e) => updateEditField("fullName", e.target.value)} /></div>
                  <div className="space-y-2"><Label>Email</Label><Input value={editData.email} onChange={(e) => updateEditField("email", e.target.value)} /></div>
                  <div className="space-y-2"><Label>Phone</Label><Input value={editData.phone} onChange={(e) => updateEditField("phone", e.target.value)} /></div>
                  <div className="space-y-2"><Label>Location</Label><Input value={editData.location} onChange={(e) => updateEditField("location", e.target.value)} /></div>
                </div>
                <div className="space-y-2"><Label>Summary</Label><Textarea value={editData.summary} onChange={(e) => updateEditField("summary", e.target.value)} rows={4} /></div>
                <div className="space-y-2"><Label>Skills (comma separated)</Label><Input value={editData.skills.join(", ")} onChange={(e) => updateEditField("skills", e.target.value.split(",").map(s => s.trim()).filter(Boolean))} /></div>
              </div>
            </Card>
            <div className="flex justify-center gap-4">
              <Button variant="outline" onClick={handlePreviewFromEdit}><Eye className="w-4 h-4 mr-2" />Preview</Button>
              <Button variant="hero" onClick={handleDownloadPdf}><Download className="w-4 h-4 mr-2" />Export</Button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-page-solid">
      <Navigation />
      <main className="pt-24 pb-16 px-4">
        <div className="max-w-5xl mx-auto">
          <Button variant="ghost" onClick={handleBack} className="mb-6">← Back</Button>
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold mb-2">Your Generated Resume</h1>
            <p className="text-muted-foreground">Preview your ATS-friendly Resume below</p>
          </div>
          <div className="flex justify-center gap-4 mb-8">
            <Button variant="outline" onClick={handleEdit}><Edit2 className="w-4 h-4 mr-2" />Edit</Button>
            <Button variant="hero" onClick={handleDownloadPdf}><Download className="w-4 h-4 mr-2" />Export</Button>
          </div>
          <CVPreview data={cvData} />
        </div>
      </main>
    </div>
  );
}
