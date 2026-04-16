import { AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface LinkedInTokenBannerProps {
  show: boolean;
}

export const LinkedInTokenBanner = ({ show }: LinkedInTokenBannerProps) => {
  const navigate = useNavigate();

  if (!show) return null;

  return (
    <Alert variant="destructive" className="mb-6">
      <AlertTriangle className="h-4 w-4" />
      <AlertDescription className="flex items-center justify-between flex-wrap gap-4">
        <span>
          Your LinkedIn session has expired. Please login again to restore access.
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate("/profile")}
          className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
        >
          Reconnect LinkedIn
        </Button>
      </AlertDescription>
    </Alert>
  );
};
