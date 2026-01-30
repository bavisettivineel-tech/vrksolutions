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
import AdminPanel from "@/pages/AdminPanel";
import BottomNavigation from "@/components/BottomNavigation";
import TopNavigation from "@/components/TopNavigation";
import AIAssistantButton from "@/components/AIAssistantButton";
import ContactSupport from "@/components/ContactSupport";

const queryClient = new QueryClient();

interface User {
  name: string;
  phone: string;
  isAdmin: boolean;
}

const AppContent = () => {
  const [showSplash, setShowSplash] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  // Check for existing session
  useEffect(() => {
    const savedUser = localStorage.getItem("vrk_user");
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
        setShowSplash(false);
      } catch {
        localStorage.removeItem("vrk_user");
      }
    }
  }, []);

  const handleLogin = (userData: User) => {
    setUser(userData);
    localStorage.setItem("vrk_user", JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("vrk_user");
  };

  // Show splash screen
  if (showSplash && !user) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }

  // Show login if not authenticated
  if (!user) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  // Show admin panel for admin users
  if (user.isAdmin) {
    return <AdminPanel onLogout={handleLogout} />;
  }

  // Student view
  return (
    <BrowserRouter>
      <TopNavigation userName={user.name} onLogout={handleLogout} />
      <Routes>
        <Route path="/" element={<StudentHome userName={user.name} />} />
        <Route path="/categories" element={<CategoriesPage />} />
        <Route path="/category/:categoryId" element={<CategoryDetailPage />} />
        <Route path="/account" element={<AccountPage user={user} onLogout={handleLogout} />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <BottomNavigation />
      <AIAssistantButton />
      <ContactSupport />
    </BrowserRouter>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AppContent />
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
