import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import SplashScreen from "@/components/SplashScreen";
import LoginScreen from "@/components/LoginScreen";
import StudentHome from "@/pages/StudentHome";
import CategoriesPage from "@/pages/CategoriesPage";
import AccountPage from "@/pages/AccountPage";
import CategoryDetailPage from "@/pages/CategoryDetailPage";
import SavedPDFsPage from "@/pages/SavedPDFsPage";
import EAPCETPage from "@/pages/EAPCETPage";
import NotesWithAIPage from "@/pages/NotesWithAIPage";
import AdminPanel from "@/pages/AdminPanel";
import PrivacyPolicyPage from "@/pages/PrivacyPolicyPage";
import DeleteAccountPage from "@/pages/DeleteAccountPage";
import BottomNavigation from "@/components/BottomNavigation";
import TopNavigation from "@/components/TopNavigation";
import AIAssistantButton from "@/components/AIAssistantButton";
import ContactSupport from "@/components/ContactSupport";
import { AuthProvider, useAuth } from "@/hooks/useAuth";

const HomeOnlyComponents = () => {
  const location = useLocation();
  if (location.pathname !== "/") return null;
  return (
    <>
      <AIAssistantButton />
      <ContactSupport />
    </>
  );
};

const queryClient = new QueryClient();

const AppContent = () => {
  const [showSplash, setShowSplash] = useState(true);
  const { user, profile, isAdmin, isLoading, signOut } = useAuth();
  const location = useLocation();

  // Dismiss splash screen once auth check is complete (whether logged in or not)
  useEffect(() => {
    if (!isLoading) {
      const timer = setTimeout(() => setShowSplash(false), 500);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  // Show loading while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const isPublicRoute = ["/privacy-policy", "/delete-account"].includes(location.pathname);

  // Show splash screen if not on public routes and not logged in
  if (showSplash && !user && !isPublicRoute) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }

  const userName = profile?.name || "Student";

  if (isAdmin) {
    return (
      <Routes>
        <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
        <Route path="/delete-account" element={<DeleteAccountPage />} />
        <Route path="*" element={<AdminPanel onLogout={signOut} />} />
      </Routes>
    );
  }

  return (
    <>
      {user && !isPublicRoute && <TopNavigation userName={userName} onLogout={signOut} />}
      <Routes>
        {/* Public Routes */}
        <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
        <Route path="/delete-account" element={<DeleteAccountPage />} />

        {/* Protected Student Routes / Fallbacks */}
        <Route path="/" element={user ? <StudentHome userName={userName} /> : <LoginScreen />} />
        <Route path="/categories" element={user ? <CategoriesPage /> : <Navigate to="/" replace />} />
        <Route path="/category/:categoryId" element={user ? <CategoryDetailPage /> : <Navigate to="/" replace />} />
        <Route path="/saved-pdfs" element={user ? <SavedPDFsPage /> : <Navigate to="/" replace />} />
        <Route path="/eapcet" element={user ? <EAPCETPage /> : <Navigate to="/" replace />} />
        <Route path="/notes-ai" element={user ? <NotesWithAIPage /> : <Navigate to="/" replace />} />
        <Route path="/account" element={user ? <AccountPage onLogout={signOut} /> : <Navigate to="/" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      {user && !isPublicRoute && (
        <>
          <BottomNavigation />
          <HomeOnlyComponents />
        </>
      )}
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
