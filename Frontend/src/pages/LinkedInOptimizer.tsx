import { useState, useEffect } from "react";
import { Navigation } from "@/components/layout/Navigation";
import { BackButton } from "@/components/layout/BackButton";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { fetchProfile } from "@/services/profileService";
import api from "@/services/api";
import { Linkedin, Sparkles, Copy, Check, Loader2, RefreshCw, Wand2, ClipboardCopy } from "lucide-react";
import { LinkedInCopyPaste } from "@/components/linkedin/LinkedInCopyPaste";

interface GeneratedContent {
  headline: string;
  about: string;
  experience: string[];
}

const LinkedInOptimizer = () => {
  const { userId } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<Record<string, unknown> | null>(null);
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);

  useEffect(() => {
    if (userId) {
      loadProfile();
    }
  }, [userId]);

  const loadProfile = async () => {
    if (!userId) return;
    try {
      const data = await fetchProfile(userId);
      setProfile(data);
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  const handleGenerate = async () => {
    if (!profile) {
      toast({ title: "Profile Required", description: "Please complete your profile first", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const { data: result } = await api.post("/linkedin/optimize", { profile });
      
      // Parse result - adapt based on actual API response shape
      const content: GeneratedContent = {
        headline: result?.headline || result?.title || "Professional headline generated",
        about: result?.about || result?.body || result?.text || "About section generated",
        experience: result?.experience || [],
      };
      setGeneratedContent(content);
      toast({ title: "Content Generated", description: "Your LinkedIn profile content has been generated" });
    } catch (error) {
      console.error("Error generating content:", error);
      toast({ title: "Error", description: "Failed to generate content. Please try again.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string, section: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedSection(section);
      toast({ title: "Copied!", description: `${section} copied to clipboard` });
      setTimeout(() => setCopiedSection(null), 2000);
    } catch (error) {
      toast({ title: "Error", description: "Failed to copy to clipboard", variant: "destructive" });
    }
  };

  const CopyButton = ({ text, section }: { text: string; section: string }) => (
    <Button variant="outline" size="sm" onClick={() => copyToClipboard(text, section)} className="shrink-0">
      {copiedSection === section ? (<><Check className="w-4 h-4 mr-2" />Copied!</>) : (<><Copy className="w-4 h-4 mr-2" />Copy</>)}
    </Button>
  );

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <BackButton className="mb-6" />
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <Linkedin className="w-8 h-8 text-[#0A66C2]" /> LinkedIn Optimizer
          </h1>
          <p className="text-muted-foreground">Generate optimized LinkedIn profile sections or copy your existing profile data</p>
        </div>

        <Tabs defaultValue="generate" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2 mb-8">
            <TabsTrigger value="generate" className="flex items-center gap-2"><Wand2 className="w-4 h-4" />AI Generate</TabsTrigger>
            <TabsTrigger value="copy-paste" className="flex items-center gap-2"><ClipboardCopy className="w-4 h-4" />Copy Profile</TabsTrigger>
          </TabsList>

          <TabsContent value="generate">
            {profile && (
              <Card className="bg-secondary/80 border-primary/20 shadow-card p-6 mb-8">
                <h2 className="text-lg font-semibold mb-4">Your Profile</h2>
                <div className="grid sm:grid-cols-2 gap-4 text-sm">
                  <div><span className="text-muted-foreground">Name:</span> <span className="font-medium">{String(profile.full_name) || "Not set"}</span></div>
                  <div><span className="text-muted-foreground">Location:</span> <span className="font-medium">{String(profile.location) || "Not set"}</span></div>
                  <div className="sm:col-span-2"><span className="text-muted-foreground">Skills:</span> <span className="font-medium">{Array.isArray(profile.skills) && profile.skills.length > 0 ? profile.skills.join(", ") : "Not set"}</span></div>
                </div>
                <Button onClick={handleGenerate} disabled={loading} className="mt-6" variant="hero">
                  {loading ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin" />Generating...</>) : generatedContent ? (<><RefreshCw className="w-4 h-4 mr-2" />Regenerate Content</>) : (<><Sparkles className="w-4 h-4 mr-2" />Generate LinkedIn Content</>)}
                </Button>
              </Card>
            )}

            {generatedContent ? (
              <div className="space-y-6">
                <Card className="bg-secondary/80 border-primary/20 shadow-card p-6">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <h3 className="text-lg font-semibold">Headline</h3>
                    <CopyButton text={generatedContent.headline} section="Headline" />
                  </div>
                  <div className="bg-muted/50 rounded-lg p-4"><p className="font-medium">{generatedContent.headline}</p></div>
                  <p className="text-xs text-muted-foreground mt-2">Max 220 characters • Shows below your name everywhere on LinkedIn</p>
                </Card>
                <Card className="bg-secondary/80 border-primary/20 shadow-card p-6">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <h3 className="text-lg font-semibold">About</h3>
                    <CopyButton text={generatedContent.about} section="About" />
                  </div>
                  <div className="bg-muted/50 rounded-lg p-4"><p className="whitespace-pre-wrap text-sm leading-relaxed">{generatedContent.about}</p></div>
                  <p className="text-xs text-muted-foreground mt-2">Max 2,600 characters • First 3 lines show before "see more"</p>
                </Card>
                {generatedContent.experience.length > 0 && (
                  <Card className="bg-secondary/80 border-primary/20 shadow-card p-6">
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <h3 className="text-lg font-semibold">Experience Descriptions</h3>
                      <CopyButton text={generatedContent.experience.join("\n\n---\n\n")} section="Experience" />
                    </div>
                    <div className="space-y-4">
                      {generatedContent.experience.map((exp, index) => (
                        <div key={index} className="bg-muted/50 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-muted-foreground">Position {index + 1}</span>
                            <CopyButton text={exp} section={`Experience ${index + 1}`} />
                          </div>
                          <p className="whitespace-pre-wrap text-sm leading-relaxed">{exp}</p>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}
                <Card className="bg-secondary/80 border-primary/20 shadow-card p-6 bg-primary/5">
                  <h3 className="text-lg font-semibold mb-4">💡 Optimization Tips</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Add a professional headshot (profiles with photos get 21x more views)</li>
                    <li>• Include relevant keywords in your headline for searchability</li>
                    <li>• Start your About section with a hook to grab attention</li>
                    <li>• Use numbers and metrics in experience descriptions</li>
                    <li>• Request recommendations from colleagues and managers</li>
                  </ul>
                </Card>
              </div>
            ) : (
              <Card className="bg-secondary/80 border-primary/20 shadow-card p-12 text-center">
                <Linkedin className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Generate Your LinkedIn Content</h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">Click the button above to generate optimized content for your LinkedIn profile based on your experience and skills.</p>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="copy-paste">
            <LinkedInCopyPaste />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default LinkedInOptimizer;
