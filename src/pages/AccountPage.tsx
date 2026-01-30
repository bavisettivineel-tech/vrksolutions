import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, Phone, LogOut, ChevronRight, HelpCircle, Shield, Bell, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import vrkLogo from "@/assets/vrk-logo.png";
import PrivacyPolicyDialog from "@/components/PrivacyPolicyDialog";
import DeleteAccountDialog from "@/components/DeleteAccountDialog";

interface AccountPageProps {
  onLogout: () => void;
}

const AccountPage = ({ onLogout }: AccountPageProps) => {
  const navigate = useNavigate();
  const { profile, user } = useAuth();
  const { toast } = useToast();
  
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteAccount = async () => {
    if (!user) return;
    
    setIsDeleting(true);
    try {
      // Delete user profile first
      await supabase.from("profiles").delete().eq("user_id", user.id);
      
      // Delete user notifications
      await supabase.from("notifications").delete().eq("user_id", user.id);
      
      // Delete user role
      await supabase.from("user_roles").delete().eq("user_id", user.id);
      
      // Sign out the user
      await supabase.auth.signOut();
      
      toast({
        title: "Account Deleted",
        description: "Your account has been successfully deleted.",
      });
    } catch (error) {
      console.error("Error deleting account:", error);
      toast({
        title: "Error",
        description: "Failed to delete account. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const menuItems = [
    { icon: Bell, label: "Notifications", onClick: () => {} },
    { icon: HelpCircle, label: "Help & Support", onClick: () => {} },
    { icon: Shield, label: "Privacy Policy", onClick: () => setShowPrivacyPolicy(true) },
    { icon: Trash2, label: "Delete Account", onClick: () => setShowDeleteDialog(true), destructive: true },
  ];

  const userName = profile?.name || "Student";
  const userPhone = profile?.phone || "";

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
              <h2 className="font-display font-semibold text-xl">{userName}</h2>
              <div className="flex items-center gap-1.5 text-muted-foreground mt-1">
                <Phone className="h-4 w-4" />
                <span className="text-sm">{userPhone}</span>
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
              } ${item.destructive ? "text-destructive" : ""}`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${item.destructive ? "bg-destructive/10" : "gradient-soft"}`}>
                  <item.icon className={`h-5 w-5 ${item.destructive ? "text-destructive" : "text-primary"}`} />
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
          <p className="text-xs text-muted-foreground mt-1">© 2026 All rights reserved</p>
        </div>

        {/* Dialogs */}
        <PrivacyPolicyDialog 
          open={showPrivacyPolicy} 
          onOpenChange={setShowPrivacyPolicy} 
        />
        <DeleteAccountDialog
          open={showDeleteDialog}
          onOpenChange={setShowDeleteDialog}
          onConfirm={handleDeleteAccount}
          isDeleting={isDeleting}
        />
      </main>
    </div>
  );
};

export default AccountPage;
