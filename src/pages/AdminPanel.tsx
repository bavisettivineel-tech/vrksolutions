import { useState } from "react";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import vrkLogo from "@/assets/vrk-logo.png";

interface AdminPanelProps {
  onLogout: () => void;
}

type AdminView = "dashboard" | "content" | "ads" | "users" | "analytics" | "support" | "settings";

const AdminPanel = ({ onLogout }: AdminPanelProps) => {
  const [activeView, setActiveView] = useState<AdminView>("dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const sidebarItems = [
    { id: "dashboard" as AdminView, icon: LayoutDashboard, label: "Dashboard" },
    { id: "content" as AdminView, icon: BookOpen, label: "Content Manager" },
    { id: "ads" as AdminView, icon: Image, label: "Advertisements" },
    { id: "users" as AdminView, icon: Users, label: "Users" },
    { id: "analytics" as AdminView, icon: BarChart3, label: "Analytics" },
    { id: "support" as AdminView, icon: MessageSquare, label: "Support Chat" },
    { id: "settings" as AdminView, icon: Settings, label: "Settings" },
  ];

  const stats = [
    { label: "Total Users", value: "0", change: "+0%", icon: Users },
    { label: "Active Today", value: "0", change: "+0%", icon: BarChart3 },
    { label: "Categories", value: "3", change: "Active", icon: BookOpen },
    { label: "Support Tickets", value: "0", change: "Pending", icon: MessageSquare },
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

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {stats.map((stat) => (
                <Card key={stat.label} className="p-4 border-vrk-100">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                      <p className="text-2xl font-display font-bold mt-1">{stat.value}</p>
                      <p className="text-xs text-vrk-600 mt-1">{stat.change}</p>
                    </div>
                    <div className="p-2 rounded-lg gradient-soft">
                      <stat.icon className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Quick Actions */}
            <Card className="p-6 border-vrk-100">
              <h3 className="font-display font-semibold text-lg mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button
                  variant="outline"
                  className="h-auto py-4 flex-col gap-2 border-vrk-200 hover:bg-vrk-50"
                  onClick={() => setActiveView("content")}
                >
                  <BookOpen className="h-6 w-6 text-primary" />
                  <span>Add Subject</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-auto py-4 flex-col gap-2 border-vrk-200 hover:bg-vrk-50"
                  onClick={() => setActiveView("ads")}
                >
                  <Image className="h-6 w-6 text-primary" />
                  <span>Add Ad</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-auto py-4 flex-col gap-2 border-vrk-200 hover:bg-vrk-50"
                  onClick={() => setActiveView("support")}
                >
                  <MessageSquare className="h-6 w-6 text-primary" />
                  <span>View Messages</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-auto py-4 flex-col gap-2 border-vrk-200 hover:bg-vrk-50"
                  onClick={() => setActiveView("analytics")}
                >
                  <BarChart3 className="h-6 w-6 text-primary" />
                  <span>View Reports</span>
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
              <Button className="gradient-primary">
                <Plus className="h-4 w-4 mr-2" />
                Add Content
              </Button>
            </div>

            {/* Category tabs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { title: "10th Grade", icon: BookOpen, count: 0 },
                { title: "Intermediate", icon: GraduationCap, count: 0 },
                { title: "Diploma", icon: FileText, count: 0 },
              ].map((cat) => (
                <Card key={cat.title} className="p-6 border-vrk-100 hover:shadow-card cursor-pointer transition-all">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl gradient-soft">
                      <cat.icon className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-display font-semibold">{cat.title}</h3>
                      <p className="text-sm text-muted-foreground">{cat.count} subjects added</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Empty state */}
            <Card className="p-12 text-center border-dashed border-2 border-vrk-200">
              <BookOpen className="h-12 w-12 mx-auto text-vrk-300 mb-4" />
              <h3 className="font-display font-semibold text-lg">No Content Yet</h3>
              <p className="text-muted-foreground mt-2 max-w-sm mx-auto">
                Start adding subjects, timetables, PDFs, and study materials for students.
              </p>
              <Button className="mt-4 gradient-primary">
                <Plus className="h-4 w-4 mr-2" />
                Add First Subject
              </Button>
            </Card>
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
              <Button className="gradient-primary">
                <Plus className="h-4 w-4 mr-2" />
                Add Advertisement
              </Button>
            </div>

            <Card className="p-12 text-center border-dashed border-2 border-vrk-200">
              <Image className="h-12 w-12 mx-auto text-vrk-300 mb-4" />
              <h3 className="font-display font-semibold text-lg">No Advertisements</h3>
              <p className="text-muted-foreground mt-2 max-w-sm mx-auto">
                Add image or video advertisements that will display on the student home screen.
              </p>
              <Button className="mt-4 gradient-primary">
                <Plus className="h-4 w-4 mr-2" />
                Add First Ad
              </Button>
            </Card>
          </div>
        );

      case "users":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="font-display font-bold text-2xl">User Management</h2>
              <p className="text-muted-foreground">View and manage registered students</p>
            </div>

            <Card className="p-12 text-center border-dashed border-2 border-vrk-200">
              <Users className="h-12 w-12 mx-auto text-vrk-300 mb-4" />
              <h3 className="font-display font-semibold text-lg">No Users Yet</h3>
              <p className="text-muted-foreground mt-2 max-w-sm mx-auto">
                Registered students will appear here once they sign up.
              </p>
            </Card>
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
                <h3 className="font-display font-semibold mb-4">Most Used Categories</h3>
                <div className="text-center py-8 text-muted-foreground">
                  No data available yet
                </div>
              </Card>
              <Card className="p-6 border-vrk-100">
                <h3 className="font-display font-semibold mb-4">Weekly Growth</h3>
                <div className="text-center py-8 text-muted-foreground">
                  No data available yet
                </div>
              </Card>
            </div>
          </div>
        );

      case "support":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="font-display font-bold text-2xl">Support Messages</h2>
              <p className="text-muted-foreground">View and respond to student inquiries</p>
            </div>

            <Card className="p-12 text-center border-dashed border-2 border-vrk-200">
              <MessageSquare className="h-12 w-12 mx-auto text-vrk-300 mb-4" />
              <h3 className="font-display font-semibold text-lg">No Messages</h3>
              <p className="text-muted-foreground mt-2 max-w-sm mx-auto">
                Student support messages will appear here.
              </p>
            </Card>
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
              <p className="text-muted-foreground">Settings will be configured here.</p>
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
    </div>
  );
};

export default AdminPanel;
