import { Navigation } from "@/components/layout/Navigation";
import { Hero } from "@/components/landing/Hero";
import { Features } from "@/components/landing/Features";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { Chatbot } from "@/components/Chatbot";
import { MainPageLinkedInBanner } from "@/components/MainPageLinkedInBanner";
const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <MainPageLinkedInBanner />
      <Hero />
      <Features />
      <HowItWorks />
      <Chatbot />
    </div>
  );
};
export default Index;