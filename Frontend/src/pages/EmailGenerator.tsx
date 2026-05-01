import { useState, useEffect } from "react";
import { Navigation } from "@/components/layout/Navigation";
import { BackButton } from "@/components/layout/BackButton";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Mail, Sparkles, Copy, Check, Loader2, Edit2 } from "lucide-react";
import { generateEmail } from "@/services/emailService";
import { fetchProfile } from "@/services/profileService";

interface EmailOutput {
  subject: string;
  body: string;
}

const EmailGenerator = () => {
  const { userId } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [profile, setProfile] = useState<Record<string, unknown> | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [emailOutput, setEmailOutput] = useState<EmailOutput | null>(null);
  const [editContent, setEditContent] = useState("");

  
  const [formData, setFormData] = useState({ company: "", jobTitle: "", jobDescription: "", recipientName: "", tone: "professional" });

  useEffect(() => {
    if (userId) {
      fetchProfile(userId).then(setProfile).catch(console.error);
    }
  }, [userId]);

  const handleGenerate = async () => {
    if (!formData.company || !formData.jobTitle) {
      toast({ title: "Missing Information", description: "Please provide company name and job title", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const result = await generateEmail({
        job_title: formData.jobTitle,
        company_name: formData.company,
        job_description: formData.jobDescription || undefined,
        tone: formData.tone,
        recipient_name: formData.recipientName || undefined,
      }, userId || undefined);

      const emailData = result?.email || result || {};
      const subject = emailData.subject || emailData.Subject || emailData.email_subject || 'No Subject';
      const body = emailData.body || emailData.Body || emailData.content || emailData.html || emailData.text || JSON.stringify(emailData);
      
      setEmailOutput({ subject, body });
      setEditContent(`Subject: ${subject}\n\n${body}`);
      setIsEditing(false);
      toast({ title: "Email Generated", description: "Your application email has been generated" });
    } catch (err) {
      toast({
        title: "Failed to generate email",
        description: err instanceof Error ? err.message : "Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      let contentToCopy = '';
      if (emailOutput) {
        contentToCopy = `Subject: ${emailOutput.subject}\n\n${emailOutput.body}`;
      } else if (editContent) {
        contentToCopy = editContent;
      }
      if (!contentToCopy) return;
      
      await navigator.clipboard.writeText(contentToCopy);
      setCopied(true);
      toast({ title: "Copied!", description: "Email copied to clipboard" });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Please try copying manually.",
        variant: "destructive"
      });
    }
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditContent(e.target.value);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <BackButton className="mb-6" />
        <div className="max-w-3xl mx-auto">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold mb-2">Email Generator</h1>
            <p className="text-muted-foreground">Generate polished application emails using your profile</p>
          </div>

          <div className="flex flex-col gap-8">
            <Card className="bg-secondary/80 border-primary/20 shadow-card p-6 w-full">
              <h2 className="text-xl font-semibold mb-6 flex items-center gap-2"><Mail className="w-5 h-5 text-primary" />Job Details</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="company">Company Name *</Label>
                    <Input id="company" value={formData.company} onChange={(e) => setFormData({ ...formData, company: e.target.value })} placeholder="Google" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="jobTitle">Job Title *</Label>
                    <Input id="jobTitle" value={formData.jobTitle} onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })} placeholder="Software Engineer" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="recipientName">Recipient Name (Optional)</Label>
                  <Input id="recipientName" value={formData.recipientName} onChange={(e) => setFormData({ ...formData, recipientName: e.target.value })} placeholder="Hiring Manager's name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="jobDescription">Job Description</Label>
                  <Textarea id="jobDescription" value={formData.jobDescription} onChange={(e) => setFormData({ ...formData, jobDescription: e.target.value })} placeholder="Paste the job description here for a more tailored email..." rows={6} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tone">Tone</Label>
                  <select id="tone" value={formData.tone} onChange={(e) => setFormData({ ...formData, tone: e.target.value })} className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                    <option value="professional">Professional</option>
                    <option value="enthusiastic">Enthusiastic</option>
                    <option value="formal">Formal</option>
                    <option value="friendly">Friendly</option>
                  </select>
                </div>
                <Button onClick={handleGenerate} disabled={loading} className="w-full" variant="hero">
                  {loading ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin" />Generating...</>) : (<><Sparkles className="w-4 h-4 mr-2" />Generate Email</>)}
                </Button>
              </div>
            </Card>

            {emailOutput && (
              <Card className="bg-secondary/80 border-primary/20 shadow-card p-6 w-full">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold flex items-center gap-2"><Sparkles className="w-5 h-5 text-accent" />Generated Email</h2>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setIsEditing(!isEditing)}>
                      <Edit2 className="w-4 h-4 mr-2" />
                      {isEditing ? "Preview" : "Edit"}
                    </Button>
                    <Button variant="outline" size="sm" onClick={copyToClipboard}>
                      {copied ? (<><Check className="w-4 h-4 mr-2" />Copied!</>) : (<><Copy className="w-4 h-4 mr-2" />Copy</>)}
                    </Button>
                  </div>
                </div>
                {isEditing ? (
                  <Textarea 
                    value={editContent} 
                    onChange={handleEditChange}
                    className="min-h-[300px] resize-none font-sans text-sm leading-relaxed" 
                    placeholder="Edit your email content here..."
                  />
                ) : (
                  <div className="space-y-6">
                    <div className="border-b border-border pb-3">
                      <h3 className="font-bold text-xl text-foreground bg-gradient-to-r from-primary to-accent bg-clip-text">
                        {emailOutput.subject}
                      </h3>
                    </div>
                    <div className="prose prose-sm max-w-none leading-relaxed bg-muted/30 p-6 rounded-xl border">
                      <div className="whitespace-pre-wrap font-sans text-sm">
                        {emailOutput.body}
                      </div>
                    </div>
                  </div>
                )}
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default EmailGenerator;

