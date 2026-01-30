import { useState } from "react";
import { Bell, X, Check, CheckCheck, BellRing, BellOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { useNotifications } from "@/hooks/useNotifications";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { formatDistanceToNow } from "date-fns";

const NotificationBell = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const { 
    isSupported, 
    isSubscribed, 
    isLoading: isPushLoading, 
    permission,
    subscribe, 
    unsubscribe,
    sendTestNotification 
  } = usePushNotifications();

  const getTypeColor = (type: string) => {
    switch (type) {
      case "announcement":
        return "bg-vrk-500";
      case "content":
        return "bg-green-500";
      case "reminder":
        return "bg-yellow-500";
      default:
        return "bg-gray-500";
    }
  };

  const handlePushToggle = async () => {
    if (isSubscribed) {
      await unsubscribe();
    } else {
      await subscribe();
    }
  };

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="relative"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center animate-pulse-soft">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </Button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <Card className="absolute right-0 top-12 w-80 md:w-96 z-50 shadow-float animate-scale-in">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="font-display font-semibold">Notifications</h3>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={markAllAsRead}
                    className="text-xs text-muted-foreground"
                  >
                    <CheckCheck className="h-4 w-4 mr-1" />
                    Mark all read
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Push Notification Toggle */}
            {isSupported && (
              <div className="p-4 border-b border-border bg-muted/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {isSubscribed ? (
                      <BellRing className="h-5 w-5 text-green-600" />
                    ) : (
                      <BellOff className="h-5 w-5 text-muted-foreground" />
                    )}
                    <div>
                      <p className="text-sm font-medium">Push Notifications</p>
                      <p className="text-xs text-muted-foreground">
                        {isSubscribed 
                          ? "You'll receive alerts even when offline" 
                          : permission === "denied" 
                            ? "Blocked in browser settings"
                            : "Get notified about new content"}
                      </p>
                    </div>
                  </div>
                  {isPushLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Switch
                      checked={isSubscribed}
                      onCheckedChange={handlePushToggle}
                      disabled={permission === "denied"}
                    />
                  )}
                </div>
                {isSubscribed && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3 w-full text-xs"
                    onClick={sendTestNotification}
                  >
                    <BellRing className="h-3 w-3 mr-1" />
                    Send Test Notification
                  </Button>
                )}
              </div>
            )}

            <ScrollArea className="h-72">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  <Bell className="h-10 w-10 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No notifications yet</p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 hover:bg-muted/50 cursor-pointer transition-colors ${
                        !notification.is_read ? "bg-vrk-50" : ""
                      }`}
                      onClick={() => {
                        if (!notification.is_read) {
                          markAsRead(notification.id);
                        }
                      }}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`h-2 w-2 rounded-full mt-2 ${getTypeColor(
                            notification.type
                          )}`}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-sm truncate">
                              {notification.title}
                            </p>
                            {!notification.is_read && (
                              <Badge variant="secondary" className="text-[10px] px-1.5">
                                New
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">
                            {notification.message}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatDistanceToNow(new Date(notification.created_at), {
                              addSuffix: true,
                            })}
                          </p>
                        </div>
                        {!notification.is_read && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={(e) => {
                              e.stopPropagation();
                              markAsRead(notification.id);
                            }}
                          >
                            <Check className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </Card>
        </>
      )}
    </div>
  );
};

export default NotificationBell;
