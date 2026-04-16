import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface BackButtonProps {
  className?: string;
  label?: string;
  to?: string; // Fixed hierarchical navigation target
}

// Page hierarchy mapping for consistent navigation
const pageHierarchy: Record<string, string> = {
  // Resume Hub
  "/cv-generator": "/",
  
  // Cover Letter Hub  
  "/cover-letter": "/",
  
  // Interview Hub
  "/prepare": "/",
  "/interview-questions": "/prepare",
  "/mock-interview": "/prepare",
  "/question-history": "/prepare",
  "/interviews-library": "/",
  
  // LinkedIn Hub
  "/linkedin-hub": "/",
  "/linkedin-posts": "/linkedin-hub",
  "/linkedin-optimizer": "/linkedin-hub",
  "/linkedin-mock": "/linkedin-hub",
  
  // Application Tracker
  "/applications": "/",
  
  // Email
  "/email-generator": "/",
  
  // Profile & Settings
  "/profile": "/",
  "/skills": "/profile",
  
  // Inbox
  "/inbox": "/",
  
  // Dashboard
  "/dashboard": "/",
  
  // Auth related
  "/onboarding": "/auth",
};

export const BackButton = ({ className = "", label = "Back", to }: BackButtonProps) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (to) {
      // Use explicit target if provided
      navigate(to);
    } else {
      // Use hierarchical navigation based on current path
      const currentPath = window.location.pathname;
      const parentPath = pageHierarchy[currentPath] || "/";
      navigate(parentPath);
    }
  };

  return (
    <Button
      variant="ghost"
      onClick={handleBack}
      className={`gap-2 ${className}`}
    >
      <ArrowLeft className="w-4 h-4" />
      {label}
    </Button>
  );
};
