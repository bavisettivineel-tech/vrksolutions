import { useNavigate } from "react-router-dom";
import { BookOpen, GraduationCap, FileText, Laptop, ArrowLeft } from "lucide-react";
import CategoryCard from "@/components/CategoryCard";
import { Button } from "@/components/ui/button";

const CategoriesPage = () => {
  const navigate = useNavigate();

  const categories = [
    {
      id: "10th",
      title: "10th Grade",
      subtitle: "Andhra Pradesh State Government Syllabus",
      icon: BookOpen,
      path: "/category/10th",
      description: "Complete study materials for SSC students",
    },
    {
      id: "intermediate",
      title: "Intermediate",
      subtitle: "Board of Intermediate Education, AP",
      icon: GraduationCap,
      path: "/category/intermediate",
      description: "MPC, BiPC, CEC, HEC streams",
    },
    {
      id: "diploma",
      title: "Diploma",
      subtitle: "AP State Board of Technical Education",
      icon: FileText,
      path: "/category/diploma",
      description: "All branches and semesters",
    },
    {
      id: "btech",
      title: "B-Tech",
      subtitle: "Engineering Programs",
      icon: Laptop,
      disabled: true,
      badge: "Coming Soon",
      description: "Available soon with comprehensive materials",
    },
  ];

  return (
    <div className="min-h-screen pb-20 md:pb-6 md:pt-20">
      {/* Mobile Header */}
      <header className="md:hidden sticky top-0 z-30 bg-card/95 backdrop-blur-sm border-b border-border px-4 py-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="font-display font-semibold text-lg">All Categories</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <div className="hidden md:block mb-6">
          <h1 className="font-display font-bold text-2xl">Education Categories</h1>
          <p className="text-muted-foreground mt-1">
            Select a category to explore available resources
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category) => (
            <div
              key={category.id}
              className={`p-6 rounded-2xl border transition-all duration-300 ${
                category.disabled
                  ? "border-muted bg-muted/30"
                  : "border-vrk-100 bg-card hover:shadow-elevated hover:-translate-y-1 cursor-pointer"
              }`}
              onClick={
                category.disabled ? undefined : () => navigate(category.path!)
              }
            >
              <div className="flex items-start gap-4">
                <div
                  className={`p-3 rounded-xl ${
                    category.disabled ? "bg-muted" : "gradient-soft"
                  }`}
                >
                  <category.icon
                    className={`h-8 w-8 ${
                      category.disabled ? "text-muted-foreground" : "text-primary"
                    }`}
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-display font-semibold text-lg">
                      {category.title}
                    </h3>
                    {category.badge && (
                      <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-vrk-500 text-primary-foreground">
                        {category.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {category.subtitle}
                  </p>
                  <p className="text-sm text-foreground/70 mt-2">
                    {category.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default CategoriesPage;
