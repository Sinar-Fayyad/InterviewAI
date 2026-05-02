import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { fetchProfile, saveProfile } from "@/services/profileService";
import { Navigation } from "@/components/layout/Navigation";
import { BackButton } from "@/components/layout/BackButton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { ConnectAccountsStep } from "@/components/onboarding/ConnectAccountsStep";
import { BasicInfoStep } from "@/components/onboarding/BasicInfoStep";
import { EducationStep } from "@/components/onboarding/EducationStep";
import { ExperienceStep } from "@/components/onboarding/ExperienceStep";
import { CertificationsStep } from "@/components/onboarding/CertificationsStep";
import { SkillsStep } from "@/components/onboarding/SkillsStep";
import {
  Education,
  Experience,
  Certification,
  Skill,
  SkillCategory,
  backendToFrontendSkillCategory,
} from "@/components/onboarding/types";

interface BasicInfo {
  full_name: string;
  email: string;
  phone: string;
  location: string;
  summary: string;
}

interface ProfileData {
  basicInfo: BasicInfo;
  education: Education[];
  experience: Experience[];
  certifications: Certification[];
  skills: Skill[];
}

const extractDateYearMonth = (dateStr: string | null | undefined): string => {
  if (!dateStr) return "";
  // Handle various date formats
  if (typeof dateStr === "string") {
    // If it's already in YYYY-MM format, return as-is
    if (dateStr.length === 7 && dateStr[4] === "-") {
      return dateStr;
    }
    // If it's in YYYY-MM-DD format, extract first 7 chars
    if (dateStr.length >= 10 && dateStr[4] === "-" && dateStr[7] === "-") {
      return dateStr.substring(0, 7);
    }
  }
  return "";
};

