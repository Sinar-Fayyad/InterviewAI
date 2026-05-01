import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Linkedin, Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import api from "@/services/api";

export const AccountConnectionsSection = () => {
  const { toast } = useToast();
  const [linkedInConnected, setLinkedInConnected] = useState(false);
  const [googleConnected, setGoogleConnected] = useState(false);
  const [linkedInLoading, setLinkedInLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleLinkedInAction = async () => {
    setLinkedInLoading(true);
    try {
      if (linkedInConnected) {
        await api.post("/auth/linkedin/disconnect");
        setLinkedInConnected(false);
        toast({ title: "LinkedIn Disconnected", description: "Your LinkedIn account has been disconnected." });
      } else {
        const { data } = await api.get("/auth/linkedin/redirect");
        if (data?.url) window.location.href = data.url;
        else {
          setLinkedInConnected(true);
          toast({ title: "LinkedIn Connected", description: "Your LinkedIn account has been connected successfully." });
        }
      }
    } catch {
      toast({ title: "Error", description: "Failed to update LinkedIn connection.", variant: "destructive" });
    } finally {
      setLinkedInLoading(false);
    }
  };

  const handleGoogleAction = async () => {
    setGoogleLoading(true);
    try {
      if (googleConnected) {
        await api.post("/auth/google/disconnect");
        setGoogleConnected(false);
        toast({ title: "Google Disconnected", description: "Your Google account has been disconnected." });
      } else {
        const { data } = await api.get("/auth/google/redirect");
        if (data?.url) window.location.href = data.url;
        else {
          setGoogleConnected(true);
          toast({ title: "Google Connected", description: "Your Google account has been connected successfully." });
        }
      }
    } catch {
      toast({ title: "Error", description: "Failed to update Google connection.", variant: "destructive" });
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="space-y-6">
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
              onClick={handleLinkedInAction}
              disabled={linkedInLoading}
              className="w-full"
              variant={linkedInConnected ? "destructive" : "default"}
            >
              {linkedInLoading ? "..." : linkedInConnected ? "Disconnect LinkedIn" : "Connect LinkedIn"}
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
              onClick={handleGoogleAction}
              disabled={googleLoading}
              className="w-full"
              variant={googleConnected ? "destructive" : "default"}
            >
              {googleLoading ? "..." : googleConnected ? "Disconnect Gmail" : "Connect Gmail"}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};
