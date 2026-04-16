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

interface ProfileData {
  basicInfo: BasicInfo;
  education: Education[];
  experience: Experience[];
  certifications: Certification[];
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
        const educationWithIds = ((data.education as unknown as Education[]) || []).map((edu, index) => ({
          ...edu, id: edu.id || `edu_${index}_${Date.now()}`,
        }));
        const experienceWithIds = ((data.experience as unknown as Experience[]) || []).map((exp, index) => ({
          ...exp, id: exp.id || `exp_${index}_${Date.now()}`,
        }));
        const certificationsWithIds = ((data.certifications as unknown as Certification[]) || []).map((cert, index) => ({
          ...cert, id: cert.id || `cert_${index}_${Date.now()}`,
        }));
        setProfileData({
          basicInfo: {
            full_name: data.full_name || "",
            email: data.email || "",
            phone: data.phone || "",
            location: data.location || "",
            summary: data.summary || "",
          },
          education: educationWithIds,
          experience: experienceWithIds,
          certifications: certificationsWithIds,
        });
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast({ title: "Error", description: "Failed to load profile", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleBasicInfoUpdate = async (data: BasicInfo) => {
    if (!userId) return;
    try {
      await updateUser(userId, data);
      setProfileData({ ...profileData, basicInfo: data });
    } catch (error) {
      console.error("Error updating basic info:", error);
    }
  };

  const handleEducationUpdate = async (data: Education[]) => {
    if (!userId) return;
    try {
      await updateUser(userId, { education: data });
      setProfileData({ ...profileData, education: data });
    } catch (error) {
      console.error("Error updating education:", error);
    }
  };

  const handleExperienceUpdate = async (data: Experience[]) => {
    if (!userId) return;
    try {
      await updateUser(userId, { experience: data });
      setProfileData({ ...profileData, experience: data });
    } catch (error) {
      console.error("Error updating experience:", error);
    }
  };

  const handleCertificationsUpdate = async (data: Certification[]) => {
    if (!userId) return;
    try {
      await updateUser(userId, { certifications: data });
      setProfileData({ ...profileData, certifications: data });
    } catch (error) {
      console.error("Error updating certifications:", error);
    }
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
            <TabsContent value="basic">
              <BasicInfoSection data={profileData.basicInfo} userId={userId || ""} onUpdate={handleBasicInfoUpdate} />
            </TabsContent>
            <TabsContent value="education">
              <EducationSection data={profileData.education} userId={userId || ""} onUpdate={handleEducationUpdate} />
            </TabsContent>
            <TabsContent value="experience">
              <ExperienceSection data={profileData.experience} userId={userId || ""} onUpdate={handleExperienceUpdate} />
            </TabsContent>
            <TabsContent value="skills">
              <SkillsManagerSection />
            </TabsContent>
            <TabsContent value="certifications">
              <CertificationsSection data={profileData.certifications} userId={userId || ""} onUpdate={handleCertificationsUpdate} />
            </TabsContent>
            <TabsContent value="connections">
              <AccountConnectionsSection userId={userId || ""} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Profile;
