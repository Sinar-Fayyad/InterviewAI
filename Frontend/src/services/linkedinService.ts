import api from "./api";

// GET /get_linkedin_messages/{user_id}
export const getLinkedinMessages = async (userId: string) => {
  const { data } = await api.get(`/get_linkedin_messages/${userId}`);
  return data?.payload || [];
};

export const createLinkedinPost = async (params: {
  title: string;
  description: string;

  image_description?: string;
  image_style?: string;
  image_mood?: string;
  image_colors?: string;
  custom_image_colors?: string;
  image_people?: string;
  image_text_option?: string;
  image_text?: string;
}) => {
  const { data } = await api.post("/create_linkedin_post", {
    title: params.title,
    description: params.description,

    image_description: params.image_description || "",
    image_style: params.image_style || "",
    image_mood: params.image_mood || "",
    image_colors: params.image_colors || "",
    custom_image_colors: params.custom_image_colors || "",
    image_people: params.image_people || "",
    image_text_option: params.image_text_option || "no_text",
    image_text: params.image_text || "",
  });

  const payload = data?.payload || {};

  return {
    code: payload?.code || null,

    title: payload?.title || payload?.post?.title || "",

    content: payload?.content || payload?.post?.content || "",

    image: payload?.image || payload?.image_base64 || "",

    imagePrompt: payload?.image_prompt || "",

    message: data?.message || "",
  };
};


// POST /post_to_linkedin/{user_id}
export const postToLinkedin = async (
  userId: string,
  params: {
    text: string;
    //media?: string | null;
  }
) => {
  const { data } = await api.post(
    `/post_to_linkedin/${encodeURIComponent(userId)}`,
    params
  );

  return data;
};


// POST /schedule_post/{user_id}
export const schedulePost = async (
  userId: string,
  params: {
    title: string;
    body?: string;
    text?: string;
    content?: string;
    scheduled_at: string;
//media?: string | null;
  }
) => {
  //const mediaUrl =
   // params.media && params.media.startsWith("http")
    //  ? params.media
    //  : "https://placehold.co/1200x627/png?text=LinkedIn+Post";

  const payload = {
    user_id: userId,
    title: params.title,
    body: params.body ?? params.text ?? params.content ?? "",
    scheduled_at: params.scheduled_at,
   // media: mediaUrl,
  };

  console.log("Final schedulePost payload:", payload);

  const { data } = await api.post(
    `/schedule_post/${encodeURIComponent(userId)}`,
    payload
  );

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
