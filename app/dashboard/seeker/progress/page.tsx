"use client";

import { useState, useEffect } from "react";
import {
  FileText,
  User,
  Camera,
  Mic,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  ArrowRight,
  RefreshCw,
  Sparkles,
  Target,
  BarChart3,
  ChevronRight,
  Trophy,
  Clock,
  Flame,
  Star,
  Lock,
  ExternalLink,
  Lightbulb,
  CircleDashed,
  Users,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { api } from "@/utils/apiServices";
import { useRouter } from "next/navigation";

// ─── Types ───────────────────────────────────────────────────────────────────

interface MilestoneData {
  resume: boolean;
  linkedin: boolean;
  headshot: boolean;
  interview: boolean;
  coach: boolean;
}

interface ProgressData {
  careerReadinessScore: number;
  careerReady: boolean;
  milestones: MilestoneData;
  latestResume?: any;
  latestLinkedIn?: any;
  latestHeadshot?: any;
  latestInterview?: any;
  latestCoach?: any;
}

interface ApiResponse {
  success: boolean;
  data: ProgressData;
  message?: string;
}

interface MilestoneConfig {
  key: keyof MilestoneData;
  label: string;
  description: string;
  icon: React.ElementType;
  route: string;
  weight: number;
  completedLabel: string;
  pendingLabel: string;
  weakThreshold?: number;
  getCompleted: (data: ProgressData) => boolean;
  getScore: (data: ProgressData) => number;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const MILESTONES: MilestoneConfig[] = [
  {
    key: "resume",
    label: "Resume Built",
    description: "Upload and analyze your resume to get AI-powered feedback",
    icon: FileText,
    route: "/dashboard/seeker/resume",
    weight: 25,
    completedLabel: "Analyzed",
    pendingLabel: "Not uploaded",
    weakThreshold: 60,
    getCompleted: (data) => data.milestones.resume,
    getScore: (data) => {
      // Return score from latestResume if available, otherwise 0
      if (data.latestResume?.score) return data.latestResume.score;
      return data.milestones.resume ? 100 : 0;
    },
  },
  {
    key: "linkedin",
    label: "LinkedIn Optimized",
    description: "Optimize your LinkedIn profile for maximum recruiter visibility",
    icon: User,
    route: "/dashboard/seeker/linkedin",
    weight: 20,
    completedLabel: "Optimized",
    pendingLabel: "Not connected",
    weakThreshold: 60,
    getCompleted: (data) => data.milestones.linkedin,
    getScore: (data) => {
      if (data.latestLinkedIn?.score) return data.latestLinkedIn.score;
      return data.milestones.linkedin ? 100 : 0;
    },
  },
  {
    key: "headshot",
    label: "Professional Headshot",
    description: "Generate a professional AI headshot for your profile",
    icon: Camera,
    route: "/dashboard/seeker/headshot",
    weight: 15,
    completedLabel: "Generated",
    pendingLabel: "Not generated",
    weakThreshold: 1,
    getCompleted: (data) => data.milestones.headshot,
    getScore: (data) => data.milestones.headshot ? 100 : 0,
  },
  {
    key: "interview",
    label: "Mock Interview",
    description: "Practice with AI-powered mock interviews and get feedback",
    icon: Mic,
    route: "/dashboard/seeker/interview",
    weight: 20,
    completedLabel: "Completed",
    pendingLabel: "Not attempted",
    weakThreshold: 1,
    getCompleted: (data) => data.milestones.interview,
    getScore: (data) => data.milestones.interview ? 100 : 0,
  },
  {
    key: "coach",
    label: "Coach Sessions",
    description: "Book and attend personalized coaching sessions with experts",
    icon: Users,
    route: "/dashboard/seeker/coach",
    weight: 20,
    completedLabel: "Sessions Done",
    pendingLabel: "No sessions",
    weakThreshold: 1,
    getCompleted: (data) => data.milestones.coach,
    getScore: (data) => data.milestones.coach ? 100 : 0,
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

const getScoreColor = (s: number) =>
  s >= 80 ? "text-emerald-600" : s >= 60 ? "text-violet-600" : "text-amber-500";

const getScoreRing = (s: number) =>
  s >= 80 ? "stroke-emerald-500" : s >= 60 ? "stroke-violet-500" : "stroke-amber-400";

const getScoreBg = (s: number) =>
  s >= 80
    ? "bg-emerald-100 text-emerald-700"
    : s >= 60
    ? "bg-violet-100 text-violet-700"
    : "bg-amber-100 text-amber-700";

const getReadinessLabel = (s: number) =>
  s === 100
    ? "Career Ready!"
    : s >= 80
    ? "Almost There"
    : s >= 50
    ? "In Progress"
    : s >= 25
    ? "Just Getting Started"
    : "Let's Begin";

// Calculate career readiness score based on all milestones
const calculateReadinessScore = (data: ProgressData): number => {
  let totalWeightedScore = 0;
  let totalWeight = 0;

  MILESTONES.forEach((milestone) => {
    const score = milestone.getScore(data);
    const weight = milestone.weight;
    totalWeightedScore += score * weight;
    totalWeight += weight;
  });

  return Math.round(totalWeightedScore / totalWeight);
};

// Check if all milestones are completed
const isCareerReady = (data: ProgressData): boolean => {
  return MILESTONES.every((milestone) => milestone.getCompleted(data));
};

// ─── Circular Score ───────────────────────────────────────────────────────────

function CircularScore({
  score,
  label,
  icon: Icon,
  sublabel,
}: {
  score: number;
  label: string;
  icon: React.ElementType;
  sublabel: string;
}) {
  const validScore = typeof score === "number" && !isNaN(score) ? Math.min(Math.max(score, 0), 100) : 0;
  const r = 52;
  const circ = 2 * Math.PI * r;
  const offset = circ - (validScore / 100) * circ;

  return (
    <div className="flex flex-col items-center gap-3 w-full">
      <div className="flex items-center gap-2 w-full">
        <Icon className="w-4 h-4 text-indigo-600" />
        <span className="text-sm font-semibold text-gray-700">{label}</span>
      </div>
      <div className="relative w-32 h-32 flex items-center justify-center">
        <svg width="128" height="128" viewBox="0 0 130 130" className="absolute top-0 left-0">
          <circle cx="65" cy="65" r={r} fill="none" stroke="#f3f4f6" strokeWidth="10" />
          <circle
            cx="65"
            cy="65"
            r={r}
            fill="none"
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circ}
            strokeDashoffset={offset || 0}
            transform="rotate(-90 65 65)"
            className={getScoreRing(validScore)}
            style={{ transition: "stroke-dashoffset 1s ease" }}
          />
        </svg>
        <div className="relative flex items-baseline gap-0.5">
          <span className={`text-3xl font-black ${getScoreColor(validScore)}`}>{validScore}</span>
          <span className="text-xs text-gray-400 font-medium">%</span>
        </div>
      </div>
      <span className={`text-xs font-bold px-3 py-1 rounded-full ${getScoreBg(validScore)}`}>{sublabel}</span>
    </div>
  );
}

// ─── Milestone Card ───────────────────────────────────────────────────────────

function MilestoneCard({
  config,
  completed,
  score,
  isWeak,
  onNavigate,
}: {
  config: MilestoneConfig;
  completed: boolean;
  score?: number;
  isWeak: boolean;
  onNavigate: (route: string) => void;
}) {
  const Icon = config.icon;

  return (
    <div
      className={`bg-white rounded-2xl p-4 shadow-md border transition-all cursor-pointer hover:shadow-lg ${
        isWeak
          ? "border-amber-200 ring-1 ring-amber-200"
          : completed
          ? "border-emerald-100"
          : "border-gray-100"
      }`}
      onClick={() => onNavigate(config.route)}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
              completed
                ? "bg-gradient-to-br from-indigo-500 to-purple-600"
                : "bg-gray-100"
            }`}
          >
            <Icon className={`w-5 h-5 ${completed ? "text-white" : "text-gray-400"}`} />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900">{config.label}</p>
            <p className="text-xs text-gray-400 mt-0.5">{config.weight}% of readiness</p>
          </div>
        </div>

        {completed ? (
          <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
        ) : (
          <CircleDashed className="w-5 h-5 text-gray-300 shrink-0 mt-0.5" />
        )}
      </div>

      {/* Score / Status */}
      {completed && score !== undefined ? (
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-500">Score</span>
            <span className={`text-xs font-bold ${getScoreColor(score)}`}>{score}/100</span>
          </div>
          <Progress value={score} className="h-1.5" />
        </div>
      ) : (
        <p className="text-xs text-gray-400 mb-3 leading-relaxed">{config.description}</p>
      )}

      {/* Status Badge */}
      <div className="flex items-center justify-between">
        <Badge
          variant="secondary"
          className={`text-xs ${
            completed
              ? "bg-emerald-100 text-emerald-700"
              : "bg-gray-100 text-gray-500"
          }`}
        >
          {completed ? config.completedLabel : config.pendingLabel}
        </Badge>

        {isWeak && (
          <Badge className="text-xs bg-amber-100 text-amber-700 border-0">
            Needs Improvement
          </Badge>
        )}
      </div>
    </div>
  );
}

// ─── Timeline Step ────────────────────────────────────────────────────────────

function TimelineStep({
  config,
  completed,
  isLast,
  index,
  onNavigate,
}: {
  config: MilestoneConfig;
  completed: boolean;
  isLast: boolean;
  index: number;
  onNavigate: (route: string) => void;
}) {
  const Icon = config.icon;

  return (
    <div 
      className="flex gap-4 cursor-pointer hover:bg-gray-50 rounded-lg transition-colors p-2 -m-2"
      onClick={() => onNavigate(config.route)}
    >
      <div className="flex flex-col items-center">
        <div
          className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-all ${
            completed
              ? "bg-gradient-to-br from-indigo-500 to-purple-600 shadow-md"
              : "bg-gray-100 border-2 border-dashed border-gray-300"
          }`}
        >
          {completed ? (
            <CheckCircle className="w-4 h-4 text-white" />
          ) : (
            <span className="text-xs font-bold text-gray-400">{index + 1}</span>
          )}
        </div>
        {!isLast && (
          <div className={`w-0.5 flex-1 mt-1 min-h-8 ${completed ? "bg-indigo-200" : "bg-gray-200"}`} />
        )}
      </div>

      <div className="pb-6 flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <Icon className={`w-4 h-4 shrink-0 ${completed ? "text-indigo-600" : "text-gray-400"}`} />
          <span className={`text-sm font-semibold ${completed ? "text-gray-900" : "text-gray-400"}`}>
            {config.label}
          </span>
          {completed && (
            <Badge className="text-[10px] bg-emerald-100 text-emerald-700 border-0 px-2 py-0">
              Done
            </Badge>
          )}
        </div>
        <p className={`text-xs mt-0.5 ${completed ? "text-gray-500" : "text-gray-300"}`}>
          {config.description}
        </p>
      </div>
    </div>
  );
}

// ─── Suggestion Card ──────────────────────────────────────────────────────────

function SuggestionCard({
  config,
  isWeak,
  completed,
  score,
  onNavigate,
}: {
  config: MilestoneConfig;
  isWeak: boolean;
  completed: boolean;
  score?: number;
  onNavigate: (route: string) => void;
}) {
  const Icon = config.icon;

  const getMessage = () => {
    if (!completed) {
      return `Complete your ${config.label.toLowerCase()} to boost your readiness score by ${config.weight}%.`;
    }
    if (isWeak && score !== undefined) {
      return `Your ${config.label.toLowerCase()} score is ${score}/100. Improving it can significantly strengthen your profile.`;
    }
    return null;
  };

  const message = getMessage();
  if (!message) return null;

  return (
    <div 
      className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-100 rounded-xl cursor-pointer hover:bg-amber-100 transition-colors"
      onClick={() => onNavigate(config.route)}
    >
      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-amber-500 flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-800">{config.label}</p>
        <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">{message}</p>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onNavigate(config.route);
          }}
          className="mt-2 text-xs font-semibold text-indigo-600 flex items-center gap-1 hover:gap-1.5 transition-all"
        >
          Go to {config.label} <ArrowRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ProgressPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [data, setData] = useState<ProgressData | null>(null);

  useEffect(() => {
    fetchProgress();
  }, []);

  const fetchProgress = async () => {
    setLoading(true);
    setError("");
    try {
      const response = (await api.get("/api/progress")) as ApiResponse;

      if (response && response.success) {
        const rawData = response.data;
        // Calculate readiness based on all 5 milestones
        const calculatedScore = calculateReadinessScore(rawData);
        const calculatedReady = isCareerReady(rawData);
        
        setData({
          ...rawData,
          careerReadinessScore: calculatedScore,
          careerReady: calculatedReady,
        });
      } else {
        setError(response?.message || "Failed to load progress data.");
      }
    } catch (err: any) {
      console.error("Progress fetch error:", err);
      if (!err.message?.includes("Session expired")) {
        setError(err.message || "Something went wrong while loading your progress.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleNavigate = (route: string) => {
    router.push(route);
  };

  // Use calculated values
  const completedCount = data ? MILESTONES.filter((m) => m.getCompleted(data)).length : 0;
  const totalMilestones = MILESTONES.length;
  const careerReady = data ? isCareerReady(data) : false;
  const readinessScore = data ? calculateReadinessScore(data) : 0;

  const weakMilestones = data
    ? MILESTONES.filter((m) => {
        const completed = m.getCompleted(data);
        if (!completed) return false;
        
        const score = m.getScore(data);
        return m.weakThreshold !== undefined && score < m.weakThreshold;
      })
    : [];

  const incompleteMilestones = data
    ? MILESTONES.filter((m) => !m.getCompleted(data))
    : [];

  const suggestionMilestones = [...incompleteMilestones, ...weakMilestones];

  // ── Skeleton ──
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4 sm:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-200 rounded-xl" />
              <div className="h-8 bg-gray-200 rounded w-48" />
            </div>
            <div className="grid lg:grid-cols-2 gap-6">
              <div className="h-64 bg-gray-200 rounded-2xl" />
              <div className="h-64 bg-gray-200 rounded-2xl" />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-48 bg-gray-200 rounded-2xl" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="p-4 sm:p-6 max-w-7xl mx-auto">

        {/* ── Header ── */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-md shrink-0">
                <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                Career Progress
              </h1>
            </div>

            {data && (
              <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full shadow-sm border border-gray-200">
                <Trophy className="w-3.5 h-3.5 text-indigo-500" />
                <span className="text-xs text-gray-600">{completedCount}/{totalMilestones} done</span>
              </div>
            )}
          </div>
          <p className="text-gray-500 ml-12 sm:ml-14 text-xs sm:text-sm">
            Track your journey to landing your dream job
          </p>
        </div>

        {/* ── Error ── */}
        {error && (
          <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-xl mb-6">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
            <p className="text-sm text-red-600">{error}</p>
            <button
              onClick={fetchProgress}
              className="ml-auto flex items-center gap-1 text-xs text-red-500 hover:text-red-700 font-semibold"
            >
              <RefreshCw className="w-3 h-3" /> Retry
            </button>
          </div>
        )}

        {data && (
          <div className="space-y-6">

            {/* ── Row 1: Readiness + Timeline ── */}
            <div className="grid lg:grid-cols-2 gap-6">

              {/* Readiness Card */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-indigo-50 to-transparent">
                  <h2 className="text-base sm:text-lg font-bold text-gray-900 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600" />
                    Career Readiness
                  </h2>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Your overall readiness to enter the job market
                  </p>
                </div>

                <div className="p-5 flex flex-col items-center gap-4">
                  <CircularScore
                    score={readinessScore}
                    label="Readiness Score"
                    icon={Target}
                    sublabel={getReadinessLabel(readinessScore)}
                  />

                  {/* Overall progress bar */}
                  <div className="w-full">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-gray-500 font-medium">Overall Progress</span>
                      <span className="text-xs font-bold text-indigo-600">{readinessScore}%</span>
                    </div>
                    <Progress value={readinessScore} className="h-2.5" />
                  </div>

                  {/* Stats row */}
                  <div className="grid grid-cols-3 gap-3 w-full">
                    {[
                      { icon: CheckCircle, label: "Completed", value: completedCount, color: "text-emerald-600", bg: "bg-emerald-50" },
                      { icon: Clock, label: "Remaining", value: totalMilestones - completedCount, color: "text-amber-500", bg: "bg-amber-50" },
                      { icon: Flame, label: "Weak Areas", value: weakMilestones.length, color: "text-orange-500", bg: "bg-orange-50" },
                    ].map(({ icon: I, label, value, color, bg }) => (
                      <div key={label} className={`${bg} rounded-xl p-3 flex flex-col items-center gap-1`}>
                        <I className={`w-4 h-4 ${color}`} />
                        <span className={`text-lg font-black ${color}`}>{value}</span>
                        <span className="text-[10px] text-gray-500 font-medium text-center">{label}</span>
                      </div>
                    ))}
                  </div>

                  {careerReady && (
                    <div className="w-full flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl">
                      <Star className="w-4 h-4 text-emerald-500 shrink-0" />
                      <p className="text-xs font-semibold text-emerald-700">
                        🎉 Congratulations! You're career ready!
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Journey Timeline */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-indigo-50 to-transparent">
                  <h2 className="text-base sm:text-lg font-bold text-gray-900 flex items-center gap-2">
                    <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600" />
                    Your Journey
                  </h2>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Step-by-step progress toward career readiness
                  </p>
                </div>

                <div className="p-5">
                  {MILESTONES.map((m, i) => (
                    <TimelineStep
                      key={m.key}
                      config={m}
                      completed={m.getCompleted(data)}
                      isLast={i === MILESTONES.length - 1}
                      index={i}
                      onNavigate={handleNavigate}
                    />
                  ))}

                  {/* Final node */}
                  <div className="flex gap-4 mt-2">
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                          careerReady
                            ? "bg-gradient-to-br from-emerald-500 to-teal-500 shadow-md"
                            : "bg-gray-100 border-2 border-dashed border-gray-300"
                        }`}
                      >
                        {careerReady ? (
                          <Trophy className="w-4 h-4 text-white" />
                        ) : (
                          <Lock className="w-4 h-4 text-gray-300" />
                        )}
                      </div>
                    </div>
                    <div className="flex-1">
                      <span className={`text-sm font-semibold ${careerReady ? "text-emerald-600" : "text-gray-300"}`}>
                        Career Ready 🎉
                      </span>
                      <p className="text-xs text-gray-400 mt-0.5">Complete all 5 milestones to unlock</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Row 2: Milestone Cards ── */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <h2 className="text-base font-bold text-gray-900">Milestone Breakdown</h2>
                <span className="text-xs text-gray-400 ml-1">— click any card to navigate</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-4">
                {MILESTONES.map((m) => {
                  const completed = m.getCompleted(data);
                  const score = m.getScore(data);
                  const isWeak = completed && m.weakThreshold !== undefined && score < m.weakThreshold;

                  return (
                    <MilestoneCard
                      key={m.key}
                      config={m}
                      completed={completed}
                      score={score}
                      isWeak={isWeak}
                      onNavigate={handleNavigate}
                    />
                  );
                })}
              </div>
            </div>

            {/* ── Row 3: AI Suggestions (only when there are suggestions) ── */}
            {suggestionMilestones.length > 0 && (
              <Card className="shadow-md border-amber-100">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Lightbulb className="w-4 h-4 text-amber-500" />
                    AI Recommendations
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Targeted actions to increase your career readiness score
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {MILESTONES.map((m) => {
                    const completed = m.getCompleted(data);
                    const score = m.getScore(data);
                    const isWeak = completed && m.weakThreshold !== undefined && score < m.weakThreshold;
                    const shouldShow = !completed || isWeak;
                    
                    if (!shouldShow) return null;

                    return (
                      <SuggestionCard
                        key={m.key}
                        config={m}
                        isWeak={isWeak}
                        completed={completed}
                        score={score}
                        onNavigate={handleNavigate}
                      />
                    );
                  })}
                </CardContent>
              </Card>
            )}

            {/* ── All Done Banner ── */}
            {careerReady && (
              <div className="rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 p-6 shadow-lg">
                <div className="flex items-center gap-3 mb-2">
                  <Trophy className="w-6 h-6 text-white shrink-0" />
                  <h3 className="text-lg font-bold text-white">You're Career Ready!</h3>
                </div>
                <p className="text-sm text-emerald-100 leading-relaxed mb-4">
                  Your profile is fully optimized and you are now career ready.
                </p>
                <button
                  onClick={() => handleNavigate("/dashboard/seeker/coach")}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-emerald-700 rounded-xl text-sm font-bold hover:bg-emerald-50 transition-colors shadow-sm"
                >
                  Continue Your Journey <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}

          </div>
        )}

        {/* ── Empty State ── */}
        {!data && !error && !loading && (
          <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-8 sm:p-12 text-center flex flex-col items-center gap-4">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
              <BarChart3 className="w-10 h-10 sm:w-12 sm:h-12 text-indigo-300" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-gray-900">No Progress Data Yet</h3>
              <p className="text-xs sm:text-sm text-gray-400 mt-1 max-w-xs mx-auto">
                Start completing milestones to see your career readiness score here
              </p>
            </div>
            <div className="flex items-center gap-2 mt-2 flex-wrap justify-center">
              {[
                { step: "1", text: "Upload Resume", route: "/dashboard/seeker/resume" },
                { step: "2", text: "Optimize LinkedIn", route: "/dashboard/seeker/linkedin" },
                { step: "3", text: "Get Headshot", route: "/dashboard/seeker/headshot" },
                { step: "4", text: "Mock Interview", route: "/dashboard/seeker/interview" },
                { step: "5", text: "Coach Session", route: "/dashboard/seeker/coach" }
              ].map((item, i) => (
                <div key={item.step} className="flex items-center gap-2">
                  <button
                    onClick={() => handleNavigate(item.route)}
                    className="flex items-center gap-1.5 text-xs text-gray-500 bg-gray-50 border border-gray-200 rounded-full px-3 py-1.5 hover:bg-gray-100 transition-colors"
                  >
                    <span className="w-4 h-4 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                      {item.step}
                    </span>
                    {item.text}
                  </button>
                  {i < 4 && <ChevronRight className="w-3.5 h-3.5 text-gray-300 shrink-0" />}
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}