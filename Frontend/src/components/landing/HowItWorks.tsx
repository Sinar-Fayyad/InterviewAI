import { FileSearch, MessageSquare, BarChart3, CheckCircle } from "lucide-react";

const steps = [
  {
    icon: FileSearch,
    title: "Submit Job Description",
    description: "Paste the job posting or company details you're preparing for.",
    color: "from-primary to-primary/70",
  },
  {
    icon: MessageSquare,
    title: "AI Generates Questions",
    description: "Our AI analyzes the role and creates personalized interview questions.",
    color: "from-accent to-accent/70",
  },
  {
    icon: BarChart3,
    title: "Practice & Analyze",
    description: "Conduct mock interviews with real-time emotion and speech analysis.",
    color: "from-primary to-accent",
  },
  {
    icon: CheckCircle,
    title: "Get Feedback & Improve",
    description: "Receive detailed feedback with specific areas to improve your performance.",
    color: "from-accent to-primary",
  },
];

export const HowItWorks = () => {
  return (
    <section className="py-24 px-4 relative">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-20 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            How It Works
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Four simple steps to interview success
          </p>
        </div>
        
        {/* Steps */}
        <div className="relative">
          {/* Connecting line */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-primary via-accent to-primary opacity-30" 
               style={{ top: '80px' }} />
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
            {steps.map((step, index) => (
              <div
                key={index}
                className="relative text-center animate-slide-up"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                {/* Step Number Badge */}
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-secondary border-2 border-primary flex items-center justify-center text-sm font-bold z-10">
                  {index + 1}
                </div>
                
                {/* Icon Container */}
                <div className={`mx-auto w-32 h-32 rounded-2xl bg-gradient-to-br ${step.color} p-0.5 mb-6 shadow-glow`}>
                  <div className="w-full h-full rounded-2xl bg-secondary flex items-center justify-center">
                    <step.icon className="w-12 h-12 text-primary" />
                  </div>
                </div>
                
                {/* Content */}
                <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
