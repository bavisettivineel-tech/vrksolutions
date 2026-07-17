import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  User, Phone, LogOut, ChevronRight, HelpCircle, Shield,
  Bell, Trash2, GraduationCap, BookOpen, Pencil, X,
  CheckCircle2, ArrowRight, ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import vrkLogo from "@/assets/vrk-logo.png";

interface AccountPageProps {
  onLogout: () => void;
}

// ── Academic config (mirrors OnboardingScreen) ───────────────────────────────
type Standard = "10th" | "intermediate" | "diploma" | "btech";
type Group = "MPC" | "BiPC" | "CME";

const STANDARDS_META = [
  { key: "10th" as Standard, label: "10th Grade", subtitle: "AP State Board" },
  { key: "intermediate" as Standard, label: "Intermediate", subtitle: "1st & 2nd Year" },
  { key: "diploma" as Standard, label: "Diploma", subtitle: "AP SBTET – CME Branch" },
  { key: "btech" as Standard, label: "B-Tech", subtitle: "Engineering – CME Branch" },
];

const GROUP_OPTIONS: Record<Standard, Group[]> = {
  "10th": [],
  "intermediate": ["MPC", "BiPC"],
  "diploma": ["CME"],
  "btech": ["CME"],
};

const YEAR_OPTIONS: Record<Standard, string[]> = {
  "10th": [],
  "intermediate": ["1st Year", "2nd Year"],
  "diploma": ["1-1", "2-1", "2-2", "3-1", "3-2"],
  "btech": ["1-1", "1-2", "2-1", "2-2", "3-1", "3-2", "4-1", "4-2"],
};

const STANDARD_LABELS: Record<string, string> = {
  "10th": "10th Grade",
  "intermediate": "Intermediate",
  "diploma": "Diploma",
  "btech": "B-Tech",
};

const formatYearOrSemester = (val: string, standard: string) => {
  if (standard === "diploma" && val === "1-1") {
    return "1st Year";
  }
  if (val.includes("-")) {
    const [yr, sem] = val.split("-");
    return `Year ${yr} – Sem ${sem}`;
  }
  return val;
};


