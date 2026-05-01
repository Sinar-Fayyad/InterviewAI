import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import {
  fetchProfile,
  saveProfile,
  socialiteRedirect,
} from "@/services/profileService";
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
import {
  backendToFrontendSkillCategory,
  Education,
  Experience,
  Certification,
  Skill,
  SkillCategory,
} from "@/components/onboarding/types";

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
  const [newSkill, setNewSkill] = useState({
    name: "",
    category: "technical" as SkillCategory,
    proficiency_level: 3,
  });
  const [selectedCategory, setSelectedCategory] = useState<
    SkillCategory | "all"
  >("all");

  useEffect(() => {
    const checkProfile = async () => {
      if (authLoading) return;
      if (!userId) {
        navigate("/auth");
        return;
      }

      try {
        const data = await fetchProfile(userId);
        if (data?.user_info?.onboarding_completed) {
          navigate("/dashboard");
          return;
        }
        if (data?.user_info) {
          const userInfo = Array.isArray(data.user_info)
            ? data.user_info[0]
            : data.user_info;
          setFullName(
            `${userInfo.first_name || ""} ${userInfo.last_name || ""}`.trim(),
          );
          setEmail(userInfo.email || user?.email || "");
          setPhone(userInfo.phone || "");
          setLocation(userInfo.location || "");
          setSummary(userInfo.summary || "");

          // Transform backend education data to frontend format
          setEducation(
            (data.education || []).map((edu: any) => ({
              id: crypto.randomUUID(),
              school: edu.institution_name || "",
              degree: edu.degree || "",
              field: edu.field_of_study || "",
              startDate: edu.start_date ? edu.start_date.substring(0, 7) : "", // YYYY-MM-DD -> YYYY-MM
              endDate: edu.end_date ? edu.end_date.substring(0, 7) : "",
              description: edu.description || "",
            })),
          );

          // Transform backend experience data to frontend format
          setExperience(
            (data.experience || []).map((exp: any) => ({
              id: crypto.randomUUID(),
              company: exp.company_name || "",
              position: exp.position || "",
              startDate: exp.start_date ? exp.start_date.substring(0, 7) : "",
              endDate: exp.end_date ? exp.end_date.substring(0, 7) : "",
              description: exp.description || "",
            })),
          );

          // Transform backend certifications data to frontend format
          setCertifications(
            (data.certifications || []).map((cert: any) => ({
              id: crypto.randomUUID(),
              name: cert.certification_name || "",
              issuer: cert.organization_name || "",
              date: cert.date_obtained
                ? cert.date_obtained.substring(0, 7)
                : "",
              url: cert.url || "",
            })),
          );

          // Transform backend skills data to frontend format
          setSkills(
            (data.skills || []).map((skill: any) => ({
              id: crypto.randomUUID(),
              name: skill.name || "",
              category: backendToFrontendSkillCategory(skill.category),
              proficiency_level: skill.proficiency || 3,
            })),
          );

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
      const url = await socialiteRedirect("linkedin-openid", userId);
      if (url) window.location.href = url;
    } catch (error: any) {
      toast({
        title: "Connection Failed",
        description: error.message || "Failed to connect LinkedIn",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleConnect = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const url = await socialiteRedirect("google", userId);
      if (url) window.location.href = url;
    } catch (error: any) {
      toast({
        title: "Connection Failed",
        description: error.message || "Failed to connect Google",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const validateCurrentStep = (): string | null => {
    switch (currentStep) {
      case 2:
        if (!fullName.trim() || !email.trim())
          return "Please fill in all required fields.";
        break;
      case 3:
        if (education.length === 0)
          return "Please fill in all required fields.";
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
        toast({
          title: "Required Fields",
          description: validationError,
          variant: "destructive",
        });
        setLoading(false);
        return;
      }
      setCurrentStep((prev) => Math.min(prev + 1, 6));
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

  // Helper function to convert YYYY-MM to YYYY-MM-01 format for backend
  const formatDateForBackend = (dateStr: string): string => {
    if (!dateStr) return "";
    // If already in YYYY-MM-DD format, return as is
    if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) return dateStr;
    // If in YYYY-MM format (from month input), add -01 day
    if (dateStr.match(/^\d{4}-\d{2}$/)) return `${dateStr}-01`;
    return dateStr;
  };

  // Transform frontend data to backend expected format
  const transformDataForBackend = () => {
    const transformEducation = education.map((edu) => ({
      institution_name: edu.school,
      degree: edu.degree,
      field_of_study: edu.field,
      start_date: formatDateForBackend(edu.startDate),
      end_date: formatDateForBackend(edu.endDate),
      description: edu.description,
    }));

    const transformExperience = experience.map((exp) => ({
      company_name: exp.company,
      position: exp.position,
      start_date: formatDateForBackend(exp.startDate),
      end_date: formatDateForBackend(exp.endDate),
      description: exp.description,
    }));

    const transformCertifications = certifications.map((cert) => ({
      certification_name: cert.name,
      organization_name: cert.issuer,
      date_obtained: formatDateForBackend(cert.date),
    }));

    const transformSkills = skills.map((s) => ({
      name: s.name,
      category: s.category,
      proficiency: s.proficiency_level,
    }));

    return {
      user_info: [
        {
          first_name: fullName.split(" ")[0],
          last_name: fullName.split(" ").slice(1).join(" ") || "",
          email,
          phone,
          location,
          summary,
        },
      ],
      education: transformEducation,
      experience: transformExperience,
      certifications: transformCertifications,
      skills: transformSkills,
      linkedin_connected: linkedinConnected,
      google_connected: googleConnected,
      onboarding_completed: true,
    };
  };

  const handleComplete = async () => {
    const validationError = validateCurrentStep();
    if (validationError) {
      toast({
        title: "Required Fields",
        description: validationError,
        variant: "destructive",
      });
      return;
    }
    if (!userId) return;

    setLoading(true);
    try {
      const profileData = transformDataForBackend();

      await saveProfile(userId, profileData);

      toast({
        title: "Welcome!",
        description: "Your profile is complete. Let's get started!",
      });
      navigate("/");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to complete onboarding",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addEducation = () => {
    setEducation([
      ...education,
      {
        id: crypto.randomUUID(),
        school: "",
        degree: "",
        field: "",
        startDate: "",
        endDate: "",
        description: "",
      },
    ]);
  };
  const removeEducation = (id: string) =>
    setEducation(education.filter((e) => e.id !== id));
  const updateEducation = (
    id: string,
    field: keyof Education,
    value: string,
  ) => {
    setEducation(
      education.map((e) => (e.id === id ? { ...e, [field]: value } : e)),
    );
  };

  const addExperience = () => {
    setExperience([
      ...experience,
      {
        id: crypto.randomUUID(),
        company: "",
        position: "",
        startDate: "",
        endDate: "",
        description: "",
      },
    ]);
  };
  const removeExperience = (id: string) =>
    setExperience(experience.filter((e) => e.id !== id));
  const updateExperience = (
    id: string,
    field: keyof Experience,
    value: string,
  ) => {
    setExperience(
      experience.map((e) => (e.id === id ? { ...e, [field]: value } : e)),
    );
  };

  const addCertification = () => {
    setCertifications([
      ...certifications,
      { id: crypto.randomUUID(), name: "", issuer: "", date: "", url: "" },
    ]);
  };
  const removeCertification = (id: string) =>
    setCertifications(certifications.filter((c) => c.id !== id));
  const updateCertification = (
    id: string,
    field: keyof Certification,
    value: string,
  ) => {
    setCertifications(
      certifications.map((c) => (c.id === id ? { ...c, [field]: value } : c)),
    );
  };

  const addSkill = () => {
    if (!newSkill.name.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter a skill name",
        variant: "destructive",
      });
      return;
    }
    setSkills([
      ...skills,
      {
        id: crypto.randomUUID(),
        name: newSkill.name.trim(),
        category: newSkill.category,
        proficiency_level: newSkill.proficiency_level,
      },
    ]);
    setNewSkill({ name: "", category: "technical", proficiency_level: 3 });
  };
  const removeSkill = (id: string) =>
    setSkills(skills.filter((s) => s.id !== id));

  const filteredSkills =
    selectedCategory === "all"
      ? skills
      : skills.filter((s) => s.category === selectedCategory);

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
            <span
              className={currentStep >= 1 ? "text-primary font-semibold" : ""}
            >
              Connect
            </span>
            <span
              className={currentStep >= 2 ? "text-primary font-semibold" : ""}
            >
              Basic Info
            </span>
            <span
              className={currentStep >= 3 ? "text-primary font-semibold" : ""}
            >
              Education
            </span>
            <span
              className={currentStep >= 4 ? "text-primary font-semibold" : ""}
            >
              Experience
            </span>
            <span
              className={currentStep >= 5 ? "text-primary font-semibold" : ""}
            >
              Certifications
            </span>
            <span
              className={currentStep >= 6 ? "text-primary font-semibold" : ""}
            >
              Skills
            </span>
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
              fullName={fullName}
              email={email}
              phone={phone}
              location={location}
              summary={summary}
              setFullName={setFullName}
              setEmail={setEmail}
              setPhone={setPhone}
              setLocation={setLocation}
              setSummary={setSummary}
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
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={loading}
                className="flex-1"
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            )}
            {currentStep < 6 ? (
              <Button
                onClick={handleNext}
                disabled={loading}
                className="flex-1"
                variant="hero"
              >
                Next
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleComplete}
                disabled={loading}
                className="flex-1"
                variant="hero"
              >
                Complete
              </Button>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
