import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v0.1",
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor: attach JWT token
api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem("token");
  const chatbotPaths = ["/initChatMemory", "/sendChat", "/clearChatMemory"];
  const isChatbot = chatbotPaths.some(path => config.url?.includes(path));
  if (token && !isChatbot) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: handle 401 (no hard reload for login page)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && window.location.pathname !== '/auth') {
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("user_id");
      window.location.href = "/auth";
    }
    return Promise.reject(error);
  }
);

export default api;
