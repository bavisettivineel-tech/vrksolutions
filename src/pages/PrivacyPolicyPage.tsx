import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Shield, Mail, Phone, Clock, FileText, CheckCircle2, UserCheck } from "lucide-react";
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
    { id: "ai-processing", label: "3. AI Processing & Privacy" },
    { id: "security", label: "4. Security & Data Minimization" },
    { id: "retention", label: "5. Data Retention & Purging" },
    { id: "dpdpa", label: "6. Indian DPDP Act Rights" },
    { id: "gdpr", label: "7. GDPR Privacy Rights" },
    { id: "ccpa", label: "8. CCPA/CPRA California Rights" },
    { id: "account-deletion", label: "9. Account Deletion Workflow" },
    { id: "children", label: "10. Children's Privacy" },
    { id: "contact", label: "11. Contact & Grievance Officer" },
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
          <div className="w-16" />
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
                  Welcome to VRK Solutions. We are committed to protecting your privacy and ensuring your personal information is handled in a safe, transparent, and legally compliant manner. This Privacy Policy details how we collect, use, process, and safeguard your data when you use our educational applications, materials, AI assistants, and websites.
                </p>
                <p>
                  By accessing or using our services, you consent to the collection and use of your information in accordance with this policy. We align our data collection and processing methodologies with local and international guidelines, including India's Digital Personal Data Protection (DPDP) Act 2023, the European Union's GDPR, and the California CCPA/CPRA.
                </p>
              </div>

              <hr className="my-8 border-border" />

              <div id="collect" className="space-y-4 scroll-mt-24">
                <h2 className="font-display font-bold text-xl text-foreground flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-primary" />
                  1. Information We Collect
                </h2>
                <p>We collect only the minimum necessary information required to provide and personalize our educational services:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                  <div className="p-4 rounded-xl border border-border bg-muted/30">
                    <h3 className="font-semibold text-foreground mb-1 text-xs flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                      Account Credentials
                    </h3>
                    <p className="text-xs">Your full name and 10-digit phone number. These serve as unique identifiers to authorize and secure your student profile.</p>
                  </div>
                  <div className="p-4 rounded-xl border border-border bg-muted/30">
                    <h3 className="font-semibold text-foreground mb-1 text-xs flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                      Academic Preferences
                    </h3>
                    <p className="text-xs">Your academic category (e.g., 10th Grade, Intermediate, Diploma, B-Tech), group details (e.g., MPC, BiPC, CME), and year/semester configuration.</p>
                  </div>
                  <div className="p-4 rounded-xl border border-border bg-muted/30">
                    <h3 className="font-semibold text-foreground mb-1 text-xs flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                      Learning & Activity Logs
                    </h3>
                    <p className="text-xs">Syllabus weightages, bookmarks, exam details, and history of saved study PDFs or documents.</p>
                  </div>
                  <div className="p-4 rounded-xl border border-border bg-muted/30">
                    <h3 className="font-semibold text-foreground mb-1 text-xs flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                      AI Chat & Notes History
                    </h3>
                    <p className="text-xs">Generated notes and prompt interactions with our AI assistant. All prompts are processed securely and independently of your user credentials.</p>
                  </div>
                </div>
              </div>

              <hr className="my-8 border-border" />

              <div id="use" className="space-y-4 scroll-mt-24">
                <h2 className="font-display font-bold text-xl text-foreground flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-primary" />
                  2. How We Use Information
                </h2>
                <p>VRK Solutions uses the collected data solely for the following educational purposes:</p>
                <ul className="list-disc ml-6 space-y-2 text-xs">
                  <li><strong>Identity Authentication:</strong> Validating logins and profiles securely using Supabase Auth.</li>
                  <li><strong>Customized Syllabus Delivery:</strong> Presenting subject weightage, learning categories, and recommended study notes based on your active standard.</li>
                  <li><strong>AI-Assisted Learning:</strong> Resolving academic queries and formatting custom revision sheets through the AI Assistant.</li>
                  <li><strong>Support & Compliance:</strong> Managing support queries, maintaining legal records of deletion requests, and ensuring app security.</li>
                </ul>
              </div>

              <hr className="my-8 border-border" />

              <div id="ai-processing" className="space-y-4 scroll-mt-24">
                <h2 className="font-display font-bold text-xl text-foreground flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-primary" />
                  3. AI Processing & Privacy
                </h2>
                <p>
                  Our services feature an integrated AI Assistant. We implement strict privacy controls to isolate and protect your prompts:
                </p>
                <ul className="list-disc ml-6 space-y-2 text-xs">
                  <li><strong>Anonymization:</strong> Prompts submitted to our LLM processors are stripped of metadata, full names, or phone numbers.</li>
                  <li><strong>No Model Training:</strong> Your academic prompt history and study transcripts are not shared or sold to build public models or public databases.</li>
                  <li><strong>User Boundary:</strong> Generated notes remain mapped to your secure profile and are fully erasable by you at any time.</li>
                </ul>
              </div>

              <hr className="my-8 border-border" />

              <div id="security" className="space-y-4 scroll-mt-24">
                <h2 className="font-display font-bold text-xl text-foreground flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-primary" />
                  4. Security & Data Minimization
                </h2>
                <p>
                  We adhere strictly to the principle of **Data Minimization**. We collect only what is essential for the functionality of our educational portal.
                </p>
                <p>
                  All database and authentication transactions are routed through encrypted SSL/TLS layers. In addition, we explicitly commit to a **Zero-Monetization Policy**: we never lease, share, or sell user contact credentials, learning patterns, or phone records to advertising corporations.
                </p>
              </div>

              <hr className="my-8 border-border" />

              <div id="retention" className="space-y-4 scroll-mt-24">
                <h2 className="font-display font-bold text-xl text-foreground flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-primary" />
                  5. Data Retention & Purging
                </h2>
                <p>
                  We retain personal information only for the duration that your account remains active:
                </p>
                <p>
                  <strong>Automatic Inactivity Purging:</strong> If an account is completely inactive for a continuous period of <strong>24 months</strong>, we will designate it as dormant. After sending a prior warning notice to the registered number, we will permanently purge the account, user roles, profile settings, AI records, and log entries from our database.
                </p>
              </div>

              <hr className="my-8 border-border" />

              <div id="dpdpa" className="space-y-4 scroll-mt-24">
                <h2 className="font-display font-bold text-xl text-foreground flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-primary" />
                  6. Indian DPDP Act, 2023 Compliance
                </h2>
                <p>
                  Since VRK Solutions operates in India and serves student boards in Andhra Pradesh and Telangana, we strictly align with the <strong>Digital Personal Data Protection (DPDP) Act, 2023</strong>:
                </p>
                <ul className="list-disc ml-6 space-y-2 text-xs">
                  <li><strong>Notice & Consent:</strong> We seek clear, specific, unconditional, and revocable consent during signup.</li>
                  <li><strong>Right to Correction & Erasure:</strong> You can edit profile parameters or request complete deletion of your data at any time.</li>
                  <li><strong>Grievance Redressal:</strong> Any complaints or inquiries regarding data processing can be directly addressed to our designated Grievance Officer (see Section 11).</li>
                  <li><strong>Right to Nominate:</strong> You have the right to nominate another individual to exercise your rights in the event of death or incapacity.</li>
                </ul>
              </div>

              <hr className="my-8 border-border" />

              <div id="gdpr" className="space-y-4 scroll-mt-24">
                <h2 className="font-display font-bold text-xl text-foreground flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-primary" />
                  7. GDPR Privacy Rights
                </h2>
                <p>
                  For users accessing the app from the European Economic Area (EEA), we process personal data under the following GDPR legal bases: consent, contract fulfillment, and legitimate educational interest. Your rights include:
                </p>
                <ul className="list-disc ml-6 space-y-2 text-xs">
                  <li><strong>Right of Access & Portability:</strong> Obtain a digital breakdown of the profile data stored in our cloud.</li>
                  <li><strong>Right to Erasure ("Right to be Forgotten"):</strong> Instantly wipe your database records.</li>
                  <li><strong>Right to Restrict or Object:</strong> Restrict automated processing or object to notification dispatch.</li>
                </ul>
              </div>

              <hr className="my-8 border-border" />

              <div id="ccpa" className="space-y-4 scroll-mt-24">
                <h2 className="font-display font-bold text-xl text-foreground flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-primary" />
                  8. CCPA/CPRA California Rights
                </h2>
                <p>
                  Under the California Consumer Privacy Act (CCPA) and CPRA, California residents possess the following rights:
                </p>
                <ul className="list-disc ml-6 space-y-2 text-xs">
                  <li><strong>Right to Know & Access:</strong> Access categories of personal information collected.</li>
                  <li><strong>Do Not Sell or Share:</strong> We do not engage in the sale or sharing of student data.</li>
                  <li><strong>Right to Limit:</strong> We limit phone number processing purely to critical session logging.</li>
                  <li><strong>Non-Discrimination:</strong> We guarantee equal app features and service quality for all students exercising privacy rights.</li>
                </ul>
              </div>

              <hr className="my-8 border-border" />

              <div id="account-deletion" className="space-y-4 scroll-mt-24">
                <h2 className="font-display font-bold text-xl text-foreground flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-primary" />
                  9. Account Deletion Workflow
                </h2>
                <p>
                  We believe that users own their personal data. We provide two separate methods to permanently delete your account and erase all associated logs:
                </p>
                <ul className="list-disc ml-6 space-y-2 text-xs">
                  <li><strong>Direct Self-Serve (LoggedIn):</strong> Navigate to settings and click the "Delete Account" button. Confirm by entering your phone number. Your account, credentials, profiles, support logs, and notes will be deleted immediately in real-time.</li>
                  <li><strong>Web Request (LoggedOut):</strong> If you cannot access the app or wish to request deletion offline, you can use our public request section at `/delete-account`. Our support team will confirm your ownership and wipe the records within 48 hours.</li>
                </ul>
                <div className="p-4 rounded-xl border border-dashed border-primary/40 bg-primary/5 flex flex-col sm:flex-row items-center justify-between gap-4 mt-2">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-primary" />
                    <div>
                      <h4 className="font-semibold text-foreground text-xs">Dedicated Account Deletion Page</h4>
                      <p className="text-xs text-muted-foreground">Submit self-serve or manual unauthenticated deletion requests.</p>
                    </div>
                  </div>
                  <Button size="sm" className="gradient-primary" onClick={() => navigate("/delete-account")}>
                    Go to Account Deletion
                  </Button>
                </div>
              </div>

              <hr className="my-8 border-border" />

              <div id="children" className="space-y-4 scroll-mt-24">
                <h2 className="font-display font-bold text-xl text-foreground flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-primary" />
                  10. Children's Privacy
                </h2>
                <p>
                  We serve academic content and exam guides to students of all ages. Under India's DPDP Act 2023, data processing of minors under 18 years of age requires parental or guardian consent. We encourage parents and guardians to monitor their children's online study habits. We do not track children's general web history or target advertisements to minors.
                </p>
              </div>

              <hr className="my-8 border-border" />

              <div id="contact" className="space-y-4 scroll-mt-24">
                <h2 className="font-display font-bold text-xl text-foreground flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-primary" />
                  11. Contact & Grievance Officer
                </h2>
                <p>
                  If you have compliance inquiries, or wish to revoke consent, please contact our support desk or reach out directly to our Grievance Officer:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                  <Card className="p-4 border-border bg-muted/10 flex items-start gap-3">
                    <Mail className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-foreground text-xs">Support Email</h4>
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

                <div className="p-4 rounded-xl border border-border bg-primary/5 mt-4">
                  <h3 className="font-semibold text-foreground text-sm flex items-center gap-2 mb-2">
                    <UserCheck className="h-4 w-4 text-primary" />
                    Designated Grievance Officer (DPDPA 2023)
                  </h3>
                  <div className="text-xs space-y-1 text-muted-foreground">
                    <p><strong className="text-foreground">Name:</strong> Mr. Vineel Bavisetti</p>
                    <p><strong className="text-foreground">Designation:</strong> Data Protection & Grievance Officer</p>
                    <p><strong className="text-foreground">Email:</strong> grievance@vrk-solutions.app</p>
                    <p><strong className="text-foreground">Address:</strong> VRK Solutions, Visakhapatnam, Andhra Pradesh, India</p>
                  </div>
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
