import api from "@/services/api";

// POST /generate_email/{user_id?} — no token required
export const generateEmail = async (params: {
  job_title: string;
  company_name: string;
  job_description?: string;
  tone: string;
  recipient_name?: string;
}, userId?: string) => {
  const url = userId ? `/generate_email/${userId}` : "/generate_email";
  const { data } = await api.post(url, params);
  return data?.payload;
};

// POST /reply_to_email
export const replyToEmail = async (params: { email_id: string; reply_content: string; context: string }) => {
  const { data } = await api.post("/reply_to_email", params);
  const payload = data?.payload;
  return {
    subject: payload?.subject || "",
    email_reply: payload?.email_reply || payload?.reply || "",
    reply: payload?.reply || payload?.email_reply || "",
  };
};

// POST /send_email/{user_id}
export const sendEmail = async (userId: string, params: { to: string; subject: string; body: string }) => {
  const { data } = await api.post(`/send_email/${userId}`, params);
  return data;
};

// GET /get_job_emails/{user_id}
export const getJobEmails = async (userId: string) => {
  const { data } = await api.get(`/get_job_emails/${userId}`);
  return data?.payload || [];
};
