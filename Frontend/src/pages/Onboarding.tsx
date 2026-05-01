import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { fetchProfile, saveProfile, socialiteRedirect } from "@/services/profileService";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Sparkles, ChevronLeft, ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ConnectAccountsStep } from "@/components/onboarding/ConnectAccountsStep";
import { BasicInfoStep } from "@/components/onboarding/BasicInfoStep";
import { EducationStep } from "@/components/onboarding/EducationStep";
import { ExperienceStep } from "@/components/onboarding/ExperienceStep";
import { CertificationsStep } from "@/components/onboarding/CertificationsStep";
import { SkillsStep } from "@/components/onboarding/SkillsStep";
import { Education, Experience, Certification, Skill, SkillCategory } from "@/components/onboarding/types";

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
          {currentStep === 1 && (
            <ConnectAccountsStep
              loading={loading}
              linkedinConnected={linkedinConnected}
              googleConnected={googleConnected}
              onLinkedInConnect={handleLinkedInConnect}
              onGoogleConnect={handleGoogleConnect}
            />
          )}

          {currentStep === 2 && (
            <BasicInfoStep
              fullName={fullName} email={email} phone={phone} location={location} summary={summary}
              setFullName={setFullName} setEmail={setEmail} setPhone={setPhone} setLocation={setLocation} setSummary={setSummary}
            />
          )}

          {currentStep === 3 && (
            <EducationStep
              education={education}
              addEducation={addEducation}
              removeEducation={removeEducation}
              updateEducation={updateEducation}
            />
          )}

          {currentStep === 4 && (
            <ExperienceStep
              experience={experience}
              addExperience={addExperience}
              removeExperience={removeExperience}
              updateExperience={updateExperience}
            />
          )}

          {currentStep === 5 && (
            <CertificationsStep
              certifications={certifications}
              addCertification={addCertification}
              removeCertification={removeCertification}
              updateCertification={updateCertification}
            />
          )}

          {currentStep === 6 && (
            <SkillsStep
              skills={skills}
              newSkill={newSkill}
              setNewSkill={setNewSkill}
              addSkill={addSkill}
              removeSkill={removeSkill}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              filteredSkills={filteredSkills}
            />
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
