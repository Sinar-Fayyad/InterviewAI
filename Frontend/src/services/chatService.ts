import api from "@/services/api";

// POST /initChatMemory/{user_id?}
export const initChatMemory = async (userId?: string) => {
  const url = userId ? `/initChatMemory/${userId}` : "/initChatMemory";
  const { data } = await api.post(url);
  return data; // { status, collection_name, collection_id }
};

// POST /sendChat
export const sendChat = async (params: { collection_id: string; message: string; chat_history: string }) => {
  const { data } = await api.post("/sendChat", params);
  return data;
};

// POST /clearChatMemory/{collection_name}
export const clearChatMemory = async (collectionName: string) => {
  const { data } = await api.post(`/clearChatMemory/${collectionName}`);
  return data;
};
