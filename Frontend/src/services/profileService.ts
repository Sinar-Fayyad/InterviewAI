import api from "@/services/api";

// GET /profile/{user_id}
export const fetchProfile = async (userId: string) => {
  const { data } = await api.get(`/profile/${userId}`);
  return data?.payload;
};

// POST /save_profile/{user_id} — called once during onboarding
export const saveProfile = async (userId: string, profileData: any) => {
  const { data } = await api.post(`/save_profile/${userId}`, profileData);
  return data;
};

// POST /update_user/{id}
export const updateUser = async (userId: string, userData: any) => {
  const { data } = await api.post(`/update_user/${userId}`, userData);
  return data;
};

// GET /change_theme/{id}
export const changeTheme = async (userId: string) => {
  const { data } = await api.get(`/change_theme/${userId}`);
  return data;
};

// --- Education ---
export const addEducation = async (userId: string, edu: any) => {
  const { data } = await api.post(`/add_education/${userId}`, edu);
  return data?.payload;
};

export const updateEducation = async (id: string, edu: any) => {
  const { data } = await api.post(`/update_education/${id}`, edu);
  return data?.payload;
};

export const deleteEducation = async (id: string) => {
  const { data } = await api.post(`/delete_education/${id}`);
  return data;
};

// --- Experience ---
export const addExperience = async (userId: string, exp: any) => {
  const { data } = await api.post(`/add_experience/${userId}`, exp);
  return data?.payload;
};

export const updateExperience = async (id: string, exp: any) => {
  const { data } = await api.post(`/update_experience/${id}`, exp);
  return data?.payload;
};

export const deleteExperience = async (id: string) => {
  const { data } = await api.post(`/delete_experience/${id}`);
  return data;
};

// --- Certifications ---
export const addCertification = async (userId: string, cert: any) => {
  const { data } = await api.post(`/add_certification/${userId}`, cert);
  return data?.payload;
};

export const updateCertification = async (id: string, cert: any) => {
  const { data } = await api.post(`/update_certification/${id}`, cert);
  return data?.payload;
};

export const deleteCertification = async (id: string) => {
  const { data } = await api.post(`/delete_certification/${id}`);
  return data;
};

// --- Skills ---
export const addSkill = async (userId: string, skill: any) => {
  const { data } = await api.post(`/add_skill/${userId}`, skill);
  return data?.payload;
};

export const updateSkill = async (id: string, skill: any) => {
  const { data } = await api.post(`/update_skill/${id}`, skill);
  return data?.payload;
};

export const deleteSkill = async (id: string) => {
  const { data } = await api.post(`/delete_skill/${id}`);
  return data;
};

// --- Social Connections ---
export const disconnectGoogle = async (userId: string) => {
  const { data } = await api.post(`/disconnect_google/${userId}`);
  return data;
};

export const disconnectLinkedin = async (userId: string) => {
  const { data } = await api.post(`/disconnect_linkedin/${userId}`);
  return data;
};

export const socialiteRedirect = async (provider: string, userId: string, returnTo: string = '/') => {
  const { data } = await api.get(`/auth/${provider}/redirect/${userId}`, {
    params: { return_to: returnTo }
  });
  return data.payload;
};