const Profile = () => {
  const { userId, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [linkedinConnected, setLinkedinConnected] = useState(false);
  const [googleConnected, setGoogleConnected] = useState(false);

  const [profileData, setProfileData] = useState<ProfileData>({
    basicInfo: {
      full_name: "",
      email: "",
      phone: "",
      location: "",
      summary: "",
    },
    education: [],
    experience: [],
    certifications: [],
    skills: [],
  });

  // Aliases for the component props
  const fullName = profileData.basicInfo.full_name;
  const email = profileData.basicInfo.email;
  const phone = profileData.basicInfo.phone;
  const location = profileData.basicInfo.location;
  const summary = profileData.basicInfo.summary;

  const setFullName = (v: string) =>
    setProfileData((p) => ({
      ...p,
      basicInfo: { ...p.basicInfo, full_name: v },
    }));
  const setPhone = (v: string) =>
    setProfileData((p) => ({ ...p, basicInfo: { ...p.basicInfo, phone: v } }));
  const setLocation = (v: string) =>
    setProfileData((p) => ({
      ...p,
      basicInfo: { ...p.basicInfo, location: v },
    }));
  const setSummary = (v: string) =>
    setProfileData((p) => ({
      ...p,
      basicInfo: { ...p.basicInfo, summary: v },
    }));

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
    if (authLoading) return;
    if (!userId) {
      navigate("/auth");
      return;
    }
    loadProfile();
  }, [userId, authLoading, navigate]);

  const loadProfile = async () => {
    if (!userId) return;
    try {
      const data = await fetchProfile(userId);
      if (data) {
        const userInfo = data.user_info?.[0] || {};

        setProfileData({
          basicInfo: {
            full_name:
              `${userInfo.first_name || ""} ${userInfo.last_name || ""}`.trim() ||
              "",
            email: userInfo.email || "",
            phone: userInfo.phone || "",
            location: userInfo.location || "",
            summary: userInfo.summary || "",
          },
          education: (data.education || []).map((edu: any, index: number) => ({
            id: edu.id != null ? String(edu.id) : `edu_${index}_${Date.now()}`,
            school: edu.institution_name || "",
            degree: edu.degree || "",
            field: edu.field_of_study || "",
            startDate: extractDateYearMonth(edu.start_date),
            endDate: extractDateYearMonth(edu.end_date),
            description: edu.description || "",
          })),
          experience: (data.experience || []).map(
            (exp: any, index: number) => ({
              id:
                exp.id != null ? String(exp.id) : `exp_${index}_${Date.now()}`,
              company: exp.company_name || "",
              position: exp.position || "",
              startDate: extractDateYearMonth(exp.start_date),
              endDate: extractDateYearMonth(exp.end_date),
              description: exp.description || "",
            }),
          ),
          certifications: (data.certifications || []).map(
            (cert: any, index: number) => ({
              id:
                cert.id != null
                  ? String(cert.id)
                  : `cert_${index}_${Date.now()}`,
              name: cert.certification_name || "",
              issuer: cert.organization_name || "",
              date: extractDateYearMonth(cert.date_obtained),
              url: cert.url || "",
            }),
          ),
          skills: (data.skills || []).map((skill: any) => ({
            id: String(skill.id ?? ""),
            name: skill.name,
            category: backendToFrontendSkillCategory(skill.category),
            proficiency_level: Math.round((skill.proficiency || 60) / 20),
          })),
        });

        // Also update the individual state variables
        setEducation(
          (data.education || []).map((edu: any, index: number) => ({
            id: edu.id != null ? String(edu.id) : `edu_${index}_${Date.now()}`,
            school: edu.institution_name || "",
            degree: edu.degree || "",
            field: edu.field_of_study || "",
            startDate: extractDateYearMonth(edu.start_date),
            endDate: extractDateYearMonth(edu.end_date),
            description: edu.description || "",
          })),
        );

        setExperience(
          (data.experience || []).map((exp: any, index: number) => ({
            id: exp.id != null ? String(exp.id) : `exp_${index}_${Date.now()}`,
            company: exp.company_name || "",
            position: exp.position || "",
            startDate: extractDateYearMonth(exp.start_date),
            endDate: extractDateYearMonth(exp.end_date),
            description: exp.description || "",
          })),
        );

        setCertifications(
          (data.certifications || []).map((cert: any, index: number) => ({
            id:
              cert.id != null ? String(cert.id) : `cert_${index}_${Date.now()}`,
            name: cert.certification_name || "",
            issuer: cert.organization_name || "",
            date: extractDateYearMonth(cert.date_obtained),
            url: cert.url || "",
          })),
        );

        setSkills(
          (data.skills || []).map((skill: any) => ({
            id: String(skill.id ?? ""),
            name: skill.name,
            category: backendToFrontendSkillCategory(skill.category),
            proficiency_level: Math.round((skill.proficiency || 60) / 20),
          })),
        );

        setLinkedinConnected(
          data.social_connections?.linkedin_connected || false,
        );
        setGoogleConnected(data.social_connections?.google_connected || false);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast({
        title: "Error",
        description: "Failed to load profile",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleConnectionsUpdate = (linkedin: boolean, google: boolean) => {
    setLinkedinConnected(linkedin);
    setGoogleConnected(google);
  };

  const handleBasicInfoSave = (data: BasicInfo) => {
    setProfileData({ ...profileData, basicInfo: data });
  };

  const handleEducationUpdate = (data: Education[]) => {
    setEducation(data);
    setProfileData({ ...profileData, education: data });
  };

  const handleExperienceUpdate = (data: Experience[]) => {
    setExperience(data);
    setProfileData({ ...profileData, experience: data });
  };

  const handleCertificationsUpdate = (data: Certification[]) => {
    setCertifications(data);
    setProfileData({ ...profileData, certifications: data });
  };

  const handleSkillsUpdate = (data: Skill[]) => {
    setSkills(data);
    setProfileData({ ...profileData, skills: data });
  };

  // Education handlers
  const addEducation = () => {
    setEducation([
      ...education,
      {
        id: `new_${Date.now()}`,
        school: "",
        degree: "",
        field: "",
        startDate: "",
        endDate: "",
        description: "",
      },
    ]);
  };
  const removeEducation = (id: string) => {
    setEducation(education.filter((e) => e.id !== id));
  };
  const updateEducation = (
    id: string,
    field: keyof Education,
    value: string,
  ) => {
    setEducation(
      education.map((e) => (e.id === id ? { ...e, [field]: value } : e)),
    );
  };

  // Experience handlers
  const addExperience = () => {
    setExperience([
      ...experience,
      {
        id: `new_${Date.now()}`,
        company: "",
        position: "",
        startDate: "",
        endDate: "",
        description: "",
      },
    ]);
  };
  const removeExperience = (id: string) => {
    setExperience(experience.filter((e) => e.id !== id));
  };
  const updateExperience = (
    id: string,
    field: keyof Experience,
    value: string,
  ) => {
    setExperience(
      experience.map((e) => (e.id === id ? { ...e, [field]: value } : e)),
    );
  };

  // Certification handlers
  const addCertification = () => {
    setCertifications([
      ...certifications,
      { id: `new_${Date.now()}`, name: "", issuer: "", date: "", url: "" },
    ]);
  };
  const removeCertification = (id: string) => {
    setCertifications(certifications.filter((c) => c.id !== id));
  };
  const updateCertification = (
    id: string,
    field: keyof Certification,
    value: string,
  ) => {
    setCertifications(
      certifications.map((c) => (c.id === id ? { ...c, [field]: value } : c)),
    );
  };

  // Skills handlers
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
        id: `new_${Date.now()}`,
        name: newSkill.name.trim(),
        category: newSkill.category,
        proficiency_level: newSkill.proficiency_level,
      },
    ]);
    setNewSkill({ name: "", category: "technical", proficiency_level: 3 });
  };
  const removeSkill = (id: string) => {
    setSkills(skills.filter((s) => s.id !== id));
  };

  const filteredSkills =
    selectedCategory === "all"
      ? skills
      : skills.filter((s) => s.category === selectedCategory);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="pt-24 pb-12 px-4">
        <div className="max-w-4xl mx-auto">
          <BackButton className="mb-6" />
          <h1 className="text-3xl font-bold mb-6">My Profile</h1>
          <Tabs defaultValue="connections" className="space-y-6">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="connections">Social Login</TabsTrigger>
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="education">Education</TabsTrigger>
              <TabsTrigger value="experience">Experience</TabsTrigger>
              <TabsTrigger value="skills">Skills</TabsTrigger>
              <TabsTrigger value="certifications">Certifications</TabsTrigger>
            </TabsList>

            <TabsContent
              value="connections"
              className="max-h-[calc(100vh-300px)] overflow-auto p-4"
            >
              <ConnectAccountsStep
                linkedinConnected={linkedinConnected}
                googleConnected={googleConnected}
                mode="profile"
                userId={userId || ""}
                onUpdate={handleConnectionsUpdate}
              />
            </TabsContent>

            <TabsContent
              value="basic"
              className="max-h-[calc(100vh-300px)] overflow-auto p-4"
            >
              <BasicInfoStep
                fullName={fullName}
                email={email}
                phone={phone}
                location={location}
                summary={summary}
                setFullName={setFullName}
                setEmail={() => {}}
                setPhone={setPhone}
                setLocation={setLocation}
                setSummary={setSummary}
                mode="profile"
                userId={userId || ""}
                onSave={handleBasicInfoSave}
              />
            </TabsContent>

            <TabsContent
              value="education"
              className="max-h-[calc(100vh-300px)] overflow-auto p-4"
            >
              <EducationStep
                education={education}
                addEducation={addEducation}
                removeEducation={removeEducation}
                updateEducation={updateEducation}
                mode="profile"
                userId={userId || ""}
                onUpdateList={handleEducationUpdate}
              />
            </TabsContent>

            <TabsContent
              value="experience"
              className="max-h-[calc(100vh-300px)] overflow-auto p-4"
            >
              <ExperienceStep
                experience={experience}
                addExperience={addExperience}
                removeExperience={removeExperience}
                updateExperience={updateExperience}
                mode="profile"
                userId={userId || ""}
                onUpdateList={handleExperienceUpdate}
              />
            </TabsContent>

            <TabsContent
              value="skills"
              className="max-h-[calc(100vh-300px)] overflow-auto p-4"
            >
              <SkillsStep
                skills={skills}
                newSkill={newSkill}
                setNewSkill={setNewSkill}
                addSkill={addSkill}
                removeSkill={removeSkill}
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
                filteredSkills={filteredSkills}
                mode="profile"
                userId={userId || ""}
                onUpdateList={handleSkillsUpdate}
              />
            </TabsContent>

            <TabsContent
              value="certifications"
              className="max-h-[calc(100vh-300px)] overflow-auto p-4"
            >
              <CertificationsStep
                certifications={certifications}
                addCertification={addCertification}
                removeCertification={removeCertification}
                updateCertification={updateCertification}
                mode="profile"
                userId={userId || ""}
                onUpdateList={handleCertificationsUpdate}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Profile;
