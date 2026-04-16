import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import api from "@/services/api";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Copy, Check, User, Briefcase, GraduationCap, MapPin, Mail, Phone, Award } from "lucide-react";
import type { Education, Experience, Skill } from "@/types/database";

interface ProfileData {
  first_name: string | null;
  last_name: string | null;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  location: string | null;
  summary: string | null;
}

export const LinkedInCopyPaste = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [educations, setEducations] = useState<Education[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchAllData();
    }
  }, [user]);

  const fetchAllData = async () => {
    try {
      const { data } = await api.get("/profile");

      if (data) {
        setProfile(data);
        setExperiences(data.experiences || []);
        setEducations(data.educations || []);
        setSkills(data.skills || []);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string, section: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedSection(section);
      toast({
        title: "Copied!",
        description: `${section} copied to clipboard`,
      });
      setTimeout(() => setCopiedSection(null), 2000);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const CopyButton = ({ text, section }: { text: string; section: string }) => (
    <Button
      variant="outline"
      size="sm"
      onClick={() => copyToClipboard(text, section)}
      className="shrink-0"
    >
      {copiedSection === section ? (
        <>
          <Check className="w-4 h-4 mr-2" />
          Copied!
        </>
      ) : (
        <>
          <Copy className="w-4 h-4 mr-2" />
          Copy
        </>
      )}
    </Button>
  );

  const formatExperienceSection = () => {
    return experiences.map((exp) => {
      const lines = [];
      if (exp.position) lines.push(exp.position);
      if (exp.company_name) lines.push(exp.company_name);
      if (exp.start_date || exp.end_date) {
        lines.push(`${exp.start_date || ''} - ${exp.end_date || 'Present'}`);
      }
      if (exp.description) lines.push(`\n${exp.description}`);
      return lines.join('\n');
    }).join('\n\n---\n\n');
  };

  const formatEducationSection = () => {
    return educations.map((edu) => {
      const lines = [];
      if (edu.institution_name) lines.push(edu.institution_name);
      if (edu.degree && edu.field_of_study) {
        lines.push(`${edu.degree} in ${edu.field_of_study}`);
      } else if (edu.degree) {
        lines.push(edu.degree);
      }
      if (edu.start_date || edu.end_date) {
        lines.push(`${edu.start_date || ''} - ${edu.end_date || ''}`);
      }
      return lines.join('\n');
    }).join('\n\n');
  };

  const formatSkillsSection = () => {
    return skills.map(s => s.name).join(", ");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <Card className="p-8 text-center">
        <p className="text-muted-foreground">No profile data found. Please complete your profile first.</p>
      </Card>
    );
  }

  const displayName = profile.full_name || `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || "Your Name";

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card className="bg-gradient-to-r from-[#0A66C2]/10 to-[#0A66C2]/5 border-[#0A66C2]/20 p-6">
        <div className="flex items-start gap-4">
          <div className="w-20 h-20 rounded-full bg-[#0A66C2]/20 flex items-center justify-center">
            <User className="w-10 h-10 text-[#0A66C2]" />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold">{displayName}</h2>
            <div className="flex flex-wrap gap-4 mt-2 text-sm text-muted-foreground">
              {profile.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {profile.location}
                </span>
              )}
              {profile.email && (
                <span className="flex items-center gap-1">
                  <Mail className="w-4 h-4" />
                  {profile.email}
                </span>
              )}
              {profile.phone && (
                <span className="flex items-center gap-1">
                  <Phone className="w-4 h-4" />
                  {profile.phone}
                </span>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* About Section */}
      <Card className="bg-secondary/80 border-primary/20 p-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <User className="w-5 h-5 text-[#0A66C2]" />
            About
          </h3>
          {profile.summary && (
            <CopyButton text={profile.summary} section="About" />
          )}
        </div>
        {profile.summary ? (
          <div className="bg-muted/50 rounded-lg p-4">
            <p className="whitespace-pre-wrap text-sm leading-relaxed">{profile.summary}</p>
          </div>
        ) : (
          <p className="text-muted-foreground text-sm">No summary added yet.</p>
        )}
      </Card>

      {/* Experience Section */}
      <Card className="bg-secondary/80 border-primary/20 p-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-[#0A66C2]" />
            Experience
          </h3>
          {experiences.length > 0 && (
            <CopyButton text={formatExperienceSection()} section="Experience" />
          )}
        </div>
        {experiences.length > 0 ? (
          <div className="space-y-4">
            {experiences.map((exp, index) => (
              <div key={exp.id} className="bg-muted/50 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-semibold">{exp.position}</h4>
                    <p className="text-sm text-muted-foreground">{exp.company_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {exp.start_date} - {exp.end_date || "Present"}
                    </p>
                  </div>
                  <CopyButton
                    text={`${exp.position}\n${exp.company_name}\n${exp.start_date} - ${exp.end_date || 'Present'}${exp.description ? '\n\n' + exp.description : ''}`}
                    section={`Experience ${index + 1}`}
                  />
                </div>
                {exp.description && (
                  <p className="mt-3 text-sm whitespace-pre-wrap">{exp.description}</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-sm">No experience added yet.</p>
        )}
      </Card>

      {/* Education Section */}
      <Card className="bg-secondary/80 border-primary/20 p-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-[#0A66C2]" />
            Education
          </h3>
          {educations.length > 0 && (
            <CopyButton text={formatEducationSection()} section="Education" />
          )}
        </div>
        {educations.length > 0 ? (
          <div className="space-y-4">
            {educations.map((edu, index) => (
              <div key={edu.id} className="bg-muted/50 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-semibold">{edu.institution_name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {edu.degree}{edu.field_of_study && ` in ${edu.field_of_study}`}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {edu.start_date} - {edu.end_date}
                    </p>
                  </div>
                  <CopyButton
                    text={`${edu.institution_name}\n${edu.degree}${edu.field_of_study ? ' in ' + edu.field_of_study : ''}\n${edu.start_date} - ${edu.end_date}`}
                    section={`Education ${index + 1}`}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-sm">No education added yet.</p>
        )}
      </Card>

      {/* Skills Section */}
      {skills.length > 0 && (
        <Card className="bg-secondary/80 border-primary/20 p-6">
          <div className="flex items-start justify-between gap-4 mb-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Award className="w-5 h-5 text-[#0A66C2]" />
              Skills
            </h3>
            <CopyButton text={formatSkillsSection()} section="Skills" />
          </div>
          <div className="flex flex-wrap gap-2">
            {skills.map((skill) => (
              <span
                key={skill.id}
                className="px-3 py-1 bg-[#0A66C2]/10 text-[#0A66C2] rounded-full text-sm"
              >
                {skill.name}
              </span>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};
