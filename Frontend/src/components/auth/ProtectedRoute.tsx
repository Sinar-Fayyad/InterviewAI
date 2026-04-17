import { ReactNode, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

export const ProtectedRoute = ({ children }: { children: ReactNode | ((props: { user: any }) => ReactNode) }) => {

  const { token, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !token) {
      navigate("/auth");
    }
  }, [token, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return token ? <>{typeof children === 'function' ? children({ user: useAuth().user }) : children}</> : null;

};
