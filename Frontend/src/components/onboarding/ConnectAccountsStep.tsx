import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Linkedin, Mail, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  socialiteRedirect,
  disconnectGoogle,
  disconnectLinkedin,
} from "@/services/profileService";
import { ComponentMode } from "./types";
import api from "@/services/api";

interface ConnectAccountsStepProps {
  loading?: boolean;
  linkedinConnected: boolean;
  googleConnected: boolean;
  onLinkedInConnect?: () => void;
  onGoogleConnect?: () => void;
  mode?: ComponentMode;
  userId?: string;
  onUpdate?: (linkedinConnected: boolean, googleConnected: boolean) => void;
}

export const ConnectAccountsStep = ({
  loading: initialLoading,
  linkedinConnected,
  googleConnected,
  onLinkedInConnect,
  onGoogleConnect,
  mode = "onboarding",
  userId,
  onUpdate,
}: ConnectAccountsStepProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(initialLoading || false);
  const isProfileMode = mode === "profile";

  const handleLinkedInConnect = async () => {
    if (isProfileMode && userId) {
      setLoading(true);
      try {
        if (linkedinConnected) {
          // ✅ disconnect
          await disconnectLinkedin(userId);
          onUpdate?.(false, googleConnected);
          toast({
            title: "LinkedIn Disconnected",
            description: "Your LinkedIn account has been disconnected.",
          });
        } else {
          // connect
          const url = await socialiteRedirect("linkedin-openid", userId);
          if (url) window.location.href = url;
        }
      } catch (error: any) {
        toast({
          title: "Failed",
          description: error.message || "Something went wrong",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    } else {
      onLinkedInConnect?.();
    }
  };

  const handleGoogleConnect = async () => {
    if (isProfileMode && userId) {
      setLoading(true);
      try {
        if (googleConnected) {
          // ✅ disconnect
          await disconnectGoogle(userId);
          onUpdate?.(linkedinConnected, false);
          toast({
            title: "Google Disconnected",
            description: "Your Google account has been disconnected.",
          });
        } else {
          // connect
          const url = await socialiteRedirect("google", userId);
          if (url) window.location.href = url;
        }
      } catch (error: any) {
        toast({
          title: "Failed",
          description: error.message || "Something went wrong",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    } else {
      onGoogleConnect?.();
    }
  };

  const getButtonVariant = (connected: boolean) => {
    if (!isProfileMode) {
      return connected ? "outline" : "default";
    }
    return connected ? "destructive" : "default";
  };

  const getButtonText = (connected: boolean, service: string) => {
    if (isProfileMode) {
      return loading
        ? "..."
        : connected
          ? `Disconnect ${service}`
          : `Connect ${service}`;
    }
    return loading ? "..." : connected ? "✓ Connected" : `Connect ${service}`;
  };

  return (
    <div className="space-y-6">
      {!isProfileMode && (
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold mb-2">Connect Your Accounts</h2>
          <p className="text-muted-foreground">
            Connect your LinkedIn and Gmail to enhance your experience
            (optional)
          </p>
        </div>
      )}

      {isProfileMode && (
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2">Social Login</h2>
          <p className="text-muted-foreground">
            Connect your LinkedIn and Gmail accounts
          </p>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        <Card className="p-6 border-border hover:border-primary transition-colors">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-[#0077B5] flex items-center justify-center">
              <Linkedin className="w-8 h-8 text-white" />
            </div>
            <div>
              <h3 className="font-semibold mb-1">LinkedIn</h3>
              <p className="text-sm text-muted-foreground">
                Import your professional profile
              </p>
            </div>
            <Button
              onClick={handleLinkedInConnect}
              disabled={loading}
              className="w-full"
              variant={getButtonVariant(linkedinConnected)}
            >
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {getButtonText(linkedinConnected, "LinkedIn")}
            </Button>
          </div>
        </Card>
        <Card className="p-6 border-border hover:border-primary transition-colors">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-red-500 to-yellow-500 flex items-center justify-center">
              <Mail className="w-8 h-8 text-white" />
            </div>
            <div>
              <h3 className="font-semibold mb-1">Gmail</h3>
              <p className="text-sm text-muted-foreground">
                Connect your email account
              </p>
            </div>
            <Button
              onClick={handleGoogleConnect}
              disabled={loading}
              className="w-full"
              variant={getButtonVariant(googleConnected)}
            >
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {getButtonText(googleConnected, "Gmail")}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};
