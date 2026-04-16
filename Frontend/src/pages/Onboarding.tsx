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
  institution_name: string;
  degree: string;
  field_of_study: string;
  start_date: string;
  end_date: string;
  description: string;
};

type Experience = {
  id: string;
  company_name: string;
  position: string;
  start_date: string;
  end_date: string;
  description: string;
};

type Certification = {
  id: string;
  certification_name: string;
  organization_name: string;
  date_obtained: string;
  url: string;
};

type SkillCategory = "technical" | "soft_skills" | "tools" | "languages" | "other";

type Skill = {
  id: string;
  name: string;
  category: SkillCategory;
  proficiency: number;
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

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [summary, setSummary] = useState("");

  const [education, setEducation] = useState<Education[]>([]);
  const [experience, setExperience] = useState<Experience[]>([]);
  const [certifications, setCertifications] = useState<Certification[]>([]);

  const [skills, setSkills] = useState<Skill[]>([]);
  const [newSkill, setNewSkill] = useState({ name: "", category: "technical" as SkillCategory, proficiency: 3 });
  const [selectedCategory, setSelectedCategory] = useState<"all" | SkillCategory>("all");

  useEffect(() => {
    const checkProfile = async () => {
      if (authLoading) return;
      if (!userId) { 
        navigate("/auth"); 
        return; 
      }

      try {
        const data = await fetchProfile(userId);
        if (data?.onboarding_completed) { 
          navigate("/dashboard"); 
          return; 
        }
        if (data) {
          const userInfo = Array.isArray(data.user_info) ? data.user_info[0] || {} : {};
          setFirstName(userInfo.first_name || "");
          setLastName(userInfo.last_name || "");
          setEmail(userInfo.email || data.email || user?.email || "");
          setPhone(userInfo.phone || data.phone || "");
          setLocation(userInfo.location || data.location || "");
          setSummary(userInfo.summary || data.summary || "");
          
          setEducation((data.education || []).map((e: any) => ({
            id: e.id || crypto.randomUUID(),
            institution_name: e.institution_name || "",
            degree: e.degree || "",
            field_of_study: e.field_of_study || "",
            start_date: e.start_date || "",
            end_date: e.end_date || "",
            description: e.description || ""
          })));

          setExperience((data.experience || []).map((ex: any) => ({
            id: ex.id || crypto.randomUUID(),
            company_name: ex.company_name || "",
            position: ex.position || "",
            start_date: ex.start_date || "",
            end_date: ex.end_date || "",
            description: ex.description || ""
          })));

          setCertifications((data.certifications || []).map((c: any) => ({
            id: c.id || crypto.randomUUID(),
            certification_name: c.certification_name || "",
            organization_name: c.organization_name || "",
            date_obtained: c.date_obtained || "",
            url: c.url || ""
          })));

          setSkills((data.skills || []).map((s: any) => ({
            id: s.id || crypto.randomUUID(),
            name: s.name || "",
            category: s.category as SkillCategory || "technical",
            proficiency: s.proficiency || 3
          })));

          setLinkedinConnected(data.linkedin_connected || false);
          setGoogleConnected(data.google_connected || false);
        }
      } catch (error) {
        console.error("Error checking profile:", error);
      }
      setIsChecking(false);
    };
    checkProfile();
  }, [userId, authLoading, navigate, user]);

  const handleLinkedInConnect = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const data = await socialiteRedirect("linkedin-openid", userId);
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
        if (!firstName.trim() || !lastName.trim() || !email.trim()) return "Please fill in all required fields.";
        break;
      case 3:
        if (education.length === 0) return "Please add at least one education entry.";
        break;
      case 6:
        if (skills.length === 0) return "Please add at least one skill.";
        break;
    }
    return null;
  };

  const handleNext = async () => {
    const validationError = validateCurrentStep();
    if (validationError) {
      toast({ title: "Validation Error", description: validationError, variant: "destructive" });
      return;
    }
    setCurrentStep((prev) => Math.min(prev + 1, 6));
  };

  const handleBack = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

  const handleComplete = async () => {
    const validationError = validateCurrentStep();
    if (validationError) {
      toast({ title: "Validation Error", description: validationError, variant: "destructive" });
      return;
    }
    if (!userId) {
      toast({ title: "Error", description: "User not authenticated", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const profileData = {
        user_info: [{
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          phone: phone.trim(),
          location: location.trim(),
          summary: summary.trim()
        }],
        education: education.map(e => ({
          institution_name: e.institution_name.trim(),
          degree: e.degree.trim(),
          field_of_study: e.field_of_study.trim(),
          start_date: e.start_date,
          end_date: e.end_date,
          description: e.description.trim()
        })),
        experience: experience.map(ex => ({
          company_name: ex.company_name.trim(),
          position: ex.position.trim(),
          start_date: ex.start_date,
          end_date: ex.end_date,
          description: ex.description.trim()
        })),
        certifications: certifications.map(c => ({
          certification_name: c.certification_name.trim(),
          organization_name: c.organization_name.trim(),
          date_obtained: c.date_obtained,
          url: c.url.trim()
        })),
        skills: skills.map(s => ({
          name: s.name.trim(),
          category: s.category,
          proficiency: s.proficiency
        })),
        linkedin_connected: linkedinConnected,
        google_connected: googleConnected,
        onboarding_completed: true
      };

      await saveProfile(userId, profileData);
      toast({ title: "Success!", description: "Profile saved! Welcome to your dashboard.", });
      navigate("/dashboard");
    } catch (error: any) {
      console.error("Onboarding error:", error);
      toast({ title: "Save Failed", description: error.message || "Failed to save profile. Please try again.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const addEducation = () => {
    setEducation([...education, { id: crypto.randomUUID(), institution_name: "", degree: "", field_of_study: "", start_date: "", end_date: "", description: "" }]);
  };

  const removeEducation = (id: string) => {
    setEducation(education.filter((e) => e.id !== id));
  };

  const updateEducation = (id: string, field: keyof Education, value: string) => {
    setEducation(education.map((e) => (e.id === id ? { ...e, [field]: value } : e)));
  };

  const addExperience = () => {
    setExperience([...experience, { id: crypto.randomUUID(), company_name: "", position:"", start_date: "", end_date:"", description: "" }]);
  };

  const removeExperience = (id: string) => {
    setExperience(experience.filter((e) => e.id !== id));
  };

  const updateExperience = (id: string, field: keyof Experience, value: string) => {
    setExperience(experience.map((e) => (e.id === id ? { ...e, [field]: value } : e)));
  };

  const addCertification = () => {
    setCertifications([...certifications, { id: crypto.randomUUID(), certification_name: "", organization_name: "", date_obtained:"", url: "" }]);
  };

  const removeCertification = (id: string) => {
    setCertifications(certifications.filter((c) => c.id !== id));
  };

  const updateCertification = (id: string, field: keyof Certification, value: string) => {
    setCertifications(certifications.map((c) => (c.id === id ? { ...c, [field]: value } : c)));
  };

  const addSkill = () => {
    if (!newSkill.name.trim()) {
      toast({ title: "Missing Skill Name", description: "Please enter a skill name", variant: "destructive" });
      return;
    }
    setSkills([...skills, { id: crypto.randomUUID(), name: newSkill.name.trim(), category: newSkill.category, proficiency: newSkill.proficiency }]);
    setNewSkill({ name: "", category: "technical" as SkillCategory, proficiency: 3 });
  };

  const removeSkill = (id: string) => {
    setSkills(skills.filter((s) => s.id !== id));
  };

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
                <p className="text-muted-foreground">Connect your social accounts (optional)</p>
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
                      <p className="text-sm text-muted-foreground">Connect your email for job tracking</p>
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
                  <Label htmlFor="firstName">First Name <span className="text-destructive">*</span></Label>
                  <Input id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="John" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name <span className="text-destructive">*</span></Label>
                  <Input id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Doe" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email <span className="text-destructive">*</span></Label>
                  <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="john@example.com" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 (555) 123-4567" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="location">Location</Label>
                  <Input id="location" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="New York, NY" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="summary">Professional Summary</Label>
                <Textarea id="summary" value={summary} onChange={(e) => setSummary(e.target.value)} placeholder="Tell us about your professional background, experience, and career goals..." rows={4} />
              </div>
            </div>
          )}

          {/* Step 3: Education */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <GraduationCap className="w-12 h-12 mx-auto mb-2 text-primary" />
                <h2 className="text-2xl font-bold mb-2">Education</h2>
                <p className="text-muted-foreground mb-4">Add your educational background <span className="text-destructive">*</span></p>
              </div>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {education.map((edu) => (
                  <Card key={edu.id} className="p-4 border-border">
                    <div className="space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Institution Name</Label>
                          <Input 
                            value={edu.institution_name} 
                            onChange={(e) => updateEducation(edu.id, "institution_name", e.target.value)} 
                            placeholder="Harvard University" 
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Degree</Label>
                          <Input 
                            value={edu.degree} 
                            onChange={(e) => updateEducation(edu.id, "degree", e.target.value)} 
                            placeholder="Bachelor of Science" 
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Field of Study</Label>
                          <Input 
                            value={edu.field_of_study} 
                            onChange={(e) => updateEducation(edu.id, "field_of_study", e.target.value)} 
                            placeholder="Computer Science" 
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-2">
                            <Label>Start Date</Label>
                            <Input 
                              type="month" 
                              value={edu.start_date} 
                              onChange={(e) => updateEducation(edu.id, "start_date", e.target.value)} 
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>End Date</Label>
                            <Input 
                              type="month" 
                              value={edu.end_date} 
                              onChange={(e) => updateEducation(edu.id, "end_date", e.target.value)} 
                            />
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Description</Label>
                        <Textarea 
                          value={edu.description} 
                          onChange={(e) => updateEducation(edu.id, "description", e.target.value)} 
                          rows={2} 
                          placeholder="Relevant coursework, achievements, GPA..."
                        />
                      </div>
                      <Button variant="outline" size="sm" onClick={() => removeEducation(edu.id)} className="w-full">
                        <Trash2 className="w-4 h-4 mr-2" /> Remove Education
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
              <Button onClick={addEducation} variant="outline" className="w-full">
                <Plus className="w-4 h-4 mr-2" /> Add Education
              </Button>
            </div>
          )}

          {/* Step 4: Work Experience */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <Briefcase className="w-12 h-12 mx-auto mb-2 text-primary" />
                <h2 className="text-2xl font-bold mb-2">Work Experience</h2>
                <p className="text-muted-foreground">Add your professional experience</p>
              </div>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {experience.map((exp) => (
                  <Card key={exp.id} className="p-4 border-border">
                    <div className="space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Company Name</Label>
                          <Input 
                            value={exp.company_name} 
                            onChange={(e) => updateExperience(exp.id, "company_name", e.target.value)} 
                            placeholder="Google" 
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Position</Label>
                          <Input 
                            value={exp.position} 
                            onChange={(e) => updateExperience(exp.id, "position", e.target.value)} 
                            placeholder="Software Engineer" 
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2 md:col-span-2">
                          <div className="space-y-2">
                            <Label>Start Date</Label>
                            <Input 
                              type="month" 
                              value={exp.start_date} 
                              onChange={(e) => updateExperience(exp.id, "start_date", e.target.value)} 
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>End Date</Label>
                            <Input 
                              type="month" 
                              value={exp.end_date} 
                              onChange={(e) => updateExperience(exp.id, "end_date", e.target.value)} 
                            />
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Description</Label>
                        <Textarea 
                          value={exp.description} 
                          onChange={(e) => updateExperience(exp.id, "description", e.target.value)} 
                          rows={3} 
                          placeholder="Key responsibilities and achievements..."
                        />
                      </div>
                      <Button variant="outline" size="sm" onClick={() => removeExperience(exp.id)} className="w-full">
                        <Trash2 className="w-4 h-4 mr-2" /> Remove Experience
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
              <Button onClick={addExperience} variant="outline" className="w-full">
                <Plus className="w-4 h-4 mr-2" /> Add Experience
              </Button>
            </div>
          )}

          {/* Step 5: Certifications */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <Award className="w-12 h-12 mx-auto mb-2 text-primary" />
                <h2 className="text-2xl font-bold mb-2">Certifications</h2>
                <p className="text-muted-foreground">Add your certifications</p>
              </div>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {certifications.map((cert) => (
                  <Card key={cert.id} className="p-4 border-border">
                    <div className="space-y-3">
                      <div className="grid md:grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label>Certification Name</Label>
                          <Input 
                            value={cert.certification_name} 
                            onChange={(e) => updateCertification(cert.id, "certification_name", e.target.value)} 
                            placeholder="AWS Certified Developer" 
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Organization</Label>
                          <Input 
                            value={cert.organization_name} 
                            onChange={(e) => updateCertification(cert.id, "organization_name", e.target.value)} 
                            placeholder="Amazon Web Services" 
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Date Obtained</Label>
                          <Input 
                            type="month" 
                            value={cert.date_obtained} 
                            onChange={(e) => updateCertification(cert.id, "date_obtained", e.target.value)} 
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Certificate URL (optional)</Label>
                          <Input 
                            value={cert.url} 
                            onChange={(e) => updateCertification(cert.id, "url", e.target.value)} 
                            placeholder="https://example.com/cert.pdf" 
                          />
                        </div>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => removeCertification(cert.id)} className="w-full">
                        <Trash2 className="w-4 h-4 mr-2" /> Remove Certification
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
              <Button onClick={addCertification} variant="outline" className="w-full">
                <Plus className="w-4 h-4 mr-2" /> Add Certification
              </Button>
            </div>
          )}

          {/* Step 6: Skills */}
          {currentStep === 6 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <Code className="w-12 h-12 mx-auto mb-2 text-primary" />
                <h2 className="text-2xl font-bold mb-2">Skills & Expertise</h2>
                <p className="text-muted-foreground">Add your top skills <span className="text-destructive">*</span></p>
              </div>

              {/* Add Skill Form */}
              <Card className="p-6 border-border">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Skill Name</Label>
                    <Input 
                      value={newSkill.name} 
                      onChange={(e) => setNewSkill({ ...newSkill, name: e.target.value })} 
                      placeholder="React, Python, Leadership" 
                      onKeyDown={(e) => e.key === "Enter" && addSkill()}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <select 
                      value={newSkill.category} 
                      onChange={(e) => setNewSkill({ ...newSkill, category: e.target.value as SkillCategory })} 
                      className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                      <option value="technical">Technical</option>
                      <option value="soft_skills">Soft Skills</option>
                      <option value="tools">Tools</option>
                      <option value="languages">Languages</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Proficiency (1-5)</Label>
                    <div className="flex items-center gap-2">
                      <input 
                        type="range" 
                        min="1" 
                        max="5" 
                        value={newSkill.proficiency} 
                        onChange={(e) => setNewSkill({ ...newSkill, proficiency: parseInt(e.target.value) })} 
                        className="flex-1 h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                      />
                      <span className="w-8 text-center font-mono font-bold text-lg">{newSkill.proficiency}</span>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Beginner</span>
                      <span>Expert</span>
                    </div>
                  </div>
                  <Button onClick={addSkill} className="w-full" disabled={!newSkill.name.trim()}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Skill
                  </Button>
                </div>
              </Card>

              {/* Skills List */}
              {skills.length > 0 && (
                <Card className="p-6 border-border">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <h3 className="text-lg font-semibold">Your Skills ({skills.length})</h3>
                    <div className="flex flex-wrap gap-1">
                      <Button 
                        variant={selectedCategory === "all" ? "default" : "ghost"} 
                        size="sm" 
                        onClick={() => setSelectedCategory("all")}
                      >
                        All
                      </Button>
                      {Object.entries(categoryConfig).map(([key, config]) => (
                        <Button 
                          key={key} 
                          variant={selectedCategory === key ? "default" : "ghost"} 
                          size="sm" 
                          onClick={() => setSelectedCategory(key as SkillCategory)}
                          className="gap-1 px-2 py-1"
                        >
                          {config.icon}
                          <span className="hidden sm:inline">{config.label}</span>
                        </Button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    {filteredSkills.map((skill) => {
                      const config = categoryConfig[skill.category];
                      return (
                        <div key={skill.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors group">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <Badge variant="outline" className={`${config.color} p-2 shrink-0`}>
                              {config.icon}
                            </Badge>
                            <span className="font-medium truncate">{skill.name}</span>
                          </div>
                          <div className="flex items-center gap-4 ml-4 flex-shrink-0">
                            <div className="flex items-center gap-1">
                              {Array.from({ length: 5 }, (_, i) => i + 1).map((level) => (
                                <div 
                                  key={level} 
                                  className={`w-2 h-2 rounded-full transition-colors ${
                                    level <= skill.proficiency 
                                      ? "bg-primary" 
                                      : "bg-muted-foreground/50"
                                  }`}
                                />
                              ))}
                            </div>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => removeSkill(skill.id)} 
                              className="opacity-0 group-hover:opacity-100 h-8 w-8 p-0"
                            >
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

          {/* Navigation */}
          <div className="flex gap-3 mt-8">
            {currentStep > 1 && (
              <Button 
                variant="outline" 
                onClick={handleBack} 
                className="flex-1" 
                disabled={loading}
              >
                <ChevronLeft className="w-4 h-4 mr-2 h-4 w-4" />
                Back
              </Button>
            )}
            {currentStep < 6 ? (
              <Button onClick={handleNext} className="flex-1" disabled={loading}>
                Next
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={handleComplete} className="flex-1" disabled={loading}>
                {loading ? "Saving..." : "Complete Onboarding"}
              </Button>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

