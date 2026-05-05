import api from "@/services/api";
import type { CVData } from "@/components/documents/CVDocument";

export type CoverLetterType = "Solicited" | "Unsolicited";

const normalizeString = (value: any): string => {
  if (typeof value === "string") return value.trim();
  if (typeof value === "number") return String(value);
  return "";
};

const normalizeText = (value: any): string => {
  if (Array.isArray(value)) 
    return value.map(normalizeString).filter(Boolean).join("\n");
  return normalizeString(value);
};

const extractSkillValues = (value: any): string[] => {
  if (!value) return [];
  
  // If it's an object with skill categories (from N8N)
  if (typeof value === "object" && !Array.isArray(value)) {
    const categoryFields = [
      "programming_languages",
      "frameworks",
      "tools",
      "soft_skills",
      "languages",
      "technical",
      "other",
    ];
    const result: string[] = [];
    for (const field of categoryFields) {
      const fieldValue = value[field];
      if (Array.isArray(fieldValue)) {
        result.push(
          ...fieldValue
            .map(normalizeString)
            .filter(Boolean)
        );
      }
    }
    return result.length > 0 ? result : [];
  }
  
  // If it's already an array of skill strings
  if (Array.isArray(value)) {
    return value.map(normalizeString).filter(Boolean);
  }
  
  return [];
};

const getField = (obj: any, fieldNames: string[]): string => {
  for (const name of fieldNames) {
    const value = obj?.[name];
    if (value !== undefined && value !== null) {
      const normalized = normalizeString(value);
      if (normalized) return normalized;
    }
  }
  return "";
};

const mapPayloadToCVData = (payload: any): CVData => {
  return {
    fullName: payload.full_name || "",
    email: payload.email || "",
    phone: payload.phone || "",
    location: payload.location || "",
    summary: payload.objective || "",

    experience: (payload.experiences || []).map((exp: any) => ({
      position: exp.role || "",
      company: exp.company_name || "",
      startDate: exp.start_date || "",
      endDate: exp.end_date || "",
      description: Array.isArray(exp.description)
        ? exp.description.join("\n")
        : exp.description || "",
    })),

  education: (payload.education || []).map((edu: any) => ({
  school: edu.institution || edu.school || edu.university || "",
  degree: edu.degree || edu.degree_name || "",
  field: edu.field_of_study || edu.field || edu.major || "",
  startDate: edu.start_date || "",
  endDate: edu.end_date || "",
})),

certifications: (payload.certifications || []).map((cert: any) => ({
  name: cert.certification_name || cert.name || cert.title || cert.certificate_name || "",
  issuer: cert.organization_name || cert.issuer || cert.organization || cert.provider || "",
  date: cert.date_obtained || cert.date || cert.issue_date || cert.issued_date || "",
  description: cert.description || "",
})),

    skills: [
      ...(payload.skills?.programming_languages || []),
      ...(payload.skills?.frameworks || []),
      ...(payload.skills?.tools || []),
      ...(payload.skills?.soft_skills || []),
    ],
  };
};

const extractCVPayload = (data: any): any => {
  // Standard API response: { payload: {...} }
  if (data?.payload) {
    return data.payload;
  }
  // Fallback: direct data if not wrapped
  return data ?? {};
};

// POST /resume_generation/{user_id}
export const generateResume = async (
  userId: string,
  params: { linkedin_account?: string; github_account?: string }
) => {
  console.log("Calling endpoint:", `/resume_generation/${userId}`);
  console.log("Params sent to backend:", JSON.stringify(params, null, 2));

  const { data } = await api.post(`/resume_generation/${userId}`, params);

  console.log("RAW response from frontend call:", JSON.stringify(data, null, 2));

  const mapped = mapPayloadToCVData(data.payload);

  console.log("Mapped response:", JSON.stringify(mapped, null, 2));

  return mapped;
};

// POST /resume_optimization/{user_id}
export const optimizeResume = async (
  userId: string,
  params: {
    old_resume: string;
    linkedin_account?: string;
    github_account?: string;
  }
) => {
  const { data } = await api.post(`/resume_optimization/${userId}`, {
    old_resume: params.old_resume,
    linkedin_account: params.linkedin_account || "",
    github_account: params.github_account || "",
  });

  const payload = extractCVPayload(data);
  return mapPayloadToCVData(payload);
};


// POST /cover_letter_generation/{user_id}
export const generateCoverLetter = async (
  userId: string,
  params: {
    company_name: string;
    job_title: string;
    cover_letter_type: CoverLetterType;
    platform?: string;
    job_description?: string;
    contact_name?: string;
  }
) => {
  const { data } = await api.post(`/cover_letter_generation/${userId}`, params);
  return data?.payload;
};

// POST /cover_letter_optimization/{user_id}
export const optimizeCoverLetter = async (
  userId: string,
  params: {
    old_cover_letter: string;
    company_name: string;
    job_title: string;
  }
) => {
  const { data } = await api.post(`/cover_letter_optimization/${userId}`, params);
  return data?.payload;
};