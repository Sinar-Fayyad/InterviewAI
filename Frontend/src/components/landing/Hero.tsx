import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
export const Hero = () => {
  return <section className="relative min-h-screen flex items-center justify-center overflow-hidden px-4">
      {/* Animated mesh gradient background */}
      <div className="absolute inset-0 gradient-mesh opacity-60" />
      
      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto text-center animate-fade-in">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-card/50 backdrop-blur-sm animate-slide-up my-[80px] mb-[10px]">
          <Sparkles className="w-4 h-4 text-accent" />
          <span className="text-sm font-medium">AI-Powered Interview Mastery</span>
        </div>
        
        {/* Heading */}
        <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent leading-tight">
          Ace Your Next Interview
          <br />
          With AI Confidence
        </h1>
        
        {/* Subheading */}
        <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed">
          From job description to interview mastery. Get personalized questions, real-time feedback, 
          and expert guidance powered by advanced AI.
        </p>
        
        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/prepare">
            <Button variant="hero" size="lg" className="group">
              Start Preparing
              <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
          <Link to="/dashboard">
            <Button variant="outline" size="lg">
              View Dashboard
            </Button>
          </Link>
        </div>
        
        {/* Stats */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto">
          {[{
          value: "10,000+",
          label: "Interviews Successfully Analyzed",
          description: "Real interviews processed"
        }, {
          value: "95%",
          label: "Candidate Success Rate",
          description: "Got their dream job"
        }, {
          value: "100%",
          label: "AI-Powered Feedback",
          description: "Personalized insights"
        }].map((stat, index) => <div key={index} className="text-center animate-slide-up" style={{
          animationDelay: `${index * 100}ms`
        }}>
              <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary via-primary to-accent bg-clip-text text-transparent mb-2">
                {stat.value}
              </div>
              <div className="text-base md:text-lg font-semibold mb-1">{stat.label}</div>
              <div className="text-sm text-muted-foreground/80">{stat.description}</div>
            </div>)}
        </div>
      </div>
      
      {/* Decorative elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/20 rounded-full blur-3xl" />
    </section>;
};