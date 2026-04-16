import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { fetchProfile, saveProfile, socialiteRedirect } from "@/services/profileService";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Linkedin, Mail, ChevronLeft, ChevronRight, GraduationCap, Briefcase, Award, Plus, Trash2, Code, Users, Wrench, Languages, MoreHorizontal } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type Education = {
  id: string;
  school: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string;
  description: string;
};

type Experience = {
  id: string;
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  description: string;
};

type Certification = {
  id: string;
  name: string;
  issuer: string;
  date: string;
  url: string;
};

type SkillCategory = "technical" | "soft_skills" | "tools" | "languages" | "other";

type Skill = {
  id: string;
  name: string;
  category: SkillCategory;
  proficiency_level: number;
};

const categoryConfig: Record<SkillCategory, { label: string; icon: React.ReactNode; color: string }> = {
  technical: { label: "Technical", icon: <Code className="w-4 h-4" />, color: "bg-blue-500/10 text-blue-600 border-blue-500/20" },
  soft_skills: { label: "Soft Skills", icon: <Users className="w-4 h-4" />, color: "bg-green-500/10 text-green-600 border-green-500/20" },
  tools: { label: "Tools", icon: <Wrench className="w-4 h-4" />, color: "bg-orange-500/10 text-orange-600 border-orange-500/20" },
  languages: { label: "Languages", icon: <Languages className="w-4 h-4" />, color: "bg-purple-500/10 text-purple-600 border-purple-500/20" },
  other: { label: "Other", icon: <MoreHorizontal className="w-4 h-4" />, color: "bg-gray-500/10 text-gray-600 border-gray-500/20" },
};

