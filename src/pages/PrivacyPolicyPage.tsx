import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Shield, Mail, Phone, Clock, FileText, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import vrkLogo from "@/assets/vrk-logo.png";

const PrivacyPolicyPage = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("introduction");

  const sections = [
    { id: "introduction", label: "Introduction" },
    { id: "collect", label: "1. Information We Collect" },
    { id: "use", label: "2. How We Use Information" },
    { id: "legal-basis", label: "3. Legal Basis for GDPR" },
    { id: "security", label: "4. Security & Encryption" },
    { id: "retention", label: "5. Data Retention & Purging" },
    { id: "rights", label: "6. Your Privacy Rights" },
    { id: "account-deletion", label: "7. Account Deletion" },
    { id: "california", label: "8. CCPA/CPRA California Rights" },
    { id: "children", label: "9. Children's Privacy" },
    { id: "contact", label: "10. Contact Information" },
  ];

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      const headerOffset = 100;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-12">
      {/* Background Glow */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-1/2 right-10 w-[300px] h-[300px] bg-vrk-100/30 rounded-full blur-3xl pointer-events-none -z-10" />

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
          <div className="w-16" /> {/* Spacer to center the logo on desktop */}
        </div>
      </header>

      {/* Main Content Layout */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto text-center mb-10">
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-primary/10 text-primary mb-4 animate-fade-in">
            <Shield className="h-10 w-10 animate-float" />
          </div>
          <h1 className="font-display font-bold text-3xl sm:text-4xl tracking-tight mb-3">Privacy Policy</h1>
          <p className="text-muted-foreground text-sm flex items-center justify-center gap-1.5">
            <Clock className="h-4 w-4 text-primary" />
            <span>Last Updated: July 17, 2026</span>
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <aside className="md:col-span-1 hidden md:block">
            <Card className="sticky top-24 p-4 border-vrk-100 shadow-card bg-card/65 backdrop-blur-sm">
              <h2 className="font-display font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-4 px-2">
                Table of Contents
              </h2>
              <nav className="space-y-1">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => scrollToSection(section.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 border-l-2 ${
                      activeSection === section.id
                        ? "bg-primary/10 border-primary text-primary font-semibold"
                        : "border-transparent text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    {section.label}
                  </button>
                ))}
              </nav>
            </Card>
          </aside>

          {/* Policy Text Container */}
          <section className="md:col-span-3 space-y-10 text-muted-foreground leading-relaxed text-sm">
            <Card className="p-6 md:p-8 border-vrk-100 shadow-card bg-card">
              
              <div id="introduction" className="space-y-4 scroll-mt-24">
                <h2 className="font-display font-bold text-xl text-foreground flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-primary" />
                  Introduction
                </h2>
                <p>
                  Welcome to VRK Solutions. We are committed to protecting your privacy and ensuring your personal information is handled in a safe, transparent, and responsible manner. This Privacy Policy details how we collect, use, share, and protect your information when you use our mobile application and web services.
                </p>
                <p>
                  By accessing or using our services, you agree to the collection and use of information in accordance with this policy. If you do not agree with any terms in this policy, please do not use our services.
                </p>
              </div>

              <hr className="my-8 border-border" />

              <div id="collect" className="space-y-4 scroll-mt-24">
                <h2 className="font-display font-bold text-xl text-foreground flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-primary" />
                  1. Information We Collect
                </h2>
                <p>We collect several types of information to provide and improve our educational services to you:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                  <div className="p-4 rounded-xl border border-border bg-muted/30">
                    <h3 className="font-semibold text-foreground mb-1 text-xs flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                      Account & Identity
                    </h3>
                    <p className="text-xs">Full Name and 10-digit Phone Number during registration. We use these for profile creation and authentication via secure credentials.</p>
                  </div>
                  <div className="p-4 rounded-xl border border-border bg-muted/30">
                    <h3 className="font-semibold text-foreground mb-1 text-xs flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                      Learning & Activity Data
                    </h3>
                    <p className="text-xs">Your chosen academic categories (e.g. 10th Grade, Intermediate, EAPCET), course selections, subject activity, progress history, and saved PDFs.</p>
                  </div>
                  <div className="p-4 rounded-xl border border-border bg-muted/30">
                    <h3 className="font-semibold text-foreground mb-1 text-xs flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                      Interactions & AI Notes
                    </h3>
                    <p className="text-xs">Notes you create and your prompt history with our integrated AI Assistant. Prompts are processed anonymously to protect your personal identity.</p>
                  </div>
                  <div className="p-4 rounded-xl border border-border bg-muted/30">
                    <h3 className="font-semibold text-foreground mb-1 text-xs flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                      Support Messages
                    </h3>
                    <p className="text-xs">Messages, questions, and support requests you submit to our support staff. We store these to help resolve queries quickly and effectively.</p>
                  </div>
                </div>
              </div>

              <hr className="my-8 border-border" />

              <div id="use" className="space-y-4 scroll-mt-24">
                <h2 className="font-display font-bold text-xl text-foreground flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-primary" />
                  2. How We Use Your Information
                </h2>
                <p>VRK Solutions uses the collected data for various purposes, including:</p>
                <ul className="list-disc ml-6 space-y-2 text-xs">
                  <li><strong>Provide & Maintain Services:</strong> To authenticate your logins, present curated study content, and manage your student profile.</li>
                  <li><strong>Personalization:</strong> To tailor subject weightage and study materials according to your classes and choices.</li>
                  <li><strong>AI Processing:</strong> To generate relevant learning notes and study support via the AI Assistant.</li>
                  <li><strong>Communication:</strong> To send important notifications, academic updates, and support answers.</li>
                  <li><strong>Improvement:</strong> To monitor system performance, fix bugs, and refine our interface to enhance your educational experience.</li>
                </ul>
              </div>

              <hr className="my-8 border-border" />

              <div id="legal-basis" className="space-y-4 scroll-mt-24">
                <h2 className="font-display font-bold text-xl text-foreground flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-primary" />
                  3. Legal Basis for GDPR Processing
                </h2>
                <p>
                  For users inside the European Economic Area (EEA), our legal basis for collecting and using the personal data described in this Privacy Policy depends on the personal data we collect and the specific context in which we collect it:
                </p>
                <ul className="list-disc ml-6 space-y-2 text-xs">
                  <li><strong>Consent:</strong> You have given us explicit permission to process your data (e.g. for push notifications or support tickets).</li>
                  <li><strong>Contract:</strong> The processing is necessary for the performance of our contract/services with you.</li>
                  <li><strong>Legitimate Interests:</strong> To improve our service offerings, prevent unauthorized access, and compile aggregated usage statistics.</li>
                </ul>
              </div>

              <hr className="my-8 border-border" />

              <div id="security" className="space-y-4 scroll-mt-24">
                <h2 className="font-display font-bold text-xl text-foreground flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-primary" />
                  4. Security & Encryption
                </h2>
                <p>
                  We prioritize data security and utilize high-level protections to keep your data safe.
                </p>
                <p>
                  All data is transmitted securely using <strong>SSL/TLS encryption protocols</strong>. Your user sessions and credentials are managed directly by Supabase’s secure identity systems. We do not sell, trade, lease, or distribute your personal details or contact credentials to any third-party marketing companies.
                </p>
              </div>

              <hr className="my-8 border-border" />

              <div id="retention" className="space-y-4 scroll-mt-24">
                <h2 className="font-display font-bold text-xl text-foreground flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-primary" />
                  5. Data Retention & Purging
                </h2>
                <p>
                  We retain your personal information only for as long as necessary to fulfill the purposes outlined in this Privacy Policy.
                </p>
                <p>
                  Account records remain active as long as you use our services. If your account remains completely inactive for a continuous period of <strong>24 months</strong>, we will notify you and subsequently purge your account, profiles, roles, and related logs from our active databases.
                </p>
              </div>

              <hr className="my-8 border-border" />

              <div id="rights" className="space-y-4 scroll-mt-24">
                <h2 className="font-display font-bold text-xl text-foreground flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-primary" />
                  6. Your Privacy Rights
                </h2>
                <p>Depending on your location, you have certain statutory privacy rights, which include:</p>
                <ul className="list-disc ml-6 space-y-2 text-xs">
                  <li><strong>The Right to Access:</strong> You can request copy summaries of your data.</li>
                  <li><strong>The Right to Rectification:</strong> You can edit inaccurate details in your profile settings.</li>
                  <li><strong>The Right to Data Portability:</strong> You can request a download of your saved data files.</li>
                  <li><strong>The Right to Erasure (Deletion):</strong> You have the right to request that we erase your personal information.</li>
                </ul>
              </div>

              <hr className="my-8 border-border" />

              <div id="account-deletion" className="space-y-4 scroll-mt-24">
                <h2 className="font-display font-bold text-xl text-foreground flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-primary" />
                  7. Account Deletion
                </h2>
                <p>
                  We make it simple for you to delete your account and remove all data completely at any time:
                </p>
                <p>
                  <strong>Within the App:</strong> Authenticated users can navigate to the Account Settings page and click the "Delete Account" button. After quick confirmation, your account and all records (profiles, roles, notifications, support records, and AI notes) are immediately deleted in real time.
                </p>
                <p>
                  <strong>Web Deletion Link:</strong> If you no longer have access to the app, you can delete your account directly using our dedicated public page at:
                </p>
                <div className="p-4 rounded-xl border border-dashed border-primary/40 bg-primary/5 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-primary" />
                    <div>
                      <h4 className="font-semibold text-foreground text-xs">Dedicated Account Deletion Page</h4>
                      <p className="text-xs text-muted-foreground">Self-serve deletion or offline manual requests.</p>
                    </div>
                  </div>
                  <Button size="sm" className="gradient-primary" onClick={() => navigate("/delete-account")}>
                    Go to Account Deletion
                  </Button>
                </div>
              </div>

              <hr className="my-8 border-border" />

              <div id="california" className="space-y-4 scroll-mt-24">
                <h2 className="font-display font-bold text-xl text-foreground flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-primary" />
                  8. CCPA/CPRA California Rights
                </h2>
                <p>
                  If you are a California resident, the California Consumer Privacy Act (CCPA), as amended by the CPRA, grants you specific rights regarding your personal information:
                </p>
                <ul className="list-disc ml-6 space-y-2 text-xs">
                  <li><strong>No Sale or Share:</strong> We do NOT sell or share your personal information.</li>
                  <li><strong>Right to Limit Use:</strong> We restrict the use of your phone numbers solely to secure profile authentication.</li>
                  <li><strong>Non-Discrimination:</strong> You will not receive discriminatory treatment from us for exercising any of your privacy rights.</li>
                </ul>
              </div>

              <hr className="my-8 border-border" />

              <div id="children" className="space-y-4 scroll-mt-24">
                <h2 className="font-display font-bold text-xl text-foreground flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-primary" />
                  9. Children's Privacy
                </h2>
                <p>
                  Our services are designed for students of all ages. We are committed to protecting the privacy of minors. If you are under 13 years old, parental consent is advised. We comply with all applicable children's privacy protection regulations and do not collect data beyond essential credentials.
                </p>
              </div>

              <hr className="my-8 border-border" />

              <div id="contact" className="space-y-4 scroll-mt-24">
                <h2 className="font-display font-bold text-xl text-foreground flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-primary" />
                  10. Contact Information
                </h2>
                <p>
                  If you have any questions, feedback, or compliance concerns regarding this Privacy Policy, or if you need assistance in exercising your rights, please reach out to us:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                  <Card className="p-4 border-border bg-muted/10 flex items-start gap-3">
                    <Mail className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-foreground text-xs">Email Support</h4>
                      <p className="text-xs text-muted-foreground mt-1">support@vrk-solutions.app</p>
                    </div>
                  </Card>
                  <Card className="p-4 border-border bg-muted/10 flex items-start gap-3">
                    <Phone className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-foreground text-xs">Official Contact</h4>
                      <p className="text-xs text-muted-foreground mt-1">+91 8297458070</p>
                    </div>
                  </Card>
                </div>
              </div>

            </Card>
          </section>
        </div>
      </main>
    </div>
  );
};

export default PrivacyPolicyPage;
