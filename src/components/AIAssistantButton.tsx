import { useState, useRef, useEffect, ChangeEvent } from "react";
import { Bot, X, Send, Loader2, Camera, ImagePlus, Minimize2, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  image?: string;
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-chat`;

const AIAssistantButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(true);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Hello! 👋 I'm your **AI Education Assistant**. I can help you with:\n\n- 📚 10th Grade subjects\n- 🎓 Intermediate (MPC, BiPC, CEC, HEC)\n- 📝 Diploma courses\n- 🎯 EAPCET preparation\n- 💻 B-Tech Engineering\n\n📷 You can also upload images of questions or problems for me to help solve!\n\nAsk me anything about your studies!",
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleImageSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeSelectedImage = () => {
    setSelectedImage(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (cameraInputRef.current) cameraInputRef.current.value = "";
  };

  const streamChat = async (userMessages: Message[]) => {
    const apiMessages = userMessages.map((m) => {
      if (m.image) {
        return {
          role: m.role,
          content: [
            { type: "text", text: m.content || "Please analyze this image and help me understand it." },
            { type: "image_url", image_url: { url: m.image } },
          ],
        };
      }
      return { role: m.role, content: m.content };
    });

    const response = await fetch(CHAT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({ messages: apiMessages }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      if (response.status === 429) {
        throw new Error("Too many requests. Please wait a moment and try again.");
      }
      if (response.status === 402) {
        throw new Error("AI service temporarily unavailable. Please try again later.");
      }
      throw new Error(errorData.error || "Failed to get response");
    }

    if (!response.body) {
      throw new Error("No response body");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let textBuffer = "";
    let assistantContent = "";

    const assistantId = Date.now().toString();
    setMessages((prev) => [...prev, { id: assistantId, role: "assistant", content: "" }]);

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      textBuffer += decoder.decode(value, { stream: true });

      let newlineIndex: number;
      while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
        let line = textBuffer.slice(0, newlineIndex);
        textBuffer = textBuffer.slice(newlineIndex + 1);

        if (line.endsWith("\r")) line = line.slice(0, -1);
        if (line.startsWith(":") || line.trim() === "") continue;
        if (!line.startsWith("data: ")) continue;

        const jsonStr = line.slice(6).trim();
        if (jsonStr === "[DONE]") break;

        try {
          const parsed = JSON.parse(jsonStr);
          const content = parsed.choices?.[0]?.delta?.content as string | undefined;
          if (content) {
            assistantContent += content;
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantId ? { ...m, content: assistantContent } : m
              )
            );
          }
        } catch {
          textBuffer = line + "\n" + textBuffer;
          break;
        }
      }
    }

    if (textBuffer.trim()) {
      for (let raw of textBuffer.split("\n")) {
        if (!raw) continue;
        if (raw.endsWith("\r")) raw = raw.slice(0, -1);
        if (raw.startsWith(":") || raw.trim() === "") continue;
        if (!raw.startsWith("data: ")) continue;
        const jsonStr = raw.slice(6).trim();
        if (jsonStr === "[DONE]") continue;
        try {
          const parsed = JSON.parse(jsonStr);
          const content = parsed.choices?.[0]?.delta?.content as string | undefined;
          if (content) {
            assistantContent += content;
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantId ? { ...m, content: assistantContent } : m
              )
            );
          }
        } catch {
          /* ignore */
        }
      }
    }
  };

  const handleSend = async () => {
    if ((!inputValue.trim() && !selectedImage) || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: inputValue.trim() || "Please analyze this image.",
      image: selectedImage || undefined,
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputValue("");
    removeSelectedImage();
    setIsLoading(true);

    try {
      const apiMessages = newMessages.filter((m) => m.id !== "welcome");
      await streamChat(apiMessages);
    } catch (error) {
      console.error("AI chat error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to get response");
      setMessages((prev) => prev.filter((m) => m.content !== ""));
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setIsFullScreen(true);
  };

  return (
    <>
      {/* Hidden file inputs */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        className="hidden"
        onChange={handleImageSelect}
      />
      <input
        type="file"
        ref={cameraInputRef}
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleImageSelect}
      />

      {/* Floating button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed z-50 p-4 rounded-full shadow-float transition-all duration-300 gradient-primary hover:shadow-elevated bottom-20 md:bottom-6 right-4"
        >
          <Bot className="h-6 w-6 text-primary-foreground animate-float" />
        </button>
      )}

      {/* Chat panel - Full screen by default */}
      {isOpen && (
        <div
          className={`fixed z-50 flex flex-col bg-card shadow-float animate-scale-in transition-all duration-300 ${
            isFullScreen
              ? "inset-0"
              : "bottom-20 right-4 w-[calc(100vw-2rem)] max-w-md h-[70vh] max-h-[500px] rounded-lg md:bottom-20 md:right-4"
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border gradient-primary rounded-t-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary-foreground/20 rounded-full">
                <Bot className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h3 className="font-display font-semibold text-primary-foreground">
                  AI Education Assistant
                </h3>
                <p className="text-xs text-primary-foreground/80">
                  Powered by Gemini AI
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsFullScreen(!isFullScreen)}
                className="text-primary-foreground hover:bg-primary-foreground/20"
              >
                {isFullScreen ? (
                  <Minimize2 className="h-5 w-5" />
                ) : (
                  <Maximize2 className="h-5 w-5" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleClose}
                className="text-primary-foreground hover:bg-primary-foreground/20"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] p-3 rounded-2xl ${
                    message.role === "user"
                      ? "gradient-primary text-primary-foreground rounded-br-md"
                      : "bg-muted text-foreground rounded-bl-md"
                  }`}
                >
                  {message.image && (
                    <img
                      src={message.image}
                      alt="Uploaded"
                      className="max-w-full max-h-48 rounded-lg mb-2"
                    />
                  )}
                  {message.role === "assistant" ? (
                    <div className="prose prose-sm dark:prose-invert max-w-none text-sm [&>p]:my-1 [&>ul]:my-1 [&>ol]:my-1">
                      <ReactMarkdown>{message.content || "..."}</ReactMarkdown>
                    </div>
                  ) : (
                    <p className="text-sm">{message.content}</p>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Selected Image Preview */}
          {selectedImage && (
            <div className="px-4 pb-2">
              <div className="relative inline-block">
                <img
                  src={selectedImage}
                  alt="Selected"
                  className="h-20 rounded-lg border border-border"
                />
                <button
                  onClick={removeSelectedImage}
                  className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            </div>
          )}

          {/* Input area */}
          <div className="p-4 border-t border-border">
            <div className="flex items-center gap-2">
              {/* Camera Button */}
              <Button
                variant="outline"
                size="icon"
                onClick={() => cameraInputRef.current?.click()}
                disabled={isLoading}
                className="flex-shrink-0 border-vrk-200"
                title="Take Photo"
              >
                <Camera className="h-4 w-4" />
              </Button>

              {/* Gallery Button */}
              <Button
                variant="outline"
                size="icon"
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
                className="flex-shrink-0 border-vrk-200"
                title="Upload Image"
              >
                <ImagePlus className="h-4 w-4" />
              </Button>

              <Input
                placeholder="Ask a question..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                className="flex-1 border-vrk-200"
                disabled={isLoading}
              />
              <Button
                size="icon"
                onClick={handleSend}
                disabled={(!inputValue.trim() && !selectedImage) || isLoading}
                className="gradient-primary"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground text-center mt-2">
              📷 Upload or take a photo of your question for instant help!
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default AIAssistantButton;
