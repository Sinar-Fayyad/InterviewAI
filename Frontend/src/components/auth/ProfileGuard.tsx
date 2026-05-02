import { ReactNode, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { fetchProfile } from "@/services/profileService";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

export const ProfileGuard = ({ children }: { children: ReactNode }) => {
  const { token, userId, loading } = useAuth();
  const navigate = useNavigate();
  const [isProfileComplete, setIsProfileComplete] = useState<boolean | null>(null);

  useEffect(() => {
    // Wait for auth to finish loading
    if (loading) return;

    // Not logged in → redirect
    if (!token || !userId) {
      navigate("/auth");
      return;
    }

    const checkProfile = async () => {
      try {
        const data = await fetchProfile(userId);
        const hasProfile =
          data?.user_info?.[0]?.onboarding_completed === true ||
          data?.education?.length > 0 ||
          data?.experience?.length > 0 ||
          data?.certifications?.length > 0 ||
          data?.skills?.length > 0;
        setIsProfileComplete(hasProfile);
      } catch {
        // On error, allow access rather than blocking
        setIsProfileComplete(true);
      }
    };

    checkProfile();
  }, [token, userId, loading, navigate]);

  // Still loading auth or profile check
  if (loading || isProfileComplete === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!token) return null;

  if (!isProfileComplete) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              You need to complete your onboarding to access this feature. Please finish setting up your profile.
            </AlertDescription>
          </Alert>
          <Button onClick={() => navigate("/onboarding")} className="w-full" variant="default">
            Complete Onboarding
          </Button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};