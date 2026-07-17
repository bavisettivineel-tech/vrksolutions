import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, BookOpen, FileText, Calendar, BarChart3, Video, Download, Eye, GraduationCap, GitBranch } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import PDFViewer from "@/components/PDFViewer";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
}

interface Subject {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  year: string | null;
  semester: string | null;
  branch: string | null;
}

interface ContentItem {
  id: string;
  title: string;
  description: string | null;
  content_type: string;
  file_url: string | null;
  file_name: string | null;
  file_size: number | null;
  created_at: string;
  metadata: {
    year?: string;
    semester?: string;
  } | null;
  subject_id: string | null;
}

// Semester options per category slug — values must match what is stored in subjects.semester column
const SEMESTER_VALUES: Record<string, string[]> = {
  diploma:       ["1-1", "2-1", "2-2", "3-1", "3-2"],
  btech:         ["1-1", "1-2", "2-1", "2-2", "3-1", "3-2", "4-1", "4-2"],
  intermediate:  ["1st Year", "2nd Year"],
  "10th":        [],
};

// Human-readable label for a semester value
const semLabel = (val: string, categoryId?: string) => {
  if (categoryId === "diploma" && val === "1-1") {
    return "1st Year";
  }
  if (val.includes("-")) {
    const [yr, sem] = val.split("-");
    return `Year ${yr} – Sem ${sem}`;
  }
  return val;
};

// Standards that filter subjects by the semester column directly
const SEMESTER_FILTERED = new Set(["diploma", "btech", "intermediate"]);

