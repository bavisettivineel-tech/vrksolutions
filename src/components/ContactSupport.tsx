import { Phone, MessageCircle, X, Send } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useSupportChat } from "@/hooks/useSupportChat";
import { useAuth } from "@/hooks/useAuth";
import { formatDistanceToNow } from "date-fns";

const ContactSupport = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const { messages, sendMessage, isLoading } = useSupportChat();
  const { user } = useAuth();

  const handleCall = () => {
    window.location.href = "tel:8297458070";
  };

  const handleSend = async () => {
    if (!inputValue.trim() || !user) return;

    await sendMessage(inputValue);
    setInputValue("");
  };

  return (
    <>
      {/* Call button */}
      <div className="fixed left-4 bottom-20 md:bottom-6 z-50 flex flex-col gap-2">
        <Button
          onClick={handleCall}
          className="rounded-full h-12 w-12 shadow-float gradient-primary p-0"
          title="Call Support"
        >
          <Phone className="h-5 w-5" />
        </Button>

        <Button
          onClick={() => setIsChatOpen(true)}
          variant="secondary"
          className="rounded-full h-12 w-12 shadow-card p-0"
          title="Chat Support"
        >
          <MessageCircle className="h-5 w-5 text-primary" />
        </Button>
      </div>

      {/* Chat panel */}
      {isChatOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center md:items-center p-4 bg-foreground/20 backdrop-blur-sm animate-fade-in">
          <Card className="w-full max-w-lg h-[80vh] max-h-[600px] flex flex-col shadow-float animate-slide-up">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="p-2 gradient-primary rounded-full">
                  <MessageCircle className="h-4 w-4 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="font-display font-semibold">Support Chat</h3>
                  <p className="text-xs text-muted-foreground">We're here to help</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsChatOpen(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageCircle className="h-10 w-10 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Start a conversation with our support team</p>
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.is_from_admin ? "justify-start" : "justify-end"}`}
                  >
                    <div
                      className={`max-w-[80%] p-3 rounded-2xl ${
                        message.is_from_admin
                          ? "bg-muted text-foreground rounded-bl-md"
                          : "gradient-primary text-primary-foreground rounded-br-md"
                      }`}
                    >
                      <p className="text-sm">{message.message}</p>
                      <span className="text-[10px] opacity-70 mt-1 block">
                        {formatDistanceToNow(new Date(message.created_at), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Input */}
            <div className="p-4 border-t border-border">
              <div className="flex gap-2">
                <Input
                  placeholder="Type your message..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSend()}
                  className="flex-1 border-vrk-200"
                />
                <Button
                  onClick={handleSend}
                  disabled={!inputValue.trim()}
                  className="gradient-primary"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>

              <p className="text-xs text-muted-foreground text-center mt-3">
                Or call us directly at{" "}
                <button
                  onClick={handleCall}
                  className="text-primary font-medium hover:underline"
                >
                  8297458070
                </button>
              </p>
            </div>
          </Card>
        </div>
      )}
    </>
  );
};

export default ContactSupport;