// ── Edit Academic Modal ───────────────────────────────────────────────────────
const EditAcademicModal = ({
  open,
  onClose,
  onSaved,
  currentStandard,
  currentGroup,
  currentYear,
}: {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  currentStandard: string | null;
  currentGroup: string | null;
  currentYear: string | null;
}) => {
  const { updateAcademicProfile } = useAuth();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [selectedStandard, setSelectedStandard] = useState<Standard | null>(
    (currentStandard as Standard) || null
  );
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(
    (currentGroup as Group) || null
  );
  const [selectedYear, setSelectedYear] = useState<string | null>(currentYear);
  const [isSaving, setIsSaving] = useState(false);

  if (!open) return null;

  const handleStandardNext = () => {
    if (!selectedStandard) return;
    if (selectedStandard === "10th") {
      handleSave(selectedStandard, null, null);
    } else {
      if (GROUP_OPTIONS[selectedStandard].length === 1) {
        setSelectedGroup(GROUP_OPTIONS[selectedStandard][0]);
      } else {
        setSelectedGroup(null);
      }
      setSelectedYear(null);
      setStep(2);
    }
  };

  const handleGroupNext = () => {
    setSelectedYear(null);
    setStep(3);
  };

  const handleSave = async (std?: Standard, grp?: Group | null, yr?: string | null) => {
    const finalStd = std ?? selectedStandard;
    if (!finalStd) return;
    setIsSaving(true);
    const { error } = await updateAcademicProfile({
      standard: finalStd,
      academic_group: grp !== undefined ? grp : selectedGroup,
      year_or_semester: yr !== undefined ? yr : selectedYear,
      onboarding_complete: true,
    });
    setIsSaving(false);
    if (error) {
      toast({ title: "Error", description: "Failed to update. Please try again.", variant: "destructive" });
      return;
    }
    toast({ title: "Updated!", description: "Your academic details have been updated." });
    onSaved();
    onClose();
    setStep(1);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <Card className="w-full max-w-md shadow-elevated border-vrk-100 animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg gradient-primary">
              <GraduationCap className="h-4 w-4 text-primary-foreground" />
            </div>
            <h2 className="font-display font-semibold text-lg">Edit Academic Details</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-muted transition-colors">
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Progress */}
          <div className="flex gap-1.5">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`flex-1 h-1.5 rounded-full transition-all duration-300 ${
                  s <= step ? "gradient-primary bg-primary" : "bg-muted"
                }`}
              />
            ))}
          </div>

          {/* Step 1: Standard */}
          {step === 1 && (
            <div className="space-y-3 animate-fade-in">
              <p className="font-medium text-sm text-center text-muted-foreground">Select your standard</p>
              <div className="grid grid-cols-2 gap-2">
                {STANDARDS_META.map((s) => {
                  const isSelected = selectedStandard === s.key;
                  return (
                    <button
                      key={s.key}
                      type="button"
                      onClick={() => setSelectedStandard(s.key)}
                      className={`relative flex flex-col items-start gap-1 p-3 rounded-xl border-2 transition-all duration-200 text-left
                        ${isSelected ? "border-primary bg-primary/5 shadow-card" : "border-border hover:border-vrk-300 hover:bg-vrk-50/50"}`}
                    >
                      <p className="font-semibold text-sm">{s.label}</p>
                      <p className="text-xs text-muted-foreground">{s.subtitle}</p>
                      {isSelected && <CheckCircle2 className="absolute top-2 right-2 h-4 w-4 text-primary" />}
                    </button>
                  );
                })}
              </div>
              <Button
                className="w-full gradient-primary text-primary-foreground"
                disabled={!selectedStandard || isSaving}
                onClick={handleStandardNext}
              >
                {selectedStandard === "10th" && isSaving ? (
                  <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>{selectedStandard === "10th" ? "Save" : "Next"} <ArrowRight className="h-4 w-4 ml-2" /></>
                )}
              </Button>
            </div>
          )}

          {/* Step 2: Group */}
          {step === 2 && selectedStandard && (
            <div className="space-y-3 animate-fade-in">
              <p className="font-medium text-sm text-center text-muted-foreground">
                {selectedStandard === "intermediate" ? "Select your group" : "Your branch is CME"}
              </p>
              <div className="space-y-2">
                {GROUP_OPTIONS[selectedStandard].map((g) => {
                  const isSelected = selectedGroup === g;
                  return (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setSelectedGroup(g)}
                      className={`relative w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all duration-200
                        ${isSelected ? "border-primary bg-primary/5 shadow-card" : "border-border hover:border-vrk-300"}`}
                    >
                      <div className="p-2 rounded-lg gradient-soft">
                        <BookOpen className="h-4 w-4 text-primary" />
                      </div>
                      <span className="font-semibold">{g}</span>
                      {isSelected && <CheckCircle2 className="ml-auto h-4 w-4 text-primary" />}
                    </button>
                  );
                })}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => setStep(1)}>
                  <ArrowLeft className="h-4 w-4 mr-1" /> Back
                </Button>
                <Button
                  className="flex-1 gradient-primary text-primary-foreground"
                  disabled={!selectedGroup}
                  onClick={handleGroupNext}
                >
                  Next <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Year/Semester */}
          {step === 3 && selectedStandard && (
            <div className="space-y-3 animate-fade-in">
              <p className="font-medium text-sm text-center text-muted-foreground">
                {selectedStandard === "intermediate" ? "Select your year" : "Select your semester"}
              </p>
              <div className="grid grid-cols-2 gap-2">
                {YEAR_OPTIONS[selectedStandard].map((y) => {
                  const isSelected = selectedYear === y;
                  return (
                    <button
                      key={y}
                      type="button"
                      onClick={() => setSelectedYear(y)}
                      className={`relative flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all duration-200
                        ${isSelected ? "border-primary bg-primary/5 shadow-card" : "border-border hover:border-vrk-300"}`}
                    >
                      <p className="font-bold text-center">
                        {formatYearOrSemester(y, selectedStandard)}
                      </p>
                      {selectedStandard !== "intermediate" && !formatYearOrSemester(y, selectedStandard).includes("Year") && (
                        <p className="text-xs text-muted-foreground mt-0.5">Semester</p>
                      )}
                      {isSelected && <CheckCircle2 className="absolute top-1.5 right-1.5 h-3.5 w-3.5 text-primary" />}
                    </button>
                  );
                })}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => setStep(2)}>
                  <ArrowLeft className="h-4 w-4 mr-1" /> Back
                </Button>
                <Button
                  className="flex-1 gradient-primary text-primary-foreground"
                  disabled={!selectedYear || isSaving}
                  onClick={() => handleSave()}
                >
                  {isSaving ? (
                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>Save Changes <CheckCircle2 className="h-4 w-4 ml-1" /></>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

// ── Main Account Page ──────────────────────────────────────────────────────────
const AccountPage = ({ onLogout }: AccountPageProps) => {
  const navigate = useNavigate();
  const { profile, user, refreshProfile } = useAuth();

  const [showEditAcademic, setShowEditAcademic] = useState(false);

  const menuItems = [
    { icon: Pencil, label: "Edit Academic Details", onClick: () => setShowEditAcademic(true) },
    { icon: Bell, label: "Notifications", onClick: () => {} },
    { icon: HelpCircle, label: "Help & Support", onClick: () => {} },
    { icon: Shield, label: "Privacy Policy", onClick: () => navigate("/privacy-policy") },
    { icon: Trash2, label: "Delete Account", onClick: () => navigate("/delete-account"), destructive: true },
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

        {/* Academic Details Card */}
        {profile?.standard && (
          <Card className="p-5 shadow-card border-vrk-100 animate-slide-up">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg gradient-primary">
                  <GraduationCap className="h-4 w-4 text-primary-foreground" />
                </div>
                <h3 className="font-display font-semibold">Academic Details</h3>
              </div>
              <button
                onClick={() => setShowEditAcademic(true)}
                className="flex items-center gap-1.5 text-sm text-primary font-medium hover:underline"
              >
                <Pencil className="h-3.5 w-3.5" />
                Edit
              </button>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-muted/50 text-center">
                <p className="text-xs text-muted-foreground mb-1">Standard</p>
                <p className="font-semibold text-sm">{STANDARD_LABELS[profile.standard] || profile.standard}</p>
              </div>
              {profile.academic_group && (
                <div className="p-3 rounded-xl bg-muted/50 text-center">
                  <p className="text-xs text-muted-foreground mb-1">Group / Branch</p>
                  <p className="font-semibold text-sm">{profile.academic_group}</p>
                </div>
              )}
              {profile.year_or_semester && (
                <div className="p-3 rounded-xl bg-muted/50 text-center">
                  <p className="text-xs text-muted-foreground mb-1">
                    {profile.standard === "intermediate" || (profile.standard === "diploma" && profile.year_or_semester === "1-1") ? "Year" : "Semester"}
                  </p>
                  <p className="font-semibold text-sm">
                    {formatYearOrSemester(profile.year_or_semester, profile.standard)}
                  </p>
                </div>
              )}
            </div>
          </Card>
        )}

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
      </main>

      {/* Edit Academic Modal */}
      <EditAcademicModal
        open={showEditAcademic}
        onClose={() => setShowEditAcademic(false)}
        onSaved={() => refreshProfile()}
        currentStandard={profile?.standard ?? null}
        currentGroup={profile?.academic_group ?? null}
        currentYear={profile?.year_or_semester ?? null}
      />
    </div>
  );
};

export default AccountPage;
