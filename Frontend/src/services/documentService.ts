import api from "@/services/api";

export type CoverLetterType = "solicited" | "unsolicited";

// POST /resume_generation/{user_id}
export const generateResume = async (userId: string, params: { linkedin_account?: string; github_account?: string }) => {
  const { data } = await api.post(`/resume_generation/${userId}`, params);
  return data?.payload;
};

// POST /resume_optimization/{user_id}
export const optimizeResume = async (userId: string, params: { old_resume: string; linkedin_account?: string; github_account?: string }) => {
  const { data } = await api.post(`/resume_optimization/${userId}`, params);
  return data?.payload;
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
