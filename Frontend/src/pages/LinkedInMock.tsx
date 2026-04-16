import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { fetchProfile } from "@/services/profileService";
import { BackButton } from "@/components/layout/BackButton";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Copy, MapPin, Mail, Briefcase, GraduationCap, Award, Linkedin, AlertCircle, BadgeCheck } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Experience {
  id: string;
  position: string;
  company_name: string | null;
  start_date: string | null;
  end_date: string | null;
  description: string | null;
}

interface Education {
  id: string;
  institution_name: string;
  degree: string | null;
  field_of_study: string | null;
  start_date: string | null;
  end_date: string | null;
}

interface Skill {
  id: string;
  name: string;
  category: string | null;
}

interface Certification {
  id: string;
  certification_name: string;
  organization_name: string | null;
  date_obtained: string | null;
}

interface ProfileData {
  full_name: string | null;
  email: string | null;
  location: string | null;
  summary: string | null;
}

export default function LinkedInMock() {
  const { userId } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [educations, setEducations] = useState<Education[]>([]);
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [completionPercentage, setCompletionPercentage] = useState(0);

  useEffect(() => {
    if (userId) fetchAllData();
  }, [userId]);

  const fetchAllData = async () => {
    if (!userId) return;
    try {
      const data = await fetchProfile(userId);
      if (data) {
        setProfile(data);
        setExperiences(data.experiences || data.experience || []);
        setEducations(data.educations || data.education || []);
        setCertifications(data.certifications || []);
        setSkills(data.user_skills || data.skills || []);
      }

      let completedSections = 0;
      const totalSections = 6;
      if (data?.full_name) completedSections++;
      if (data?.summary) completedSections++;
      if ((data?.experiences || data?.experience || []).length > 0) completedSections++;
      if ((data?.educations || data?.education || []).length > 0) completedSections++;
      if ((data?.certifications || []).length > 0) completedSections++;
      if ((data?.user_skills || data?.skills || []).length > 0) completedSections++;
      setCompletionPercentage(Math.round((completedSections / totalSections) * 100));
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({ title: "Error", description: "Failed to load profile data", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied!", description: `${label} copied to clipboard` });
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "Present";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-4 pt-8">
        <div className="max-w-3xl mx-auto">
          <Skeleton className="h-64 w-full rounded-xl mb-6" />
          <Skeleton className="h-48 w-full rounded-xl mb-6" />
          <Skeleton className="h-48 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <BackButton className="mb-6" />
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Linkedin className="w-5 h-5 text-[#0A66C2]" />
            <span className="text-sm text-muted-foreground">LinkedIn Profile Preview</span>
          </div>
        </div>

        <Card className="rounded-xl p-6 mb-6 bg-card border-border">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">Profile Completion</h3>
            <span className={`text-sm font-medium ${completionPercentage === 100 ? 'text-green-500' : 'text-muted-foreground'}`}>{completionPercentage}%</span>
          </div>
          <Progress value={completionPercentage} className="h-2 mb-4" />
          {completionPercentage < 100 && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Complete your profile to 100% before copying to LinkedIn.
                Add: {!profile?.full_name && "Name, "}{!profile?.summary && "Summary, "}{experiences.length === 0 && "Experience, "}{educations.length === 0 && "Education, "}{certifications.length === 0 && "Certifications, "}{skills.length === 0 && "Skills"}
              </AlertDescription>
            </Alert>
          )}
          {completionPercentage === 100 && (
            <p className="text-sm text-green-500">✓ Your profile is complete! You can now copy sections to LinkedIn.</p>
          )}
        </Card>

        <Card className="rounded-xl overflow-hidden mb-4 bg-card border-border">
          <div className="h-28 bg-gradient-to-r from-[#0A66C2] to-[#0073b1]" />
          <div className="p-6 pt-0 relative">
            <div className="w-32 h-32 rounded-full border-4 border-card bg-muted -mt-16 mb-4 flex items-center justify-center text-4xl font-bold text-muted-foreground">
              {profile?.full_name?.charAt(0) || "?"}
            </div>
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-bold">{profile?.full_name || "Your Name"}</h1>
                <p className="text-muted-foreground mt-1">Add your headline here</p>
                <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                  {profile?.location && (<span className="flex items-center gap-1"><MapPin className="w-4 h-4" />{profile.location}</span>)}
                  {profile?.email && (<span className="flex items-center gap-1"><Mail className="w-4 h-4" />{profile.email}</span>)}
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={() => copyToClipboard(`${profile?.full_name || ""}\n${profile?.location || ""}\n${profile?.email || ""}`, "Header info")}>
                <Copy className="w-4 h-4 mr-2" />Copy
              </Button>
            </div>
          </div>
        </Card>

        <Card className="rounded-xl p-6 mb-4 bg-card border-border">
          <div className="flex items-start justify-between mb-4">
            <h2 className="text-xl font-semibold">About</h2>
            {profile?.summary && (<Button variant="ghost" size="sm" onClick={() => copyToClipboard(profile.summary || "", "About section")}><Copy className="w-4 h-4" /></Button>)}
          </div>
          {profile?.summary ? (<p className="text-foreground whitespace-pre-wrap">{profile.summary}</p>) : (<p className="text-muted-foreground italic">No summary added yet. Add one in your profile.</p>)}
        </Card>

        <Card className="rounded-xl p-6 mb-4 bg-card border-border">
          <div className="flex items-center gap-2 mb-6"><Briefcase className="w-5 h-5" /><h2 className="text-xl font-semibold">Experience</h2></div>
          {experiences.length > 0 ? (
            <div className="space-y-6">
              {experiences.map((exp) => (
                <div key={exp.id} className="flex items-start justify-between border-b border-border pb-6 last:border-0 last:pb-0">
                  <div className="flex-1">
                    <h3 className="font-semibold">{exp.position}</h3>
                    <p className="text-muted-foreground">{exp.company_name || "Company"}</p>
                    <p className="text-sm text-muted-foreground mt-1">{formatDate(exp.start_date)} - {formatDate(exp.end_date)}</p>
                    {exp.description && (<p className="mt-3 text-sm">{exp.description}</p>)}
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => copyToClipboard(`${exp.position}\n${exp.company_name || ""}\n${formatDate(exp.start_date)} - ${formatDate(exp.end_date)}\n${exp.description || ""}`, "Experience")}><Copy className="w-4 h-4" /></Button>
                </div>
              ))}
            </div>
          ) : (<p className="text-muted-foreground italic">No experience added yet.</p>)}
        </Card>

        <Card className="rounded-xl p-6 mb-4 bg-card border-border">
          <div className="flex items-center gap-2 mb-6"><GraduationCap className="w-5 h-5" /><h2 className="text-xl font-semibold">Education</h2></div>
          {educations.length > 0 ? (
            <div className="space-y-6">
              {educations.map((edu) => (
                <div key={edu.id} className="flex items-start justify-between border-b border-border pb-6 last:border-0 last:pb-0">
                  <div className="flex-1">
                    <h3 className="font-semibold">{edu.institution_name}</h3>
                    {(edu.degree || edu.field_of_study) && (<p className="text-muted-foreground">{edu.degree}{edu.degree && edu.field_of_study ? ", " : ""}{edu.field_of_study}</p>)}
                    <p className="text-sm text-muted-foreground mt-1">{formatDate(edu.start_date)} - {formatDate(edu.end_date)}</p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => copyToClipboard(`${edu.institution_name}\n${edu.degree || ""} ${edu.field_of_study || ""}\n${formatDate(edu.start_date)} - ${formatDate(edu.end_date)}`, "Education")}><Copy className="w-4 h-4" /></Button>
                </div>
              ))}
            </div>
          ) : (<p className="text-muted-foreground italic">No education added yet.</p>)}
        </Card>

        <Card className="rounded-xl p-6 mb-4 bg-card border-border">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2"><BadgeCheck className="w-5 h-5" /><h2 className="text-xl font-semibold">Licenses & Certifications</h2></div>
            {certifications.length > 0 && (<Button variant="ghost" size="sm" onClick={() => copyToClipboard(certifications.map(c => `${c.certification_name} - ${c.organization_name || "N/A"}`).join("\n"), "Certifications")}><Copy className="w-4 h-4 mr-2" />Copy All</Button>)}
          </div>
          {certifications.length > 0 ? (
            <div className="space-y-6">
              {certifications.map((cert) => (
                <div key={cert.id} className="flex items-start justify-between border-b border-border pb-6 last:border-0 last:pb-0">
                  <div className="flex-1">
                    <h3 className="font-semibold">{cert.certification_name}</h3>
                    {cert.organization_name && (<p className="text-muted-foreground">{cert.organization_name}</p>)}
                    {cert.date_obtained && (<p className="text-sm text-muted-foreground mt-1">Issued {formatDate(cert.date_obtained)}</p>)}
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => copyToClipboard(`${cert.certification_name}\n${cert.organization_name || ""}\nIssued: ${formatDate(cert.date_obtained)}`, "Certification")}><Copy className="w-4 h-4" /></Button>
                </div>
              ))}
            </div>
          ) : (<p className="text-muted-foreground italic">No certifications added yet.</p>)}
        </Card>

        <Card className="rounded-xl p-6 bg-card border-border">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2"><Award className="w-5 h-5" /><h2 className="text-xl font-semibold">Skills</h2></div>
            {skills.length > 0 && (<Button variant="ghost" size="sm" onClick={() => copyToClipboard(skills.map(s => s.name).join(", "), "Skills")}><Copy className="w-4 h-4 mr-2" />Copy All</Button>)}
          </div>
          {skills.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {skills.map((skill) => (<Badge key={skill.id} variant="secondary" className="cursor-pointer hover:bg-secondary/80" onClick={() => copyToClipboard(skill.name, skill.name)}>{skill.name}</Badge>))}
            </div>
          ) : (<p className="text-muted-foreground italic">No skills added yet.</p>)}
        </Card>
      </div>
    </div>
  );
}
