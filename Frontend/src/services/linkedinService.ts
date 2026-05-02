import api from "@/services/api";

// GET /get_linkedin_messages/{user_id}
export const getLinkedinMessages = async (userId: string) => {
  const { data } = await api.get(`/get_linkedin_messages/${userId}`);
  return data?.payload || [];
};

// POST /create_linkedin_post
export const createLinkedinPost = async (params: {
  title: string;
  description: string;
}) => {
  const { data } = await api.post("/create_linkedin_post", params);

  const payload = data?.payload;

  return {
    title: payload?.title || "",
    content: payload?.content || payload?.data || "",
    message: payload?.message || data?.message || "",
  };
};
// GET /linkedin_profile
export const getLinkedinProfile = async (userId: string) => {
  const { data } = await api.get(`/linkedin_profile/${userId}`);
  return data?.payload;
};

// POST /post_to_linkedin/{user_id}
export const postToLinkedin = async (userId: string, params: { text: string }) => {
  const { data } = await api.post(`/post_to_linkedin/${userId}`, params);
  return data;
};

// POST /schedule_post/{user_id}
export const schedulePost = async (userId: string, params: any) => {
  const { data } = await api.post(`/schedule_post/${userId}`, params);
  return data;
};

// GET /check_linkedin_expiry/{user_id}
export const checkLinkedinExpiry = async (userId: string) => {
  const { data } = await api.get(`/check_linkedin_expiry/${userId}`);
  return data?.payload;
};

// POST /disconnect_linkedin/{user_id}
export const disconnectLinkedin = async (userId: string) => {
  const { data } = await api.post(`/disconnect_linkedin/${userId}`);
  return data;
};