const CategoryDetailPage = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [category, setCategory] = useState<Category | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [content, setContent] = useState<ContentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedContent, setSelectedContent] = useState<ContentItem | null>(null);
  const [showPDFViewer, setShowPDFViewer] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [selectedSemester, setSelectedSemester] = useState<string>("all");
  const [selectedSubject, setSelectedSubject] = useState<string>("all");

  const semesterOptions = categoryId ? (SEMESTER_VALUES[categoryId] ?? []) : [];
  const usesSemesterFilter = SEMESTER_FILTERED.has(categoryId ?? "");

  // Pre-select the user's semester from their profile when entering this category
  useEffect(() => {
    if (categoryId) {
      fetchCategoryData();
      setSelectedSubject("all");

      // Auto-select user's semester from profile if it matches this category
      const profileSem = profile?.year_or_semester;
      const opts = SEMESTER_VALUES[categoryId] ?? [];
      if (profileSem && opts.includes(profileSem)) {
        setSelectedSemester(profileSem);
      } else {
        // For diploma/btech default to "all" but show prompt
        setSelectedSemester("all");
      }
    }
  }, [categoryId]);

  // Reset subject when semester changes
  useEffect(() => {
    setSelectedSubject("all");
  }, [selectedSemester]);

  const fetchContent = async (catId: string) => {
    const { data: contentData } = await supabase
      .from("content")
      .select("*")
      .eq("category_id", catId)
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (contentData) setContent(contentData as ContentItem[]);
  };

  const fetchCategoryData = async () => {
    setIsLoading(true);
    try {
      // Fetch category by slug
      const { data: catData } = await supabase
        .from("categories")
        .select("*")
        .eq("slug", categoryId)
        .eq("is_active", true)
        .maybeSingle();

      if (catData) {
        setCategory(catData);

        // Fetch ALL subjects for this category
        const { data: subData } = await supabase
          .from("subjects")
          .select("*")
          .eq("category_id", catData.id)
          .eq("is_active", true)
          .order("sort_order");

        if (subData) setSubjects(subData as Subject[]);

        // Fetch ALL content for this category (filter client-side)
        await fetchContent(catData.id);
      }
    } catch (error) {
      console.error("Error fetching category data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewContent = (item: ContentItem) => {
    if (item.file_url) {
      if (item.content_type === "pdf" || item.file_name?.toLowerCase().endsWith(".pdf")) {
        setSelectedContent(item);
        setShowPDFViewer(true);
      } else if (item.content_type === "video" || item.file_name?.toLowerCase().match(/\.(mp4|webm|ogg)$/)) {
        window.open(item.file_url, "_blank");
      } else {
        window.open(item.file_url, "_blank");
      }
    }
  };

  const handleDownload = (item: ContentItem) => {
    if (item.file_url) {
      window.open(item.file_url, "_blank");
    }
  };

  const getContentIcon = (type: string) => {
    switch (type) {
      case "pdf":
      case "notes":
        return FileText;
      case "timetable":
        return Calendar;
      case "weightage":
        return BarChart3;
      case "video":
        return Video;
      default:
        return FileText;
    }
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return "";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Filter subjects based on semester column (exact match from DB)
  const filteredSubjects = useMemo(() => {
    if (!usesSemesterFilter || selectedSemester === "all") {
      // 10th or no filter selected: show all subjects
      return subjects;
    }
    // Diploma / B-Tech / Intermediate: strict semester match
    return subjects.filter(s => (s as any).semester === selectedSemester);
  }, [subjects, selectedSemester, usesSemesterFilter]);

  // Filter content based on subject filter
  const filteredContent = useMemo(() => {
    let result = content;

    // Filter by content type
    if (activeFilter !== "all") {
      result = result.filter(item => item.content_type === activeFilter);
    }

    // Filter by subject - STRICT: only show files assigned to the selected subject
    if (selectedSubject !== "all") {
      result = result.filter(item => item.subject_id === selectedSubject);
    }

    return result;
  }, [content, activeFilter, selectedSubject]);

  const contentTypes = [
    { id: "all", label: "All", icon: BookOpen },
    { id: "pdf", label: "PDFs", icon: FileText },
    { id: "timetable", label: "Timetables", icon: Calendar },
    { id: "weightage", label: "Weightage", icon: BarChart3 },
    { id: "notes", label: "Notes", icon: FileText },
    { id: "video", label: "Videos", icon: Video },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!category) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="p-8 text-center max-w-md">
          <h2 className="font-display font-semibold text-xl">Category Not Found</h2>
          <p className="text-muted-foreground mt-2">
            The category you're looking for doesn't exist.
          </p>
          <Button className="mt-4 gradient-primary" onClick={() => navigate("/")}>
            Go Home
          </Button>
        </Card>
      </div>
    );
  }

  // Get the currently opened subject object
  const openedSubject = selectedSubject !== "all" 
    ? filteredSubjects.find(s => s.id === selectedSubject) || null 
    : null;

  const openedSubjectFiles = openedSubject 
    ? content.filter(c => c.subject_id === openedSubject.id) 
    : [];

  // Full-screen subject view
  if (openedSubject) {
    return (
      <div className="min-h-screen pb-20 md:pb-6 md:pt-20">
        {/* Mobile Header */}
        <header className="md:hidden sticky top-0 z-30 bg-card/95 backdrop-blur-sm border-b border-border px-4 py-3">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => setSelectedSubject("all")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1 min-w-0">
              <h1 className="font-display font-semibold text-lg truncate">{openedSubject.name}</h1>
              <div className="flex items-center gap-2">
                {openedSubject.branch && (
                  <Badge variant="outline" className="text-[10px]">{openedSubject.branch}</Badge>
                )}
                {openedSubject.year && (
                  <span className="text-xs text-muted-foreground">{openedSubject.year}</span>
                )}
                {openedSubject.semester && (
                  <span className="text-xs text-muted-foreground">• {openedSubject.semester}</span>
                )}
              </div>
            </div>
            <Badge variant="secondary" className="text-xs flex-shrink-0">
              {openedSubjectFiles.length} file{openedSubjectFiles.length !== 1 ? 's' : ''}
            </Badge>
          </div>
        </header>

        {/* Desktop Header */}
        <div className="hidden md:block container mx-auto px-4 pt-6 pb-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => setSelectedSubject("all")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1">
              <h1 className="font-display font-bold text-2xl">{openedSubject.name}</h1>
              <div className="flex items-center gap-2 mt-1">
                {openedSubject.branch && (
                  <Badge variant="outline" className="text-xs">{openedSubject.branch}</Badge>
                )}
                {openedSubject.year && (
                  <span className="text-sm text-muted-foreground">{openedSubject.year}</span>
                )}
                {openedSubject.semester && (
                  <span className="text-sm text-muted-foreground">• {openedSubject.semester}</span>
                )}
                <Badge variant="secondary" className="text-xs ml-2">
                  {openedSubjectFiles.length} file{openedSubjectFiles.length !== 1 ? 's' : ''}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Subject Files */}
        <main className="container mx-auto px-4 py-4">
          {openedSubjectFiles.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-3 opacity-40" />
              <p className="font-medium">No materials uploaded yet</p>
              <p className="text-sm mt-1">Check back later for study materials.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {openedSubjectFiles.map((item) => {
                const Icon = getContentIcon(item.content_type);
                return (
                  <Card
                    key={item.id}
                    className="p-4 flex items-center gap-3 hover:bg-muted/50 transition-colors"
                  >
                    <div className="p-2.5 rounded-xl gradient-soft flex-shrink-0">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm truncate">{item.title}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="text-[10px]">
                          {item.content_type}
                        </Badge>
                        {item.file_size && (
                          <span className="text-[10px] text-muted-foreground">
                            {formatFileSize(item.file_size)}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-9 px-3"
                        onClick={() => handleViewContent(item)}
                      >
                        <Eye className="h-4 w-4 mr-1.5" />
                        View
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-9 w-9"
                        onClick={() => handleDownload(item)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </main>

        {/* PDF Viewer Dialog */}
        {selectedContent && selectedContent.file_url && (
          <PDFViewer
            open={showPDFViewer}
            onOpenChange={setShowPDFViewer}
            fileUrl={selectedContent.file_url}
            title={selectedContent.title}
            contentId={selectedContent.id}
          />
        )}
      </div>
    );
  }

  // Main category view with subject listing
  return (
    <div className="min-h-screen pb-20 md:pb-6 md:pt-20">
      {/* Mobile Header */}
      <header className="md:hidden sticky top-0 z-30 bg-card/95 backdrop-blur-sm border-b border-border px-4 py-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="font-display font-semibold text-lg">{category.name}</h1>
            <p className="text-xs text-muted-foreground">{category.description}</p>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Desktop Header */}
        <div className="hidden md:flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="font-display font-bold text-2xl">{category.name}</h1>
            <p className="text-muted-foreground">{category.description}</p>
          </div>
        </div>

        {/* Semester Filter — for diploma, btech, intermediate */}
        {usesSemesterFilter && semesterOptions.length > 0 && (
          <section className="animate-fade-in">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Select Semester</span>
              {selectedSemester !== "all" && (
                <Badge className="gradient-primary text-primary-foreground text-xs">
                  {semLabel(selectedSemester, categoryId)}
                </Badge>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedSemester("all")}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${
                  selectedSemester === "all"
                    ? "gradient-primary text-primary-foreground border-primary"
                    : "border-border hover:border-primary/50 hover:bg-primary/5"
                }`}
              >
                All
              </button>
              {semesterOptions.map(sem => (
                <button
                  key={sem}
                  onClick={() => setSelectedSemester(sem)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${
                    selectedSemester === sem
                      ? "gradient-primary text-primary-foreground border-primary shadow-card"
                      : "border-border hover:border-primary/50 hover:bg-primary/5"
                  }`}
                >
                  {semLabel(sem, categoryId)}
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Subjects Section */}
        {(() => {
          if (usesSemesterFilter && selectedSemester === "all") {
            // Prompt user to pick a semester first
            return (
              <section className="animate-fade-in">
                <div className="p-8 text-center rounded-xl border-2 border-dashed border-vrk-200">
                  <Calendar className="h-10 w-10 mx-auto text-vrk-300 mb-3" />
                  <h3 className="font-display font-semibold text-lg">Select a Semester</h3>
                  <p className="text-muted-foreground mt-1 text-sm">
                    Choose your semester above to see the subjects for that semester.
                  </p>
                </div>
              </section>
            );
          }

          if (filteredSubjects.length === 0) {
            return (
              <section className="animate-fade-in">
                <div className="p-8 text-center rounded-xl border-2 border-dashed border-vrk-200">
                  <BookOpen className="h-10 w-10 mx-auto text-vrk-300 mb-3" />
                  <h3 className="font-display font-semibold text-lg">No Subjects Found</h3>
                  <p className="text-muted-foreground mt-1 text-sm">
                    No subjects available for this semester yet.
                  </p>
                </div>
              </section>
            );
          }

          return (
            <section className="animate-slide-up space-y-4">
              <h2 className="font-display font-semibold text-lg flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-primary" />
                {selectedSemester !== "all" ? `${semLabel(selectedSemester, categoryId)} Subjects` : "All Subjects"}
                <Badge variant="secondary" className="text-xs ml-1">{filteredSubjects.length}</Badge>
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {filteredSubjects.map((subject) => {
                  const subjectFiles = content.filter(c => c.subject_id === subject.id);
                  return (
                    <Card
                      key={subject.id}
                      className="p-4 cursor-pointer hover:shadow-lg hover:border-primary/30 transition-all active:scale-[0.97] text-center"
                      onClick={() => setSelectedSubject(subject.id)}
                    >
                      <div className="flex flex-col items-center gap-2">
                        <div className="p-3 rounded-xl gradient-soft">
                          <BookOpen className="h-6 w-6 text-primary" />
                        </div>
                        <h4 className="font-medium text-xs sm:text-sm leading-tight line-clamp-2">{subject.name}</h4>
                        <Badge variant="secondary" className="text-[9px] px-1.5">
                          {subjectFiles.length} file{subjectFiles.length !== 1 ? 's' : ''}
                        </Badge>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </section>
          );
        })()}
      </main>

      {/* PDF Viewer Dialog */}
      {selectedContent && selectedContent.file_url && (
        <PDFViewer
          open={showPDFViewer}
          onOpenChange={setShowPDFViewer}
          fileUrl={selectedContent.file_url}
          title={selectedContent.title}
          contentId={selectedContent.id}
        />
      )}
    </div>
  );
};

export default CategoryDetailPage;