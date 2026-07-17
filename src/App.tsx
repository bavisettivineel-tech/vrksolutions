import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import SplashScreen from "@/components/SplashScreen";
import LoginScreen from "@/components/LoginScreen";
import OnboardingScreen from "@/components/OnboardingScreen";
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
  const { user, profile, isAdmin, isLoading, signOut, refreshProfile } = useAuth();
  const location = useLocation();

  const isPublicRoute = ["/privacy-policy", "/delete-account"].includes(location.pathname);

  // Show splash screen initially
  useEffect(() => {
    if (!isLoading && user) {
      setShowSplash(false);
    }
  }, [isLoading, user]);

  // Show loading while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Show public routes if user is not authenticated and is visiting them
  if (!user) {
    if (isPublicRoute) {
      return (
        <Routes>
          <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
          <Route path="/delete-account" element={<DeleteAccountPage />} />
          <Route path="*" element={<Navigate to="/privacy-policy" replace />} />
        </Routes>
      );
    }
    // Show splash screen
    if (showSplash) {
      return <SplashScreen onComplete={() => setShowSplash(false)} />;
    }
    return <LoginScreen />;
  }

  // Show loading while profile is being fetched
  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // If NOT admin and onboarding not complete → show onboarding
  if (!isAdmin && !profile.onboarding_complete) {
    return (
      <OnboardingScreen
        onComplete={() => refreshProfile()}
      />
    );
  }

  const userName = profile?.name || "Student";

  // Both admin and student views inherit Router context
  return (
    <>
      {isAdmin ? (
        <AdminPanel onLogout={signOut} />
      ) : (
        <>
          <TopNavigation userName={userName} onLogout={signOut} />
          <Routes>
            <Route path="/" element={<StudentHome userName={userName} />} />
            <Route path="/categories" element={<CategoriesPage />} />
            <Route path="/category/:categoryId" element={<CategoryDetailPage />} />
            <Route path="/saved-pdfs" element={<SavedPDFsPage />} />
            <Route path="/eapcet" element={<EAPCETPage />} />
            <Route path="/notes-ai" element={<NotesWithAIPage />} />
            <Route path="/account" element={<AccountPage onLogout={signOut} />} />
            <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
            <Route path="/delete-account" element={<DeleteAccountPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
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
