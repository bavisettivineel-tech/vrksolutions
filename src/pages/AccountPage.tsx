import { useNavigate } from "react-router-dom";
import { User, Phone, LogOut, ChevronRight, HelpCircle, Shield, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import vrkLogo from "@/assets/vrk-logo.png";

interface AccountPageProps {
  user: { name: string; phone: string };
  onLogout: () => void;
}

const AccountPage = ({ user, onLogout }: AccountPageProps) => {
  const navigate = useNavigate();

  const menuItems = [
    { icon: Bell, label: "Notifications", onClick: () => {} },
    { icon: HelpCircle, label: "Help & Support", onClick: () => {} },
    { icon: Shield, label: "Privacy Policy", onClick: () => {} },
  ];

  return (
    <div className="min-h-screen pb-20 md:pb-6 md:pt-20 bg-background">
      {/* Mobile Header */}
      <header className="md:hidden sticky top-0 z-30 bg-card/95 backdrop-blur-sm border-b border-border px-4 py-3">
        <h1 className="font-display font-semibold text-lg text-center">My Account</h1>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Profile Card */}
        <Card className="p-6 shadow-card border-vrk-100 animate-fade-in">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full gradient-primary flex items-center justify-center">
              <User className="h-8 w-8 text-primary-foreground" />
            </div>
            <div className="flex-1">
              <h2 className="font-display font-semibold text-xl">{user.name}</h2>
              <div className="flex items-center gap-1.5 text-muted-foreground mt-1">
                <Phone className="h-4 w-4" />
                <span className="text-sm">{user.phone}</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Menu Items */}
        <Card className="overflow-hidden shadow-card border-vrk-100 animate-slide-up">
          {menuItems.map((item, index) => (
            <button
              key={item.label}
              onClick={item.onClick}
              className={`w-full flex items-center justify-between p-4 hover:bg-vrk-50 transition-colors ${
                index < menuItems.length - 1 ? "border-b border-border" : ""
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg gradient-soft">
                  <item.icon className="h-5 w-5 text-primary" />
                </div>
                <span className="font-medium">{item.label}</span>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </button>
          ))}
        </Card>

        {/* Logout Button */}
        <Button
          variant="outline"
          className="w-full h-12 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground animate-slide-up"
          onClick={onLogout}
        >
          <LogOut className="h-5 w-5 mr-2" />
          Logout
        </Button>

        {/* App Info */}
        <div className="text-center pt-6 animate-fade-in">
          <img src={vrkLogo} alt="VRK" className="h-12 w-12 mx-auto opacity-50" />
          <p className="text-sm text-muted-foreground mt-2">VRK Solutions v1.0.0</p>
          <p className="text-xs text-muted-foreground mt-1">© 2024 All rights reserved</p>
        </div>
      </main>
    </div>
  );
};

export default AccountPage;
