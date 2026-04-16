import api from "@/services/api";

// POST /add_application/{user_id}
export const addApplication = async (userId: string, appData: any) => {
  const { data } = await api.post(`/add_application/${userId}`, appData);
  return data?.payload;
};

// POST /update_application/{id}
export const updateApplication = async (id: string, appData: any) => {
  const { data } = await api.post(`/update_application/${id}`, appData);
  return data?.payload;
};

// GET /get_applications/{user_id}
export const getApplications = async (userId: string) => {
  const { data } = await api.get(`/get_applications/${userId}`);
  return data?.payload || [];
};

// GET /get_application/{id}
export const getApplication = async (id: string) => {
  const { data } = await api.get(`/get_application/${id}`);
  return data?.payload;
};

// POST /delete_application/{id}
export const deleteApplication = async (id: string) => {
  const { data } = await api.post(`/delete_application/${id}`);
  return data;
};
