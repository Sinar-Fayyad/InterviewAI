import api from "@/services/api";

// POST /add_post/{user_id}
export const addPost = async (userId: string, postData: any) => {
  const { data } = await api.post(`/add_post/${userId}`, postData);
  return data?.payload;
};

// POST /update_post/{id}
export const updatePost = async (id: string, postData: any) => {
  const { data } = await api.post(`/update_post/${id}`, postData);
  return data?.payload;
};

// GET /get_posts/{user_id}
export const getPosts = async (userId: string) => {
  const { data } = await api.get(`/get_posts/${userId}`);
  return data?.payload || [];
};

// GET /get_post/{id}
export const getPost = async (id: string) => {
  const { data } = await api.get(`/get_post/${id}`);
  return data?.payload;
};

// POST /delete_post/{id}
export const deletePost = async (id: string) => {
  const { data } = await api.post(`/delete_post/${id}`);
  return data;
};
