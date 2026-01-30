import { useNavigate } from "react-router-dom";
import { BookOpen, GraduationCap, FileText, Laptop, Target, BookmarkCheck } from "lucide-react";
import CategoryCard from "@/components/CategoryCard";
import AdvertisementSlider from "@/components/AdvertisementSlider";
import ContentSearch from "@/components/ContentSearch";
import { useOfflinePDFs } from "@/hooks/useOfflinePDFs";
import vrkLogo from "@/assets/vrk-logo.png";

interface StudentHomeProps {
  userName: string;
}

// Placeholder advertisements - will be managed by admin
const sampleAdvertisements = [
  {
    id: "1",
    type: "image" as const,
    url: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1200&h=400&fit=crop",
    title: "Admissions Open for 2024-25",
    link: "#",
  },
  {
    id: "2",
    type: "image" as const,
    url: "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=1200&h=400&fit=crop",
    title: "EAPCET Coaching Classes Starting Soon",
    link: "#",
  },
];

const StudentHome = ({ userName }: StudentHomeProps) => {
  const navigate = useNavigate();
  const { savedPDFs } = useOfflinePDFs();

  const categories = [
    {
      id: "10th",
      title: "10th Grade",
      subtitle: "AP State Board",
      icon: BookOpen,
      path: "/category/10th",
    },
    {
      id: "intermediate",
      title: "Intermediate",
      subtitle: "1st & 2nd Year",
      icon: GraduationCap,
      path: "/category/intermediate",
    },
    {
      id: "diploma",
      title: "Diploma",
      subtitle: "AP SBTET",
      icon: FileText,
      path: "/category/diploma",
    },
    {
      id: "eapcet",
      title: "EAPCET",
      subtitle: "All Streams",
      icon: Target,
      path: "/eapcet",
    },
    {
      id: "btech",
      title: "B-Tech",
      subtitle: "Engineering",
      icon: Laptop,
      path: "/category/btech",
    },
  ];

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
          
          {/* Search Bar */}
          <div className="mt-4">
            <ContentSearch />
          </div>
        </section>

        {/* Advertisement Slider */}
        <section className="animate-slide-up" style={{ animationDelay: "0.1s" }}>
          <AdvertisementSlider advertisements={sampleAdvertisements} />
        </section>

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
