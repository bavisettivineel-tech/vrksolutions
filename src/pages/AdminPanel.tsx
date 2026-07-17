import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { format, subDays, startOfDay, eachDayOfInterval } from "date-fns";
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
  Edit2,
  Save,
  XCircle,
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

type AdminView = "dashboard" | "content" | "ads" | "users" | "analytics" | "support" | "notifications" | "settings" | "subjects";

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
  category_id: string | null;
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

interface Subject {
  id: string;
  category_id: string;
  name: string;
  description: string | null;
  semester: string | null;
  sort_order: number;
  is_active: boolean;
  created_at?: string;
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
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [uploadType, setUploadType] = useState<"content" | "advertisement">("content");
  const [notificationTitle, setNotificationTitle] = useState("");
  const [notificationMessage, setNotificationMessage] = useState("");
  const [replyMessage, setReplyMessage] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategorySlug, setNewCategorySlug] = useState("");
  const [newCategoryDesc, setNewCategoryDesc] = useState("");
  const [editCatName, setEditCatName] = useState("");
  const [editCatDesc, setEditCatDesc] = useState("");
  const [showAddCategory, setShowAddCategory] = useState(false);

  // ── Subject management state ──────────────────────────────────────────────
  const [subjectFilterCat, setSubjectFilterCat] = useState<string>("all");
  const [subjectFilterSem, setSubjectFilterSem] = useState<string>("all");
  const [showAddSubject, setShowAddSubject] = useState(false);
  const [editingSubject, setEditingSubject] = useState<string | null>(null);
  // Add form
  const [newSubjectName, setNewSubjectName] = useState("");
  const [newSubjectDesc, setNewSubjectDesc] = useState("");
  const [newSubjectCatId, setNewSubjectCatId] = useState("");
  const [newSubjectSem, setNewSubjectSem] = useState("");
  const [newSubjectOrder, setNewSubjectOrder] = useState("0");
  // Edit form
  const [editSubjectName, setEditSubjectName] = useState("");
  const [editSubjectDesc, setEditSubjectDesc] = useState("");
  const [editSubjectSem, setEditSubjectSem] = useState("");
  const [editSubjectOrder, setEditSubjectOrder] = useState("0");

  const { toast } = useToast();
  const navigate = useNavigate();

  const fetchData = useCallback(async () => {
    // Always fetch dashboard data
    const { data: catData } = await supabase.from("categories").select("*").order("sort_order");
    if (catData) setCategories(catData);
    
    const { data: contentData } = await supabase.from("content").select("*").order("created_at", { ascending: false });
    if (contentData) setContent(contentData);

    const { data: adsData } = await supabase.from("advertisements").select("*").order("sort_order");
    if (adsData) setAdvertisements(adsData);

    const { data: usersData } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
    if (usersData) setUsers(usersData);

    // Fetch subjects
    const { data: subjData } = await supabase
      .from("subjects")
      .select("*")
      .order("sort_order");
    if (subjData) setSubjects(subjData as unknown as Subject[]);

    const { data: msgData } = await supabase
      .from("support_messages")
      .select("*")
      .order("created_at", { ascending: false });
    if (msgData) {
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
  }, []);

  // Initial data fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Real-time subscriptions for all tables
  useEffect(() => {
    const channels: ReturnType<typeof supabase.channel>[] = [];

    // Content changes
    const contentChannel = supabase
      .channel('content-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'content' }, () => {
        fetchData();
      })
      .subscribe();
    channels.push(contentChannel);

    // Advertisements changes
    const adsChannel = supabase
      .channel('ads-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'advertisements' }, () => {
        fetchData();
      })
      .subscribe();
    channels.push(adsChannel);

    // Profiles changes
    const profilesChannel = supabase
      .channel('profiles-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => {
        fetchData();
      })
      .subscribe();
    channels.push(profilesChannel);

    // Support messages changes
    const supportChannel = supabase
      .channel('support-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'support_messages' }, () => {
        fetchData();
      })
      .subscribe();
    channels.push(supportChannel);

    // Categories changes
    const categoriesChannel = supabase
      .channel('categories-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'categories' }, () => {
        fetchData();
      })
      .subscribe();
    channels.push(categoriesChannel);

    return () => {
      channels.forEach(channel => supabase.removeChannel(channel));
    };
  }, [fetchData]);

  const toggleContentStatus = async (id: string, isActive: boolean) => {
    await supabase.from("content").update({ is_active: !isActive }).eq("id", id);
    toast({ title: isActive ? "Content hidden" : "Content visible" });
  };

  const toggleAdStatus = async (id: string, isActive: boolean) => {
    await supabase.from("advertisements").update({ is_active: !isActive }).eq("id", id);
    toast({ title: isActive ? "Ad hidden" : "Ad visible" });
  };

  const deleteContent = async (id: string) => {
    await supabase.from("content").delete().eq("id", id);
    toast({ title: "Content deleted" });
  };

  const deleteAd = async (id: string) => {
    await supabase.from("advertisements").delete().eq("id", id);
    toast({ title: "Advertisement deleted" });
  };

  const sendNotification = async () => {
    if (!notificationTitle.trim() || !notificationMessage.trim()) {
      toast({ title: "Please fill all fields", variant: "destructive" });
      return;
    }

    const { error } = await supabase.from("notifications").insert({
      title: notificationTitle,
      message: notificationMessage,
      type: "announcement",
      user_id: null,
    });

    if (error) {
      toast({ title: "Failed to send notification", variant: "destructive" });
      return;
    }

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
    }
  };

  const addCategory = async () => {
    if (!newCategoryName.trim() || !newCategorySlug.trim()) {
      toast({ title: "Name and slug are required", variant: "destructive" });
      return;
    }
    const { error } = await supabase.from("categories").insert({
      name: newCategoryName.trim(),
      slug: newCategorySlug.trim().toLowerCase().replace(/\s+/g, "-"),
      description: newCategoryDesc.trim() || null,
      is_active: true,
      sort_order: categories.length,
    });
    if (error) {
      toast({ title: "Failed to add category", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Category added!" });
      setNewCategoryName("");
      setNewCategorySlug("");
      setNewCategoryDesc("");
      setShowAddCategory(false);
    }
  };

  const updateCategory = async (id: string) => {
    const { error } = await supabase.from("categories").update({
      name: editCatName.trim(),
      description: editCatDesc.trim() || null,
    }).eq("id", id);
    if (error) {
      toast({ title: "Failed to update", variant: "destructive" });
    } else {
      toast({ title: "Category updated!" });
      setEditingCategory(null);
    }
  };

  const deleteCategory = async (id: string) => {
    const catContent = content.filter(c => c.category_id === id);
    if (catContent.length > 0) {
      toast({ title: "Cannot delete", description: `This category has ${catContent.length} content items. Remove them first.`, variant: "destructive" });
      return;
    }
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) {
      toast({ title: "Failed to delete category", variant: "destructive" });
    } else {
      toast({ title: "Category deleted" });
    }
  };

  const toggleCategoryStatus = async (id: string, isActive: boolean) => {
    await supabase.from("categories").update({ is_active: !isActive }).eq("id", id);
    toast({ title: isActive ? "Category hidden" : "Category visible" });
  };

  // ── Subject CRUD ──────────────────────────────────────────────────────────
  const addSubject = async () => {
    if (!newSubjectName.trim() || !newSubjectCatId) {
      toast({ title: "Name and category are required", variant: "destructive" });
      return;
    }
    const { error } = await supabase.from("subjects").insert({
      name: newSubjectName.trim(),
      description: newSubjectDesc.trim() || null,
      category_id: newSubjectCatId,
      semester: newSubjectSem.trim() || null,
      sort_order: parseInt(newSubjectOrder) || 0,
      is_active: true,
    } as any);
    if (error) {
      toast({ title: "Failed to add subject", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Subject added!" });
      setNewSubjectName(""); setNewSubjectDesc(""); setNewSubjectCatId("");
      setNewSubjectSem(""); setNewSubjectOrder("0");
      setShowAddSubject(false);
      fetchData();
    }
  };

  const updateSubject = async (id: string) => {
    const { error } = await supabase.from("subjects").update({
      name: editSubjectName.trim(),
      description: editSubjectDesc.trim() || null,
      semester: editSubjectSem.trim() || null,
      sort_order: parseInt(editSubjectOrder) || 0,
    } as any).eq("id", id);
    if (error) {
      toast({ title: "Failed to update subject", variant: "destructive" });
    } else {
      toast({ title: "Subject updated!" });
      setEditingSubject(null);
      fetchData();
    }
  };

  const deleteSubject = async (id: string) => {
    const { error } = await supabase.from("subjects").delete().eq("id", id);
    if (error) {
      toast({ title: "Failed to delete subject", variant: "destructive" });
    } else {
      toast({ title: "Subject deleted" });
      fetchData();
    }
  };

  const toggleSubjectStatus = async (id: string, isActive: boolean) => {
    await supabase.from("subjects").update({ is_active: !isActive } as any).eq("id", id);
    toast({ title: isActive ? "Subject hidden" : "Subject visible" });
    fetchData();
  };

  // ── Semester options per category slug ────────────────────────────────────
  const getSemesterOptions = (catId: string): string[] => {
    const cat = categories.find(c => c.id === catId);
    if (!cat) return [];
    switch (cat.slug) {
      case "diploma": return ["1-1", "2-1", "2-2", "3-1", "3-2"];
      case "btech":   return ["1-1", "1-2", "2-1", "2-2", "3-1", "3-2", "4-1", "4-2"];
      case "intermediate": return ["1st Year", "2nd Year"];
      default: return [];
    }
  };

  const sidebarItems = [
    { id: "dashboard" as AdminView, icon: LayoutDashboard, label: "Dashboard" },
    { id: "content" as AdminView, icon: BookOpen, label: "Content Manager" },
    { id: "subjects" as AdminView, icon: GraduationCap, label: "Subjects Manager" },
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
              <p className="text-muted-foreground">Welcome back, Admin! (Real-time updates enabled)</p>
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
              {categories.map((cat) => {
                const catContentCount = content.filter(c => c.category_id === cat.id).length;
                return (
                  <Card key={cat.id} className="p-6 border-vrk-100">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-xl gradient-soft">
                        <BookOpen className="h-8 w-8 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-display font-semibold">{cat.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {catContentCount} {catContentCount === 1 ? "file" : "files"} uploaded
                        </p>
                      </div>
                    </div>
                  </Card>
                );
              })}
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

      case "subjects": {
        // Filtered subjects
        const filteredSubjects = subjects.filter(s => {
          const catMatch = subjectFilterCat === "all" || s.category_id === subjectFilterCat;
          const semMatch = subjectFilterSem === "all" || (s as any).semester === subjectFilterSem;
          return catMatch && semMatch;
        });

        const semOpts = subjectFilterCat !== "all" ? getSemesterOptions(subjectFilterCat) : [];

        return (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-display font-bold text-2xl">Subjects Manager</h2>
                <p className="text-muted-foreground">Add, edit and delete subjects for every standard</p>
              </div>
              <Button className="gradient-primary" onClick={() => { setShowAddSubject(true); setEditingSubject(null); }}>
                <Plus className="h-4 w-4 mr-2" />
                Add Subject
              </Button>
            </div>

            {/* ── Add Subject Form ──────────────────────────────────── */}
            {showAddSubject && (
              <Card className="p-5 border-vrk-200 bg-vrk-50/30 space-y-4">
                <h3 className="font-semibold text-base">New Subject</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">Subject Name *</label>
                    <Input
                      placeholder="e.g., Mathematics 2"
                      value={newSubjectName}
                      onChange={e => setNewSubjectName(e.target.value)}
                      className="border-vrk-200"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">Category (Standard) *</label>
                    <select
                      value={newSubjectCatId}
                      onChange={e => { setNewSubjectCatId(e.target.value); setNewSubjectSem(""); }}
                      className="w-full h-10 px-3 rounded-md border border-vrk-200 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="">Select standard...</option>
                      {categories.filter(c => c.is_active).map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">Semester / Year</label>
                    {getSemesterOptions(newSubjectCatId).length > 0 ? (
                      <select
                        value={newSubjectSem}
                        onChange={e => setNewSubjectSem(e.target.value)}
                        className="w-full h-10 px-3 rounded-md border border-vrk-200 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value="">Select semester...</option>
                        {getSemesterOptions(newSubjectCatId).map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    ) : (
                      <Input
                        placeholder="e.g., 2-1 (or leave blank for 10th)"
                        value={newSubjectSem}
                        onChange={e => setNewSubjectSem(e.target.value)}
                        className="border-vrk-200"
                      />
                    )}
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">Sort Order</label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={newSubjectOrder}
                      onChange={e => setNewSubjectOrder(e.target.value)}
                      className="border-vrk-200"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">Description (optional)</label>
                    <Input
                      placeholder="Short description of this subject"
                      value={newSubjectDesc}
                      onChange={e => setNewSubjectDesc(e.target.value)}
                      className="border-vrk-200"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" className="gradient-primary" onClick={addSubject}>
                    <Save className="h-4 w-4 mr-1" /> Save Subject
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setShowAddSubject(false)}>
                    Cancel
                  </Button>
                </div>
              </Card>
            )}

            {/* ── Filters ──────────────────────────────────────────── */}
            <div className="flex flex-wrap gap-3 items-center">
              <div>
                <select
                  value={subjectFilterCat}
                  onChange={e => { setSubjectFilterCat(e.target.value); setSubjectFilterSem("all"); }}
                  className="h-9 px-3 rounded-md border border-vrk-200 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="all">All Standards</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              {semOpts.length > 0 && (
                <div>
                  <select
                    value={subjectFilterSem}
                    onChange={e => setSubjectFilterSem(e.target.value)}
                    className="h-9 px-3 rounded-md border border-vrk-200 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="all">All Semesters</option>
                    {semOpts.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              )}
              <Badge variant="secondary" className="ml-auto">
                {filteredSubjects.length} subject{filteredSubjects.length !== 1 ? "s" : ""}
              </Badge>
            </div>

            {/* ── Subject List ──────────────────────────────────────── */}
            {filteredSubjects.length === 0 ? (
              <Card className="p-12 text-center border-dashed border-2 border-vrk-200">
                <GraduationCap className="h-12 w-12 mx-auto text-vrk-300 mb-4" />
                <h3 className="font-display font-semibold text-lg">No Subjects Found</h3>
                <p className="text-muted-foreground mt-2">Add subjects using the button above.</p>
              </Card>
            ) : (
              <div className="space-y-2">
                {filteredSubjects.map(subject => {
                  const cat = categories.find(c => c.id === subject.category_id);
                  const isEditing = editingSubject === subject.id;
                  return (
                    <Card key={subject.id} className="p-4 border-vrk-100">
                      {isEditing ? (
                        <div className="space-y-3">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div>
                              <label className="text-xs text-muted-foreground mb-1 block">Name</label>
                              <Input
                                value={editSubjectName}
                                onChange={e => setEditSubjectName(e.target.value)}
                                className="h-9 text-sm border-vrk-200"
                              />
                            </div>
                            <div>
                              <label className="text-xs text-muted-foreground mb-1 block">Semester / Year</label>
                              {getSemesterOptions(subject.category_id).length > 0 ? (
                                <select
                                  value={editSubjectSem}
                                  onChange={e => setEditSubjectSem(e.target.value)}
                                  className="w-full h-9 px-3 rounded-md border border-vrk-200 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                >
                                  <option value="">No semester</option>
                                  {getSemesterOptions(subject.category_id).map(s => (
                                    <option key={s} value={s}>{s}</option>
                                  ))}
                                </select>
                              ) : (
                                <Input
                                  value={editSubjectSem}
                                  onChange={e => setEditSubjectSem(e.target.value)}
                                  className="h-9 text-sm border-vrk-200"
                                  placeholder="e.g. 1-1"
                                />
                              )}
                            </div>
                            <div>
                              <label className="text-xs text-muted-foreground mb-1 block">Sort Order</label>
                              <Input
                                type="number"
                                value={editSubjectOrder}
                                onChange={e => setEditSubjectOrder(e.target.value)}
                                className="h-9 text-sm border-vrk-200"
                              />
                            </div>
                            <div className="md:col-span-3">
                              <label className="text-xs text-muted-foreground mb-1 block">Description</label>
                              <Input
                                value={editSubjectDesc}
                                onChange={e => setEditSubjectDesc(e.target.value)}
                                placeholder="Description (optional)"
                                className="h-9 text-sm border-vrk-200"
                              />
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" className="gradient-primary" onClick={() => updateSubject(subject.id)}>
                              <Save className="h-4 w-4 mr-1" /> Save
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => setEditingSubject(null)}>
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className="p-2 rounded-lg gradient-soft shrink-0">
                              <BookOpen className="h-4 w-4 text-primary" />
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium text-sm truncate">{subject.name}</p>
                              <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                                <span className="text-xs text-muted-foreground">{cat?.name || "Unknown"}</span>
                                {(subject as any).semester && (
                                  <Badge variant="outline" className="text-xs px-1.5 py-0">
                                    Sem {(subject as any).semester}
                                  </Badge>
                                )}
                                {subject.description && (
                                  <span className="text-xs text-muted-foreground truncate hidden md:block max-w-[200px]">
                                    {subject.description}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <Badge variant={subject.is_active ? "default" : "secondary"} className="text-xs">
                              {subject.is_active ? "Active" : "Hidden"}
                            </Badge>
                            <Button
                              variant="ghost" size="icon" className="h-8 w-8"
                              onClick={() => toggleSubjectStatus(subject.id, subject.is_active)}
                              title={subject.is_active ? "Hide" : "Show"}
                            >
                              {subject.is_active ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                            </Button>
                            <Button
                              variant="ghost" size="icon" className="h-8 w-8"
                              onClick={() => {
                                setEditingSubject(subject.id);
                                setEditSubjectName(subject.name);
                                setEditSubjectDesc(subject.description || "");
                                setEditSubjectSem((subject as any).semester || "");
                                setEditSubjectOrder(String(subject.sort_order));
                              }}
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost" size="icon" className="h-8 w-8 text-destructive"
                              onClick={() => deleteSubject(subject.id)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        );
      }

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
                          variant="destructive"
                          size="sm"
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
              <h2 className="font-display font-bold text-2xl">Users</h2>
              <p className="text-muted-foreground">Manage registered students</p>
            </div>

            {users.length === 0 ? (
              <Card className="p-12 text-center border-dashed border-2 border-vrk-200">
                <Users className="h-12 w-12 mx-auto text-vrk-300 mb-4" />
                <h3 className="font-display font-semibold text-lg">No Users Yet</h3>
                <p className="text-muted-foreground mt-2 max-w-sm mx-auto">
                  Users will appear here once they register.
                </p>
              </Card>
            ) : (
              <div className="space-y-3">
                {users.map((user) => (
                  <Card key={user.id} className="p-4 border-vrk-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full gradient-soft flex items-center justify-center">
                        <span className="font-semibold text-primary">
                          {user.name.charAt(0).toUpperCase()}
                        </span>
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
              <p className="text-muted-foreground">Send push notifications to all users</p>
            </div>

            <Card className="p-6 border-vrk-100">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Notification Title</label>
                  <Input
                    placeholder="Enter title..."
                    value={notificationTitle}
                    onChange={(e) => setNotificationTitle(e.target.value)}
                    className="mt-1 border-vrk-200"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Message</label>
                  <Textarea
                    placeholder="Enter message..."
                    value={notificationMessage}
                    onChange={(e) => setNotificationMessage(e.target.value)}
                    className="mt-1 border-vrk-200"
                    rows={4}
                  />
                </div>
                <Button className="gradient-primary w-full" onClick={sendNotification}>
                  <Send className="h-4 w-4 mr-2" />
                  Send to All Users
                </Button>
              </div>
            </Card>
          </div>
        );

      case "support":
        const groupedMessages = supportMessages.reduce((acc, msg) => {
          if (!acc[msg.user_id]) {
            acc[msg.user_id] = {
              userName: msg.profiles?.name || "Unknown User",
              messages: [],
              unreadCount: 0,
            };
          }
          acc[msg.user_id].messages.push(msg);
          if (!msg.is_read && !msg.is_from_admin) {
            acc[msg.user_id].unreadCount++;
          }
          return acc;
        }, {} as Record<string, { userName: string; messages: SupportMessage[]; unreadCount: number }>);

        return (
          <div className="space-y-6">
            <div>
              <h2 className="font-display font-bold text-2xl">Support Chat</h2>
              <p className="text-muted-foreground">Reply to user messages</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* User List */}
              <Card className="p-4 border-vrk-100 md:col-span-1">
                <h3 className="font-semibold mb-3">Conversations</h3>
                <div className="space-y-2">
                  {Object.entries(groupedMessages).map(([userId, data]) => (
                    <button
                      key={userId}
                      onClick={() => setSelectedUserId(userId)}
                      className={`w-full p-3 rounded-lg text-left transition-colors ${
                        selectedUserId === userId ? "bg-vrk-100" : "hover:bg-muted"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{data.userName}</span>
                        {data.unreadCount > 0 && (
                          <Badge variant="destructive" className="text-xs">
                            {data.unreadCount}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {data.messages[0]?.message}
                      </p>
                    </button>
                  ))}
                  {Object.keys(groupedMessages).length === 0 && (
                    <p className="text-muted-foreground text-center py-4">No messages yet</p>
                  )}
                </div>
              </Card>

              {/* Chat Area */}
              <Card className="p-4 border-vrk-100 md:col-span-2 flex flex-col h-[500px]">
                {selectedUserId ? (
                  <>
                    <div className="flex-1 overflow-y-auto space-y-3 mb-4">
                      {groupedMessages[selectedUserId]?.messages
                        .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
                        .map((msg) => (
                          <div
                            key={msg.id}
                            className={`flex ${msg.is_from_admin ? "justify-end" : "justify-start"}`}
                          >
                            <div
                              className={`max-w-[70%] p-3 rounded-lg ${
                                msg.is_from_admin
                                  ? "gradient-primary text-primary-foreground"
                                  : "bg-muted"
                              }`}
                            >
                              <p className="text-sm">{msg.message}</p>
                              <span className="text-xs opacity-70">
                                {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true })}
                              </span>
                            </div>
                          </div>
                        ))}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Type reply..."
                        value={replyMessage}
                        onChange={(e) => setReplyMessage(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && sendSupportReply()}
                        className="flex-1 border-vrk-200"
                      />
                      <Button className="gradient-primary" onClick={sendSupportReply}>
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-muted-foreground">
                    Select a conversation to view messages
                  </div>
                )}
              </Card>
            </div>
          </div>
        );

      case "analytics": {
        const totalContent = content.length;
        const activeContent = content.filter(c => c.is_active).length;
        const totalAds = advertisements.length;
        const activeAds = advertisements.filter(a => a.is_active).length;
        const unreadSupport = supportMessages.filter(m => !m.is_read && !m.is_from_admin).length;
        const totalCategories = categories.length;

        // Users joined in last 7 days
        const recentUsers = users.filter(u => {
          const joined = new Date(u.created_at);
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          return joined >= weekAgo;
        });

        // Users joined in last 30 days
        const monthlyUsers = users.filter(u => {
          const joined = new Date(u.created_at);
          const monthAgo = new Date();
          monthAgo.setDate(monthAgo.getDate() - 30);
          return joined >= monthAgo;
        });

        const analyticsStats = [
          { label: "Total Users", value: users.length, icon: Users, color: "text-blue-600" },
          { label: "New (7 days)", value: recentUsers.length, icon: Users, color: "text-green-600" },
          { label: "New (30 days)", value: monthlyUsers.length, icon: Users, color: "text-emerald-600" },
          { label: "Categories", value: totalCategories, icon: GraduationCap, color: "text-purple-600" },
          { label: "Total Content", value: totalContent, icon: BookOpen, color: "text-orange-600" },
          { label: "Active Content", value: activeContent, icon: FileText, color: "text-teal-600" },
          { label: "Total Ads", value: totalAds, icon: Image, color: "text-pink-600" },
          { label: "Active Ads", value: activeAds, icon: Image, color: "text-rose-600" },
          { label: "Unread Messages", value: unreadSupport, icon: MessageSquare, color: "text-red-600" },
        ];

        return (
          <div className="space-y-6">
            <div>
              <h2 className="font-display font-bold text-2xl">Analytics</h2>
              <p className="text-muted-foreground">Platform overview and statistics</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {analyticsStats.map((stat) => (
                <Card key={stat.label} className="p-4 border-vrk-100">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">{stat.label}</p>
                      <p className="text-2xl font-display font-bold mt-1">{stat.value}</p>
                    </div>
                    <div className="p-2 rounded-lg gradient-soft">
                      <stat.icon className={`h-5 w-5 ${stat.color}`} />
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            <Card className="p-6 border-vrk-100">
              <h3 className="font-semibold mb-4">User Registration Trends (Last 30 Days)</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={(() => {
                    const days = eachDayOfInterval({ start: subDays(new Date(), 29), end: new Date() });
                    return days.map(day => {
                      const dayStart = startOfDay(day);
                      const count = users.filter(u => {
                        const joined = startOfDay(new Date(u.created_at));
                        return joined.getTime() === dayStart.getTime();
                      }).length;
                      return { date: format(day, "MMM dd"), users: count };
                    });
                  })()}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} interval="preserveStartEnd" />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
                    />
                    <Area type="monotone" dataKey="users" stroke="hsl(var(--primary))" fill="hsl(var(--primary) / 0.2)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card className="p-6 border-vrk-100">
              <h3 className="font-semibold mb-4">Content per Category</h3>
              <div className="space-y-3">
                {categories.map((cat) => {
                  const count = content.filter(c => c.category_id === cat.id).length;
                  const maxCount = Math.max(...categories.map(c => content.filter(ct => ct.category_id === c.id).length), 1);
                  return (
                    <div key={cat.id} className="flex items-center gap-3">
                      <span className="text-sm font-medium w-32 truncate">{cat.name}</span>
                      <div className="flex-1 bg-muted rounded-full h-3 overflow-hidden">
                        <div
                          className="h-full gradient-primary rounded-full transition-all"
                          style={{ width: `${(count / maxCount) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm text-muted-foreground w-8 text-right">{count}</span>
                    </div>
                  );
                })}
              </div>
            </Card>

            <Card className="p-6 border-vrk-100">
              <h3 className="font-semibold mb-4">Recent Users</h3>
              {recentUsers.length === 0 ? (
                <p className="text-sm text-muted-foreground">No new users in the last 7 days</p>
              ) : (
                <div className="space-y-2">
                  {recentUsers.slice(0, 5).map((u) => (
                    <div key={u.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full gradient-soft flex items-center justify-center">
                          <span className="text-xs font-semibold text-primary">{u.name.charAt(0).toUpperCase()}</span>
                        </div>
                        <span className="text-sm font-medium">{u.name}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(u.created_at), { addSuffix: true })}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        );
      }

      case "settings":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="font-display font-bold text-2xl">Settings</h2>
              <p className="text-muted-foreground">App configuration & category management</p>
            </div>

            {/* Category Management */}
            <Card className="p-6 border-vrk-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Manage Categories</h3>
                <Button size="sm" className="gradient-primary" onClick={() => setShowAddCategory(!showAddCategory)}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add Category
                </Button>
              </div>

              {showAddCategory && (
                <div className="mb-4 p-4 rounded-lg border border-vrk-200 bg-vrk-50/30 space-y-3">
                  <Input
                    placeholder="Category Name (e.g., Degree)"
                    value={newCategoryName}
                    onChange={(e) => {
                      setNewCategoryName(e.target.value);
                      setNewCategorySlug(e.target.value.toLowerCase().replace(/\s+/g, "-"));
                    }}
                    className="border-vrk-200"
                  />
                  <Input
                    placeholder="Slug (auto-generated)"
                    value={newCategorySlug}
                    onChange={(e) => setNewCategorySlug(e.target.value)}
                    className="border-vrk-200"
                  />
                  <Input
                    placeholder="Description (optional)"
                    value={newCategoryDesc}
                    onChange={(e) => setNewCategoryDesc(e.target.value)}
                    className="border-vrk-200"
                  />
                  <div className="flex gap-2">
                    <Button size="sm" className="gradient-primary" onClick={addCategory}>
                      <Save className="h-4 w-4 mr-1" /> Save
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setShowAddCategory(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                {categories.map((cat) => {
                  const catContentCount = content.filter(c => c.category_id === cat.id).length;
                  const isEditing = editingCategory === cat.id;

                  return (
                    <div key={cat.id} className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                      {isEditing ? (
                        <div className="flex-1 mr-3 space-y-2">
                          <Input
                            value={editCatName}
                            onChange={(e) => setEditCatName(e.target.value)}
                            className="h-8 text-sm border-vrk-200"
                          />
                          <Input
                            value={editCatDesc}
                            onChange={(e) => setEditCatDesc(e.target.value)}
                            placeholder="Description"
                            className="h-8 text-sm border-vrk-200"
                          />
                        </div>
                      ) : (
                        <div className="flex items-center gap-3 flex-1">
                          <div className="p-2 rounded-lg gradient-soft">
                            <BookOpen className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium text-sm">{cat.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {cat.description || cat.slug} · {catContentCount} files
                            </p>
                          </div>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        {isEditing ? (
                          <>
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => updateCategory(cat.id)}>
                              <Save className="h-4 w-4 text-green-600" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditingCategory(null)}>
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </>
                        ) : (
                          <>
                            <Badge variant={cat.is_active ? "default" : "secondary"} className="text-xs mr-1">
                              {cat.is_active ? "Active" : "Hidden"}
                            </Badge>
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => toggleCategoryStatus(cat.id, cat.is_active)}>
                              {cat.is_active ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => {
                              setEditingCategory(cat.id);
                              setEditCatName(cat.name);
                              setEditCatDesc(cat.description || "");
                            }}>
                              <Edit2 className="h-3.5 w-3.5" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteCategory(cat.id)}>
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

            <Card className="p-6 border-vrk-100">
              <h3 className="font-semibold mb-4">App Information</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b border-border">
                  <span className="text-sm text-muted-foreground">App Name</span>
                  <span className="text-sm font-medium">VRK Solutions</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-border">
                  <span className="text-sm text-muted-foreground">Version</span>
                  <span className="text-sm font-medium">1.0.0</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-border">
                  <span className="text-sm text-muted-foreground">Total Users</span>
                  <span className="text-sm font-medium">{users.length}</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-muted-foreground">Categories</span>
                  <span className="text-sm font-medium">{categories.length}</span>
                </div>
              </div>
            </Card>

            <Card className="p-6 border-vrk-100 border-destructive/30">
              <h3 className="font-semibold mb-4 text-destructive">Danger Zone</h3>
              <Button variant="destructive" onClick={onLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout from Admin
              </Button>
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
      <header className="lg:hidden sticky top-0 z-40 bg-card border-b border-border px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(true)}>
              <Menu className="h-5 w-5" />
            </Button>
            <img src={vrkLogo} alt="VRK" className="h-8 w-8 object-contain" />
            <span className="font-display font-bold text-gradient">Admin Panel</span>
          </div>
          <Button variant="ghost" size="icon" onClick={onLogout}>
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </header>

      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-64 bg-card border-r border-border transform transition-transform duration-300 lg:translate-x-0 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-4 border-b border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img src={vrkLogo} alt="VRK" className="h-10 w-10 object-contain" />
                <div>
                  <h1 className="font-display font-bold text-gradient">VRK Admin</h1>
                  <p className="text-xs text-muted-foreground">Management Panel</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setIsSidebarOpen(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {sidebarItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveView(item.id);
                  setIsSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  activeView === item.id
                    ? "bg-vrk-100 text-primary"
                    : "hover:bg-muted text-muted-foreground"
                }`}
              >
                <item.icon className="h-5 w-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </nav>

          {/* Logout */}
          <div className="p-4 border-t border-border">
            <Button
              variant="outline"
              className="w-full justify-start gap-3"
              onClick={onLogout}
            >
              <LogOut className="h-5 w-5" />
              Logout
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-64 p-4 lg:p-8">
        {renderContent()}
      </main>

      {/* Upload Dialog */}
      <FileUploadDialog
        open={showUploadDialog}
        onOpenChange={setShowUploadDialog}
        type={uploadType}
        onSuccess={() => {
          setShowUploadDialog(false);
        }}
      />
    </div>
  );
};

export default AdminPanel;
