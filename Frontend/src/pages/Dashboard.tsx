import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Navigation } from "@/components/layout/Navigation";
import { BackButton } from "@/components/layout/BackButton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Briefcase,
  TrendingUp,
  Target,
  Sparkles,
  FileText,
  Video,
  Lightbulb,
  Loader2,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

import { useAuth } from "@/hooks/useAuth";
import { getApplications } from "@/services/applicationService";
import { getInterviews, getAnalysisFeedback } from "@/services/interviewService";

type DateRange = "7" | "30" | "90";

type FeedbackTrait = {
  trait: string;
  score: number;
};

type FeedbackAnalysis = {
  strengths: FeedbackTrait[];
  weaknesses: FeedbackTrait[];
  suggestions: string[];
};

const CircularProgress = ({
  value,
  size = 48,
  strokeWidth = 4,
}: {
  value: number;
  size?: number;
  strokeWidth?: number;
}) => {
  const safeValue = Math.max(0, Math.min(100, value || 0));
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (safeValue / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="hsl(var(--muted))"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-500"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xs font-semibold text-foreground">
          {safeValue}%
        </span>
      </div>
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
  const [interviewsCompleted, setInterviewsCompleted] = useState(0);

  const [feedbackAnalysis, setFeedbackAnalysis] = useState<FeedbackAnalysis>({
    strengths: [],
    weaknesses: [],
    suggestions: [],
  });

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

        if (apps.status === "fulfilled") {
          const appList = Array.isArray(apps.value) ? apps.value : [];
          setApplicationsCount(appList.length);
        }
if (interviews.status === "fulfilled") {
  const interviewList = Array.isArray(interviews.value)
    ? interviews.value
    : [];

  setInterviewsCompleted(interviewList.length);

  const scores = interviewList
    .map((interview: any) => {
      // feedback is a JSON string, parse it to get the score
      try {
        const feedback = typeof interview.feedback === "string"
          ? JSON.parse(interview.feedback)
          : interview.feedback;
        return Number(feedback?.score) || 0;
      } catch {
        return 0;
      }
    })
    .filter((score: number) => !Number.isNaN(score) && score > 0);

  const average =
    scores.length > 0
      ? Math.round(
          scores.reduce((sum: number, score: number) => sum + score, 0) /
            scores.length
        )
      : 0;

  // score is out of 10, convert to percentage
  setAvgInterviewScore(average * 10);
}

        if (analysis.status === "fulfilled" && analysis.value) {
          // analysis.value is already unwrapped from data.payload
          // by getAnalysisFeedback in interviewService.ts
          // shape: { code, strengths, weaknesses, suggestions }
          const feedback = analysis.value;

          console.log("Feedback received:", JSON.stringify(feedback));

          const strengths = Array.isArray(feedback.strengths)
            ? feedback.strengths
            : [];

          const weaknesses = Array.isArray(feedback.weaknesses)
            ? feedback.weaknesses
            : [];

          const suggestions = Array.isArray(feedback.suggestions)
            ? feedback.suggestions
            : [];

          setFeedbackAnalysis({ strengths, weaknesses, suggestions });

          // Readiness: strengths push score up, weaknesses represent gaps (100 - score)
          const strengthAvg =
            strengths.length > 0
              ? strengths.reduce((sum, s) => sum + (Number(s.score) || 0), 0) /
                strengths.length
              : 0;

          const weaknessAvg =
            weaknesses.length > 0
              ? weaknesses.reduce(
                  (sum, w) => sum + (Number(w.score) || 0),
                  0
                ) / weaknesses.length
              : 0;

          const totalItems = strengths.length + weaknesses.length;

          const calculatedReadiness =
            totalItems > 0
              ? Math.round(
                  (strengthAvg * strengths.length +
                    (100 - weaknessAvg) * weaknesses.length) /
                    totalItems
                )
              : 0;

          setReadinessScore(calculatedReadiness);
        }

        if (analysis.status === "rejected") {
          console.warn("Analysis unavailable:", analysis.reason);
        }
      } catch (error) {
        console.error("Error loading dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [userId]);

  const trendData = useMemo(() => {
    const days = Number(dateRange);
    const data = [];
    const now = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);

      data.push({
        date: date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        readiness: readinessScore,
        interview: avgInterviewScore,
      });
    }

    return data;
  }, [dateRange, readinessScore, avgInterviewScore]);

  const kpiCards = [
    {
      label: "Applications",
      value: applicationsCount,
      icon: Briefcase,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      label: "Avg Interview Score",
      value: `${avgInterviewScore}%`,
      icon: Target,
      color: "text-accent",
      bgColor: "bg-accent/10",
    },
    {
      label: "Readiness Score",
      value: readinessScore,
      icon: TrendingUp,
      color: "text-primary",
      bgColor: "bg-primary/10",
      showRing: true,
    },
    {
      label: "Interviews Completed",
      value: interviewsCompleted,
      icon: Sparkles,
      color: "text-yellow-500",
      bgColor: "bg-yellow-500/10",
    },
  ];

  const quickActions = [
    {
      label: "Start New Application",
      icon: Briefcase,
      link: "/applications",
      variant: "default" as const,
    },
    {
      label: "Prepare for Interview",
      icon: Video,
      link: "/prepare",
      variant: "outline" as const,
    },
    {
      label: "Generate Resume",
      icon: FileText,
      link: "/cv-generator",
      variant: "outline" as const,
    },
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

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <h1 className="text-3xl md:text-4xl font-bold">Dashboard</h1>

            <Select
              value={dateRange}
              onValueChange={(value: DateRange) => setDateRange(value)}
            >
              <SelectTrigger className="w-[180px] bg-secondary border-border">
                <SelectValue placeholder="Select range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
            {kpiCards.map((kpi) => (
              <Card key={kpi.label} className="bg-card border-border shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    {kpi.showRing ? (
                      <CircularProgress
                        value={typeof kpi.value === "number" ? kpi.value : 0}
                        size={48}
                        strokeWidth={4}
                      />
                    ) : (
                      <div
                        className={`w-12 h-12 rounded-lg ${kpi.bgColor} flex items-center justify-center`}
                      >
                        <kpi.icon className={`w-6 h-6 ${kpi.color}`} />
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="text-2xl font-bold text-foreground">
                        {kpi.showRing ? `${kpi.value}%` : kpi.value}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {kpi.label}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Next Steps */}
          <Card className="bg-card border-border shadow-sm mb-8">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-yellow-500" />
                Your Next Steps
              </CardTitle>
            </CardHeader>
            <CardContent>
              {feedbackAnalysis.suggestions.length > 0 ? (
                <ul className="space-y-2">
                  {feedbackAnalysis.suggestions.map((suggestion, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-3 text-sm text-foreground"
                    >
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-medium">
                        {index + 1}
                      </span>
                      <span>{suggestion}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Complete a mock interview to get personalized tips.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Strengths & Weaknesses */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-8">
            <Card className="bg-card border-border shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold text-green-500">
                  Key Strengths
                </CardTitle>
              </CardHeader>
              <CardContent>
                {feedbackAnalysis.strengths.length > 0 ? (
                  <ul className="space-y-3">
                    {feedbackAnalysis.strengths.map((item, index) => {
                      const score = Math.max(
                        0,
                        Math.min(100, Number(item.score) || 0)
                      );
                      return (
                        <li
                          key={index}
                          className="flex items-center justify-between gap-4"
                        >
                          <span className="text-sm text-foreground">
                            {item.trait}
                          </span>
                          <div className="flex items-center gap-2">
                            <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                              <div
                                className="h-full bg-green-500 rounded-full transition-all duration-500"
                                style={{ width: `${score}%` }}
                              />
                            </div>
                            <span className="text-xs font-medium text-muted-foreground w-10 text-right">
                              {score}%
                            </span>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No strengths detected yet.
                  </p>
                )}
              </CardContent>
            </Card>

            <Card className="bg-card border-border shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold text-amber-500">
                  Areas to Improve
                </CardTitle>
              </CardHeader>
              <CardContent>
                {feedbackAnalysis.weaknesses.length > 0 ? (
                  <ul className="space-y-3">
                    {feedbackAnalysis.weaknesses.map((item, index) => {
                      const score = Math.max(
                        0,
                        Math.min(100, Number(item.score) || 0)
                      );
                      return (
                        <li
                          key={index}
                          className="flex items-center justify-between gap-4"
                        >
                          <span className="text-sm text-foreground">
                            {item.trait}
                          </span>
                          <div className="flex items-center gap-2">
                            <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                              <div
                                className="h-full bg-amber-500 rounded-full transition-all duration-500"
                                style={{ width: `${score}%` }}
                              />
                            </div>
                            <span className="text-xs font-medium text-muted-foreground w-10 text-right">
                              {score}%
                            </span>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No improvement areas detected yet.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Score Trends */}
          <Card className="bg-card border-border shadow-sm mb-8">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">
                Score Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-72 md:h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={trendData}
                    margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="hsl(var(--border))"
                    />
                    <XAxis
                      dataKey="date"
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      interval={
                        dateRange === "90" ? 13 : dateRange === "30" ? 4 : 0
                      }
                    />
                    <YAxis
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      domain={[0, 100]}
                      tickFormatter={(value) => `${value}%`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                        color: "hsl(var(--foreground))",
                      }}
                      labelStyle={{ color: "hsl(var(--foreground))" }}
                      formatter={(value: number, name: string) => [
                        `${value}%`,
                        name,
                      ]}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="readiness"
                      name="Readiness Score"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      dot={{
                        fill: "hsl(var(--primary))",
                        strokeWidth: 2,
                        r: 3,
                      }}
                      activeDot={{ r: 5 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="interview"
                      name="Avg Interview Score"
                      stroke="hsl(var(--accent))"
                      strokeWidth={2}
                      dot={{
                        fill: "hsl(var(--accent))",
                        strokeWidth: 2,
                        r: 3,
                      }}
                      activeDot={{ r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="bg-card border-border shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-3">
                {quickActions.map((action) => (
                  <Link key={action.label} to={action.link} className="flex-1">
                    <Button
                      variant={action.variant}
                      className="w-full justify-start gap-2"
                    >
                      <action.icon className="w-4 h-4" />
                      {action.label}
                    </Button>
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
