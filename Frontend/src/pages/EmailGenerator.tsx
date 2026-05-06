import { useState, useEffect } from "react";
import { Navigation } from "@/components/layout/Navigation";
import { BackButton } from "@/components/layout/BackButton";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Mail, Sparkles, Copy, Check, Loader2, Edit2, Send } from "lucide-react";
import { generateEmail, sendEmail } from "@/services/emailService";
import { fetchProfile } from "@/services/profileService";

interface EmailOutput {
  subject: string;
  body: string;
}

interface EmailResponse {
  subject?: string;
  email?: string;
  [key: string]: unknown;
}

const parseEmailResponse = (response: unknown): { subject: string; body: string } => {
  if (!response || typeof response !== 'object') {
    console.warn('Invalid email response format:', response);
    return { subject: '', body: '' };
  }

  const data = response as EmailResponse;

  const subject = String(data.subject || '').trim();
  const body = String(data.email || '').trim();

  console.debug('Parsed email response:', { subject, body });

  return { subject, body };
};

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
  const [sendModalOpen, setSendModalOpen] = useState(false);
  const [sendLoading, setSendLoading] = useState(false);
  const [sendFormData, setSendFormData] = useState({ to: "", subject: "", body: "" });

  const openSendModal = () => {
    if (emailOutput) {
      setSendFormData({
        to: "",
        subject: emailOutput.subject.replace(/\r?\n/g, ' '),
        body: emailOutput.body
      });
    }
    setSendModalOpen(true);
  };

  const handleSendEmail = async () => {
    if (!sendFormData.to) {
      toast({ title: "Missing Information", description: "Please enter recipient email", variant: "destructive" });
      return;
    }
    if (!sendFormData.subject) {
      toast({ title: "Missing Information", description: "Please enter subject", variant: "destructive" });
      return;
    }
    if (!sendFormData.body) {
      toast({ title: "Missing Information", description: "Please enter body", variant: "destructive" });
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(sendFormData.to)) {
      toast({ title: "Invalid Email", description: "Please enter a valid email address", variant: "destructive" });
      return;
    }
    if (sendFormData.subject.length > 255) {
      toast({ title: "Subject Too Long", description: "Subject must be 255 characters or less", variant: "destructive" });
      return;
    }

    if (!userId) {
      toast({ title: "Not Authenticated", description: "Please log in to send email", variant: "destructive" });
      return;
    }

    setSendLoading(true);
    try {
      await sendEmail(userId, {
        to: sendFormData.to,
        subject: sendFormData.subject,
        body: sendFormData.body
      });
      toast({ title: "Email Sent", description: "Your email has been sent successfully" });
      setSendModalOpen(false);
    } catch (err) {
      toast({
        title: "Failed to send email",
        description: err instanceof Error ? err.message : "Please try again.",
        variant: "destructive"
      });
    } finally {
      setSendLoading(false);
    }
  };

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

      console.debug('Raw email generation response:', result);

      const { subject, body } = parseEmailResponse(result);
      
      if (!body) {
        toast({ 
          title: "Warning", 
          description: "Email body is empty. Please try again.",
          variant: "destructive" 
        });
        setLoading(false);
        return;
      }

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
                    <Button variant="hero" size="sm" onClick={openSendModal}>
                      <Send className="w-4 h-4 mr-2" />
                      Send
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

      <Dialog open={sendModalOpen} onOpenChange={setSendModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Send Email</DialogTitle>
            <DialogDescription>
              Fill in the details below to send your generated email.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="sendTo">To *</Label>
              <Input
                id="sendTo"
                type="email"
                placeholder="recipient@example.com"
                value={sendFormData.to}
                onChange={(e) => setSendFormData({ ...sendFormData, to: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sendSubject">Subject *</Label>
              <Input
                id="sendSubject"
                placeholder="Email subject"
                value={sendFormData.subject}
                onChange={(e) => setSendFormData({ ...sendFormData, subject: e.target.value })}
                maxLength={255}
              />
              <p className="text-xs text-muted-foreground">{sendFormData.subject.length}/255</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="sendBody">Body *</Label>
              <Textarea
                id="sendBody"
                rows={10}
                value={sendFormData.body}
                onChange={(e) => setSendFormData({ ...sendFormData, body: e.target.value })}
                className="resize-none"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSendModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="hero" onClick={handleSendEmail} disabled={sendLoading}>
              {sendLoading ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin" />Sending...</>) : (<><Send className="w-4 h-4 mr-2" />Send Email</>)}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EmailGenerator;
