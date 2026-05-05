import api from "./api";

// Interfaces
export interface LinkedInExperience {
  id: string;
  position: string;
  company_name: string | null;
  start_date: string | null;
  end_date: string | null;
  description: string | null;
}

export interface LinkedInEducation {
  id: string;
  institution_name: string;
  degree: string | null;
  field_of_study: string | null;
  start_date: string | null;
  end_date: string | null;
}

export interface LinkedInSkill {
  id: string;
  name: string;
  category: string | null;
}

export interface LinkedInCertification {
  id: string;
  certification_name: string;
  organization_name: string | null;
  date_obtained: string | null;
}

export interface LinkedInProfile {
  full_name: string | null;
  headline: string | null;
  email: string | null;
  location: string | null;
  summary: string | null;
  experiences: LinkedInExperience[];
  educations: LinkedInEducation[];
  certifications: LinkedInCertification[];
  skills: LinkedInSkill[];
}
export const fetchLinkedinProfile = async (userId: string): Promise<LinkedInProfile> => {
  const { data } = await api.get(`/linkedin_profile/${userId}`);

  const payload = data?.payload || data || {};
  // ↓ Capital "P" and space in "Full name"
  const profile = payload["Profile_info"] || payload["profile_info"] || {};

  return {
    full_name: payload["Full name"] || payload.full_name || null,
    headline: profile.headline || null,
    email: payload.email || null,
    location: profile.location || null,
    summary: profile.about || profile.summary || null,

    experiences: (profile.experiences || []).map((exp: any) => ({
      id: exp.id || crypto.randomUUID(),
      position: exp.role || exp.position,
      company_name: exp.company || exp.company_name,
      start_date: exp.start_date || null,
      end_date: exp.end_date || null,
      description: exp.description || null,
    })),

    educations: (profile.education || profile.educations || []).map((edu: any) => ({
      id: edu.id || crypto.randomUUID(),
      institution_name: edu.institution || edu.institution_name,
      degree: edu.degree || null,
      field_of_study: edu.field_of_study || null,
      start_date: edu.start_date || null,
      end_date: edu.end_date || null,
    })),

    certifications: (profile.certifications || []).map((cert: any) => ({
      id: cert.id || crypto.randomUUID(),
      certification_name: cert.name || cert.certification_name,
      organization_name: cert.organization || cert.organization_name || null,
      date_obtained: cert.date || cert.date_obtained || null,
    })),

    skills: (profile.skills || []).map((skill: any) =>
      typeof skill === "string"
        ? { id: crypto.randomUUID(), name: skill }
        : skill
    ),
  };
};

// POST /create_linkedin_post
export const createLinkedinPost = async (params: {
  title: string;
  description: string;
  image_description?: string;
  image_style?: string;
  image_mood?: string;
  image_colors?: string;
  custom_image_colors?: string;
  image_people?: string;
  image_text_option?: string;
  image_text?: string;
}) => {
  const { data } = await api.post("/create_linkedin_post", {
    title: params.title,
    description: params.description,
    image_description: params.image_description || "",
    image_style: params.image_style || "",
    image_mood: params.image_mood || "",
    image_colors: params.image_colors || "",
    custom_image_colors: params.custom_image_colors || "",
    image_people: params.image_people || "",
    image_text_option: params.image_text_option || "no_text",
    image_text: params.image_text || "",
  });

  const payload = data?.payload || {};

  return {
    code: payload?.code || null,
    title: payload?.title || payload?.post?.title || "",
    content: payload?.content || payload?.post?.content || "",
    image: payload?.image || payload?.image_base64 || "",
    imagePrompt: payload?.image_prompt || "",
    message: data?.message || "",
  };
};

// GET /check_linkedin_expiry/{user_id}
export const checkLinkedinExpiry = async (userId: string) => {
  const { data } = await api.get(`/check_linkedin_expiry/${userId}`);
  return data?.payload;
};