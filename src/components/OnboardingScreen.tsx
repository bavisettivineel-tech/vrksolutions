import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { GraduationCap, BookOpen, Laptop, FileText, ArrowRight, ArrowLeft, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import vrkLogo from "@/assets/vrk-logo.png";

type Standard = "10th" | "intermediate" | "diploma" | "btech";
type Group = "MPC" | "BiPC" | "CME";

// ── semester/year options per standard ──────────────────────────────────────
const YEAR_OPTIONS: Record<Standard, string[]> = {
  "10th": [],                                                     // no selection
  "intermediate": ["1st Year", "2nd Year"],
  "diploma": ["1-1", "2-1", "2-2", "3-1", "3-2"],
  "btech": ["1-1", "1-2", "2-1", "2-2", "3-1", "3-2", "4-1", "4-2"],
};

// ── group options per standard ───────────────────────────────────────────────
const GROUP_OPTIONS: Record<Standard, Group[]> = {
  "10th": [],
  "intermediate": ["MPC", "BiPC"],
  "diploma": ["CME"],
  "btech": ["CME"],
};

const STANDARDS = [
  { key: "10th" as Standard,         label: "10th Grade",     subtitle: "AP State Board",          icon: BookOpen,      color: "from-blue-500 to-blue-600" },
  { key: "intermediate" as Standard, label: "Intermediate",   subtitle: "1st & 2nd Year",           icon: GraduationCap, color: "from-purple-500 to-purple-600" },
  { key: "diploma" as Standard,      label: "Diploma",        subtitle: "AP SBTET – CME Branch",   icon: FileText,      color: "from-green-500 to-green-600" },
  { key: "btech" as Standard,        label: "B-Tech",         subtitle: "Engineering – CME Branch", icon: Laptop,        color: "from-orange-500 to-orange-600" },
];

const GROUP_META: Record<Group, { label: string; subtitle: string; color: string }> = {
  MPC:  { label: "MPC",  subtitle: "Maths, Physics, Chemistry",  color: "from-sky-500 to-sky-600" },
  BiPC: { label: "BiPC", subtitle: "Biology, Physics, Chemistry", color: "from-emerald-500 to-emerald-600" },
  CME:  { label: "CME",  subtitle: "Computer & Mechanical Engg.", color: "from-violet-500 to-violet-600" },
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


interface OnboardingScreenProps {
  onComplete: () => void;
}

const OnboardingScreen = ({ onComplete }: OnboardingScreenProps) => {
  const { updateAcademicProfile, profile } = useAuth();
  const { toast } = useToast();

  // Steps: 1 = standard, 2 = group (if needed), 3 = year/semester (if needed)
  const [step, setStep] = useState(1);
  const [selectedStandard, setSelectedStandard] = useState<Standard | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [selectedYear, setSelectedYear] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const totalSteps = (() => {
    if (!selectedStandard) return 3;
    if (selectedStandard === "10th") return 1;
    return 3;
  })();

  const progressPercent = (step / totalSteps) * 100;

  // ── handle final save ──────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!selectedStandard) return;
    setIsSaving(true);

    const { error } = await updateAcademicProfile({
      standard: selectedStandard,
      academic_group: selectedGroup,
      year_or_semester: selectedYear,
      onboarding_complete: true,
    });

    setIsSaving(false);

    if (error) {
      toast({ title: "Error", description: "Failed to save. Please try again.", variant: "destructive" });
      return;
    }

    toast({ title: "Profile Set Up!", description: "Your subjects are now personalised for you." });
    onComplete();
  };

  // ── advance from step 1 ────────────────────────────────────────────────────
  const handleStandardNext = () => {
    if (!selectedStandard) return;
    if (selectedStandard === "10th") {
      // No further steps
      handleSave();
    } else {
      setSelectedGroup(null);
      setSelectedYear(null);
      // Auto-select CME for diploma/btech
      if (GROUP_OPTIONS[selectedStandard].length === 1) {
        setSelectedGroup(GROUP_OPTIONS[selectedStandard][0]);
      }
      setStep(2);
    }
  };

  // ── advance from step 2 ────────────────────────────────────────────────────
  const handleGroupNext = () => {
    setSelectedYear(null);
    setStep(3);
  };

  // ── advance from step 3 ────────────────────────────────────────────────────
  const handleYearNext = () => {
    handleSave();
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background relative overflow-hidden">
      {/* Ambient glows */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-vrk-100 rounded-full blur-3xl opacity-40 -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-vrk-50 rounded-full blur-3xl opacity-50 translate-y-1/2 -translate-x-1/2" />
      </div>

      <Card className="w-full max-w-lg shadow-elevated animate-scale-in relative z-10 border-vrk-100">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto mb-3">
            <img src={vrkLogo} alt="VRK Solutions" className="h-14 w-14 object-contain" />
          </div>
          <CardTitle className="font-display text-xl text-gradient">
            Welcome, {profile?.name?.split(" ")[0] || "Student"}! 🎉
          </CardTitle>
          <CardDescription>
            Let's personalise your learning experience
          </CardDescription>

          {/* Progress bar */}
          <div className="mt-4 h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full gradient-primary rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-1.5">
            Step {step} of {totalSteps}
          </p>
        </CardHeader>

        <CardContent className="space-y-4">

          {/* ── STEP 1: Select Standard ──────────────────────────────────── */}
          {step === 1 && (
            <div className="animate-fade-in space-y-4">
              <h3 className="font-display font-semibold text-lg text-center">
                What are you currently studying?
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {STANDARDS.map((s) => {
                  const Icon = s.icon;
                  const isSelected = selectedStandard === s.key;
                  return (
                    <button
                      key={s.key}
                      type="button"
                      onClick={() => setSelectedStandard(s.key)}
                      className={`relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200 text-left group
                        ${isSelected
                          ? "border-primary bg-primary/5 shadow-card scale-[1.02]"
                          : "border-border hover:border-vrk-300 hover:bg-vrk-50/50"
                        }`}
                    >
                      <div className={`p-3 rounded-xl bg-gradient-to-br ${s.color} shadow-sm`}>
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <div className="text-center">
                        <p className="font-semibold text-sm">{s.label}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{s.subtitle}</p>
                      </div>
                      {isSelected && (
                        <CheckCircle2 className="absolute top-2 right-2 h-4 w-4 text-primary" />
                      )}
                    </button>
                  );
                })}
              </div>
              <Button
                className="w-full h-12 gradient-primary text-primary-foreground font-semibold"
                disabled={!selectedStandard || isSaving}
                onClick={handleStandardNext}
              >
                {isSaving ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    Saving...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    {selectedStandard === "10th" ? "Finish Setup" : "Next"}
                    <ArrowRight className="h-4 w-4" />
                  </div>
                )}
              </Button>
            </div>
          )}

          {/* ── STEP 2: Select Group ─────────────────────────────────────── */}
          {step === 2 && selectedStandard && (
            <div className="animate-fade-in space-y-4">
              <h3 className="font-display font-semibold text-lg text-center">
                {selectedStandard === "intermediate"
                  ? "Choose your stream / group"
                  : "Your branch is CME"}
              </h3>
              <div className="grid grid-cols-1 gap-3">
                {GROUP_OPTIONS[selectedStandard].map((g) => {
                  const meta = GROUP_META[g];
                  const isSelected = selectedGroup === g;
                  return (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setSelectedGroup(g)}
                      className={`relative flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-200
                        ${isSelected
                          ? "border-primary bg-primary/5 shadow-card"
                          : "border-border hover:border-vrk-300 hover:bg-vrk-50/50"
                        }`}
                    >
                      <div className={`p-3 rounded-xl bg-gradient-to-br ${meta.color} shadow-sm`}>
                        <BookOpen className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1 text-left">
                        <p className="font-semibold">{meta.label}</p>
                        <p className="text-sm text-muted-foreground">{meta.subtitle}</p>
                      </div>
                      {isSelected && (
                        <CheckCircle2 className="h-5 w-5 text-primary" />
                      )}
                    </button>
                  );
                })}
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1 h-12"
                  onClick={() => setStep(1)}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
                <Button
                  className="flex-1 h-12 gradient-primary text-primary-foreground font-semibold"
                  disabled={!selectedGroup}
                  onClick={handleGroupNext}
                >
                  Next
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {/* ── STEP 3: Select Year / Semester ───────────────────────────── */}
          {step === 3 && selectedStandard && (
            <div className="animate-fade-in space-y-4">
              <h3 className="font-display font-semibold text-lg text-center">
                {selectedStandard === "intermediate"
                  ? "Which year are you in?"
                  : "Which semester are you in?"}
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {YEAR_OPTIONS[selectedStandard].map((y) => {
                  const isSelected = selectedYear === y;
                  return (
                    <button
                      key={y}
                      type="button"
                      onClick={() => setSelectedYear(y)}
                      className={`relative flex flex-col items-center justify-center gap-1 p-4 rounded-xl border-2 transition-all duration-200
                        ${isSelected
                          ? "border-primary bg-primary/5 shadow-card scale-[1.02]"
                          : "border-border hover:border-vrk-300 hover:bg-vrk-50/50"
                        }`}
                    >
                      <p className="font-bold text-lg">{formatYearOrSemester(y, selectedStandard)}</p>
                      {selectedStandard !== "intermediate" && !formatYearOrSemester(y, selectedStandard).includes("Year") && (
                        <p className="text-xs text-muted-foreground">Semester</p>
                      )}
                      {isSelected && (
                        <CheckCircle2 className="absolute top-2 right-2 h-4 w-4 text-primary" />
                      )}
                    </button>
                  );
                })}
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1 h-12"
                  onClick={() => setStep(2)}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
                <Button
                  className="flex-1 h-12 gradient-primary text-primary-foreground font-semibold"
                  disabled={!selectedYear || isSaving}
                  onClick={handleYearNext}
                >
                  {isSaving ? (
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                      Saving...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      Finish Setup
                      <CheckCircle2 className="h-4 w-4" />
                    </div>
                  )}
                </Button>
              </div>
            </div>
          )}

        </CardContent>
      </Card>
    </div>
  );
};

export default OnboardingScreen;
