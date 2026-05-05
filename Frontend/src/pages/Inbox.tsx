import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Navigation } from "@/components/layout/Navigation";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { BackButton } from "@/components/layout/BackButton";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Mail,
  AlertTriangle,
  Search,
  Loader2,
  Send,
  Edit2,
  Zap,
  Clock,
  ArrowDown,
} from "lucide-react";
import { getJobEmails } from "@/services/inboxService";
import { replyToEmail, sendEmail } from "@/services/emailService";
import { socialiteRedirect } from "@/services/profileService";
import api from "@/services/api";

const loadingMessages = [
  "Fetching your messages...",
  "Please wait...",
  "This might take a moment...",
  "Almost there...",
  "Scanning your inbox...",
  "Prioritizing your messages...",
];

interface InboxMessage {
  id: number;
  type: "email";
  from: string;
  subject: string;
  preview: string;
  fullContent: string;
  priority: "high" | "medium" | "low";
  isSpam: boolean;
  date: string;
}

export default function Inbox() {
  const { userId } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [messages, setMessages] = useState<InboxMessage[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<InboxMessage | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [aiReply, setAiReply] = useState("");
  const [isGeneratingReply, setIsGeneratingReply] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditingReply, setIsEditingReply] = useState(false);
  const [isCustomizeModalOpen, setIsCustomizeModalOpen] = useState(false);
  const [customizeNotes, setCustomizeNotes] = useState("");
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [googleConnected, setGoogleConnected] = useState(false);
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
  const [selectedPriority, setSelectedPriority] = useState<"high" | "medium" | "low" | "all">("all");
  const { toast } = useToast();

  useEffect(() => {
    if (userId) {
      initInbox();
    }
  }, [userId]);

  useEffect(() => {
    if (!isLoading) return;
    const interval = setInterval(() => {
      setLoadingMessageIndex((prev) => (prev + 1) % loadingMessages.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [isLoading]);

  const initInbox = async () => {
    if (!userId) return;
    setIsLoading(true);
    try {
      const response = await api.get(`/connections/${userId}`);
      const data = response.data?.payload;
      const isGoogleConnected = data?.google_connected ?? false;
      setGoogleConnected(isGoogleConnected);

      const allMessages: InboxMessage[] = [];

      if (isGoogleConnected) {
        const emails = await getJobEmails(userId).catch(() => []);
        if (Array.isArray(emails)) {
          emails.forEach((e: any, i: number) => {
            allMessages.push({
              id: e.id || i + 1,
              type: "email",
              from: e.from || e.sender || "",
              subject: e.subject || "",
              preview: e.preview || e.body?.substring(0, 100) || "",
              fullContent: e.body || e.fullContent || "",
              priority: e.priority || "medium",
              isSpam: e.is_spam || false,
              date: e.date || "",
            });
          });
        }
      }

      setMessages(allMessages);
    } catch (err) {
      toast({ title: "Error", description: "Failed to load inbox. Please refresh the page.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenMessage = (message: InboxMessage) => {
    setSelectedMessage(message);
    setAiReply("");
    setIsEditingReply(false);
    setIsModalOpen(true);
  };

  const extractReplyText = (result: any): string => {
    if (!result) return "";
    const candidate = result.email_reply || result.reply || "";
    return typeof candidate === "string" ? candidate.trim() : "";
  };

  const handleGenerateReply = async () => {
    // Snapshot all values before state changes — closing the modal triggers
    // a re-render that can null out selectedMessage via stale closures
    const message = selectedMessage;
    const uid = userId;
    const notes = customizeNotes;

    if (!message || !uid) return;

    setIsCustomizeModalOpen(false);
    setIsGeneratingReply(true);

    try {
      const result = await replyToEmail({
        email_id: String(message.id),
        reply_content: notes,
        context: message.fullContent,
      });

      const replyText = extractReplyText(result);

      if (!replyText) {
        toast({
          title: "No reply generated",
          description: "The AI returned an empty response. Please try again.",
          variant: "destructive",
        });
        return;
      }

      setAiReply(replyText);
      setIsEditingReply(false);
    } catch (err) {
      toast({ title: "Error", description: "Failed to generate reply. Please try again.", variant: "destructive" });
    } finally {
      setIsGeneratingReply(false);
    }
  };

  const handleSendEmail = async () => {
    if (!selectedMessage || !aiReply || !userId) return;
    setIsSendingEmail(true);
    try {
      const rawFrom = selectedMessage.from;
      const emailMatch = rawFrom.match(/<(.+?)>/);
      const cleanEmail = emailMatch ? emailMatch[1] : rawFrom;

      await sendEmail(userId, {
        to: cleanEmail,
        subject: `Re: ${selectedMessage.subject}`,
        body: aiReply,
      });
      toast({
        title: "Email sent successfully",
        description: `Reply sent to ${cleanEmail}`,
      });
      setAiReply("");
      setIsModalOpen(false);
    } catch (err) {
      toast({ title: "Error", description: "Failed to send email. Please try again.", variant: "destructive" });
    } finally {
      setIsSendingEmail(false);
    }
  };

  const handleConnect = async () => {
    if (!userId) return;
    try {
      const url = await socialiteRedirect("google", userId, "/inbox");
      if (url) window.location.href = url;
    } catch (error: any) {
      toast({
        title: "Connection Failed",
        description: error.message || "Failed to connect",
        variant: "destructive",
      });
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "destructive";
      case "medium": return "default";
      default: return "secondary";
    }
  };

  const filterMessages = (priority: "high" | "medium" | "low" | "all" = "all") => {
    let filtered = [...messages];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (m) =>
          m.subject.toLowerCase().includes(q) ||
          m.from.toLowerCase().includes(q) ||
          m.preview.toLowerCase().includes(q)
      );
    }
    if (priority !== "all") {
      filtered = filtered.filter((m) => m.priority === priority);
    }
    return filtered;
  };

  const renderMessageCard = (message: InboxMessage) => {
    const getPriorityIcon = (priority: string) => {
      switch (priority) {
        case "high": return <Zap className="w-5 h-5 text-red-500" />;
        case "medium": return <Clock className="w-5 h-5 text-yellow-500" />;
        case "low": return <ArrowDown className="w-5 h-5 text-green-500" />;
        default: return <Mail className="w-5 h-5 text-primary" />;
      }
    };

    return (
      <Card
        key={message.id}
        className="gradient-card border-border shadow-card p-6 hover:shadow-glow transition-smooth cursor-pointer"
        onClick={() => handleOpenMessage(message)}
      >
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 bg-primary/10">
            {getPriorityIcon(message.priority)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4 mb-2">
              <div>
                <h3 className="font-semibold truncate">{message.subject}</h3>
                <p className="text-sm text-muted-foreground">{message.from}</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Badge variant={getPriorityColor(message.priority)}>{message.priority}</Badge>
              </div>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2">{message.preview}</p>
          </div>
        </div>
      </Card>
    );
  };

  const renderNotConnected = () => {
    return (
      <Card className="bg-secondary/80 border-primary/20 shadow-card p-8">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0 bg-primary/10">
            <Mail className="w-7 h-7 text-primary" />
          </div>
          <div className="flex-1 text-center sm:text-left">
            <h3 className="text-lg font-semibold mb-1">Gmail Not Connected</h3>
            <p className="text-sm text-muted-foreground">
              Connect your Gmail account to receive and manage job-related emails directly from your inbox.
            </p>
          </div>
          <Button onClick={() => handleConnect()} variant="default" className="flex-shrink-0">
            Connect Gmail
          </Button>
        </div>
      </Card>
    );
  };

  const filteredAll = filterMessages("all");
  const filteredHigh = filterMessages("high");
  const filteredMedium = filterMessages("medium");
  const filteredLow = filterMessages("low");

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="pt-24 pb-16 px-4">
          <div className="max-w-6xl mx-auto">
            <BackButton className="mb-6" />
            <div className="mb-8 animate-fade-in">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">Smart Inbox</h1>
              <p className="text-xl text-muted-foreground">
                AI-powered message prioritization with automatic spam detection
              </p>
            </div>
            <div className="flex gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search messages..."
                  className="pl-10"
                />
              </div>
            </div>

            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-12 gap-4">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                <p className="text-sm text-muted-foreground animate-pulse">
                  {loadingMessages[loadingMessageIndex]}
                </p>
              </div>
            ) : (
              <Tabs defaultValue="all" className="space-y-6" value={selectedPriority} onValueChange={(value) => setSelectedPriority(value as "high" | "medium" | "low" | "all")}>
                <TabsList>
                  <TabsTrigger value="all">All ({filteredAll.length})</TabsTrigger>
                  <TabsTrigger value="high">
                    <Zap className="w-4 h-4 mr-2" />High ({filteredHigh.length})
                  </TabsTrigger>
                  <TabsTrigger value="medium">
                    <Clock className="w-4 h-4 mr-2" />Medium ({filteredMedium.length})
                  </TabsTrigger>
                  <TabsTrigger value="low">
                    <ArrowDown className="w-4 h-4 mr-2" />Low ({filteredLow.length})
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="space-y-4">
                  {!googleConnected && renderNotConnected()}
                  {filteredAll.length > 0
                    ? filteredAll.map(renderMessageCard)
                    : !googleConnected
                      ? null
                      : <div className="text-center py-12 text-muted-foreground">No messages found.</div>
                  }
                </TabsContent>

                <TabsContent value="high" className="space-y-4">
                  {!googleConnected
                    ? renderNotConnected()
                    : filteredHigh.length > 0
                      ? filteredHigh.map(renderMessageCard)
                      : <div className="text-center py-12 text-muted-foreground">No high priority messages found.</div>
                  }
                </TabsContent>

                <TabsContent value="medium" className="space-y-4">
                  {!googleConnected
                    ? renderNotConnected()
                    : filteredMedium.length > 0
                      ? filteredMedium.map(renderMessageCard)
                      : <div className="text-center py-12 text-muted-foreground">No medium priority messages found.</div>
                  }
                </TabsContent>

                <TabsContent value="low" className="space-y-4">
                  {!googleConnected
                    ? renderNotConnected()
                    : filteredLow.length > 0
                      ? filteredLow.map(renderMessageCard)
                      : <div className="text-center py-12 text-muted-foreground">No low priority messages found.</div>
                  }
                </TabsContent>
              </Tabs>
            )}
          </div>
        </main>

        {/* ── Message Detail Modal ── */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto overflow-x-hidden">
            {selectedMessage && (
              <>
                <DialogHeader>
                  <DialogTitle className="text-xl">{selectedMessage.subject}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 pb-4 border-b border-border">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center bg-primary/10">
                      {selectedMessage.priority === "high" ? (
                        <Zap className="w-5 h-5 text-red-500" />
                      ) : selectedMessage.priority === "medium" ? (
                        <Clock className="w-5 h-5 text-yellow-500" />
                      ) : (
                        <ArrowDown className="w-5 h-5 text-green-500" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{selectedMessage.from}</p>
                      <p className="text-sm text-muted-foreground">
                        {selectedMessage.date}
                      </p>
                    </div>
                  </div>
                  <div className="py-4">
                    <p className="text-sm text-foreground leading-relaxed break-all whitespace-pre-wrap">
                      {selectedMessage.fullContent}
                    </p>
                  </div>

                  {!selectedMessage.isSpam && (
                    <div className="pt-4 border-t border-border space-y-4">
                      <Button
                        onClick={() => { setCustomizeNotes(""); setIsCustomizeModalOpen(true); }}
                        disabled={isGeneratingReply}
                        className="w-full"
                      >
                        {isGeneratingReply
                          ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Generating AI Reply...</>
                          : <><Send className="w-4 h-4 mr-2" />Generate AI Reply</>
                        }
                      </Button>

                      {/* ── AI Reply Section: only renders when aiReply has content ── */}
                      {aiReply.length > 0 && (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <label className="text-sm font-medium">AI-Generated Reply</label>
                            <Button variant="ghost" size="sm" onClick={() => setIsEditingReply(!isEditingReply)}>
                              <Edit2 className="w-4 h-4 mr-2" />
                              {isEditingReply ? "Preview" : "Edit"}
                            </Button>
                          </div>
                          {isEditingReply
                            ? <Textarea value={aiReply} onChange={(e) => setAiReply(e.target.value)} rows={8} className="resize-none" />
                            : (
                              <div className="bg-muted/30 rounded-lg p-4">
                                <p className="whitespace-pre-wrap text-sm">{aiReply}</p>
                              </div>
                            )
                          }
                          <Button onClick={handleSendEmail} disabled={isSendingEmail} className="w-full">
                            {isSendingEmail
                              ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Sending...</>
                              : <><Send className="w-4 h-4 mr-2" />Send Email</>
                            }
                          </Button>
                        </div>
                      )}
                    </div>
                  )}


                </div>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* ── Customize Reply Modal ── */}
        <Dialog open={isCustomizeModalOpen} onOpenChange={setIsCustomizeModalOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Customize Your Reply</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Add notes to guide the AI (optional)</Label>
                <Textarea
                  value={customizeNotes}
                  onChange={(e) => setCustomizeNotes(e.target.value)}
                  placeholder="E.g., mention my experience in Laravel..."
                  rows={4}
                  className="resize-none"
                />
              </div>
            </div>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button variant="outline" onClick={() => setIsCustomizeModalOpen(false)}>Cancel</Button>
              <Button onClick={handleGenerateReply}>Generate Reply</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </ProtectedRoute>
  );
}