import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { fetchProfile, updateUser } from "@/services/profileService";
import { Navigation } from "@/components/layout/Navigation";
import { BackButton } from "@/components/layout/BackButton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { BasicInfoSection } from "@/components/profile/BasicInfoSection";
import { EducationSection, Education } from "@/components/profile/EducationSection";
import { ExperienceSection, Experience } from "@/components/profile/ExperienceSection";
import { CertificationsSection, Certification } from "@/components/profile/CertificationsSection";
import { SkillsManagerSection } from "@/components/profile/SkillsManagerSection";
import { AccountConnectionsSection } from "@/components/profile/AccountConnectionsSection";

interface BasicInfo {
  full_name: string;
  email: string;
  phone: string;
  location: string;
  summary: string;
}

interface Skill {
  id: string;
  name: string;
  category: "technical" | "soft skills" | "tools" | "languages" | "others" | null;
  proficiency_level: number | null;
  created_at: string;
}

interface ProfileData {
  basicInfo: BasicInfo;
  education: Education[];
  experience: Experience[];
  certifications: Certification[];
  skills: Skill[];
}

const Profile = () => {
  const { userId, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
    const [profileData, setProfileData] = useState<ProfileData>({
      basicInfo: { full_name: "", email: "", phone: "", location: "", summary: "" },
      education: [],
      experience: [],
      certifications: [],
      skills: [],
    });

  useEffect(() => {
    if (authLoading) return;
    if (!userId) { navigate("/auth"); return; }
    loadProfile();
  }, [userId, authLoading, navigate]);

  const loadProfile = async () => {
    if (!userId) return;
    try {
      const data = await fetchProfile(userId);
      if (data) {
        const userInfo = data.user_info?.[0] || {};
        const educationWithIds = ((data.education || []) as any[]).map((edu: any, index: number) => ({
          id: edu.id || `edu_${index}_${Date.now()}`,
          school: edu.institution_name || '',
          degree: edu.degree || '',
          field: edu.field_of_study || '',
          startDate: edu.start_date || '',
          endDate: edu.end_date || '',
          description: edu.description || ''
        }));
        const experienceWithIds = ((data.experience || []) as any[]).map((exp: any, index: number) => ({
          id: exp.id || `exp_${index}_${Date.now()}`,
          company: exp.company_name || exp.organization_name || '',
          position: exp.job_title || exp.position || '',
          startDate: exp.start_date || '',
          endDate: exp.end_date || '',
          description: exp.description || ''
        }));
        const certificationsWithIds = ((data.certifications || []) as any[]).map((cert: any, index: number) => ({
          id: cert.id || `cert_${index}_${Date.now()}`,
          certification_name: cert.certification_name || cert.credential_name || cert.name || '',
          organization_name: cert.organization_name || cert.issuer || '',
          date_obtained: cert.date_obtained || cert.date || '',
          url: cert.url || ''
        })); 

        const skillsData = (data.skills || []).map((skill: any) => ({
          id: skill.id,
          name: skill.name,
          category: skill.category,
          proficiency_level: skill.proficiency,
          created_at: skill.created_at || ''
        }));

        setProfileData({
          basicInfo: {
            full_name: `${userInfo.first_name || ''} ${userInfo.last_name || ''}`.trim() || '',
            email: userInfo.email || '',
            phone: userInfo.phone || '',
            location: userInfo.location || '',
            summary: userInfo.summary || ''
          },
          education: educationWithIds,
          experience: experienceWithIds,
          certifications: certificationsWithIds,
          skills: skillsData
        });
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast({ title: "Error", description: "Failed to load profile", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  // Removed batch API calls - sections handle individual updates
  const handleBasicInfoUpdate = async (data: BasicInfo) => {
    setProfileData({ ...profileData, basicInfo: data });
  };

  const handleEducationUpdate = async (data: Education[]) => {
    setProfileData({ ...profileData, education: data });
  };

  const handleExperienceUpdate = async (data: Experience[]) => {
    setProfileData({ ...profileData, experience: data });
  };

  const handleCertificationsUpdate = async (data: Certification[]) => {
    setProfileData({ ...profileData, certifications: data });
  };

  const handleSkillsUpdate = async (data: Skill[]) => {
    setProfileData({ ...profileData, skills: data });
  };


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
<TabsContent value="connections" className="max-h-[calc(100vh-300px)] overflow-auto p-4">
              <AccountConnectionsSection userId={userId || ""} />
            </TabsContent>
<TabsContent value="basic" className="max-h-[calc(100vh-300px)] overflow-auto p-4">
              <BasicInfoSection data={profileData.basicInfo} userId={userId || ""} onUpdate={handleBasicInfoUpdate} />
            </TabsContent>
<TabsContent value="education" className="max-h-[calc(100vh-300px)] overflow-auto p-4">
              <EducationSection data={profileData.education} userId={userId || ""} onUpdate={handleEducationUpdate} />
            </TabsContent>
<TabsContent value="experience" className="max-h-[calc(100vh-300px)] overflow-auto p-4">
              <ExperienceSection data={profileData.experience} userId={userId || ""} onUpdate={handleExperienceUpdate} />
            </TabsContent>
<TabsContent value="skills" className="max-h-[calc(100vh-300px)] overflow-auto p-4">
              <SkillsManagerSection data={profileData.skills} userId={userId || ""} onUpdate={handleSkillsUpdate} />
            </TabsContent>
<TabsContent value="certifications" className="max-h-[calc(100vh-300px)] overflow-auto p-4">
              <CertificationsSection data={profileData.certifications} userId={userId || ""} onUpdate={handleCertificationsUpdate} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Profile;
