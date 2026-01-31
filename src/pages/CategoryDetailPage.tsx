import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, BookOpen, FileText, Calendar, BarChart3, Video, Download, Eye, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
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

// Year and semester configurations for different categories
const categoryConfigs: Record<string, { years: string[]; semesters?: Record<string, string[]> }> = {
  intermediate: {
    years: ["1st Year", "2nd Year"],
  },
  diploma: {
    years: ["1st Year", "2nd Year", "3rd Year"],
    semesters: {
      "1st Year": ["Semester 1", "Semester 2"],
      "2nd Year": ["Semester 3", "Semester 4"],
      "3rd Year": ["Semester 5", "Semester 6"],
    },
  },
  btech: {
    years: ["1st Year", "2nd Year", "3rd Year", "4th Year"],
    semesters: {
      "1st Year": ["Semester 1", "Semester 2"],
      "2nd Year": ["Semester 3", "Semester 4"],
      "3rd Year": ["Semester 5", "Semester 6"],
      "4th Year": ["Semester 7", "Semester 8"],
    },
  },
};

const CategoryDetailPage = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const navigate = useNavigate();
  const [category, setCategory] = useState<Category | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [content, setContent] = useState<ContentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedContent, setSelectedContent] = useState<ContentItem | null>(null);
  const [showPDFViewer, setShowPDFViewer] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [selectedYear, setSelectedYear] = useState<string>("all");
  const [selectedSemester, setSelectedSemester] = useState<string>("all");
  const [selectedSubject, setSelectedSubject] = useState<string>("all");

  // Get category config
  const config = categoryId ? categoryConfigs[categoryId] : null;
  const hasYearFilter = !!config;
  const hasSemesterFilter = !!(config?.semesters && selectedYear !== "all");
  const availableSemesters = hasSemesterFilter && selectedYear !== "all" 
    ? config?.semesters?.[selectedYear] || [] 
    : [];

  useEffect(() => {
    if (categoryId) {
      fetchCategoryData();
      // Reset filters when category changes
      setSelectedYear("all");
      setSelectedSemester("all");
      setSelectedSubject("all");
    }
  }, [categoryId]);

  // Reset semester when year changes
  useEffect(() => {
    setSelectedSemester("all");
  }, [selectedYear]);

  const fetchCategoryData = async () => {
    setIsLoading(true);
    try {
      // Fetch category by slug
      const { data: catData } = await supabase
        .from("categories")
        .select("*")
        .eq("slug", categoryId)
        .eq("is_active", true)
        .single();

      if (catData) {
        setCategory(catData);

        // Fetch subjects for this category
        const { data: subData } = await supabase
          .from("subjects")
          .select("*")
          .eq("category_id", catData.id)
          .eq("is_active", true)
          .order("sort_order");

        if (subData) setSubjects(subData);

        // Fetch content for this category
        const { data: contentData } = await supabase
          .from("content")
          .select("*")
          .eq("category_id", catData.id)
          .eq("is_active", true)
          .order("created_at", { ascending: false });

        if (contentData) setContent(contentData as ContentItem[]);
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
        // Open video in new tab
        window.open(item.file_url, "_blank");
      } else {
        // Download other file types
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

  // Filter subjects based on year (for subjects that include year in their name)
  const filteredSubjects = useMemo(() => {
    if (selectedYear === "all") return subjects;
    
    // Filter subjects that match the selected year
    return subjects.filter(subject => {
      const name = subject.name.toLowerCase();
      if (selectedYear === "1st Year") {
        return name.includes("1st year") || name.includes("- 1a") || name.includes("- 1b") || name.includes("i ") || (!name.includes("year") && !name.includes("2nd") && !name.includes("2a") && !name.includes("2b"));
      }
      if (selectedYear === "2nd Year") {
        return name.includes("2nd year") || name.includes("- 2a") || name.includes("- 2b") || name.includes("ii ");
      }
      if (selectedYear === "3rd Year") {
        return name.includes("3rd year") || name.includes("iii ");
      }
      if (selectedYear === "4th Year") {
        return name.includes("4th year") || name.includes("iv ");
      }
      return true;
    });
  }, [subjects, selectedYear]);

  // Filter content based on all filters
  const filteredContent = useMemo(() => {
    let result = content;

    // Filter by content type
    if (activeFilter !== "all") {
      result = result.filter(item => item.content_type === activeFilter);
    }

    // Filter by year (from metadata)
    if (selectedYear !== "all") {
      result = result.filter(item => {
        if (!item.metadata?.year) return true; // Show items without year metadata
        return item.metadata.year === selectedYear;
      });
    }

    // Filter by semester (from metadata)
    if (selectedSemester !== "all") {
      result = result.filter(item => {
        if (!item.metadata?.semester) return true; // Show items without semester metadata
        return item.metadata.semester === selectedSemester;
      });
    }

    // Filter by subject
    if (selectedSubject !== "all") {
      result = result.filter(item => item.subject_id === selectedSubject);
    }

    return result;
  }, [content, activeFilter, selectedYear, selectedSemester, selectedSubject]);

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

        {/* Year and Semester Filters */}
        {hasYearFilter && (
          <section className="animate-fade-in">
            <div className="flex flex-wrap gap-3">
              {/* Year Filter */}
              <div className="flex-1 min-w-[140px] max-w-[200px]">
                <label className="text-xs font-medium text-muted-foreground mb-1 block">
                  <GraduationCap className="h-3 w-3 inline mr-1" />
                  Select Year
                </label>
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger className="border-vrk-200">
                    <SelectValue placeholder="All Years" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Years</SelectItem>
                    {config?.years.map((year) => (
                      <SelectItem key={year} value={year}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Semester Filter (only for Diploma and B-Tech) */}
              {config?.semesters && (
                <div className="flex-1 min-w-[140px] max-w-[200px]">
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">
                    <Calendar className="h-3 w-3 inline mr-1" />
                    Select Semester
                  </label>
                  <Select 
                    value={selectedSemester} 
                    onValueChange={setSelectedSemester}
                    disabled={selectedYear === "all"}
                  >
                    <SelectTrigger className="border-vrk-200">
                      <SelectValue placeholder="All Semesters" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Semesters</SelectItem>
                      {availableSemesters.map((sem) => (
                        <SelectItem key={sem} value={sem}>
                          {sem}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Subject Filter */}
              {subjects.length > 0 && (
                <div className="flex-1 min-w-[140px] max-w-[250px]">
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">
                    <BookOpen className="h-3 w-3 inline mr-1" />
                    Select Subject
                  </label>
                  <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                    <SelectTrigger className="border-vrk-200">
                      <SelectValue placeholder="All Subjects" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Subjects</SelectItem>
                      {filteredSubjects.map((subject) => (
                        <SelectItem key={subject.id} value={subject.id}>
                          {subject.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Content Type Filter */}
        <section className="animate-fade-in">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {contentTypes.map((type) => (
              <Button
                key={type.id}
                variant={activeFilter === type.id ? "default" : "outline"}
                size="sm"
                className={activeFilter === type.id ? "gradient-primary" : "border-vrk-200"}
                onClick={() => setActiveFilter(type.id)}
              >
                <type.icon className="h-4 w-4 mr-1" />
                {type.label}
              </Button>
            ))}
          </div>
        </section>

        {/* Subjects Section */}
        {filteredSubjects.length > 0 && (
          <section className="animate-slide-up">
            <h2 className="font-display font-semibold text-lg mb-4">
              Subjects {selectedYear !== "all" && `(${selectedYear})`}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredSubjects.map((subject) => (
                <Card
                  key={subject.id}
                  className={`p-4 text-center border-vrk-100 hover:shadow-card hover:-translate-y-1 transition-all cursor-pointer ${
                    selectedSubject === subject.id ? "ring-2 ring-primary bg-vrk-50" : ""
                  }`}
                  onClick={() => setSelectedSubject(selectedSubject === subject.id ? "all" : subject.id)}
                >
                  <div className="p-3 rounded-xl gradient-soft mx-auto w-fit mb-3">
                    <BookOpen className="h-6 w-6 text-primary" />
                  </div>
                  <h4 className="font-medium text-sm">{subject.name}</h4>
                  {subject.description && (
                    <p className="text-xs text-muted-foreground mt-1">{subject.description}</p>
                  )}
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Content Section */}
        <section className="animate-slide-up">
          <h2 className="font-display font-semibold text-lg mb-4">
            Study Materials {filteredContent.length > 0 && `(${filteredContent.length})`}
          </h2>

          {filteredContent.length === 0 ? (
            <Card className="p-12 text-center border-dashed border-2 border-vrk-200">
              <FileText className="h-12 w-12 mx-auto text-vrk-300 mb-4" />
              <h3 className="font-display font-semibold text-lg text-muted-foreground">
                No Content Available
              </h3>
              <p className="text-sm text-muted-foreground mt-2 max-w-sm mx-auto">
                {activeFilter === "all" 
                  ? "Study materials for this category will appear here once added by admin."
                  : `No ${activeFilter} content available. Try a different filter.`}
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredContent.map((item) => {
                const Icon = getContentIcon(item.content_type);
                return (
                  <Card
                    key={item.id}
                    className="p-4 border-vrk-100 hover:shadow-card transition-all"
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg gradient-soft flex-shrink-0">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm line-clamp-2">{item.title}</h4>
                        {item.description && (
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {item.description}
                          </p>
                        )}
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                          <Badge variant="secondary" className="text-xs">
                            {item.content_type}
                          </Badge>
                          {item.metadata?.year && (
                            <Badge variant="outline" className="text-xs">
                              {item.metadata.year}
                            </Badge>
                          )}
                          {item.metadata?.semester && (
                            <Badge variant="outline" className="text-xs">
                              {item.metadata.semester}
                            </Badge>
                          )}
                          {item.file_size && (
                            <span className="text-xs text-muted-foreground">
                              {formatFileSize(item.file_size)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 mt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleViewContent(item)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
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
        </section>
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