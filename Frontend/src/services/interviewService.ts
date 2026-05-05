import api from "@/services/api";

// POST /research
export const researchCompany = async (
  companyName: string,
  jobTitle: string,
) => {
  const { data } = await api.post("/research", {
    company_name: companyName,
    job_title: jobTitle,
  });

  const code = data?.payload?.code;
  const response = data?.payload?.response;

  if (!code || code < 200 || code >= 300) {
    throw new Error("Research failed. Please try again.");
  }

  if (!response || String(response).trim().length === 0) {
    throw new Error("Research returned no usable summary.");
  }

  return {
    code,
    context_summary: String(response),
  };
};

// POST /start_interview/{user_id}
export const startInterview = async (
  userId: string,
  params: { company_name: string; job_title: string; context_summary: string },
) => {
  const { data } = await api.post(`/start_interview/${userId}`, params);
  return data?.payload;
};

// POST /submit_answer/{id}
export const submitAnswer = async (
  interviewId: string,
  payload: { answer_text: string; emotion: string; end_now: number },
) => {
  const { data } = await api.post(`/submit_answer/${interviewId}`, payload);
  return data?.payload;
};

// POST /generate_feedback/{id}
export const generateFeedback = async (interviewId: string) => {
  const { data } = await api.post(`/generate_feedback/${interviewId}`);
  return data?.payload?.feedback ?? data?.payload ?? data;
};

// POST /end_interview/{id}
export const endInterview = async (interviewId: string, formData: FormData) => {
  const { data } = await api.post(`/end_interview/${interviewId}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};

export const getAnalysisFeedback = async (userId: string) => {
  const { data } = await api.get(`/analysis_feedback/${userId}`);
  return data; // { feedback_over_time: Array<{ date: string; score: number }>, emotion_distribution: Record<string, number> }
}

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

