import { useNavigate } from "react-router-dom";
import { ArrowLeft, Cpu, Leaf, FlaskConical, Calendar, FileText, BarChart3, Target, Clock, BookOpen, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const EAPCETPage = () => {
  const navigate = useNavigate();

  const streams = [
    {
      id: "engineering",
      title: "Engineering",
      subtitle: "MPC Stream",
      icon: Cpu,
      color: "from-blue-500 to-blue-700",
      subjects: ["Mathematics", "Physics", "Chemistry"],
      eligibility: "Intermediate with MPC",
    },
    {
      id: "agriculture",
      title: "Agriculture",
      subtitle: "BiPC Stream",
      icon: Leaf,
      color: "from-green-500 to-green-700",
      subjects: ["Biology", "Physics", "Chemistry"],
      eligibility: "Intermediate with BiPC",
    },
    {
      id: "pharmacy",
      title: "Pharmacy",
      subtitle: "MPC/BiPC Stream",
      icon: FlaskConical,
      color: "from-purple-500 to-purple-700",
      subjects: ["Physics", "Chemistry", "Mathematics/Biology"],
      eligibility: "Intermediate with MPC or BiPC",
    },
  ];

  const examInfo = [
    { icon: Calendar, label: "Exam Date", value: "To be announced by Admin" },
    { icon: Clock, label: "Duration", value: "3 Hours" },
    { icon: Target, label: "Total Marks", value: "160 Marks" },
    { icon: FileText, label: "Questions", value: "160 MCQs" },
  ];

  const preparationTips = [
    "Focus on NCERT textbooks for strong fundamentals",
    "Practice previous year question papers regularly",
    "Create a structured study timetable",
    "Focus on weak areas and revise daily",
    "Take mock tests to improve time management",
    "Stay updated with exam pattern changes",
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
            <h1 className="font-display font-semibold text-lg">EAPCET Guidance</h1>
            <p className="text-xs text-muted-foreground">All Streams</p>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-8">
        {/* Desktop Header */}
        <div className="hidden md:flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="font-display font-bold text-2xl">EAPCET Guidance</h1>
            <p className="text-muted-foreground">Engineering, Agriculture & Pharmacy Common Entrance Test</p>
          </div>
        </div>

        {/* Hero Banner */}
        <Card className="p-6 md:p-8 gradient-primary text-primary-foreground animate-fade-in overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary-foreground/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="relative z-10">
            <Badge className="bg-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/30 mb-3">
              AP EAPCET 2024
            </Badge>
            <h2 className="font-display font-bold text-2xl md:text-3xl">
              Your Gateway to Top Colleges
            </h2>
            <p className="mt-2 text-primary-foreground/90 max-w-xl">
              Prepare for AP EAPCET with comprehensive study materials, previous papers, and expert guidance for Engineering, Agriculture, and Pharmacy streams.
            </p>
          </div>
        </Card>

        {/* Exam Info Cards */}
        <section className="animate-slide-up" style={{ animationDelay: "0.1s" }}>
          <h3 className="font-display font-semibold text-lg mb-4">Exam Overview</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {examInfo.map((info) => (
              <Card key={info.label} className="p-4 border-vrk-100 text-center">
                <div className="p-2 rounded-lg gradient-soft w-fit mx-auto mb-2">
                  <info.icon className="h-5 w-5 text-primary" />
                </div>
                <p className="text-xs text-muted-foreground">{info.label}</p>
                <p className="font-semibold text-sm mt-1">{info.value}</p>
              </Card>
            ))}
          </div>
        </section>

        {/* Streams Section */}
        <section className="animate-slide-up" style={{ animationDelay: "0.2s" }}>
          <h3 className="font-display font-semibold text-lg mb-4">Choose Your Stream</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {streams.map((stream) => (
              <Card
                key={stream.id}
                className="overflow-hidden border-vrk-100 hover:shadow-elevated transition-all cursor-pointer group"
              >
                <div className={`p-4 bg-gradient-to-r ${stream.color}`}>
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-primary-foreground/20">
                      <stream.icon className="h-8 w-8 text-primary-foreground" />
                    </div>
                    <div>
                      <h4 className="font-display font-bold text-xl text-primary-foreground">
                        {stream.title}
                      </h4>
                      <p className="text-sm text-primary-foreground/80">{stream.subtitle}</p>
                    </div>
                  </div>
                </div>
                <div className="p-4 space-y-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Subjects</p>
                    <div className="flex flex-wrap gap-2">
                      {stream.subjects.map((subject) => (
                        <Badge key={subject} variant="secondary" className="text-xs">
                          {subject}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Eligibility</p>
                    <p className="text-sm font-medium">{stream.eligibility}</p>
                  </div>
                  <Button className="w-full gradient-primary group-hover:shadow-card transition-all">
                    Explore Resources
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* Resources Section */}
        <section className="animate-slide-up" style={{ animationDelay: "0.3s" }}>
          <h3 className="font-display font-semibold text-lg mb-4">Preparation Resources</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: FileText, title: "Syllabus", desc: "Complete exam syllabus" },
              { icon: BookOpen, title: "Study Materials", desc: "Chapter-wise notes" },
              { icon: Calendar, title: "Previous Papers", desc: "Last 5 years papers" },
              { icon: BarChart3, title: "Topic Weightage", desc: "Important topics analysis" },
            ].map((resource) => (
              <Card
                key={resource.title}
                className="p-4 border-vrk-100 hover:shadow-card hover:-translate-y-1 transition-all cursor-pointer"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg gradient-soft">
                    <resource.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold">{resource.title}</h4>
                    <p className="text-sm text-muted-foreground">{resource.desc}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Empty state for admin-managed content */}
          <Card className="mt-6 p-8 text-center border-dashed border-2 border-vrk-200">
            <AlertCircle className="h-10 w-10 mx-auto text-vrk-300 mb-3" />
            <h4 className="font-display font-semibold text-muted-foreground">
              Resources Coming Soon
            </h4>
            <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
              Study materials, previous papers, and syllabus will be available once uploaded by admin.
            </p>
          </Card>
        </section>

        {/* Preparation Tips */}
        <section className="animate-slide-up" style={{ animationDelay: "0.4s" }}>
          <h3 className="font-display font-semibold text-lg mb-4">Preparation Tips</h3>
          <Card className="p-6 border-vrk-100">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {preparationTips.map((tip, index) => (
                <div key={index} className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-vrk-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm">{tip}</p>
                </div>
              ))}
            </div>
          </Card>
        </section>

        {/* CTA Section */}
        <section className="animate-slide-up" style={{ animationDelay: "0.5s" }}>
          <Card className="p-6 md:p-8 bg-vrk-50 border-vrk-200 text-center">
            <h3 className="font-display font-bold text-xl">Need Personalized Guidance?</h3>
            <p className="text-muted-foreground mt-2 max-w-md mx-auto">
              Our experts are ready to help you with your EAPCET preparation journey.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center mt-4">
              <Button className="gradient-primary">
                Contact Expert
              </Button>
              <Button variant="outline" className="border-vrk-300">
                Join Study Group
              </Button>
            </div>
          </Card>
        </section>
      </main>
    </div>
  );
};

export default EAPCETPage;
