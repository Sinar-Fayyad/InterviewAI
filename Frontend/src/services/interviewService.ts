import api from "@/services/api";

// POST /research
export const researchCompany = async (companyName: string, jobTitle: string) => {
  const { data } = await api.post("/research", {
    company_name: companyName,
    job_title: jobTitle,
  });

  const payload = data?.payload;

  return {
    code: payload?.code ?? data?.code,
    context_summary:
      payload?.context_summary ||
      payload?.response ||
      payload?.summary ||
      payload?.data ||
      "",
    raw: payload ?? data,
  };
};

// GET /analysis_feedback/{user_id}
export const getAnalysisFeedback = async (userId: string) => {
  const { data } = await api.get(`/analysis_feedback/${userId}`);
  return data?.payload;
};

// POST /start_interview/{user_id}
export const startInterview = async (userId: string, params: { company_name: string; job_title: string; context_summary: string }) => {
  const { data } = await api.post(`/start_interview/${userId}`, params);
  return data?.payload;
};

// POST /submit_answer/{id}
export const submitAnswer = async (interviewId: string, formData: FormData) => {
  const { data } = await api.post(`/submit_answer/${interviewId}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data?.payload;
};

// POST /generate_feedack/{id} (typo matches backend)
export const generateFeedback = async (interviewId: string) => {
  const { data } = await api.post(`/generate_feedack/${interviewId}`);
  return data?.payload;
};

// POST /end_interview/{id}
export const endInterview = async (interviewId: string, formData: FormData) => {
  const { data } = await api.post(`/end_interview/${interviewId}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};

// GET /get_interviews/{user_id}
export const getInterviews = async (userId: string) => {
  const { data } = await api.get(`/get_interviews/${userId}`);
  return data?.payload || [];
};

// GET /get_interview/{id}
export const getInterview = async (id: string) => {
  const { data } = await api.get(`/get_interview/${id}`);
  return data?.payload;
};

// POST /delete_interview/{id}
export const deleteInterview = async (id: string) => {
  const { data } = await api.post(`/delete_interview/${id}`);
  return data;
};
