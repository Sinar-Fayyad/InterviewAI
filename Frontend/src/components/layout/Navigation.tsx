import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sparkles, Menu, User, Home, Sun, Moon, Inbox } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "next-themes";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
export const Navigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    user,
    signOut
  } = useAuth();
  const {
    theme,
    setTheme
  } = useTheme();
  const handleGetStarted = () => {
    if (user) {
      navigate("/prepare");
    } else {
      navigate("/auth");
    }
  };
  return <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/95 backdrop-blur-lg shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left Section - Menu + Logo */}
          <div className="flex items-center gap-3 flex-shrink-0">
            {user && <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <Menu className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56 bg-popover/95 backdrop-blur-lg shadow-lg border-border/50 z-[100]">
                  <DropdownMenuItem asChild>
                    <Link to="/prepare" className="cursor-pointer flex items-center gap-2 py-2">
                      <span>🎯</span> Interview Preparation
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/linkedin-hub" className="cursor-pointer flex items-center gap-2 py-2">
                      <span>💼</span> LinkedIn Management
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/cv-generator" className="cursor-pointer flex items-center gap-2 py-2">
                      <span>📄</span> Resume
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/cover-letter" className="cursor-pointer flex items-center gap-2 py-2">
                      <span>✉️</span> Cover Letter
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/applications" className="cursor-pointer flex items-center gap-2 py-2">
                      <span>📋</span> Application Tracker
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/email-generator" className="cursor-pointer flex items-center gap-2 py-2">
                      <span>📧</span> Email Generator
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>}
            
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-lg gradient-hero flex items-center justify-center shadow-glow group-hover:scale-110 transition-smooth">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl hidden sm:inline">InterviewAI</span>
            </Link>
          </div>
          
          {/* Right Actions */}
          <div className="flex items-center gap-3 flex-shrink-0">
            {user ? <>
                <Link to="/" className="flex flex-col items-center gap-1 text-foreground/80 hover:text-foreground transition-colors px-3 py-2">
                  <Home className="w-5 h-5" />
                  <span className="text-xs hidden sm:block">Home</span>
                </Link>
                
                <Link to="/inbox" className="flex flex-col items-center gap-1 text-foreground/80 hover:text-foreground transition-colors px-3 py-2">
                  <Inbox className="w-5 h-5" />
                  <span className="text-xs hidden sm:block">Inbox</span>
                </Link>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="flex flex-col items-center gap-1 h-auto py-2 hover:bg-accent">
                      <User className="w-5 h-5" />
                      <span className="text-xs hidden sm:block">Profile</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 bg-popover/95 backdrop-blur-lg shadow-lg border-border/50 z-[100]">
                    <DropdownMenuItem asChild>
                      <Link to="/profile" className="cursor-pointer flex items-center gap-2 py-2">
                        <User className="w-4 h-4" />
                        My Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="cursor-pointer flex items-center justify-between py-2">
                      <span className="flex items-center gap-2">
                        {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                        Theme
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {theme === "dark" ? "Light" : "Dark"}
                      </span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={signOut} className="cursor-pointer text-destructive focus:text-destructive">
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </> : <>
                <Link to="/" className="hidden md:inline-block text-sm font-medium text-foreground/80 hover:text-foreground transition-colors px-3 py-2">
                  Home
                </Link>
                <Button variant="default" size="sm" onClick={handleGetStarted} className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-glow">
                  Get Started
                </Button>
              </>}
          </div>
        </div>
      </div>
    </nav>;
};