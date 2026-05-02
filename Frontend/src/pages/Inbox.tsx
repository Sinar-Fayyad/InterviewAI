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
import { ErrorPopup } from "@/components/ui/error-popup";
import { useErrorHandler } from "@/hooks/useErrorHandler";
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
  Star,
  Search,
  Loader2,
  Send,
  Edit2,
} from "lucide-react";
import { getJobEmails, replyToEmail, sendEmail } from "@/services/emailService";
import { socialiteRedirect } from "@/services/profileService";
import api from "@/services/api";

const loadingMessages = [
  "Fetching your emails...",
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
  isStarred: boolean;
  time: string;
  date: string;
}

export default function Inbox() {
  const { userId } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [showStarredOnly, setShowStarredOnly] = useState(false);
  const [messages, setMessages] = useState<InboxMessage[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<InboxMessage | null>(
    null,
  );
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
  const { error, hideError, handleError } = useErrorHandler();
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
      // Step 1: Check connections first
      const response = await api.get(`/connections/${userId}`);
      const data = response.data?.payload;
      const isGoogleConnected = data?.google_connected ?? false;
      setGoogleConnected(isGoogleConnected);

      // Step 2: Only fetch emails if Google is connected
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
              isStarred: false,
              time: e.time || "",
              date: e.date || "",
            });
          });
        }
      }

      const starredIds = loadStarredFromStorage();
      setMessages(
        allMessages.map((m) => ({
          ...m,
          isStarred: starredIds.includes(m.id),
        })),
      );
    } catch (err) {
      handleError(err, "Failed to load inbox. Please refresh the page.");
    } finally {
      setIsLoading(false);
    }
  };

  const loadStarredFromStorage = (): number[] => {
    try {
      return JSON.parse(localStorage.getItem("starredMessages") || "[]");
    } catch {
      return [];
    }
  };

  const saveStarredToStorage = (ids: number[]) =>
    localStorage.setItem("starredMessages", JSON.stringify(ids));

  const handleToggleStar = (messageId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = messages.map((m) =>
      m.id === messageId ? { ...m, isStarred: !m.isStarred } : m,
    );
    setMessages(updated);
    saveStarredToStorage(updated.filter((m) => m.isStarred).map((m) => m.id));
  };

  const handleOpenMessage = (message: InboxMessage) => {
    setSelectedMessage(message);
    setAiReply("");
    setIsEditingReply(false);
    setIsModalOpen(true);
  };

  const handleGenerateReply = async () => {
    if (!selectedMessage || !userId) return;
    setIsCustomizeModalOpen(false);
    setIsGeneratingReply(true);
    try {
      const result = await replyToEmail({
        email_id: String(selectedMessage.id),
        reply_content: customizeNotes,
        text: selectedMessage.fullContent,
      });
      setAiReply(result?.reply || result || "");
      setIsEditingReply(false);
    } catch (err) {
      handleError(err, "Failed to generate reply. Please try again.");
    } finally {
      setIsGeneratingReply(false);
    }
  };

  const handleSendEmail = async () => {
    if (!selectedMessage || !aiReply || !userId) return;
    setIsSendingEmail(true);
    try {
      await sendEmail(userId, {
        to: selectedMessage.from,
        subject: `Re: ${selectedMessage.subject}`,
        body: aiReply,
      });
      toast({
        title: "Email sent successfully",
        description: `Reply sent to ${selectedMessage.from}`,
      });
      setAiReply("");
      setIsModalOpen(false);
    } catch (err) {
      handleError(err, "Failed to send email. Please try again.");
    } finally {
      setIsSendingEmail(false);
    }
  };

  const handleConnectGmail = async () => {
    if (!userId) return;
    try {
      const url = await socialiteRedirect("google", userId, "/inbox");
      if (url) window.location.href = url;
    } catch (error: any) {
      toast({
        title: "Connection Failed",
        description: error.message || "Failed to connect Gmail",
        variant: "destructive",
      });
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "destructive";
      case "medium":
        return "default";
      default:
        return "secondary";
    }
  };

  const filterMessages = (type: "all" | "email" | "spam") => {
    let filtered = [...messages];
    if (showStarredOnly) filtered = filtered.filter((m) => m.isStarred);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (m) =>
          m.subject.toLowerCase().includes(q) ||
          m.from.toLowerCase().includes(q) ||
          m.preview.toLowerCase().includes(q),
      );
    }
    if (type === "email") filtered = filtered.filter((m) => !m.isSpam);
    else if (type === "spam") filtered = filtered.filter((m) => m.isSpam);
    else filtered = filtered.filter((m) => !m.isSpam);
    return filtered;
  };

  const renderMessageCard = (message: InboxMessage) => (
    <Card
      key={message.id}
      className="gradient-card border-border shadow-card p-6 hover:shadow-glow transition-smooth cursor-pointer"
      onClick={() => handleOpenMessage(message)}
    >
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 bg-primary/10">
          <Mail className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4 mb-2">
            <div>
              <h3 className="font-semibold truncate">{message.subject}</h3>
              <p className="text-sm text-muted-foreground">{message.from}</p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={(e) => handleToggleStar(message.id, e)}
              >
                <Star
                  className={`w-4 h-4 ${message.isStarred ? "fill-primary text-primary" : "text-muted-foreground"}`}
                />
              </Button>
              <Badge variant={getPriorityColor(message.priority)}>
                {message.priority}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {message.time}
              </span>
            </div>
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {message.preview}
          </p>
        </div>
      </div>
    </Card>
  );

  const renderNotConnected = () => (
    <Card className="bg-secondary/80 border-primary/20 shadow-card p-8">
      <div className="flex flex-col sm:flex-row items-center gap-6">
        <div className="w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0 bg-primary/10">
          <Mail className="w-7 h-7 text-primary" />
        </div>
        <div className="flex-1 text-center sm:text-left">
          <h3 className="text-lg font-semibold mb-1">Gmail Not Connected</h3>
          <p className="text-sm text-muted-foreground">
            Connect your Gmail account to receive and manage job-related emails
            directly from your inbox.
          </p>
        </div>
        <Button
          onClick={handleConnectGmail}
          variant="default"
          className="flex-shrink-0"
        >
          Connect Gmail
        </Button>
      </div>
    </Card>
  );

  const filteredAll = filterMessages("all");
  const filteredEmail = filterMessages("email");
  const spamMessages = filterMessages("spam");

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="pt-24 pb-16 px-4">
          <div className="max-w-6xl mx-auto">
            <BackButton className="mb-6" />
            <div className="mb-8 animate-fade-in">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Smart Inbox
              </h1>
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
              <Button
                variant={showStarredOnly ? "default" : "outline"}
                onClick={() => setShowStarredOnly(!showStarredOnly)}
              >
                <Star
                  className={`w-4 h-4 mr-2 ${showStarredOnly ? "fill-current" : ""}`}
                />
                Starred
              </Button>
            </div>

            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-12 gap-4">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                <p className="text-sm text-muted-foreground animate-pulse">
                  {loadingMessages[loadingMessageIndex]}
                </p>
              </div>
            ) : (
              <Tabs defaultValue="all" className="space-y-6">
                <TabsList>
                  <TabsTrigger value="all">
                    All ({filteredAll.length})
                  </TabsTrigger>
                  <TabsTrigger value="email">
                    <Mail className="w-4 h-4 mr-2" />
                    Email
                  </TabsTrigger>
                  <TabsTrigger value="spam">
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    Spam ({spamMessages.length})
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="space-y-4">
                  {!googleConnected ? (
                    renderNotConnected()
                  ) : filteredAll.length > 0 ? (
                    filteredAll.map(renderMessageCard)
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      No messages found.
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="email" className="space-y-4">
                  {!googleConnected ? (
                    renderNotConnected()
                  ) : filteredEmail.length > 0 ? (
                    filteredEmail.map(renderMessageCard)
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      No email messages found.
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="spam" className="space-y-4">
                  {spamMessages.length > 0 ? (
                    spamMessages.map((m) => (
                      <Card
                        key={m.id}
                        className="border-destructive/50 bg-destructive/5 p-6 cursor-pointer"
                        onClick={() => handleOpenMessage(m)}
                      >
                        <div className="flex items-start gap-4">
                          <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0 mt-1" />
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold truncate">
                              {m.subject}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {m.from}
                            </p>
                            <p className="text-sm text-muted-foreground line-clamp-2 mt-2">
                              {m.preview}
                            </p>
                            <Badge variant="destructive" className="mt-2">
                              Marked as Spam
                            </Badge>
                          </div>
                        </div>
                      </Card>
                    ))
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      No spam messages found.
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            )}
          </div>
        </main>

        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto overflow-x-hidden">
            {selectedMessage && (
              <>
                <DialogHeader>
                  <DialogTitle className="text-xl">
                    {selectedMessage.subject}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 pb-4 border-b border-border">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center bg-primary/10">
                      <Mail className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{selectedMessage.from}</p>
                      <p className="text-sm text-muted-foreground">
                        {selectedMessage.date} • {selectedMessage.time}
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
                        onClick={() => {
                          setCustomizeNotes("");
                          setIsCustomizeModalOpen(true);
                        }}
                        disabled={isGeneratingReply}
                        className="w-full"
                      >
                        {isGeneratingReply ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Generating AI Reply...
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4 mr-2" />
                            Generate AI Reply
                          </>
                        )}
                      </Button>
                      {aiReply && (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <label className="text-sm font-medium">
                              AI-Generated Reply
                            </label>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setIsEditingReply(!isEditingReply)}
                            >
                              <Edit2 className="w-4 h-4 mr-2" />
                              {isEditingReply ? "Preview" : "Edit"}
                            </Button>
                          </div>
                          {isEditingReply ? (
                            <Textarea
                              value={aiReply}
                              onChange={(e) => setAiReply(e.target.value)}
                              rows={8}
                              className="resize-none"
                            />
                          ) : (
                            <div className="bg-muted/30 rounded-lg p-4">
                              <p className="whitespace-pre-wrap text-sm">
                                {aiReply}
                              </p>
                            </div>
                          )}
                          <Button
                            onClick={handleSendEmail}
                            disabled={isSendingEmail}
                            className="w-full"
                          >
                            {isSendingEmail ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Sending...
                              </>
                            ) : (
                              <>
                                <Send className="w-4 h-4 mr-2" />
                                Send Email
                              </>
                            )}
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

        <Dialog
          open={isCustomizeModalOpen}
          onOpenChange={setIsCustomizeModalOpen}
        >
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
              <Button
                variant="outline"
                onClick={() => setIsCustomizeModalOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleGenerateReply}>Generate Reply</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <ErrorPopup
          isOpen={error.isOpen}
          onClose={hideError}
          title={error.title}
          message={error.message}
          onRetry={error.onRetry}
        />
      </div>
    </ProtectedRoute>
  );
}
