import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Phone, BookOpen, GraduationCap } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import vrkLogo from "@/assets/vrk-logo.png";

const LoginScreen = () => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { signInWithPhone } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim() || !phone.trim()) {
      setError("Please fill in all fields");
      return;
    }

    if (!/^\d{10}$/.test(phone)) {
      setError("Please enter a valid 10-digit phone number");
      return;
    }

    setIsLoading(true);

    const { error: authError, isAdmin } = await signInWithPhone(name, phone);

    if (authError) {
      setError(authError.message);
      setIsLoading(false);
      return;
    }

    toast({
      title: isAdmin ? "Welcome, Admin!" : "Welcome!",
      description: isAdmin
        ? "You have been logged in as administrator."
        : "You have been logged in successfully.",
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
          <CardTitle className="font-display text-2xl text-gradient">Welcome Back</CardTitle>
          <CardDescription className="text-muted-foreground">
            Sign in to continue your learning journey
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">
                Full Name
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pl-10 h-12 border-vrk-200 focus:border-primary focus:ring-primary"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-sm font-medium">
                Phone Number
              </Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="phone"
                  type="tel"
                  placeholder="Enter 10-digit phone number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
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
                "Login"
              )}
            </Button>
          </form>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            By signing in, you agree to our Terms of Service and Privacy Policy
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginScreen;
