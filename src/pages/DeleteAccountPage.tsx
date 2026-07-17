import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Trash2, ShieldAlert, CheckSquare, Loader2, Sparkles, Send, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import vrkLogo from "@/assets/vrk-logo.png";

const DeleteAccountPage = () => {
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();
  const { toast } = useToast();

  // State for Authenticated deletion
  const [isChecked, setIsChecked] = useState(false);
  const [confirmPhone, setConfirmPhone] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  // State for Unauthenticated offline request
  const [requestName, setRequestName] = useState("");
  const [requestPhone, setRequestPhone] = useState("");
  const [requestReason, setRequestReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const userPhone = profile?.phone || "";
  const userName = profile?.name || "";

  // Authenticated direct deletion
  const handleDeleteAccount = async () => {
    if (!user) return;
    if (confirmPhone !== userPhone) {
      toast({
        title: "Validation Error",
        description: "The phone number entered does not match your registered phone number.",
        variant: "destructive",
      });
      return;
    }
    if (!isChecked) {
      toast({
        title: "Confirmation Required",
        description: "Please check the box to confirm you understand the consequences.",
        variant: "destructive",
      });
      return;
    }

    setIsDeleting(true);
    try {
      // Call the security definer RPC
      const { data, error } = await supabase.rpc("delete_user_account");

      if (error) throw error;

      if (data) {
        // Sign out on client side
        await signOut();
        toast({
          title: "Account Permanently Deleted",
          description: "Your account and all associated data have been permanently removed.",
        });
        navigate("/");
      } else {
        throw new Error("Unable to complete deletion.");
      }
    } catch (err: any) {
      console.error("Error deleting account:", err);
      toast({
        title: "Deletion Failed",
        description: err.message || "An error occurred. Please try again or contact support.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Unauthenticated manual request submission
  const handleRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestName.trim() || !requestPhone.trim()) {
      toast({
        title: "Required Fields",
        description: "Please enter your name and phone number.",
        variant: "destructive",
      });
      return;
    }
    if (!/^\d{10}$/.test(requestPhone)) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid 10-digit phone number.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("deletion_requests").insert({
        name: requestName,
        phone: requestPhone,
        reason: requestReason || null,
        status: "pending",
      });

      if (error) throw error;

      setIsSubmitted(true);
      toast({
        title: "Request Submitted",
        description: "Your account deletion request has been recorded successfully.",
      });
    } catch (err: any) {
      console.error("Error submitting deletion request:", err);
      toast({
        title: "Submission Failed",
        description: err.message || "Failed to submit request. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-12 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-destructive/5 rounded-full blur-3xl opacity-60 -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-primary/5 rounded-full blur-3xl opacity-50 translate-y-1/2 -translate-x-1/2" />
      </div>

      {/* Navigation Header */}
      <header className="sticky top-0 z-40 w-full border-b border-border bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 hover:bg-muted"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </Button>
          <div className="flex items-center gap-2">
            <img src={vrkLogo} alt="VRK Solutions Logo" className="h-8 w-8 object-contain" />
            <span className="font-display font-bold text-sm tracking-wide text-gradient">VRK SOLUTIONS</span>
          </div>
          <div className="w-16" />
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 flex justify-center items-center z-10 relative">
        <div className="w-full max-w-lg">
          
          {user ? (
            /* Logged In Instant Deletion Card */
            <Card className="border-destructive/30 shadow-card animate-scale-in bg-card overflow-hidden">
              <div className="h-2 bg-destructive" />
              <CardHeader className="text-center pb-4">
                <div className="mx-auto p-3 bg-destructive/10 text-destructive rounded-full w-fit mb-3">
                  <ShieldAlert className="h-10 w-10 animate-pulse" />
                </div>
                <CardTitle className="font-display text-2xl text-destructive">Delete Account</CardTitle>
                <CardDescription>
                  Permanently delete your profile and all associate data
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                <div className="p-4 rounded-xl bg-destructive/5 border border-destructive/20 text-xs text-muted-foreground space-y-2">
                  <h3 className="font-semibold text-destructive flex items-center gap-1.5 text-sm">
                    <Trash2 className="h-4 w-4" />
                    Warning: Irreversible Action
                  </h3>
                  <p>
                    You are signed in as <strong className="text-foreground">{userName}</strong> with registered phone number <strong className="text-foreground">{userPhone}</strong>.
                  </p>
                  <p className="font-medium text-foreground pt-1">
                    Once deleted, you will lose access immediately and we will permanently erase:
                  </p>
                  <ul className="list-disc ml-5 space-y-1 mt-1">
                    <li>Your student profile details and login credentials.</li>
                    <li>Saved study PDFs and weightage preferences.</li>
                    <li>AI Notes history and chats.</li>
                    <li>Support questions and notification logs.</li>
                    <li>Active push subscriptions.</li>
                  </ul>
                </div>

                <div className="space-y-4">
                  {/* Irreversible Confirmation Checkbox */}
                  <button
                    onClick={() => setIsChecked(!isChecked)}
                    className="flex items-start gap-3 text-left w-full p-3 rounded-xl border border-border hover:bg-muted/50 transition-colors"
                  >
                    <div className="mt-0.5">
                      <div className={`h-5 w-5 rounded border flex items-center justify-center transition-colors ${
                        isChecked ? "bg-destructive border-destructive text-destructive-foreground" : "border-muted-foreground"
                      }`}>
                        {isChecked && <CheckSquare className="h-4 w-4" />}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-foreground">Confirm permanent erasure</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        I understand that my account cannot be recovered and I want to delete all my data permanently.
                      </p>
                    </div>
                  </button>

                  {/* Verification Phone Number Input */}
                  <div className="space-y-2">
                    <Label htmlFor="phone-verify" className="text-xs font-semibold">
                      Confirm registered phone number:
                    </Label>
                    <Input
                      id="phone-verify"
                      type="tel"
                      placeholder={`Type "${userPhone}" to confirm`}
                      value={confirmPhone}
                      onChange={(e) => setConfirmPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                      className="h-11 border-border focus:border-destructive focus:ring-destructive"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <Button
                    variant="outline"
                    className="flex-1 h-11 border-border"
                    onClick={() => navigate(-1)}
                    disabled={isDeleting}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="flex-1 h-11 bg-destructive text-destructive-foreground hover:bg-destructive/90 font-semibold"
                    disabled={!isChecked || confirmPhone !== userPhone || isDeleting}
                    onClick={handleDeleteAccount}
                  >
                    {isDeleting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      "Delete My Account"
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            /* Unauthenticated Tabbed Form Card */
            <Card className="border-vrk-100 shadow-card animate-scale-in bg-card overflow-hidden">
              <Tabs defaultValue="login" className="w-full">
                <TabsList className="grid grid-cols-2 rounded-none h-14 bg-muted/30 border-b border-border">
                  <TabsTrigger value="login" className="font-display font-medium text-xs data-[state=active]:bg-background data-[state=active]:text-primary border-r border-border">
                    <Lock className="h-3.5 w-3.5 mr-1.5" />
                    Sign In to Delete
                  </TabsTrigger>
                  <TabsTrigger value="offline" className="font-display font-medium text-xs data-[state=active]:bg-background data-[state=active]:text-primary">
                    <Send className="h-3.5 w-3.5 mr-1.5" />
                    Submit Web Request
                  </TabsTrigger>
                </TabsList>

                {/* Tab 1: Direct Login instructions */}
                <TabsContent value="login" className="p-6 md:p-8 space-y-6 focus-visible:ring-0 focus-visible:ring-offset-0">
                  <div className="text-center space-y-2">
                    <div className="mx-auto p-3 bg-primary/10 text-primary rounded-full w-fit mb-2">
                      <Sparkles className="h-8 w-8 animate-float" />
                    </div>
                    <h3 className="font-display font-bold text-lg">Instant Self-Serve Deletion</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      For security and to ensure instant processing, we recommend logging in to verify ownership. Logged-in deletions are performed securely in real time.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-muted/40 border border-border text-xs text-muted-foreground space-y-2">
                    <h4 className="font-semibold text-foreground">How it works:</h4>
                    <ol className="list-decimal ml-4 space-y-1">
                      <li>Log in using your registered phone number.</li>
                      <li>Navigate to Account Settings or this deletion page.</li>
                      <li>Verify your account details and delete immediately.</li>
                    </ol>
                  </div>

                  <Button
                    onClick={() => navigate("/")}
                    className="w-full h-12 gradient-primary text-primary-foreground font-semibold"
                  >
                    Go to Login Page
                  </Button>
                </TabsContent>

                {/* Tab 2: Manual Web Deletion Request */}
                <TabsContent value="offline" className="p-6 md:p-8 focus-visible:ring-0 focus-visible:ring-offset-0">
                  {isSubmitted ? (
                    <div className="text-center py-6 space-y-4 animate-fade-in">
                      <div className="mx-auto p-3 bg-green-500/10 text-green-500 rounded-full w-fit">
                        <CheckSquare className="h-10 w-10 animate-bounce" />
                      </div>
                      <h3 className="font-display font-bold text-lg">Request Received</h3>
                      <p className="text-xs text-muted-foreground leading-relaxed max-w-xs mx-auto">
                        Your account deletion request has been successfully submitted. For security, our support team will contact you on the registered phone number within 48 hours to verify identity and complete the deletion.
                      </p>
                      <Button
                        variant="outline"
                        onClick={() => navigate("/")}
                        className="h-10 border-border"
                      >
                        Back to Home
                      </Button>
                    </div>
                  ) : (
                    <form onSubmit={handleRequestSubmit} className="space-y-4">
                      <div className="space-y-1 text-center mb-2">
                        <h3 className="font-display font-bold text-lg">Submit Deletion Request</h3>
                        <p className="text-xs text-muted-foreground">
                          Cannot access your account? Submit a request and support will contact you.
                        </p>
                      </div>

                      <div className="space-y-3">
                        <div className="space-y-1.5">
                          <Label htmlFor="request-name" className="text-xs font-semibold">
                            Full Name
                          </Label>
                          <Input
                            id="request-name"
                            type="text"
                            placeholder="Enter your registered name"
                            value={requestName}
                            onChange={(e) => setRequestName(e.target.value)}
                            className="h-10 border-border focus:border-primary focus:ring-primary"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <Label htmlFor="request-phone" className="text-xs font-semibold">
                            Registered Phone Number
                          </Label>
                          <Input
                            id="request-phone"
                            type="tel"
                            placeholder="Enter 10-digit phone number"
                            value={requestPhone}
                            onChange={(e) => setRequestPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                            className="h-10 border-border focus:border-primary focus:ring-primary"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <Label htmlFor="request-reason" className="text-xs font-semibold">
                            Reason for deletion (Optional)
                          </Label>
                          <Textarea
                            id="request-reason"
                            placeholder="Please let us know why you would like to delete your account"
                            value={requestReason}
                            onChange={(e) => setRequestReason(e.target.value)}
                            className="min-h-[80px] border-border focus:border-primary focus:ring-primary text-xs"
                          />
                        </div>
                      </div>

                      <Button
                        type="submit"
                        className="w-full h-11 gradient-primary text-primary-foreground font-semibold mt-2"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Submitting...
                          </>
                        ) : (
                          "Submit Deletion Request"
                        )}
                      </Button>
                    </form>
                  )}
                </TabsContent>
              </Tabs>
            </Card>
          )}

        </div>
      </main>
    </div>
  );
};

export default DeleteAccountPage;
