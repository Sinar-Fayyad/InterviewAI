import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { ProfileGuard } from "@/components/auth/ProfileGuard";
import { Chatbot } from "@/components/Chatbot";
import Footer from "@/components/Footer";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import ResetPassword from "./pages/ResetPassword";
import Onboarding from "./pages/Onboarding";
import Profile from "./pages/Profile";
import Prepare from "./pages/Prepare";
import Dashboard from "./pages/Dashboard";
import InterviewQuestions from "./pages/InterviewQuestions";
import MockInterview from "./pages/MockInterview";
import SaveInterview from "./pages/SaveInterview";
import CVGenerator from "./pages/CVGenerator";
import CVOutput from "./pages/CVOutput";
import CoverLetter from "./pages/CoverLetter";
import LinkedInHub from "./pages/LinkedInHub";
import LinkedInPosts from "./pages/LinkedInManager";
import LinkedInScheduledPosts from "./pages/LinkedInScheduledPosts";
import Inbox from "./pages/Inbox";
import NotFound from "./pages/NotFound";
import InterviewsLibrary from "./pages/InterviewsLibrary";
import ApplicationTracker from "./pages/ApplicationTracker";
import EmailGenerator from "./pages/EmailGenerator";
import LinkedInOptimizer from "./pages/LinkedInOptimizer";
import LinkedInMock from "./pages/LinkedInMock";
import SkillsManager from "./pages/SkillsManager";
import QuestionHistory from "./pages/QuestionHistory";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
<Sonner />
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <AuthProvider>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            {/* Auth required, no profile check */}
            <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

            {/* No login required for generation */}
            <Route path="/email-generator" element={<EmailGenerator />} />
            <Route path="/linkedin-posts" element={<LinkedInPosts />} />
            <Route path="/cv-generator" element={<CVGenerator />} />
            <Route path="/cv-output" element={<CVOutput />} />
            <Route path="/cover-letter" element={<CoverLetter />} />

            {/* Profile guard (login + onboarding required) */}
            <Route path="/dashboard" element={<ProfileGuard><Dashboard /></ProfileGuard>} />
            <Route path="/prepare" element={<ProfileGuard><Prepare /></ProfileGuard>} />
            <Route path="/interview-questions" element={<ProfileGuard><InterviewQuestions /></ProfileGuard>} />
            <Route path="/mock-interview" element={<ProfileGuard><MockInterview /></ProfileGuard>} />
            <Route path="/save-interview" element={<ProfileGuard><SaveInterview /></ProfileGuard>} />
            <Route path="/linkedin-hub" element={<ProfileGuard><LinkedInHub /></ProfileGuard>} />
            <Route path="/linkedin-scheduled-posts" element={<ProfileGuard><LinkedInScheduledPosts /></ProfileGuard>} />
            <Route path="/inbox" element={<ProfileGuard><Inbox /></ProfileGuard>} />
            <Route path="/interviews-library" element={<ProfileGuard><InterviewsLibrary /></ProfileGuard>} />
            <Route path="/applications" element={<ProfileGuard><ApplicationTracker /></ProfileGuard>} />
            <Route path="/linkedin-optimizer" element={<ProfileGuard><LinkedInOptimizer /></ProfileGuard>} />
            <Route path="/linkedin-mock" element={<ProfileGuard><LinkedInMock /></ProfileGuard>} />
            <Route path="/skills" element={<ProfileGuard><SkillsManager /></ProfileGuard>} />
            <Route path="/question-history" element={<ProfileGuard><QuestionHistory /></ProfileGuard>} />

            <Route path="*" element={<NotFound />} />
          </Routes>
          <Chatbot />
          <Footer />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
