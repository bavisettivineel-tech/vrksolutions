import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  BookOpen, GraduationCap, FileText, Laptop, Target,
  BookmarkCheck, ChevronRight, Layers,
} from "lucide-react";
import CategoryCard from "@/components/CategoryCard";
import AdvertisementSlider from "@/components/AdvertisementSlider";
import ContentSearch from "@/components/ContentSearch";
import { useOfflinePDFs } from "@/hooks/useOfflinePDFs";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import vrkLogo from "@/assets/vrk-logo.png";

interface StudentHomeProps {
  userName: string;
}

interface Advertisement {
  id: string;
  type: "image" | "video";
  url: string;
  link?: string;
  title?: string;
}

interface Subject {
  id: string;
  name: string;
  description: string | null;
  category_id: string;
  categorySlug?: string;
}

// Standards that use exact semester-column filtering in the subjects table
const SEMESTER_FILTERED_STANDARDS = new Set(["diploma", "btech"]);

// Intermediate group keyword filters (no semester column for intermediate)
const INTERMEDIATE_KEYWORDS: Record<string, string[]> = {
  MPC:  ["math", "maths", "physics", "chemistry", "english"],
  BiPC: ["biology", "botany", "zoology", "physics", "chemistry", "english"],
};

// Map standard slug to categories.slug in DB
const STANDARD_TO_SLUG: Record<string, string> = {
  "10th": "10th",
  "intermediate": "intermediate",
  "diploma": "diploma",
  "btech": "btech",
};

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  "10th": BookOpen,
  "intermediate": GraduationCap,
  "diploma": FileText,
  "btech": Laptop,
  "eapcet": Target,
};

