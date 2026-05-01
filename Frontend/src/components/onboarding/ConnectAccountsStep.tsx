import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Linkedin, Mail } from "lucide-react";

interface ConnectAccountsStepProps {
  loading: boolean;
  linkedinConnected: boolean;
  googleConnected: boolean;
  onLinkedInConnect: () => void;
  onGoogleConnect: () => void;
}

export const ConnectAccountsStep = ({
  loading,
  linkedinConnected,
  googleConnected,
  onLinkedInConnect,
  onGoogleConnect,
}: ConnectAccountsStepProps) => {
  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold mb-2">Connect Your Accounts</h2>
        <p className="text-muted-foreground">Connect your LinkedIn and Gmail to enhance your experience (optional)</p>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <Card className="p-6 border-border hover:border-primary transition-colors">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-[#0077B5] flex items-center justify-center">
              <Linkedin className="w-8 h-8 text-white" />
            </div>
            <div>
              <h3 className="font-semibold mb-1">LinkedIn</h3>
              <p className="text-sm text-muted-foreground">Import your professional profile</p>
            </div>
            <Button onClick={onLinkedInConnect} disabled={loading || linkedinConnected} className="w-full" variant={linkedinConnected ? "outline" : "default"}>
              {linkedinConnected ? "✓ Connected" : "Connect LinkedIn"}
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
              <p className="text-sm text-muted-foreground">Connect your email account</p>
            </div>
            <Button onClick={onGoogleConnect} disabled={loading || googleConnected} className="w-full" variant={googleConnected ? "outline" : "default"}>
              {googleConnected ? "✓ Connected" : "Connect Gmail"}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};
