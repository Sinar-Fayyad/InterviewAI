import { useState, useEffect, createContext, useContext, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/services/api";

interface AuthUser {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  full_name?: string;
  [key: string]: unknown;
}

interface AuthContextType {
  token: string | null;
  userId: string | null;
  user: AuthUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, firstName?: string, lastName?: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // On mount: restore from sessionStorage
  useEffect(() => {
    const storedToken = sessionStorage.getItem("token");
    const storedUserId = sessionStorage.getItem("user_id");

    if (storedToken && storedUserId) {
      setToken(storedToken);
      setUserId(storedUserId);
      setUser({ id: storedUserId, email: "" });
    }
    setLoading(false);
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const response = await api.post("/login", { email, password });
      const payload = response.data?.payload;
      const newToken = payload?.token;
      const newUserId = String(payload?.id);

      sessionStorage.setItem("token", newToken);
      sessionStorage.setItem("user_id", newUserId);
      setToken(newToken);
      setUserId(newUserId);
      setUser({ id: newUserId, email });

      return { error: null };
    } catch (error: any) {
      return { error: error.response?.data?.message || error.message || "Login failed" };
    }
  };

  const signUp = async (email: string, password: string, firstName?: string, lastName?: string) => {
    try {
      const response = await api.post("/register", {
        email,
        password,
        first_name: firstName,
        last_name: lastName,
      });
      const payload = response.data?.payload;
      const newToken = payload?.token;
      const newUserId = String(payload?.id);

      sessionStorage.setItem("token", newToken);
      sessionStorage.setItem("user_id", newUserId);
      setToken(newToken);
      setUserId(newUserId);
      setUser({ id: newUserId, email });

      return { error: null };
    } catch (error: any) {
      return { error: error.response?.data?.message || error.message || "Signup failed" };
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
    setToken(null);
    setUserId(null);
    setUser(null);
    navigate("/auth");
  };

  return (
    <AuthContext.Provider value={{ token, userId, user, loading, signIn, signUp, signOut }}>
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