export default function Onboarding() {
  const { user, userId, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  const [linkedinConnected, setLinkedinConnected] = useState(false);
  const [googleConnected, setGoogleConnected] = useState(false);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [summary, setSummary] = useState("");

  const [education, setEducation] = useState<Education[]>([]);
  const [experience, setExperience] = useState<Experience[]>([]);
  const [certifications, setCertifications] = useState<Certification[]>([]);

  const [skills, setSkills] = useState<Skill[]>([]);
  const [newSkill, setNewSkill] = useState({ name: "", category: "technical" as SkillCategory, proficiency_level: 3 });
  const [selectedCategory, setSelectedCategory] = useState<SkillCategory | "all">("all");

  useEffect(() => {
    const checkProfile = async () => {
      if (authLoading) return;
      if (!userId) { navigate("/auth"); return; }

      try {
        const data = await fetchProfile(userId);
        if (data?.onboarding_completed) { navigate("/dashboard"); return; }
        if (data) {
          setFullName(data.full_name || "");
          setEmail(data.email || user?.email || "");
          setPhone(data.phone || "");
          setLocation(data.location || "");
          setSummary(data.summary || "");
          setEducation(data.education as Education[] || []);
          setExperience(data.experience as Experience[] || []);
          setCertifications(data.certifications as Certification[] || []);
          setLinkedinConnected(data.linkedin_connected || false);
          setGoogleConnected(data.google_connected || false);
        }
      } catch (error) {
        console.error("Error checking profile:", error);
      }
      setIsChecking(false);
    };
    checkProfile();
  }, [userId, authLoading, navigate]);

  const handleLinkedInConnect = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const data = await socialiteRedirect("linkedin", userId);
      if (data?.url) window.location.href = data.url;
      setLinkedinConnected(true);
    } catch (error: any) {
      toast({ title: "Connection Failed", description: error.message || "Failed to connect LinkedIn", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleConnect = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const data = await socialiteRedirect("google", userId);
      if (data?.url) window.location.href = data.url;
      setGoogleConnected(true);
    } catch (error: any) {
      toast({ title: "Connection Failed", description: error.message || "Failed to connect Google", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const validateCurrentStep = (): string | null => {
    switch (currentStep) {
      case 2:
        if (!fullName.trim() || !email.trim()) return "Please fill in all required fields.";
        break;
      case 3:
        if (education.length === 0) return "Please fill in all required fields.";
        break;
      case 6:
        if (skills.length === 0) return "Please fill in all required fields.";
        break;
    }
    return null;
  };

  const handleNext = async () => {
    setLoading(true);
    try {
      const validationError = validateCurrentStep();
      if (validationError) {
        toast({ title: "Required Fields", description: validationError, variant: "destructive" });
        setLoading(false);
        return;
      }
      setCurrentStep((prev) => Math.min(prev + 1, 6));
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

  const handleComplete = async () => {
    const validationError = validateCurrentStep();
    if (validationError) {
      toast({ title: "Required Fields", description: validationError, variant: "destructive" });
      return;
    }
    if (!userId) return;

    setLoading(true);
    try {
      const profileData = {
        full_name: fullName,
        email,
        phone,
        location,
        summary,
        education,
        experience,
        certifications,
        skills: skills.map(s => ({ name: s.name, category: s.category, proficiency_level: s.proficiency_level })),
        linkedin_connected: linkedinConnected,
        google_connected: googleConnected,
        onboarding_completed: true,
      };

      await saveProfile(userId, profileData);

      toast({ title: "Welcome!", description: "Your profile is complete. Let's get started!" });
      navigate("/");
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to complete onboarding", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const addEducation = () => {
    setEducation([...education, { id: crypto.randomUUID(), school: "", degree: "", field: "", startDate: "", endDate: "", description: "" }]);
  };
  const removeEducation = (id: string) => setEducation(education.filter((e) => e.id !== id));
  const updateEducation = (id: string, field: keyof Education, value: string) => {
    setEducation(education.map((e) => (e.id === id ? { ...e, [field]: value } : e)));
  };

  const addExperience = () => {
    setExperience([...experience, { id: crypto.randomUUID(), company: "", position: "", startDate: "", endDate: "", description: "" }]);
  };
  const removeExperience = (id: string) => setExperience(experience.filter((e) => e.id !== id));
  const updateExperience = (id: string, field: keyof Experience, value: string) => {
    setExperience(experience.map((e) => (e.id === id ? { ...e, [field]: value } : e)));
  };

  const addCertification = () => {
    setCertifications([...certifications, { id: crypto.randomUUID(), name: "", issuer: "", date: "", url: "" }]);
  };
  const removeCertification = (id: string) => setCertifications(certifications.filter((c) => c.id !== id));
  const updateCertification = (id: string, field: keyof Certification, value: string) => {
    setCertifications(certifications.map((c) => (c.id === id ? { ...c, [field]: value } : c)));
  };

  const addSkill = () => {
    if (!newSkill.name.trim()) {
      toast({ title: "Missing Information", description: "Please enter a skill name", variant: "destructive" });
      return;
    }
    setSkills([...skills, { id: crypto.randomUUID(), name: newSkill.name.trim(), category: newSkill.category, proficiency_level: newSkill.proficiency_level }]);
    setNewSkill({ name: "", category: "technical", proficiency_level: 3 });
  };
  const removeSkill = (id: string) => setSkills(skills.filter((s) => s.id !== id));

  const filteredSkills = selectedCategory === "all" ? skills : skills.filter((s) => s.category === selectedCategory);

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const progress = (currentStep / 6) * 100;

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-xl gradient-hero flex items-center justify-center shadow-glow mx-auto mb-4">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Complete Your Profile</h1>
          <p className="text-muted-foreground">Step {currentStep} of 6</p>
        </div>

        <div className="mb-8">
          <Progress value={progress} className="h-2" />
          <div className="flex justify-between mt-2 text-xs text-muted-foreground">
            <span className={currentStep >= 1 ? "text-primary font-semibold" : ""}>Connect</span>
            <span className={currentStep >= 2 ? "text-primary font-semibold" : ""}>Basic Info</span>
            <span className={currentStep >= 3 ? "text-primary font-semibold" : ""}>Education</span>
            <span className={currentStep >= 4 ? "text-primary font-semibold" : ""}>Experience</span>
            <span className={currentStep >= 5 ? "text-primary font-semibold" : ""}>Certifications</span>
            <span className={currentStep >= 6 ? "text-primary font-semibold" : ""}>Skills</span>
          </div>
        </div>

        <Card className="p-8 gradient-card border-border shadow-elegant">
          {/* Step 1: OAuth Connections */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold mb-2">Connect Your Accounts</h2>
                <p className="text-muted-foreground">Connect your LinkedIn and Gmail to enhance your experience (optional)</p>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <Card className="p-6 border-border hover:border-primary transition-colors">
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className="w-16 h-16 rounded-full bg-[#0077B5] flex items-center justify-center">
                      <Linkedin className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">LinkedIn</h3>
                      <p className="text-sm text-muted-foreground">Import your professional profile</p>
                    </div>
                    <Button onClick={handleLinkedInConnect} disabled={loading || linkedinConnected} className="w-full" variant={linkedinConnected ? "outline" : "default"}>
                      {linkedinConnected ? "✓ Connected" : "Connect LinkedIn"}
                    </Button>
                  </div>
                </Card>
                <Card className="p-6 border-border hover:border-primary transition-colors">
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-r from-red-500 to-yellow-500 flex items-center justify-center">
                      <Mail className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Gmail</h3>
                      <p className="text-sm text-muted-foreground">Connect your email account</p>
                    </div>
                    <Button onClick={handleGoogleConnect} disabled={loading || googleConnected} className="w-full" variant={googleConnected ? "outline" : "default"}>
                      {googleConnected ? "✓ Connected" : "Connect Gmail"}
                    </Button>
                  </div>
                </Card>
              </div>
            </div>
          )}

          {/* Step 2: Basic Information */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold mb-2">Basic Information</h2>
                <p className="text-muted-foreground">Tell us about yourself</p>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name <span className="text-destructive">*</span></Label>
                  <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="John Doe" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email <span className="text-destructive">*</span></Label>
                  <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="john@example.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 (555) 123-4567" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input id="location" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="New York, USA" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="summary">Professional Summary</Label>
                <Textarea id="summary" value={summary} onChange={(e) => setSummary(e.target.value)} placeholder="A brief summary of your professional background and career goals..." rows={4} />
              </div>
            </div>
          )}

          {/* Step 3: Education */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <GraduationCap className="w-12 h-12 mx-auto mb-2 text-primary" />
                <h2 className="text-2xl font-bold mb-2">Education</h2>
                <p className="text-muted-foreground">Add your educational background <span className="text-destructive">*</span></p>
              </div>
              <div className="space-y-4">
                {education.map((edu) => (
                  <Card key={edu.id} className="p-4 border-border">
                    <div className="space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <Input placeholder="School/University" value={edu.school} onChange={(e) => updateEducation(edu.id, "school", e.target.value)} />
                        <Input placeholder="Degree" value={edu.degree} onChange={(e) => updateEducation(edu.id, "degree", e.target.value)} />
                        <Input placeholder="Field of Study" value={edu.field} onChange={(e) => updateEducation(edu.id, "field", e.target.value)} />
                        <div className="grid grid-cols-2 gap-2">
                          <Input type="month" placeholder="Start Date" value={edu.startDate} onChange={(e) => updateEducation(edu.id, "startDate", e.target.value)} />
                          <Input type="month" placeholder="End Date" value={edu.endDate} onChange={(e) => updateEducation(edu.id, "endDate", e.target.value)} />
                        </div>
                      </div>
                      <Textarea placeholder="Description (optional)" value={edu.description} onChange={(e) => updateEducation(edu.id, "description", e.target.value)} rows={2} />
                      <Button variant="outline" size="sm" onClick={() => removeEducation(edu.id)} className="w-full">Remove</Button>
                    </div>
                  </Card>
                ))}
              </div>
              <Button onClick={addEducation} variant="outline" className="w-full">+ Add Education</Button>
            </div>
          )}

          {/* Step 4: Experience */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <Briefcase className="w-12 h-12 mx-auto mb-2 text-primary" />
                <h2 className="text-2xl font-bold mb-2">Work Experience</h2>
                <p className="text-muted-foreground">Add your professional experience (optional)</p>
              </div>
              <div className="space-y-4">
                {experience.map((exp) => (
                  <Card key={exp.id} className="p-4 border-border">
                    <div className="space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <Input placeholder="Company" value={exp.company} onChange={(e) => updateExperience(exp.id, "company", e.target.value)} />
                        <Input placeholder="Position" value={exp.position} onChange={(e) => updateExperience(exp.id, "position", e.target.value)} />
                        <div className="grid grid-cols-2 gap-2 md:col-span-2">
                          <Input type="month" placeholder="Start Date" value={exp.startDate} onChange={(e) => updateExperience(exp.id, "startDate", e.target.value)} />
                          <Input type="month" placeholder="End Date" value={exp.endDate} onChange={(e) => updateExperience(exp.id, "endDate", e.target.value)} />
                        </div>
                      </div>
                      <Textarea placeholder="Description (optional)" value={exp.description} onChange={(e) => updateExperience(exp.id, "description", e.target.value)} rows={3} />
                      <Button variant="outline" size="sm" onClick={() => removeExperience(exp.id)} className="w-full">Remove</Button>
                    </div>
                  </Card>
                ))}
              </div>
              <Button onClick={addExperience} variant="outline" className="w-full">+ Add Experience</Button>
            </div>
          )}

          {/* Step 5: Certifications */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <Award className="w-12 h-12 mx-auto mb-2 text-primary" />
                <h2 className="text-2xl font-bold mb-2">Certifications</h2>
                <p className="text-muted-foreground">Add your professional certifications (optional)</p>
              </div>
              <div className="space-y-4">
                {certifications.map((cert) => (
                  <Card key={cert.id} className="p-4 border-border">
                    <div className="space-y-3">
                      <div className="grid md:grid-cols-2 gap-3">
                        <Input placeholder="Certification Name" value={cert.name} onChange={(e) => updateCertification(cert.id, "name", e.target.value)} />
                        <Input placeholder="Issuer" value={cert.issuer} onChange={(e) => updateCertification(cert.id, "issuer", e.target.value)} />
                        <Input type="month" placeholder="Date" value={cert.date} onChange={(e) => updateCertification(cert.id, "date", e.target.value)} />
                        <Input placeholder="URL (optional)" value={cert.url} onChange={(e) => updateCertification(cert.id, "url", e.target.value)} />
                      </div>
                      <Button variant="outline" size="sm" onClick={() => removeCertification(cert.id)} className="w-full">Remove</Button>
                    </div>
                  </Card>
                ))}
              </div>
              <Button onClick={addCertification} variant="outline" className="w-full">+ Add Certification</Button>
            </div>
          )}

          {/* Step 6: Skills */}
          {currentStep === 6 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <Code className="w-12 h-12 mx-auto mb-2 text-primary" />
                <h2 className="text-2xl font-bold mb-2">Skills</h2>
                <p className="text-muted-foreground">Add at least one skill <span className="text-destructive">*</span></p>
              </div>

              <Card className="p-4 border-border">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="skillName">Skill Name</Label>
                    <Input id="skillName" value={newSkill.name} onChange={(e) => setNewSkill({ ...newSkill, name: e.target.value })} placeholder="e.g., React, Python, Leadership" onKeyDown={(e) => e.key === "Enter" && addSkill()} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <select id="category" value={newSkill.category} onChange={(e) => setNewSkill({ ...newSkill, category: e.target.value as SkillCategory })} className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                      {(Object.keys(categoryConfig) as SkillCategory[]).map((cat) => (
                        <option key={cat} value={cat}>{categoryConfig[cat].label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="proficiency">Proficiency Level (1-5)</Label>
                    <div className="flex items-center gap-2">
                      <input type="range" id="proficiency" min="1" max="5" value={newSkill.proficiency_level} onChange={(e) => setNewSkill({ ...newSkill, proficiency_level: parseInt(e.target.value) })} className="flex-1" />
                      <span className="w-8 text-center font-medium">{newSkill.proficiency_level}</span>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Beginner</span>
                      <span>Expert</span>
                    </div>
                  </div>
                  <Button onClick={addSkill} variant="outline" className="w-full">
                    <Plus className="w-4 h-4 mr-2" />Add Skill
                  </Button>
                </div>
              </Card>

              {skills.length > 0 && (
                <Card className="p-4 border-border">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                    <h3 className="font-semibold">Your Skills ({skills.length})</h3>
                    <div className="flex flex-wrap gap-2">
                      <Button variant={selectedCategory === "all" ? "default" : "outline"} size="sm" onClick={() => setSelectedCategory("all")}>All</Button>
                      {(Object.keys(categoryConfig) as SkillCategory[]).map((cat) => (
                        <Button key={cat} variant={selectedCategory === cat ? "default" : "outline"} size="sm" onClick={() => setSelectedCategory(cat)} className="gap-1">
                          {categoryConfig[cat].icon}
                          <span className="hidden sm:inline">{categoryConfig[cat].label}</span>
                        </Button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    {filteredSkills.map((skill) => {
                      const config = categoryConfig[skill.category];
                      return (
                        <div key={skill.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors group">
                          <div className="flex items-center gap-3 min-w-0">
                            <Badge variant="outline" className={`${config.color} shrink-0`}>
                              {config.icon}
                              <span className="ml-1 hidden sm:inline">{config.label}</span>
                            </Badge>
                            <span className="font-medium truncate">{skill.name}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1">
                              {[1, 2, 3, 4, 5].map((level) => (
                                <div key={level} className={`w-2 h-2 rounded-full ${level <= skill.proficiency_level ? "bg-primary" : "bg-muted-foreground/30"}`} />
                              ))}
                            </div>
                            <Button variant="ghost" size="sm" onClick={() => removeSkill(skill.id)} className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </Card>
              )}
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex gap-4 mt-8">
            {currentStep > 1 && (
              <Button variant="outline" onClick={handleBack} disabled={loading} className="flex-1">
                <ChevronLeft className="w-4 h-4 mr-2" />Back
              </Button>
            )}
            {currentStep < 6 ? (
              <Button onClick={handleNext} disabled={loading} className="flex-1" variant="hero">
                Next<ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={handleComplete} disabled={loading} className="flex-1" variant="hero">
                Complete
              </Button>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
