import { useState, useEffect } from "react";
import { MessageCircle, X, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/hooks/useAuth";
import { initChatMemory, sendChat, clearChatMemory } from "@/services/chatService";

export const Chatbot = () => {
  const { userId } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [collectionId, setCollectionId] = useState<string | null>(null);
  const [collectionName, setCollectionName] = useState<string | null>(null);
  const [messages, setMessages] = useState<Array<{ role: "user" | "bot"; content: string }>>([
    { role: "bot", content: "Hi! I'm your InterviewAI assistant. How can I help you today?" }
  ]);

  useEffect(() => {
    if (isOpen && !collectionId) {
      initChat();
    }
  }, [isOpen, userId]);

  const initChat = async () => {
    try {
      const result = await initChatMemory(userId || undefined);
      setCollectionId(result?.collection_id || null);
      setCollectionName(result?.collection_name || null);
    } catch (error) {
      console.error("Failed to init chat:", error);
    }
  };

  const handleSend = async () => {
    if (!message.trim() || isLoading) return;
    const userMsg = message;
    setMessages(prev => [...prev, { role: "user", content: userMsg }]);
    setMessage("");
    setIsLoading(true);

    try {
      const chatHistory = messages.map(m => `${m.role}: ${m.content}`).join("\n");
      const result = await sendChat({
        collection_id: collectionId || "",
        message: userMsg,
        chat_history: chatHistory,
      });
      setMessages(prev => [...prev, { role: "bot", content: result?.response || result?.message || "I couldn't process that. Please try again." }]);
    } catch {
      setMessages(prev => [...prev, { role: "bot", content: "Sorry, something went wrong. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Button onClick={() => setIsOpen(!isOpen)} className="fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-glow bg-primary hover:bg-primary/90 z-50" size="icon">
        {isOpen ? <X className="w-6 h-6 text-primary-foreground" /> : <MessageCircle className="w-6 h-6 text-primary-foreground" />}
      </Button>
      {isOpen && (
        <Card className="fixed bottom-24 right-6 w-80 sm:w-96 h-[500px] shadow-elegant border-border z-50 flex flex-col">
          <div className="p-4 border-b border-border bg-primary/5">
            <h3 className="font-semibold">InterviewAI Assistant</h3>
            <p className="text-xs text-muted-foreground">Ask me anything!</p>
          </div>
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[80%] p-3 rounded-lg ${msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                    <p className="text-sm">{msg.content}</p>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start"><div className="bg-muted p-3 rounded-lg"><Loader2 className="w-4 h-4 animate-spin" /></div></div>
              )}
            </div>
          </ScrollArea>
          <div className="p-4 border-t border-border">
            <div className="flex gap-2">
              <Input value={message} onChange={(e) => setMessage(e.target.value)} onKeyPress={(e) => e.key === "Enter" && handleSend()} placeholder="Type a message..." className="flex-1" disabled={isLoading} />
              <Button onClick={handleSend} size="icon" variant="default" disabled={isLoading}><Send className="w-4 h-4" /></Button>
            </div>
          </div>
        </Card>
      )}
    </>
  );
};
