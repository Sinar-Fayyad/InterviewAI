import api from "@/services/api";
import type { CVData } from "@/components/documents/CVDocument";

export type CoverLetterType = "solicited" | "unsolicited";

const mapPayloadToCVData = (payload: any): CVData => {
  const experiences = Array.isArray(payload?.experience)
    ? payload.experience.map((exp: any) => ({
        company: exp.company_name || "",
        position: exp.role || "",
        startDate: exp.start_date || "",
        endDate: exp.end_date || "",
        description: Array.isArray(exp.description)
          ? exp.description.join("\n")
          : exp.description || "",
      }))
    : [];

  const educations = Array.isArray(payload?.education)
    ? payload.education.map((edu: any) => ({
        school: edu.institution || "",
        degree: edu.degree || "",
        field: edu.field_of_study || "",
        startDate: edu.start_date || "",
        endDate: edu.end_date || "",
      }))
    : [];

  const certifications = Array.isArray(payload?.certifications)
    ? payload.certifications.map((cert: any) => ({
        name: cert.certification_name || "",
        issuer: cert.organization_name || "",
        date: cert.date_obtained || "",
      }))
    : [];

  const skillsObj = payload?.skills || {};
  const skills = [
    ...(Array.isArray(skillsObj.programming_languages) ? skillsObj.programming_languages : []),
    ...(Array.isArray(skillsObj.frameworks) ? skillsObj.frameworks : []),
    ...(Array.isArray(skillsObj.tools) ? skillsObj.tools : []),
    ...(Array.isArray(skillsObj.soft_skills) ? skillsObj.soft_skills : []),
  ];

  return {
    fullName: payload?.full_name || "",
    email: payload?.email || "",
    phone: payload?.phone || "",
    location: payload?.location || "",
    summary: payload?.objective || "",
    experience: experiences,
    education: educations,
    skills,
    certifications,
  };
};

const extractCVPayload = (data: any): any => {
  const inner = data?.payload;
  // If the inner object has CV fields directly, use it
  if (inner && (inner.full_name !== undefined || inner.objective !== undefined || inner.experience !== undefined)) {
    return inner;
  }
  // If it's double-wrapped (payload.payload), use the nested one
  if (inner?.payload && (inner.payload.full_name !== undefined || inner.payload.objective !== undefined || inner.payload.experience !== undefined)) {
    return inner.payload;
  }
  return inner ?? data;
};

// POST /resume_generation/{user_id}
export const generateResume = async (userId: string, params: { linkedin_account?: string; github_account?: string }) => {
  const { data } = await api.post(`/resume_generation/${userId}`, params);
  return mapPayloadToCVData(extractCVPayload(data));
};

// POST /resume_optimization/{user_id}
export const optimizeResume = async (userId: string, params: { old_resume: string; linkedin_account?: string; github_account?: string }) => {
  const { data } = await api.post(`/resume_optimization/${userId}`, params);
  return mapPayloadToCVData(extractCVPayload(data));
};

// POST /cover_letter_generation/{user_id}
export const generateCoverLetter = async (userId: string, params: {
  company_name: string;
  job_title: string;
  cover_letter_type: string;
  platform?: string;
  job_description?: string;
  contact_name?: string;
}) => {
  const { data } = await api.post(`/cover_letter_generation/${userId}`, params);
  return data?.payload;
};

// POST /cover_letter_optimization/{user_id}
export const optimizeCoverLetter = async (userId: string, params: {
  old_cover_letter: string;
  company_name: string;
  job_title: string;
}) => {
  const { data } = await api.post(`/cover_letter_optimization/${userId}`, params);
  return data?.payload;
};
