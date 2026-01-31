import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Image,
  MessageSquare,
  BookOpen,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  Plus,
  GraduationCap,
  FileText,
  Bell,
  Send,
  Trash2,
  Eye,
  EyeOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import FileUploadDialog from "@/components/FileUploadDialog";
import vrkLogo from "@/assets/vrk-logo.png";
import { formatDistanceToNow } from "date-fns";

interface AdminPanelProps {
  onLogout: () => void;
}

type AdminView = "dashboard" | "content" | "ads" | "users" | "analytics" | "support" | "notifications" | "settings";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  is_active: boolean;
}

interface ContentItem {
  id: string;
  title: string;
  content_type: string;
  file_url: string | null;
  is_active: boolean;
  created_at: string;
}

interface Advertisement {
  id: string;
  title: string | null;
  media_type: string;
  media_url: string;
  is_active: boolean;
  created_at: string;
}

interface Profile {
  id: string;
  name: string;
  phone: string;
  created_at: string;
}

interface SupportMessage {
  id: string;
  user_id: string;
  message: string;
  is_from_admin: boolean;
  is_read: boolean;
  created_at: string;
  profiles?: { name: string } | null;
}

const AdminPanel = ({ onLogout }: AdminPanelProps) => {
  const [activeView, setActiveView] = useState<AdminView>("dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [content, setContent] = useState<ContentItem[]>([]);
  const [advertisements, setAdvertisements] = useState<Advertisement[]>([]);
  const [users, setUsers] = useState<Profile[]>([]);
  const [supportMessages, setSupportMessages] = useState<SupportMessage[]>([]);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [uploadType, setUploadType] = useState<"content" | "advertisement">("content");
  const [notificationTitle, setNotificationTitle] = useState("");
  const [notificationMessage, setNotificationMessage] = useState("");
  const [replyMessage, setReplyMessage] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, [activeView]);

  const fetchData = async () => {
    switch (activeView) {
      case "dashboard":
      case "content":
        const { data: catData } = await supabase.from("categories").select("*").order("sort_order");
        if (catData) setCategories(catData);
        const { data: contentData } = await supabase.from("content").select("*").order("created_at", { ascending: false });
        if (contentData) setContent(contentData);
        break;
      case "ads":
        const { data: adsData } = await supabase.from("advertisements").select("*").order("sort_order");
        if (adsData) setAdvertisements(adsData);
        break;
      case "users":
        const { data: usersData } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
        if (usersData) setUsers(usersData);
        break;
      case "support":
        const { data: msgData } = await supabase
          .from("support_messages")
          .select("*")
          .order("created_at", { ascending: false });
        if (msgData) {
          // Fetch profiles separately for user names
          const userIds = [...new Set(msgData.map(m => m.user_id))];
          const { data: profilesData } = await supabase
            .from("profiles")
            .select("user_id, name")
            .in("user_id", userIds);
          
          const messagesWithProfiles = msgData.map(msg => ({
            ...msg,
            profiles: profilesData?.find(p => p.user_id === msg.user_id) || null
          }));
          setSupportMessages(messagesWithProfiles as SupportMessage[]);
        }
        break;
    }
  };

  const toggleContentStatus = async (id: string, isActive: boolean) => {
    await supabase.from("content").update({ is_active: !isActive }).eq("id", id);
    fetchData();
    toast({ title: isActive ? "Content hidden" : "Content visible" });
  };

  const toggleAdStatus = async (id: string, isActive: boolean) => {
    await supabase.from("advertisements").update({ is_active: !isActive }).eq("id", id);
    fetchData();
    toast({ title: isActive ? "Ad hidden" : "Ad visible" });
  };

  const deleteContent = async (id: string) => {
    await supabase.from("content").delete().eq("id", id);
    fetchData();
    toast({ title: "Content deleted" });
  };

  const deleteAd = async (id: string) => {
    await supabase.from("advertisements").delete().eq("id", id);
    fetchData();
    toast({ title: "Advertisement deleted" });
  };

  const sendNotification = async () => {
    if (!notificationTitle.trim() || !notificationMessage.trim()) {
      toast({ title: "Please fill all fields", variant: "destructive" });
      return;
    }

    // Save to in-app notifications
    const { error } = await supabase.from("notifications").insert({
      title: notificationTitle,
      message: notificationMessage,
      type: "announcement",
      user_id: null, // Broadcast to all
    });

    if (error) {
      toast({ title: "Failed to send notification", variant: "destructive" });
      return;
    }

    // Also send push notifications to all subscribed users
    try {
      const pushResponse = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/push-notifications`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            action: "send",
            title: notificationTitle,
            body: notificationMessage,
            icon: "/favicon.ico",
            url: "/",
          }),
        }
      );

      const pushResult = await pushResponse.json();
      
      if (pushResult.sent > 0) {
        toast({ 
          title: `Notification sent to all users! Push notifications sent to ${pushResult.sent} device(s).` 
        });
      } else {
        toast({ title: "Notification sent to all users!" });
      }
    } catch (pushError) {
      console.error("Push notification error:", pushError);
      toast({ title: "Notification sent! (Push may have failed)" });
    }

    setNotificationTitle("");
    setNotificationMessage("");
  };

  const sendSupportReply = async () => {
    if (!replyMessage.trim() || !selectedUserId) return;

    const { error } = await supabase.from("support_messages").insert({
      user_id: selectedUserId,
      message: replyMessage,
      is_from_admin: true,
    });

    if (!error) {
      toast({ title: "Reply sent" });
      setReplyMessage("");
      fetchData();
    }
  };

  const sidebarItems = [
    { id: "dashboard" as AdminView, icon: LayoutDashboard, label: "Dashboard" },
    { id: "content" as AdminView, icon: BookOpen, label: "Content Manager" },
    { id: "ads" as AdminView, icon: Image, label: "Advertisements" },
    { id: "users" as AdminView, icon: Users, label: "Users" },
    { id: "notifications" as AdminView, icon: Bell, label: "Notifications" },
    { id: "support" as AdminView, icon: MessageSquare, label: "Support Chat" },
    { id: "analytics" as AdminView, icon: BarChart3, label: "Analytics" },
    { id: "settings" as AdminView, icon: Settings, label: "Settings" },
  ];

  const stats = [
    { label: "Total Users", value: users.length.toString(), icon: Users },
    { label: "Content Items", value: content.length.toString(), icon: BookOpen },
    { label: "Active Ads", value: advertisements.filter(a => a.is_active).length.toString(), icon: Image },
    { label: "Support Tickets", value: supportMessages.filter(m => !m.is_read && !m.is_from_admin).length.toString(), icon: MessageSquare },
  ];

  const renderContent = () => {
    switch (activeView) {
      case "dashboard":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="font-display font-bold text-2xl">Dashboard</h2>
              <p className="text-muted-foreground">Welcome back, Admin!</p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {stats.map((stat) => (
                <Card key={stat.label} className="p-4 border-vrk-100">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                      <p className="text-2xl font-display font-bold mt-1">{stat.value}</p>
                    </div>
                    <div className="p-2 rounded-lg gradient-soft">
                      <stat.icon className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            <Card className="p-6 border-vrk-100">
              <h3 className="font-display font-semibold text-lg mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button
                  variant="outline"
                  className="h-auto py-4 flex-col gap-2 border-vrk-200 hover:bg-vrk-50"
                  onClick={() => {
                    setUploadType("content");
                    setShowUploadDialog(true);
                  }}
                >
                  <BookOpen className="h-6 w-6 text-primary" />
                  <span>Add Content</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-auto py-4 flex-col gap-2 border-vrk-200 hover:bg-vrk-50"
                  onClick={() => {
                    setUploadType("advertisement");
                    setShowUploadDialog(true);
                  }}
                >
                  <Image className="h-6 w-6 text-primary" />
                  <span>Add Ad</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-auto py-4 flex-col gap-2 border-vrk-200 hover:bg-vrk-50"
                  onClick={() => setActiveView("notifications")}
                >
                  <Bell className="h-6 w-6 text-primary" />
                  <span>Send Notification</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-auto py-4 flex-col gap-2 border-vrk-200 hover:bg-vrk-50"
                  onClick={() => setActiveView("support")}
                >
                  <MessageSquare className="h-6 w-6 text-primary" />
                  <span>View Messages</span>
                </Button>
              </div>
            </Card>
          </div>
        );

      case "content":
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-display font-bold text-2xl">Content Manager</h2>
                <p className="text-muted-foreground">Manage educational content</p>
              </div>
              <Button
                className="gradient-primary"
                onClick={() => {
                  setUploadType("content");
                  setShowUploadDialog(true);
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Content
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {categories.map((cat) => (
                <Card key={cat.id} className="p-6 border-vrk-100">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl gradient-soft">
                      <BookOpen className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-display font-semibold">{cat.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {content.filter(c => c.title.toLowerCase().includes(cat.slug)).length} items
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {content.length === 0 ? (
              <Card className="p-12 text-center border-dashed border-2 border-vrk-200">
                <BookOpen className="h-12 w-12 mx-auto text-vrk-300 mb-4" />
                <h3 className="font-display font-semibold text-lg">No Content Yet</h3>
                <p className="text-muted-foreground mt-2 max-w-sm mx-auto">
                  Start adding subjects, timetables, PDFs, and study materials for students.
                </p>
              </Card>
            ) : (
              <div className="space-y-3">
                {content.map((item) => (
                  <Card key={item.id} className="p-4 border-vrk-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium">{item.title}</p>
                        <p className="text-sm text-muted-foreground">{item.content_type}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={item.is_active ? "default" : "secondary"}>
                        {item.is_active ? "Active" : "Hidden"}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => toggleContentStatus(item.id, item.is_active)}
                      >
                        {item.is_active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive"
                        onClick={() => deleteContent(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        );

      case "ads":
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-display font-bold text-2xl">Advertisement Manager</h2>
                <p className="text-muted-foreground">Manage home screen advertisements</p>
              </div>
              <Button
                className="gradient-primary"
                onClick={() => {
                  setUploadType("advertisement");
                  setShowUploadDialog(true);
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Advertisement
              </Button>
            </div>

            {advertisements.length === 0 ? (
              <Card className="p-12 text-center border-dashed border-2 border-vrk-200">
                <Image className="h-12 w-12 mx-auto text-vrk-300 mb-4" />
                <h3 className="font-display font-semibold text-lg">No Advertisements</h3>
                <p className="text-muted-foreground mt-2 max-w-sm mx-auto">
                  Add image or video advertisements that will display on the student home screen.
                </p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {advertisements.map((ad) => (
                  <Card key={ad.id} className="overflow-hidden border-vrk-100">
                    <div className="aspect-video bg-muted">
                      {ad.media_type === "image" ? (
                        <img src={ad.media_url} alt={ad.title || "Ad"} className="w-full h-full object-cover" />
                      ) : (
                        <video src={ad.media_url} className="w-full h-full object-cover" />
                      )}
                    </div>
                    <div className="p-4">
                      <div className="flex items-center justify-between">
                        <p className="font-medium truncate">{ad.title || "Untitled"}</p>
                        <Badge variant={ad.is_active ? "default" : "secondary"}>
                          {ad.is_active ? "Active" : "Hidden"}
                        </Badge>
                      </div>
                      <div className="flex gap-2 mt-3">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => toggleAdStatus(ad.id, ad.is_active)}
                        >
                          {ad.is_active ? <EyeOff className="h-4 w-4 mr-1" /> : <Eye className="h-4 w-4 mr-1" />}
                          {ad.is_active ? "Hide" : "Show"}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-destructive"
                          onClick={() => deleteAd(ad.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        );

      case "users":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="font-display font-bold text-2xl">User Management</h2>
              <p className="text-muted-foreground">View registered students ({users.length} total)</p>
            </div>

            {users.length === 0 ? (
              <Card className="p-12 text-center border-dashed border-2 border-vrk-200">
                <Users className="h-12 w-12 mx-auto text-vrk-300 mb-4" />
                <h3 className="font-display font-semibold text-lg">No Users Yet</h3>
                <p className="text-muted-foreground mt-2">Registered students will appear here.</p>
              </Card>
            ) : (
              <div className="space-y-3">
                {users.map((user) => (
                  <Card key={user.id} className="p-4 border-vrk-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-semibold">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-muted-foreground">{user.phone}</p>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Joined {formatDistanceToNow(new Date(user.created_at), { addSuffix: true })}
                    </p>
                  </Card>
                ))}
              </div>
            )}
          </div>
        );

      case "notifications":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="font-display font-bold text-2xl">Send Notification</h2>
              <p className="text-muted-foreground">Broadcast announcements to all students</p>
            </div>

            <Card className="p-6 border-vrk-100">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Title</label>
                  <Input
                    value={notificationTitle}
                    onChange={(e) => setNotificationTitle(e.target.value)}
                    placeholder="Notification title"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Message</label>
                  <Textarea
                    value={notificationMessage}
                    onChange={(e) => setNotificationMessage(e.target.value)}
                    placeholder="Write your message here..."
                    rows={4}
                  />
                </div>
                <Button
                  onClick={sendNotification}
                  disabled={!notificationTitle.trim() || !notificationMessage.trim()}
                  className="gradient-primary"
                >
                  <Bell className="h-4 w-4 mr-2" />
                  Send to All Students
                </Button>
              </div>
            </Card>
          </div>
        );

      case "support":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="font-display font-bold text-2xl">Support Messages</h2>
              <p className="text-muted-foreground">View and respond to student inquiries</p>
            </div>

            {supportMessages.length === 0 ? (
              <Card className="p-12 text-center border-dashed border-2 border-vrk-200">
                <MessageSquare className="h-12 w-12 mx-auto text-vrk-300 mb-4" />
                <h3 className="font-display font-semibold text-lg">No Messages</h3>
                <p className="text-muted-foreground mt-2">Student support messages will appear here.</p>
              </Card>
            ) : (
              <div className="space-y-4">
                {supportMessages
                  .filter((m) => !m.is_from_admin)
                  .map((msg) => (
                    <Card key={msg.id} className="p-4 border-vrk-100">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-full gradient-primary flex items-center justify-center text-primary-foreground text-sm font-semibold">
                            {msg.profiles?.name?.charAt(0)?.toUpperCase() || "U"}
                          </div>
                          <div>
                            <p className="font-medium">{msg.profiles?.name || "Unknown"}</p>
                            <p className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true })}
                            </p>
                          </div>
                        </div>
                        {!msg.is_read && (
                          <Badge variant="secondary">New</Badge>
                        )}
                      </div>
                      <p className="text-sm mb-3">{msg.message}</p>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Type your reply..."
                          value={selectedUserId === msg.user_id ? replyMessage : ""}
                          onChange={(e) => {
                            setSelectedUserId(msg.user_id);
                            setReplyMessage(e.target.value);
                          }}
                          onFocus={() => setSelectedUserId(msg.user_id)}
                        />
                        <Button
                          onClick={sendSupportReply}
                          disabled={selectedUserId !== msg.user_id || !replyMessage.trim()}
                          className="gradient-primary"
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                    </Card>
                  ))}
              </div>
            )}
          </div>
        );

      case "analytics":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="font-display font-bold text-2xl">Analytics</h2>
              <p className="text-muted-foreground">Track usage and growth metrics</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-6 border-vrk-100">
                <h3 className="font-display font-semibold mb-4">User Growth</h3>
                <div className="text-center py-8">
                  <p className="text-4xl font-display font-bold text-primary">{users.length}</p>
                  <p className="text-muted-foreground mt-2">Total registered users</p>
                </div>
              </Card>
              <Card className="p-6 border-vrk-100">
                <h3 className="font-display font-semibold mb-4">Content Stats</h3>
                <div className="text-center py-8">
                  <p className="text-4xl font-display font-bold text-primary">{content.length}</p>
                  <p className="text-muted-foreground mt-2">Total content items</p>
                </div>
              </Card>
            </div>
          </div>
        );

      case "settings":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="font-display font-bold text-2xl">Settings</h2>
              <p className="text-muted-foreground">Configure app settings</p>
            </div>

            <Card className="p-6 border-vrk-100">
              <h3 className="font-display font-semibold mb-4">Admin Settings</h3>
              <p className="text-muted-foreground">Additional settings will be available here.</p>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <header className="md:hidden sticky top-0 z-40 bg-card/95 backdrop-blur-sm border-b border-border px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
              <img src={vrkLogo} alt="VRK" className="h-8 w-8 object-contain" />
              <span className="font-display font-bold text-gradient">Admin Panel</span>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="md:hidden fixed inset-0 z-50 bg-foreground/20 backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        >
          <aside
            className="absolute left-0 top-0 bottom-0 w-64 bg-card shadow-float p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <img src={vrkLogo} alt="VRK" className="h-10 w-10 object-contain" />
                <span className="font-display font-bold text-gradient">Admin</span>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            <nav className="space-y-1">
              {sidebarItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveView(item.id);
                    setIsSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                    activeView === item.id
                      ? "bg-vrk-100 text-primary"
                      : "text-muted-foreground hover:bg-vrk-50"
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              ))}
            </nav>
            <Button
              variant="ghost"
              className="w-full mt-6 text-destructive hover:bg-destructive/10"
              onClick={onLogout}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </aside>
        </div>
      )}

      {/* Desktop Layout */}
      <div className="flex">
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex flex-col w-64 h-screen sticky top-0 bg-card border-r border-border p-4">
          <div className="flex items-center gap-3 mb-8 px-2">
            <img src={vrkLogo} alt="VRK" className="h-10 w-10 object-contain" />
            <div>
              <h1 className="font-display font-bold text-gradient">VRK Solutions</h1>
              <p className="text-xs text-muted-foreground">Admin Panel</p>
            </div>
          </div>

          <nav className="flex-1 space-y-1">
            {sidebarItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                  activeView === item.id
                    ? "bg-vrk-100 text-primary"
                    : "text-muted-foreground hover:bg-vrk-50"
                }`}
              >
                <item.icon className="h-5 w-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </nav>

          <Button
            variant="ghost"
            className="w-full text-destructive hover:bg-destructive/10"
            onClick={onLogout}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-8">{renderContent()}</main>
      </div>

      {/* File Upload Dialog */}
      <FileUploadDialog
        open={showUploadDialog}
        onOpenChange={setShowUploadDialog}
        type={uploadType}
        onSuccess={fetchData}
      />
    </div>
  );
};

export default AdminPanel;
