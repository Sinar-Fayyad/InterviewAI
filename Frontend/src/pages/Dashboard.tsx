import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { Navigation } from "@/components/layout/Navigation";
import { BackButton } from "@/components/layout/BackButton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Briefcase, TrendingUp, Target, Sparkles, FileText, Video, Lightbulb, Loader2 } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { useAuth } from "@/hooks/useAuth";
import { getApplications } from "@/services/applicationService";
import { getInterviews, getAnalysisFeedback } from "@/services/interviewService";

type DateRange = "7" | "30" | "90";

const CircularProgress = ({ value, size = 48, strokeWidth = 4 }: { value: number; size?: number; strokeWidth?: number }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (value / 100) * circumference;
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="hsl(var(--muted))" strokeWidth={strokeWidth} />
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="hsl(var(--primary))" strokeWidth={strokeWidth} strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" className="transition-all duration-500" />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center"><span className="text-xs font-semibold text-foreground">{value}%</span></div>
    </div>
  );
};

export default function Dashboard() {
  const { userId } = useAuth();
  const [dateRange, setDateRange] = useState<DateRange>("7");
  const [loading, setLoading] = useState(true);
  const [applicationsCount, setApplicationsCount] = useState(0);
  const [avgInterviewScore, setAvgInterviewScore] = useState(0);
  const [readinessScore, setReadinessScore] = useState(0);
  const [questionsCount, setQuestionsCount] = useState(0);
  const [feedbackAnalysis, setFeedbackAnalysis] = useState<{
    strengths: { trait: string; score: number }[];
    weaknesses: { trait: string; score: number }[];
    suggestions: string[];
  }>({ strengths: [], weaknesses: [], suggestions: [] });

  useEffect(() => {
    if (!userId) return;
    const fetchDashboard = async () => {
      setLoading(true);
      try {
        const [apps, interviews, analysis] = await Promise.allSettled([
          getApplications(userId),
          getInterviews(userId),
          getAnalysisFeedback(userId),
        ]);
        
        if (apps.status === "fulfilled") setApplicationsCount(Array.isArray(apps.value) ? apps.value.length : 0);
        if (interviews.status === "fulfilled") {
          const interviewList = Array.isArray(interviews.value) ? interviews.value : [];
          const scores = interviewList.filter((i: any) => i.score).map((i: any) => i.score);
          setAvgInterviewScore(scores.length > 0 ? Math.round(scores.reduce((a: number, b: number) => a + b, 0) / scores.length) : 0);
        }
        if (analysis.status === "fulfilled" && analysis.value) {
          const a = analysis.value;
          setReadinessScore(a.readiness_score || 0);
          setQuestionsCount(a.questions_count || 0);
          setFeedbackAnalysis({
            strengths: a.strengths || [],
            weaknesses: a.weaknesses || [],
            suggestions: a.suggestions || [],
          });
        }
      } catch (error) {
        console.error("Error loading dashboard:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, [userId]);

  // Static trends using current averages or 0 (real time-series data pending backend)
  const trendData = useMemo(() => {
    const days = parseInt(dateRange);
    const data = [];
    const now = new Date();
    const r = readinessScore || 0;
    const s = avgInterviewScore || 0;
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      data.push({ date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }), readiness: r, interview: s });
    }
    return data;
  }, [dateRange, readinessScore, avgInterviewScore]);

  const kpiCards = [
    { label: "Applications", value: applicationsCount, icon: Briefcase, color: "text-primary", bgColor: "bg-primary/10" },
    { label: "Avg Interview Score", value: `${avgInterviewScore}%`, icon: Target, color: "text-accent", bgColor: "bg-accent/10" },
    { label: "Readiness Score", value: readinessScore, icon: TrendingUp, color: "text-primary", bgColor: "bg-primary/10", showRing: true },
    { label: "Questions Generated", value: questionsCount, icon: Sparkles, color: "text-yellow-500", bgColor: "bg-yellow-500/10" },
  ];

  const quickActions = [
    { label: "Start New Application", icon: Briefcase, link: "/applications", variant: "default" as const },
    { label: "Prepare for Interview", icon: Video, link: "/prepare", variant: "outline" as const },
    { label: "Generate Resume", icon: FileText, link: "/cv-generator", variant: "outline" as const },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="pt-24 pb-16 px-4 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="pt-24 pb-16 px-4">
        <div className="max-w-7xl mx-auto">
          <BackButton className="mb-6" />
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 animate-fade-in">
            <h1 className="text-3xl md:text-4xl font-bold">Dashboard</h1>
            <Select value={dateRange} onValueChange={(value: DateRange) => setDateRange(value)}>
              <SelectTrigger className="w-[180px] bg-secondary border-border"><SelectValue placeholder="Select range" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
            {kpiCards.map((kpi, index) => (
              <Card key={kpi.label} className="bg-card border-border shadow-sm animate-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    {kpi.showRing ? (
                      <CircularProgress value={typeof kpi.value === "number" ? kpi.value : 0} size={48} strokeWidth={4} />
                    ) : (
                      <div className={`w-12 h-12 rounded-lg ${kpi.bgColor} flex items-center justify-center`}><kpi.icon className={`w-6 h-6 ${kpi.color}`} /></div>
                    )}
                    <div className="flex-1">
                      <div className="text-2xl font-bold text-foreground">{kpi.showRing ? `${kpi.value}%` : kpi.value}</div>
                      <div className="text-sm text-muted-foreground">{kpi.label}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="bg-card border-border shadow-sm mb-8 animate-slide-up" style={{ animationDelay: "450ms" }}>
            <CardHeader className="pb-3"><CardTitle className="text-lg font-semibold flex items-center gap-2"><Lightbulb className="w-5 h-5 text-yellow-500" />Your Next Steps</CardTitle></CardHeader>
            <CardContent>
              {feedbackAnalysis.suggestions.length > 0 ? (
                <ul className="space-y-2">{feedbackAnalysis.suggestions.slice(0, 2).map((suggestion, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-sm text-foreground">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-medium">{idx + 1}</span>{suggestion}
                  </li>
                ))}</ul>
              ) : (<p className="text-sm text-muted-foreground">Complete a mock interview to get personalized tips.</p>)}
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-8">
            <Card className="bg-card border-border shadow-sm animate-slide-up" style={{ animationDelay: "500ms" }}>
              <CardHeader className="pb-3"><CardTitle className="text-lg font-semibold text-green-500">Key Strengths</CardTitle></CardHeader>
              <CardContent>
                <ul className="space-y-3">{feedbackAnalysis.strengths.slice(0, 2).map((s, idx) => (
                  <li key={idx} className="flex items-center justify-between">
                    <span className="text-sm text-foreground">{s.trait}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-muted rounded-full overflow-hidden"><div className="h-full bg-green-500 rounded-full transition-all duration-500" style={{ width: `${s.score}%` }} /></div>
                      <span className="text-xs font-medium text-muted-foreground w-10 text-right">{s.score}%</span>
                    </div>
                  </li>
                ))}</ul>
              </CardContent>
            </Card>
            <Card className="bg-card border-border shadow-sm animate-slide-up" style={{ animationDelay: "550ms" }}>
              <CardHeader className="pb-3"><CardTitle className="text-lg font-semibold text-amber-500">Areas to Improve</CardTitle></CardHeader>
              <CardContent>
                <ul className="space-y-3">{feedbackAnalysis.weaknesses.slice(0, 2).map((w, idx) => (
                  <li key={idx} className="flex items-center justify-between">
                    <span className="text-sm text-foreground">{w.trait}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-muted rounded-full overflow-hidden"><div className="h-full bg-amber-500 rounded-full transition-all duration-500" style={{ width: `${w.score}%` }} /></div>
                      <span className="text-xs font-medium text-muted-foreground w-10 text-right">{w.score}%</span>
                    </div>
                  </li>
                ))}</ul>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-card border-border shadow-sm mb-8 animate-slide-up" style={{ animationDelay: "600ms" }}>
            <CardHeader><CardTitle className="text-lg font-semibold">Score Trends</CardTitle></CardHeader>
            <CardContent>
              <div className="h-72 md:h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} interval={dateRange === "90" ? 13 : dateRange === "30" ? 4 : 0} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
                    <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", color: "hsl(var(--foreground))" }} labelStyle={{ color: "hsl(var(--foreground))" }} formatter={(value: number, name: string) => [`${value}%`, name]} />
                    <Legend />
                    <Line type="monotone" dataKey="readiness" name="Readiness Score" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 3 }} activeDot={{ r: 5 }} />
                    <Line type="monotone" dataKey="interview" name="Avg Interview Score" stroke="hsl(var(--accent))" strokeWidth={2} dot={{ fill: "hsl(var(--accent))", strokeWidth: 2, r: 3 }} activeDot={{ r: 5 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border shadow-sm animate-slide-up" style={{ animationDelay: "500ms" }}>
            <CardHeader><CardTitle className="text-lg font-semibold">Quick Actions</CardTitle></CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-3">
                {quickActions.map((action) => (
                  <Link key={action.label} to={action.link} className="flex-1">
                    <Button variant={action.variant} className="w-full justify-start gap-2"><action.icon className="w-4 h-4" />{action.label}</Button>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
