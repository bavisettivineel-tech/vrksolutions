import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Phone, BookOpen, GraduationCap, LogIn, UserPlus } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import vrkLogo from "@/assets/vrk-logo.png";

type TabType = "login" | "signup";

const LoginScreen = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>("login");

  // Login state
  const [loginName, setLoginName] = useState("");
  const [loginPhone, setLoginPhone] = useState("");

  // Signup state
  const [signupName, setSignupName] = useState("");
  const [signupPhone, setSignupPhone] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { signInWithPhone } = useAuth();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!loginName.trim() || !loginPhone.trim()) {
      setError("Please fill in all fields");
      return;
    }
    if (!/^\d{10}$/.test(loginPhone)) {
      setError("Please enter a valid 10-digit phone number");
      return;
    }

    setIsLoading(true);
    const { error: authError, isAdmin } = await signInWithPhone(loginName, loginPhone);

    if (authError) {
      setError(authError.message);
      setIsLoading(false);
      return;
    }

    toast({
      title: isAdmin ? "Welcome, Admin!" : "Welcome back!",
      description: isAdmin
        ? "You have been logged in as administrator."
        : "You have been logged in successfully.",
    });
    setIsLoading(false);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!signupName.trim() || !signupPhone.trim()) {
      setError("Please fill in all fields");
      return;
    }
    if (!/^\d{10}$/.test(signupPhone)) {
      setError("Please enter a valid 10-digit phone number");
      return;
    }

    setIsLoading(true);
    // signInWithPhone auto-creates account if not exists
    const { error: authError } = await signInWithPhone(signupName, signupPhone);

    if (authError) {
      setError(authError.message);
      setIsLoading(false);
      return;
    }

    toast({
      title: "Account Created!",
      description: "Welcome to VRK Solutions. Let's set up your profile.",
    });
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-vrk-100 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-vrk-50 rounded-full blur-3xl opacity-60 translate-y-1/2 -translate-x-1/2" />
        {/* Floating icons */}
        <BookOpen className="absolute top-20 left-10 w-8 h-8 text-vrk-200 animate-float" />
        <GraduationCap className="absolute top-40 right-20 w-10 h-10 text-vrk-300 animate-float" style={{ animationDelay: "1s" }} />
        <BookOpen className="absolute bottom-32 right-10 w-6 h-6 text-vrk-200 animate-float" style={{ animationDelay: "0.5s" }} />
      </div>

      <Card className="w-full max-w-md shadow-elevated animate-scale-in relative z-10 border-vrk-100">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-4">
            <img src={vrkLogo} alt="VRK Solutions" className="h-20 w-20 object-contain" />
          </div>
          <CardTitle className="font-display text-2xl text-gradient">VRK Solutions</CardTitle>
          <CardDescription className="text-muted-foreground">
            Your first step to educational excellence
          </CardDescription>
        </CardHeader>

        <CardContent>
          {/* Tab Switcher */}
          <div className="flex rounded-xl overflow-hidden border border-vrk-100 mb-6 p-1 bg-muted/40">
            <button
              type="button"
              onClick={() => { setActiveTab("login"); setError(""); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 ${
                activeTab === "login"
                  ? "gradient-primary text-primary-foreground shadow-card"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <LogIn className="h-4 w-4" />
              Login
            </button>
            <button
              type="button"
              onClick={() => { setActiveTab("signup"); setError(""); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 ${
                activeTab === "signup"
                  ? "gradient-primary text-primary-foreground shadow-card"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <UserPlus className="h-4 w-4" />
              Sign Up
            </button>
          </div>

          {/* Login Form */}
          {activeTab === "login" && (
            <form onSubmit={handleLogin} className="space-y-5 animate-fade-in">
              <div className="space-y-2">
                <Label htmlFor="login-name" className="text-sm font-medium">
                  Full Name
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="login-name"
                    type="text"
                    placeholder="Enter your name"
                    value={loginName}
                    onChange={(e) => setLoginName(e.target.value)}
                    className="pl-10 h-12 border-vrk-200 focus:border-primary focus:ring-primary"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="login-phone" className="text-sm font-medium">
                  Phone Number
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="login-phone"
                    type="tel"
                    placeholder="Enter 10-digit phone number"
                    value={loginPhone}
                    onChange={(e) => setLoginPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                    className="pl-10 h-12 border-vrk-200 focus:border-primary focus:ring-primary"
                  />
                </div>
              </div>

              {error && (
                <p className="text-sm text-destructive text-center animate-fade-in">{error}</p>
              )}

              <Button
                type="submit"
                className="w-full h-12 gradient-primary text-primary-foreground font-semibold text-base shadow-card hover:shadow-elevated transition-all duration-300"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    Signing in...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <LogIn className="h-4 w-4" />
                    Login
                  </div>
                )}
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                New here?{" "}
                <button
                  type="button"
                  onClick={() => { setActiveTab("signup"); setError(""); }}
                  className="text-primary font-medium hover:underline"
                >
                  Create an account
                </button>
              </p>
            </form>
          )}

          {/* Signup Form */}
          {activeTab === "signup" && (
            <form onSubmit={handleSignup} className="space-y-5 animate-fade-in">
              <div className="space-y-2">
                <Label htmlFor="signup-name" className="text-sm font-medium">
                  Full Name
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="signup-name"
                    type="text"
                    placeholder="Enter your full name"
                    value={signupName}
                    onChange={(e) => setSignupName(e.target.value)}
                    className="pl-10 h-12 border-vrk-200 focus:border-primary focus:ring-primary"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-phone" className="text-sm font-medium">
                  Phone Number
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="signup-phone"
                    type="tel"
                    placeholder="Enter 10-digit phone number"
                    value={signupPhone}
                    onChange={(e) => setSignupPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                    className="pl-10 h-12 border-vrk-200 focus:border-primary focus:ring-primary"
                  />
                </div>
              </div>

              {error && (
                <p className="text-sm text-destructive text-center animate-fade-in">{error}</p>
              )}

              <Button
                type="submit"
                className="w-full h-12 gradient-primary text-primary-foreground font-semibold text-base shadow-card hover:shadow-elevated transition-all duration-300"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    Creating account...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <UserPlus className="h-4 w-4" />
                    Create Account
                  </div>
                )}
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => { setActiveTab("login"); setError(""); }}
                  className="text-primary font-medium hover:underline"
                >
                  Login
                </button>
              </p>
            </form>
          )}

          <div className="mt-6 space-y-2 text-center text-xs text-muted-foreground">
            <p>
              By continuing, you agree to our Terms of Service and{" "}
              <button
                type="button"
                onClick={() => navigate("/privacy-policy")}
                className="text-primary hover:underline font-medium focus:outline-none"
              >
                Privacy Policy
              </button>
            </p>
            <p className="pt-1">
              Need to delete your account?{" "}
              <button
                type="button"
                onClick={() => navigate("/delete-account")}
                className="text-destructive hover:underline font-semibold focus:outline-none"
              >
                Submit Deletion Request
              </button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginScreen;
