import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, BookOpen, FileText, Calendar, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface Subject {
  id: string;
  name: string;
  icon: typeof BookOpen;
}

// This will be populated by admin - showing empty state for now
const categoryData: Record<string, { title: string; description: string; subjects: Subject[] }> = {
  "10th": {
    title: "10th Grade",
    description: "Andhra Pradesh State Government Syllabus",
    subjects: [], // Admin will add subjects
  },
  intermediate: {
    title: "Intermediate",
    description: "Board of Intermediate Education, AP",
    subjects: [], // Admin will add subjects
  },
  diploma: {
    title: "Diploma",
    description: "AP State Board of Technical Education",
    subjects: [], // Admin will add subjects
  },
};

const CategoryDetailPage = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const navigate = useNavigate();

  const category = categoryId ? categoryData[categoryId] : null;

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

  const resourceTypes = [
    { icon: Calendar, label: "Timetables", description: "Exam schedules and study plans" },
    { icon: FileText, label: "PDFs", description: "Study materials and notes" },
    { icon: BarChart3, label: "Subject Weightage", description: "Chapter-wise importance" },
  ];

  return (
    <div className="min-h-screen pb-20 md:pb-6 md:pt-20">
      {/* Mobile Header */}
      <header className="md:hidden sticky top-0 z-30 bg-card/95 backdrop-blur-sm border-b border-border px-4 py-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="font-display font-semibold text-lg">{category.title}</h1>
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
            <h1 className="font-display font-bold text-2xl">{category.title}</h1>
            <p className="text-muted-foreground">{category.description}</p>
          </div>
        </div>

        {/* Resource Types */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-fade-in">
          {resourceTypes.map((type) => (
            <Card
              key={type.label}
              className="p-4 border-vrk-100 hover:shadow-card transition-all cursor-pointer"
            >
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg gradient-soft">
                  <type.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">{type.label}</h3>
                  <p className="text-sm text-muted-foreground">{type.description}</p>
                </div>
              </div>
            </Card>
          ))}
        </section>

        {/* Subjects Section */}
        <section className="animate-slide-up">
          <h2 className="font-display font-semibold text-lg mb-4">Subjects</h2>

          {category.subjects.length === 0 ? (
            <Card className="p-12 text-center border-dashed border-2 border-vrk-200">
              <BookOpen className="h-12 w-12 mx-auto text-vrk-300 mb-4" />
              <h3 className="font-display font-semibold text-lg text-muted-foreground">
                No Subjects Available
              </h3>
              <p className="text-sm text-muted-foreground mt-2 max-w-sm mx-auto">
                Subjects for this category will appear here once added by the admin.
                Check back soon!
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {category.subjects.map((subject) => (
                <Card
                  key={subject.id}
                  className="p-4 text-center border-vrk-100 hover:shadow-card hover:-translate-y-1 transition-all cursor-pointer"
                >
                  <div className="p-3 rounded-xl gradient-soft mx-auto w-fit mb-3">
                    <subject.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h4 className="font-medium text-sm">{subject.name}</h4>
                </Card>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default CategoryDetailPage;
