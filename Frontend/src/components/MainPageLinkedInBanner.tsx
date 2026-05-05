import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { checkLinkedinExpiry } from "@/services/linkedinService";
import { disconnectLinkedin } from "@/services/profileService";

export const MainPageLinkedInBanner = () => {
  const { user } = useAuth();
  const [showBanner, setShowBanner] = useState(false);
  const [isDismissing, setIsDismissing] = useState(false);

  useEffect(() => {
    if (user?.id) {
      checkLinkedInExpiry();
    }
  }, [user?.id]);

  const checkLinkedInExpiry = async () => {
    try {
      if (!user?.id) return;
      sessionStorage.removeItem("linkedin_banner_dismissed");
      const result = await checkLinkedinExpiry(user.id);
      setShowBanner(result?.is_expired ?? false);
    } catch (error) {
      setShowBanner(false);
    }
  };

  const handleDismiss = async () => {
    setIsDismissing(true);
    try {
      if (!user?.id) return;
      await disconnectLinkedin(user.id);
      sessionStorage.setItem("linkedin_banner_dismissed", "true");
      setShowBanner(false);
    } catch (error) {
      console.error("Error disconnecting LinkedIn:", error);
    } finally {
      setIsDismissing(false);
    }
  };

  if (!showBanner) return null;

  return (
    <div
      className="fixed top-16 left-0 right-0 z-40"
      style={{
        background: "linear-gradient(90deg, #7C3AED, #4F46E5)",
        padding: "12px 20px",
      }}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <span className="text-white text-sm font-medium">
          Your LinkedIn session has expired. Please connect again to restore
          access.
        </span>
        <button
          onClick={handleDismiss}
          disabled={isDismissing}
          className="text-white hover:text-white/80 transition-colors ml-4"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};
