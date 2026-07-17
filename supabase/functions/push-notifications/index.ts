import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// VAPID keys for web push - these should be generated once and stored securely
// For production, generate your own keys using: npx web-push generate-vapid-keys
const VAPID_PUBLIC_KEY = Deno.env.get("VAPID_PUBLIC_KEY") || "BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U";
const VAPID_PRIVATE_KEY = Deno.env.get("VAPID_PRIVATE_KEY") || "UUxI4O8-FbRouADVXc-hK3ltRAc8UV3sP0YOwIzpAMI";

// Base64 URL decode helper
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// Simple web push implementation
async function sendPushNotification(
  subscription: { endpoint: string; p256dh: string; auth: string },
  payload: string
): Promise<boolean> {
  try {
    // For a production implementation, you would use a proper web-push library
    // This is a simplified version that sends the notification
    const response = await fetch(subscription.endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "TTL": "86400",
      },
      body: payload,
    });
    
    return response.ok;
  } catch (error) {
    console.error("Failed to send push notification:", error);
    return false;
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { action, subscription, title, body, userId, icon, url } = await req.json();

    switch (action) {
      case "get-vapid-key": {
        return new Response(
          JSON.stringify({ publicKey: VAPID_PUBLIC_KEY }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "subscribe": {
        if (!subscription || !userId) {
          return new Response(
            JSON.stringify({ error: "Missing subscription or userId" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Upsert the subscription
        const { error } = await supabase
          .from("push_subscriptions")
          .upsert({
            user_id: userId,
            endpoint: subscription.endpoint,
            p256dh: subscription.keys.p256dh,
            auth: subscription.keys.auth,
            updated_at: new Date().toISOString(),
          }, { onConflict: "endpoint" });

        if (error) {
          console.error("Failed to save subscription:", error);
          return new Response(
            JSON.stringify({ error: "Failed to save subscription" }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "unsubscribe": {
        if (!subscription) {
          return new Response(
            JSON.stringify({ error: "Missing subscription" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const { error } = await supabase
          .from("push_subscriptions")
          .delete()
          .eq("endpoint", subscription.endpoint);

        if (error) {
          console.error("Failed to remove subscription:", error);
        }

        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "send": {
        // Send notification to specific user or all users
        let query = supabase.from("push_subscriptions").select("*");
        
        if (userId) {
          query = query.eq("user_id", userId);
        }

        const { data: subscriptions, error } = await query;

        if (error) {
          console.error("Failed to fetch subscriptions:", error);
          return new Response(
            JSON.stringify({ error: "Failed to fetch subscriptions" }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const payload = JSON.stringify({
          title: title || "VRK Solutions",
          body: body || "You have a new notification",
          icon: icon || "/favicon.ico",
          url: url || "/",
        });

        let successCount = 0;
        let failCount = 0;

        for (const sub of subscriptions || []) {
          const success = await sendPushNotification(
            { endpoint: sub.endpoint, p256dh: sub.p256dh, auth: sub.auth },
            payload
          );
          if (success) {
            successCount++;
          } else {
            failCount++;
            // Remove invalid subscriptions
            await supabase
              .from("push_subscriptions")
              .delete()
              .eq("endpoint", sub.endpoint);
          }
        }

        return new Response(
          JSON.stringify({ success: true, sent: successCount, failed: failCount }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      default:
        return new Response(
          JSON.stringify({ error: "Invalid action" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }
  } catch (error) {
    console.error("Push notification error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
