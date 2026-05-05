// API Service - connects to real backend via axios
import api from "@/services/api";

// Token validation
export const validateToken = async (): Promise<boolean> => {
  return !!sessionStorage.getItem("token");
};

// Wrapper for protected API calls
export const protectedApiCall = async <T>(
  apiCall: () => Promise<T>,
  navigate: (path: string) => void
): Promise<T | null> => {
  const isValid = await validateToken();

  if (!isValid) {
    navigate("/auth");
    return null;
  }

  try {
    return await apiCall();
  } catch (error) {
    console.error("API call failed:", error);
    throw error;
  }
};

// Inbox Messages API
export interface InboxMessage {
  id: number;
  type: "email" | "linkedin";
  from: string;
  subject: string;
  preview: string;
  fullContent: string;
  priority: "high" | "medium" | "low";
  isSpam: boolean;
  isStarred: boolean;
  time: string;
  date: string;
}

export const fetchInboxMessages = async (): Promise<InboxMessage[]> => {
  const { data } = await api.get("/inbox/messages");
  return data;
};

// Stats API
export interface MonthlyStats {
  posts: number;
  impressions: number;
  engagement: string;
}

export const fetchMonthlyStats = async (): Promise<MonthlyStats> => {
  const { data } = await api.get("/stats/monthly");
  return data;
};
