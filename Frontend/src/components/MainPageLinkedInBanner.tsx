import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

// Mock API function
const mockCheckLinkedInExpiry = async (): Promise<{ is_expired: boolean }> => {
  // GET /api/v0.1/check_linkedin_expiry
  await new Promise(resolve => setTimeout(resolve, 300));
  console.log("Mock: GET /api/v0.1/check_linkedin_expiry called");
  // Return mock data - in real implementation this would check actual expiry
  return { is_expired: true }; // Set to true to demonstrate the banner
};

const mockDisconnectLinkedIn = async (): Promise<void> => {
  // POST /api/v0.1/disconnect_linkedin
  await new Promise(resolve => setTimeout(resolve, 500));
  console.log("Mock: POST /api/v0.1/disconnect_linkedin called");
};

export const MainPageLinkedInBanner = () => {
  const { user } = useAuth();
  const [showBanner, setShowBanner] = useState(false);
  const [isDismissing, setIsDismissing] = useState(false);

  useEffect(() => {
    if (user) {
      checkLinkedInExpiry();
    }
  }, [user]);

  const checkLinkedInExpiry = async () => {
    try {
      const result = await mockCheckLinkedInExpiry();
      if (result.is_expired) {
        // Check if banner was already dismissed this session
        const dismissed = sessionStorage.getItem("linkedin_banner_dismissed");
        if (!dismissed) {
          setShowBanner(true);
        }
      }
    } catch (error) {
      console.error("Error checking LinkedIn expiry:", error);
    }
  };

  const handleDismiss = async () => {
    setIsDismissing(true);
    try {
      await mockDisconnectLinkedIn();
      // Mark as dismissed for this session
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
        borderRadius: "0"
      }}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <span className="text-white text-sm font-medium">
          Your LinkedIn session has expired. Please connect again to restore access.
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
