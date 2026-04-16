import { Link } from "react-router-dom";
import { Navigation } from "@/components/layout/Navigation";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { BackButton } from "@/components/layout/BackButton";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Linkedin, UserCog, PenLine } from "lucide-react";

export default function LinkedInHub() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <Navigation />
        
        <main className="pt-24 pb-16 px-4">
          <div className="max-w-4xl mx-auto">
            <BackButton className="mb-6" />
            
            {/* Header */}
            <div className="mb-12 animate-fade-in text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-card/50 backdrop-blur-sm mb-6">
                <Linkedin className="w-4 h-4 text-[#0A66C2]" />
                <span className="text-sm font-medium">LinkedIn Management</span>
              </div>
              
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                LinkedIn Management
              </h1>
              <p className="text-xl text-muted-foreground">
                Optimize your profile and create engaging posts
              </p>
            </div>

            {/* Two Paths */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Optimize Profile */}
              <Card className="bg-secondary/80 border-primary/20 shadow-card p-8 hover:shadow-glow transition-smooth group">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#0A66C2] to-[#0A66C2]/70 p-0.5 mb-6">
                  <div className="w-full h-full rounded-xl bg-secondary flex items-center justify-center">
                    <UserCog className="w-7 h-7 text-[#0A66C2]" />
                  </div>
                </div>
                <h3 className="text-2xl font-semibold mb-3">Profile Optimizer</h3>
                <p className="text-muted-foreground mb-6">
                  View your profile in a LinkedIn-style layout and copy sections directly to your real LinkedIn
                </p>
                <Button variant="outline" className="w-full group-hover:bg-primary group-hover:text-primary-foreground" asChild>
                  <Link to="/linkedin-mock">View Profile</Link>
                </Button>
              </Card>

              {/* Post Generator */}
              <Card className="bg-secondary/80 border-primary/20 shadow-card p-8 hover:shadow-glow transition-smooth group">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-accent to-accent/70 p-0.5 mb-6">
                  <div className="w-full h-full rounded-xl bg-secondary flex items-center justify-center">
                    <PenLine className="w-7 h-7 text-primary" />
                  </div>
                </div>
                <h3 className="text-2xl font-semibold mb-3">Post Generator</h3>
                <p className="text-muted-foreground mb-6">
                  Create engaging LinkedIn posts with AI assistance and schedule them for optimal reach
                </p>
                <Button variant="outline" className="w-full group-hover:bg-primary group-hover:text-primary-foreground" asChild>
                  <Link to="/linkedin-posts">Get Started</Link>
                </Button>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
