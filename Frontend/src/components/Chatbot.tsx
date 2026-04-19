import { useState, useEffect, useRef, useCallback } from "react";
import { MessageCircle, X, Send, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/hooks/useAuth";
import { initChatMemory, sendChat, clearChatMemory } from "@/services/chatService";

export const Chatbot = () => {
  const { userId } = useAuth();
  const initRef = useRef(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [collectionId, setCollectionId] = useState<string | null>(null);
  const [collectionName, setCollectionName] = useState<string | null>(null);
  const [messages, setMessages] = useState<Array<{ role: "user" | "bot"; content: string }>>([
    { role: "bot", content: "Hi! I'm your InterviewAI assistant. How can I help you today?" }
  ]);

  const scrollToBottom = useCallback(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    if (isOpen && !collectionId && !initRef.current) {
      initRef.current = true;
      initChat();
    }
  }, [isOpen]);

  const initChat = async () => {
    try {
      const result = await initChatMemory(userId || undefined);
      console.log("Init result:", result);
      const payload = result.payload || result;
      setCollectionId(payload.collection_id || null);
      setCollectionName(payload.collection_name || null);
      if (!payload.collection_id) {
        setMessages(prev => [...prev, { role: "bot", content: "Failed to initialize chat memory. Backend or AI server may be down." }]);
      }
    } catch (error) {
      console.error("Failed to init chat:", error);
      setMessages(prev => [...prev, { role: "bot", content: "Failed to initialize. Please refresh and try again. Check console." }]);
    }
  };

  const handleClear = async () => {
    if (collectionName) {
      try {
        await clearChatMemory(collectionName);
      } catch (error) {
        console.error("Failed to clear memory:", error);
      }
    }
    setCollectionId(null);
    setCollectionName(null);
    setMessages([
      { role: "bot", content: "Hi! I'm your InterviewAI assistant. How can I help you today?" }
    ]);
  };

  const handleSend = async () => {
    if (!message.trim() || isLoading) return;
    if (!collectionId) {
      setMessages(prev => [...prev, { role: "bot", content: "Chat not initialized. Click to open again." }]);
      setIsLoading(false);
      return;
    }
    const userMsg = message;
    const newMessages = [...messages, { role: "user" as const, content: userMsg }];
    setMessages(newMessages);
    setMessage("");
    setIsLoading(true);

    try {
      const chatHistory = newMessages.slice(-5).map(m => ({ role: m.role, content: m.content }));
      console.log("Sending:", { collection_id: collectionId, message: userMsg, chat_history: chatHistory });
      const result = await sendChat({
        collection_id: collectionId,
        message: userMsg,
        chat_history: chatHistory,
      });
      console.log("Send result:", result);
      const responsePayload = result.payload || result;
      setMessages(newMessages.concat({ role: "bot" as const, content: responsePayload.response || "No response from AI." }));
    } catch (error) {
      console.error("Send error:", error);
      setMessages(newMessages.concat({ role: "bot" as const, content: "Sorry, API error. Check console/server status." }));
    } finally {
      setIsLoading(false);
    }
  };

  const toggleChat = () => {
    if (isOpen) {
      setIsOpen(false);
    } else {
      setIsOpen(true);
    }
  };

  return (
    <>
      <Button onClick={toggleChat} className="fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-glow bg-primary hover:bg-primary/90 z-50" size="icon">
        {isOpen ? <X className="w-6 h-6 text-primary-foreground" /> : <MessageCircle className="w-6 h-6 text-primary-foreground" />}
      </Button>
      {isOpen && (
        <Card className="fixed bottom-24 right-6 w-80 sm:w-96 h-[500px] shadow-elegant border-border z-50 flex flex-col">
          <div className="p-4 border-b border-border bg-primary/5 flex items-center justify-between">
            <div>
              <h3 className="font-semibold">InterviewAI Assistant</h3>
              <p className="text-xs text-muted-foreground">Ask me anything!</p>
            </div>
            <Button variant="ghost" size="icon" onClick={handleClear} className="h-8 w-8">
              <Trash2 className="h-4 w-4" />
            </Button>
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
                <div className="flex justify-start">
                  <div className="bg-muted p-3 rounded-lg">
                    <Loader2 className="w-4 h-4 animate-spin" />
                  </div>
                </div>
              )}
              <div ref={scrollRef} />
            </div>
          </ScrollArea>
          <div className="p-4 border-t border-border">
            <div className="flex gap-2">
              <Input 
                value={message} 
                onChange={(e) => setMessage(e.target.value)} 
                onKeyPress={(e) => e.key === "Enter" && handleSend()} 
                placeholder="Type a message..." 
                className="flex-1" 
                disabled={isLoading} 
              />
              <Button onClick={handleSend} size="icon" variant="default" disabled={isLoading || !collectionId}>
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Card>
      )}
    </>
  );
};
