import api from "./api";


export const getPosts = async (userId: string) => {
  try {
    const { data } = await api.get(`/get_posts/${encodeURIComponent(userId)}`);
    return data?.payload || [];
  } catch (error: any) {
    if (error?.response?.status === 404) {
      return [];
    }

    throw error;
  }
};

// GET /get_post/{id}
export const getPost = async (id: string) => {
  const { data } = await api.get(`/get_post/${encodeURIComponent(id)}`);
  return data?.payload;
};

// POST /update_post/{id}
export const updatePost = async (
  id: string,
  params: {
    body?: string;
    scheduled_at?: string;
    media?: string | null;
  }
) => {
  const { data } = await api.post(
    `/update_post/${encodeURIComponent(id)}`,
    params
  );

  return data?.payload;
};

// POST /delete_post/{id}
export const deletePost = async (id: string) => {
  const { data } = await api.post(`/delete_post/${encodeURIComponent(id)}`);
  return data;
};