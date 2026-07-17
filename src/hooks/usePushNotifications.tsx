import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface PushSubscriptionState {
  isSupported: boolean;
  isSubscribed: boolean;
  isLoading: boolean;
  permission: NotificationPermission | "default";
}

const PUSH_FUNCTION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/push-notifications`;

export const usePushNotifications = () => {
  const { user } = useAuth();
  const [state, setState] = useState<PushSubscriptionState>({
    isSupported: false,
    isSubscribed: false,
    isLoading: true,
    permission: "default",
  });

  // Check if push notifications are supported
  const checkSupport = useCallback(() => {
    const isSupported = 
      "serviceWorker" in navigator && 
      "PushManager" in window && 
      "Notification" in window;
    
    setState(prev => ({
      ...prev,
      isSupported,
      permission: isSupported ? Notification.permission : "default",
    }));
    
    return isSupported;
  }, []);

  // Register service worker
  const registerServiceWorker = useCallback(async (): Promise<ServiceWorkerRegistration | null> => {
    try {
      const registration = await navigator.serviceWorker.register("/sw.js", {
        scope: "/",
      });
      console.log("Service Worker registered:", registration);
      return registration;
    } catch (error) {
      console.error("Service Worker registration failed:", error);
      return null;
    }
  }, []);

  // Get VAPID public key from server
  const getVapidPublicKey = useCallback(async (): Promise<string | null> => {
    try {
      const response = await fetch(PUSH_FUNCTION_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ action: "get-vapid-key" }),
      });
      
      const data = await response.json();
      return data.publicKey;
    } catch (error) {
      console.error("Failed to get VAPID key:", error);
      return null;
    }
  }, []);

  // Convert VAPID key to Uint8Array
  const urlBase64ToUint8Array = (base64String: string): ArrayBuffer => {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
    const rawData = atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray.buffer as ArrayBuffer;
  };

  // Subscribe to push notifications
  const subscribe = useCallback(async (): Promise<boolean> => {
    if (!user) {
      toast.error("Please log in to enable notifications");
      return false;
    }

    setState(prev => ({ ...prev, isLoading: true }));

    try {
      // Request notification permission
      const permission = await Notification.requestPermission();
      setState(prev => ({ ...prev, permission }));

      if (permission !== "granted") {
        toast.error("Notification permission denied");
        setState(prev => ({ ...prev, isLoading: false }));
        return false;
      }

      // Register service worker
      const registration = await registerServiceWorker();
      if (!registration) {
        throw new Error("Failed to register service worker");
      }

      // Get VAPID key
      const vapidPublicKey = await getVapidPublicKey();
      if (!vapidPublicKey) {
        throw new Error("Failed to get VAPID key");
      }

      // Subscribe to push manager
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
      });

      // Save subscription to server
      const response = await fetch(PUSH_FUNCTION_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          action: "subscribe",
          subscription: subscription.toJSON(),
          userId: user.id,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save subscription");
      }

      setState(prev => ({ ...prev, isSubscribed: true, isLoading: false }));
      toast.success("Push notifications enabled!");
      return true;
    } catch (error) {
      console.error("Failed to subscribe:", error);
      toast.error("Failed to enable notifications");
      setState(prev => ({ ...prev, isLoading: false }));
      return false;
    }
  }, [user, registerServiceWorker, getVapidPublicKey]);

  // Unsubscribe from push notifications
  const unsubscribe = useCallback(async (): Promise<boolean> => {
    setState(prev => ({ ...prev, isLoading: true }));

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        // Unsubscribe from push manager
        await subscription.unsubscribe();

        // Remove from server
        await fetch(PUSH_FUNCTION_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            action: "unsubscribe",
            subscription: subscription.toJSON(),
          }),
        });
      }

      setState(prev => ({ ...prev, isSubscribed: false, isLoading: false }));
      toast.success("Push notifications disabled");
      return true;
    } catch (error) {
      console.error("Failed to unsubscribe:", error);
      toast.error("Failed to disable notifications");
      setState(prev => ({ ...prev, isLoading: false }));
      return false;
    }
  }, []);

  // Check current subscription status
  const checkSubscription = useCallback(async () => {
    if (!checkSupport()) {
      setState(prev => ({ ...prev, isLoading: false }));
      return;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      
      setState(prev => ({
        ...prev,
        isSubscribed: !!subscription,
        isLoading: false,
      }));
    } catch (error) {
      console.error("Failed to check subscription:", error);
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [checkSupport]);

  // Initialize on mount
  useEffect(() => {
    checkSubscription();
  }, [checkSubscription]);

  // Send a test notification (for debugging)
  const sendTestNotification = useCallback(async () => {
    if (!user) return;

    try {
      const response = await fetch(PUSH_FUNCTION_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          action: "send",
          userId: user.id,
          title: "Test Notification",
          body: "This is a test notification from VRK Solutions!",
          icon: "/favicon.ico",
          url: "/",
        }),
      });

      if (response.ok) {
        toast.success("Test notification sent!");
      } else {
        toast.error("Failed to send test notification");
      }
    } catch (error) {
      console.error("Failed to send test notification:", error);
      toast.error("Failed to send test notification");
    }
  }, [user]);

  return {
    ...state,
    subscribe,
    unsubscribe,
    sendTestNotification,
  };
};
