import api from "@/services/api";

// POST /add_questions_list/{user_id}
export const addQuestionsList = async (
  userId: string,
  params: {
    company_name: string;
    job_title: string;
    context_summary: string;
  }
) => {
  const { data } = await api.post(`/add_questions_list/${userId}`, params);

  const payload = data?.payload ?? data;

  const questions = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.questions)
      ? payload.questions
      : [];

  return {
    questions,
  };
};

// GET /get_questions_lists/{user_id}
export const getQuestionsLists = async (userId: string) => {
  const { data } = await api.get(`/get_questions_lists/${userId}`);
  return data?.payload || [];
};

// GET /get_questions_list/{id}
export const getQuestionsList = async (id: string) => {
  const { data } = await api.get(`/get_questions_list/${id}`);
  return data?.payload || null;
};

// POST /delete_questions_list/{id}
export const deleteQuestionsList = async (id: string) => {
  const { data } = await api.post(`/delete_questions_list/${id}`);
  return data;
};
