import { useState, createContext, useContext, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/services/api";
import { getUserFriendlyMessage } from "./useErrorHandler";

interface AuthUser {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  full_name?: string;
  onboarding_completed?: boolean;
  [key: string]: unknown;
}

interface AuthState {
  token: string | null;
  userId: string | null;
  user: AuthUser | null;
  loading: boolean;
}

interface AuthContextType extends AuthState {
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, firstName?: string, lastName?: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  
  const [authState, setAuthState] = useState<AuthState>(() => {
    const storedToken = sessionStorage.getItem("token");
    const storedUserId = sessionStorage.getItem("user_id");
    if (storedToken && storedUserId) {
      return {
        token: storedToken,
        userId: storedUserId,
        user: { id: storedUserId, email: "" },
        loading: false,
      };
    }
    return { token: null, userId: null, user: null, loading: false };
  });

  console.log("AuthProvider rendered — userId:", authState.userId, "loading:", authState.loading);
  const navigate = useNavigate();

  const signIn = async (email: string, password: string) => {
    try {
      const response = await api.post("/login", { email, password });
      const payload = response.data?.payload;
      const newToken = payload?.token;
      const newUserId = String(payload?.id);

      sessionStorage.setItem("token", newToken);
      sessionStorage.setItem("user_id", newUserId);
      setAuthState({
        token: newToken,
        userId: newUserId,
        user: { id: newUserId, email, onboarding_completed: payload?.onboarding_completed ?? false },
        loading: false,
      });
      return { error: null };
    } catch (error: any) {
      return { error: getUserFriendlyMessage(error) };
    }
  };

  const signUp = async (email: string, password: string, firstName?: string, lastName?: string) => {
    try {
      const response = await api.post("/register", { email, password, first_name: firstName, last_name: lastName });
      const payload = response.data?.payload;
      const newToken = payload?.token;
      const newUserId = String(payload?.id);

      sessionStorage.setItem("token", newToken);
      sessionStorage.setItem("user_id", newUserId);
      setAuthState({
        token: newToken,
        userId: newUserId,
        user: { id: newUserId, email, onboarding_completed: payload?.onboarding_completed ?? false },
        loading: false,
      });
      return { error: null };
    } catch (error: any) {
      return { error: getUserFriendlyMessage(error, undefined, true) };
    }
  };

  const signOut = async () => {
    try {
      await api.post("/logout");
    } catch {
      // Ignore logout API errors
    }
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user_id");
    setAuthState({ token: null, userId: null, user: null, loading: false });
    navigate("/auth");
  };

  return (
    <AuthContext.Provider value={{ ...authState, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};