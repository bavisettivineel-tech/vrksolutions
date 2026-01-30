import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import SplashScreen from "@/components/SplashScreen";
import LoginScreen from "@/components/LoginScreen";
import StudentHome from "@/pages/StudentHome";
import CategoriesPage from "@/pages/CategoriesPage";
import AccountPage from "@/pages/AccountPage";
import CategoryDetailPage from "@/pages/CategoryDetailPage";
import EAPCETPage from "@/pages/EAPCETPage";
import AdminPanel from "@/pages/AdminPanel";
import BottomNavigation from "@/components/BottomNavigation";
import TopNavigation from "@/components/TopNavigation";
import AIAssistantButton from "@/components/AIAssistantButton";
import ContactSupport from "@/components/ContactSupport";
import { AuthProvider, useAuth } from "@/hooks/useAuth";

const queryClient = new QueryClient();

const AppContent = () => {
  const [showSplash, setShowSplash] = useState(true);
  const { user, profile, isAdmin, isLoading, signOut } = useAuth();

  // Show splash screen initially
  useEffect(() => {
    if (!isLoading && user) {
      setShowSplash(false);
    }
  }, [isLoading, user]);

  // Show splash screen
  if (showSplash && !user && !isLoading) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }

  // Show loading while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Show login if not authenticated
  if (!user) {
    return <LoginScreen />;
  }

  const userName = profile?.name || "Student";

  // Both admin and student views need Router context
  return (
    <BrowserRouter>
      {isAdmin ? (
        <AdminPanel onLogout={signOut} />
      ) : (
        <>
          <TopNavigation userName={userName} onLogout={signOut} />
          <Routes>
            <Route path="/" element={<StudentHome userName={userName} />} />
            <Route path="/categories" element={<CategoriesPage />} />
            <Route path="/category/:categoryId" element={<CategoryDetailPage />} />
            <Route path="/eapcet" element={<EAPCETPage />} />
            <Route path="/account" element={<AccountPage onLogout={signOut} />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <BottomNavigation />
          <AIAssistantButton />
          <ContactSupport />
        </>
      )}
    </BrowserRouter>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AppContent />
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
