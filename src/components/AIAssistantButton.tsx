import { useState } from "react";
import { Bot, X, Camera, MessageSquare, Send, Image } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

interface Message {
  id: string;
  type: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const AIAssistantButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      type: "assistant",
      content: "Hello! I'm your AI Education Assistant. Ask me anything about your studies, or upload a photo of a problem you'd like help with.",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");

  const handleSend = () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: "assistant",
        content: "I'm currently in demo mode. Once connected to the backend, I'll be able to help you with educational questions, solve problems, and provide detailed explanations!",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiResponse]);
    }, 1000);
  };

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed z-50 p-4 rounded-full shadow-float transition-all duration-300 ${
          isOpen
            ? "bg-destructive hover:bg-destructive/90"
            : "gradient-primary hover:shadow-elevated"
        } ${
          isOpen
            ? "bottom-4 right-4"
            : "bottom-20 md:bottom-6 right-4"
        }`}
      >
        {isOpen ? (
          <X className="h-6 w-6 text-primary-foreground" />
        ) : (
          <Bot className="h-6 w-6 text-primary-foreground animate-float" />
        )}
      </button>

      {/* Chat panel */}
      {isOpen && (
        <Card className="fixed z-40 bottom-20 right-4 w-[calc(100vw-2rem)] max-w-md h-[70vh] max-h-[500px] flex flex-col shadow-float animate-scale-in md:bottom-20 md:right-4">
          {/* Header */}
          <div className="flex items-center gap-3 p-4 border-b border-border gradient-primary rounded-t-lg">
            <div className="p-2 bg-primary-foreground/20 rounded-full">
              <Bot className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h3 className="font-display font-semibold text-primary-foreground">AI Education Assistant</h3>
              <p className="text-xs text-primary-foreground/80">Ask anything about your studies</p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-2xl ${
                    message.type === "user"
                      ? "gradient-primary text-primary-foreground rounded-br-md"
                      : "bg-muted text-foreground rounded-bl-md"
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Input area */}
          <div className="p-4 border-t border-border">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-primary"
                title="Upload image"
              >
                <Image className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-primary"
                title="Take photo"
              >
                <Camera className="h-5 w-5" />
              </Button>
              <Input
                placeholder="Ask a question..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSend()}
                className="flex-1 border-vrk-200"
              />
              <Button
                size="icon"
                onClick={handleSend}
                disabled={!inputValue.trim()}
                className="gradient-primary"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      )}
    </>
  );
};

export default AIAssistantButton;
