import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

interface SupportMessage {
  id: string;
  user_id: string;
  message: string;
  is_from_admin: boolean;
  is_read: boolean;
  created_at: string;
}

export const useSupportChat = () => {
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user, isAdmin } = useAuth();

  const fetchMessages = async () => {
    if (!user) return;

    let query = supabase
      .from("support_messages")
      .select("*")
      .order("created_at", { ascending: true });

    if (!isAdmin) {
      query = query.eq("user_id", user.id);
    }

    const { data, error } = await query;

    if (!error && data) {
      setMessages(data as SupportMessage[]);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchMessages();

    if (!user) return;

    // Subscribe to realtime messages
    const channel = supabase
      .channel("support_messages")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "support_messages",
        },
        (payload) => {
          const newMessage = payload.new as SupportMessage;
          // Only add if it's relevant to the current user
          if (isAdmin || newMessage.user_id === user.id) {
            setMessages((prev) => [...prev, newMessage]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, isAdmin]);

  const sendMessage = async (message: string) => {
    if (!user) return { error: new Error("Not authenticated") };

    const { error } = await supabase.from("support_messages").insert({
      user_id: user.id,
      message,
      is_from_admin: isAdmin,
    });

    return { error };
  };

  const markAsRead = async (messageId: string) => {
    if (!isAdmin) return;

    await supabase
      .from("support_messages")
      .update({ is_read: true })
      .eq("id", messageId);
  };

  return {
    messages,
    isLoading,
    sendMessage,
    markAsRead,
    refetch: fetchMessages,
  };
};
