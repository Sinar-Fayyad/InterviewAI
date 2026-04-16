import { Bot, FileText, FileSignature, Linkedin, Briefcase, Mail } from "lucide-react";
import { Link } from "react-router-dom";

const features = [
  {
    icon: Bot,
    title: "Interview Preparation",
    description: "Generate tailored questions and practice with realistic mock interviews featuring emotion analysis.",
    link: "/prepare",
  },
  {
    icon: Linkedin,
    title: "LinkedIn Management",
    description: "Optimize your profile and create engaging posts with AI assistance.",
    link: "/linkedin-hub",
  },
  {
    icon: FileText,
    title: "Resume",
    description: "AI-powered creation and refinement of your resume based on your profile and job requirements.",
    link: "/cv-generator",
  },
  {
    icon: FileSignature,
    title: "Cover Letter",
    description: "Create personalized cover letters tailored to specific companies and job opportunities.",
    link: "/cover-letter",
  },
  {
    icon: Briefcase,
    title: "Application Tracker",
    description: "Track and manage all your job applications in one centralized dashboard.",
    link: "/applications",
  },
  {
    icon: Mail,
    title: "Email Generator",
    description: "Create polished professional emails using AI based on your profile and context.",
    link: "/email-generator",
  },
];

export const Features = () => {
  return (
    <section className="py-24 px-4 relative">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Everything You Need to Succeed
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Comprehensive AI-powered tools to transform your interview preparation and career journey.
          </p>
        </div>
        
        {/* Features Grid - Equal size boxes, 2x3 on large, 3x2 on small */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Link
              key={index}
              to={feature.link}
              className="group bg-card/80 border border-border rounded-xl p-6 md:p-8 shadow-card hover:shadow-glow transition-smooth hover:-translate-y-1 animate-slide-up cursor-pointer"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center mb-5 group-hover:scale-110 transition-smooth">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg md:text-xl font-semibold mb-2 text-foreground">{feature.title}</h3>
              <p className="text-sm md:text-base text-muted-foreground leading-relaxed">{feature.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};