const StudentHome = ({ userName }: StudentHomeProps) => {
  const navigate = useNavigate();
  const { savedPDFs } = useOfflinePDFs();
  const { profile } = useAuth();

  const [advertisements, setAdvertisements] = useState<Advertisement[]>([]);
  const [mySubjects, setMySubjects] = useState<Subject[]>([]);
  const [categoryPath, setCategoryPath] = useState<string>("/categories");
  const [isLoadingSubjects, setIsLoadingSubjects] = useState(false);

  // ── Fetch advertisements ────────────────────────────────────────────────
  useEffect(() => {
    const fetchAdvertisements = async () => {
      const { data, error } = await supabase
        .from("advertisements")
        .select("*")
        .eq("is_active", true)
        .order("sort_order");

      if (data && !error) {
        const formattedAds: Advertisement[] = data.map((ad) => ({
          id: ad.id,
          type: ad.media_type as "image" | "video",
          url: ad.media_url,
          link: ad.link_url || undefined,
          title: ad.title || undefined,
        }));
        setAdvertisements(formattedAds);
      }
    };
    fetchAdvertisements();
  }, []);

  // ── Fetch personalised subjects ────────────────────────────────────────
  useEffect(() => {
    if (!profile?.standard) return;

    const fetchMySubjects = async () => {
      setIsLoadingSubjects(true);

      const slug = STANDARD_TO_SLUG[profile.standard!];
      if (!slug) { setIsLoadingSubjects(false); return; }

      setCategoryPath(`/category/${slug}`);

      // Get category id for this standard
      const { data: catData } = await supabase
        .from("categories")
        .select("id, slug")
        .eq("slug", slug)
        .eq("is_active", true)
        .single();

      if (!catData) { setIsLoadingSubjects(false); return; }

      // ── Diploma / B-Tech: filter directly by semester column ──────────
      if (SEMESTER_FILTERED_STANDARDS.has(profile.standard!) && profile.year_or_semester) {
        const { data: semSubjects } = await supabase
          .from("subjects")
          .select("*")
          .eq("category_id", catData.id)
          .eq("is_active", true)
          .eq("semester", profile.year_or_semester)
          .order("sort_order");

        setMySubjects(
          (semSubjects ?? []).map((s) => ({
            id: s.id,
            name: s.name,
            description: (s as any).description ?? null,
            category_id: s.category_id,
            categorySlug: slug,
          }))
        );
        setIsLoadingSubjects(false);
        return;
      }

      // ── Intermediate: keyword filter by group ─────────────────────────
      if (profile.standard === "intermediate") {
        const { data: subjectsData } = await supabase
          .from("subjects")
          .select("*")
          .eq("category_id", catData.id)
          .eq("is_active", true)
          .order("sort_order");

        const keywords = profile.academic_group
          ? INTERMEDIATE_KEYWORDS[profile.academic_group] ?? []
          : [];

        const filtered = keywords.length === 0
          ? (subjectsData ?? [])
          : (subjectsData ?? []).filter((s) =>
              keywords.some((k) => s.name.toLowerCase().includes(k.toLowerCase()))
            );

        setMySubjects(
          filtered.map((s) => ({
            id: s.id,
            name: s.name,
            description: s.description ?? null,
            category_id: s.category_id,
            categorySlug: slug,
          }))
        );
        setIsLoadingSubjects(false);
        return;
      }

      // ── 10th / others: show all subjects in the category ─────────────
      const { data: allSubjects } = await supabase
        .from("subjects")
        .select("*")
        .eq("category_id", catData.id)
        .eq("is_active", true)
        .order("sort_order");

      setMySubjects(
        (allSubjects ?? []).map((s) => ({
          id: s.id,
          name: s.name,
          description: s.description ?? null,
          category_id: s.category_id,
          categorySlug: slug,
        }))
      );
      setIsLoadingSubjects(false);
    };

    fetchMySubjects();
  }, [profile?.standard, profile?.academic_group, profile?.year_or_semester]);

  // ── General categories ─────────────────────────────────────────────────
  const categories = [
    { id: "10th", title: "10th Grade", subtitle: "AP State Board", icon: BookOpen, path: "/category/10th" },
    { id: "intermediate", title: "Intermediate", subtitle: "1st & 2nd Year", icon: GraduationCap, path: "/category/intermediate" },
    { id: "diploma", title: "Diploma", subtitle: "AP SBTET", icon: FileText, path: "/category/diploma" },
    { id: "eapcet", title: "EAPCET", subtitle: "All Streams", icon: Target, path: "/eapcet" },
    { id: "btech", title: "B-Tech", subtitle: "Engineering", icon: Laptop, path: "/category/btech" },
  ];

  const standardLabel: Record<string, string> = {
    "10th": "10th Grade",
    "intermediate": "Intermediate",
    "diploma": "Diploma",
    "btech": "B-Tech",
  };

  const hasAcademicProfile = !!profile?.standard;

  return (
    <div className="min-h-screen pb-20 md:pb-6 md:pt-20">
      {/* Mobile Header */}
      <header className="md:hidden sticky top-0 z-30 bg-card/95 backdrop-blur-sm border-b border-border px-4 py-3">
        <div className="flex items-center gap-3">
          <img src={vrkLogo} alt="VRK" className="h-10 w-10 object-contain" />
          <div>
            <h1 className="font-display font-bold text-lg text-gradient">VRK Solutions</h1>
            <p className="text-xs text-muted-foreground">First step for your education</p>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-8">
        {/* Welcome Section */}
        <section className="animate-fade-in">
          <h2 className="text-xl md:text-2xl font-display font-semibold">
            Hello, <span className="text-gradient">{userName}</span> 👋
          </h2>
          <p className="text-muted-foreground mt-1">Continue your learning journey</p>

          {/* Academic badge */}
          {hasAcademicProfile && (
            <div className="mt-2 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium">
              <GraduationCap className="h-3.5 w-3.5" />
              {standardLabel[profile!.standard!] || profile!.standard}
              {profile?.academic_group && ` · ${profile.academic_group}`}
              {profile?.year_or_semester && ` · ${profile.year_or_semester}`}
            </div>
          )}

          {/* Search Bar */}
          <div className="mt-4">
            <ContentSearch />
          </div>
        </section>

        {/* Advertisement Slider */}
        {advertisements.length > 0 && (
          <section className="animate-slide-up" style={{ animationDelay: "0.1s" }}>
            <AdvertisementSlider advertisements={advertisements} />
          </section>
        )}

        {/* ── MY SUBJECTS (personalised) ────────────────────────────────── */}
        {hasAcademicProfile && (
          <section className="animate-slide-up" style={{ animationDelay: "0.15s" }}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg gradient-primary">
                  <Layers className="h-4 w-4 text-primary-foreground" />
                </div>
                <h3 className="font-display font-semibold text-lg">Your Subjects</h3>
              </div>
              <button
                onClick={() => navigate(categoryPath)}
                className="flex items-center gap-1 text-sm text-primary font-medium hover:underline"
              >
                View All <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            {isLoadingSubjects ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-20 rounded-xl bg-muted animate-pulse" />
                ))}
              </div>
            ) : mySubjects.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {mySubjects.slice(0, 6).map((subject) => (
                  <button
                    key={subject.id}
                    onClick={() => navigate(categoryPath)}
                    className="group flex flex-col gap-1.5 p-4 rounded-xl border border-border bg-card hover:border-primary/40 hover:bg-primary/5 hover:shadow-card transition-all duration-200 text-left"
                  >
                    <div className="p-2 rounded-lg gradient-soft w-fit">
                      <BookOpen className="h-4 w-4 text-primary" />
                    </div>
                    <p className="font-semibold text-sm leading-tight">{subject.name}</p>
                    {subject.description && (
                      <p className="text-xs text-muted-foreground line-clamp-1">{subject.description}</p>
                    )}
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-6 rounded-xl border border-dashed border-border text-center">
                <BookOpen className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  No subjects found yet. Admin will add them soon.
                </p>
                <button
                  onClick={() => navigate(categoryPath)}
                  className="mt-2 text-sm text-primary font-medium hover:underline"
                >
                  Browse all content →
                </button>
              </div>
            )}
          </section>
        )}

        {/* Education Categories */}
        <section className="animate-slide-up" style={{ animationDelay: "0.2s" }}>
          <h3 className="font-display font-semibold text-lg mb-4">Explore Categories</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {categories.map((category) => (
              <CategoryCard
                key={category.id}
                title={category.title}
                subtitle={category.subtitle}
                icon={category.icon}
                onClick={() => navigate(category.path)}
              />
            ))}
          </div>
        </section>

        {/* Saved PDFs Quick Access */}
        {savedPDFs.length > 0 && (
          <section className="animate-slide-up" style={{ animationDelay: "0.25s" }}>
            <div
              className="p-4 rounded-xl border border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800 cursor-pointer hover:shadow-card transition-all"
              onClick={() => navigate("/saved-pdfs")}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-100 dark:bg-green-800">
                  <BookmarkCheck className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-green-800 dark:text-green-300">Saved PDFs</h4>
                  <p className="text-sm text-green-600 dark:text-green-400">
                    {savedPDFs.length} PDF{savedPDFs.length !== 1 ? "s" : ""} available offline
                  </p>
                </div>
                <span className="text-sm text-green-600 dark:text-green-400">View →</span>
              </div>
            </div>
          </section>
        )}

        {/* Quick Stats */}
        <section className="animate-slide-up" style={{ animationDelay: "0.3s" }}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl gradient-soft text-center">
              <p className="text-2xl md:text-3xl font-display font-bold text-primary">10+</p>
              <p className="text-xs md:text-sm text-muted-foreground mt-1">Subjects</p>
            </div>
            <div className="p-4 rounded-xl gradient-soft text-center">
              <p className="text-2xl md:text-3xl font-display font-bold text-primary">100+</p>
              <p className="text-xs md:text-sm text-muted-foreground mt-1">Resources</p>
            </div>
            <div className="p-4 rounded-xl gradient-soft text-center">
              <p className="text-2xl md:text-3xl font-display font-bold text-primary">500+</p>
              <p className="text-xs md:text-sm text-muted-foreground mt-1">Students</p>
            </div>
            <div className="p-4 rounded-xl gradient-soft text-center">
              <p className="text-2xl md:text-3xl font-display font-bold text-primary">24/7</p>
              <p className="text-xs md:text-sm text-muted-foreground mt-1">Support</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default StudentHome;
