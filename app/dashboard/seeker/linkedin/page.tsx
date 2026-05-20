"use client";

import { useEffect, useRef, useState } from "react";
import {
  User, CheckCircle, AlertCircle, TrendingUp, Lightbulb,
  ThumbsUp, ThumbsDown, Sparkles, Target, Zap, ArrowRight,
  RefreshCw, Clock, Star, Brain, Search, Cpu, Award,
  ChevronRight, BarChart3, Hash, FileText, Tag,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// ── Score helpers (same as resume page) ──────────────────────
const getScoreColor = (s: number) => s >= 80 ? "text-emerald-600" : s >= 60 ? "text-violet-600" : "text-amber-500";
const getScoreRing  = (s: number) => s >= 80 ? "stroke-emerald-500" : s >= 60 ? "stroke-violet-500" : "stroke-amber-400";
const getScoreLabel = (s: number) => s >= 80 ? "Excellent" : s >= 60 ? "Good" : s >= 40 ? "Average" : "Needs Work";
const getScoreBg    = (s: number) => s >= 80 ? "bg-emerald-100 text-emerald-700" : s >= 60 ? "bg-violet-100 text-violet-700" : "bg-amber-100 text-amber-700";
const safeArr       = (v: any): string[] => Array.isArray(v) ? v : typeof v === "string" && v.trim() ? [v] : [];

const getToken = () => typeof window !== "undefined" ? localStorage.getItem("token") : null;

// ── Loader (same component as resume page) ───────────────────
const LOADER_STEPS = [
  { icon: Search, label: "Reading profile…",         detail: "Parsing your LinkedIn data" },
  { icon: Brain,      label: "Running AI analysis…",     detail: "Evaluating content & tone" },
  { icon: Target,     label: "Scoring keywords…",        detail: "Checking recruiter visibility" },
  { icon: Cpu,        label: "Calculating scores…",      detail: "Profile completeness & headline" },
  { icon: Award, label: "Finalizing results…",      detail: "Almost ready!" },
];

function AnalysisLoader() {
  const [progress, setProgress]   = useState(0);
  const [stepIndex, setStepIndex] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setProgress(prev => {
        if (prev >= 95) return prev;
        const inc = prev < 40 ? 2 : prev < 70 ? 1.2 : prev < 90 ? 0.6 : 0.2;
        return Math.min(prev + inc, 95);
      });
    }, 120);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  useEffect(() => {
    setStepIndex(progress < 20 ? 0 : progress < 45 ? 1 : progress < 65 ? 2 : progress < 85 ? 3 : 4);
  }, [progress]);

  const CurrentIcon = LOADER_STEPS[stepIndex].icon;

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 flex flex-col items-center gap-6">
      <div className="relative w-28 h-28 flex items-center justify-center">
        <svg className="absolute inset-0 animate-spin" style={{ animationDuration: "2s" }} viewBox="0 0 112 112">
          <circle cx="56" cy="56" r="50" fill="none" stroke="#e0e7ff" strokeWidth="6" />
          <circle cx="56" cy="56" r="50" fill="none" stroke="url(#ligrad)" strokeWidth="6"
            strokeLinecap="round" strokeDasharray="80 235" />
          <defs>
            <linearGradient id="ligrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#6366f1" />
              <stop offset="100%" stopColor="#a855f7" />
            </linearGradient>
          </defs>
        </svg>
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center animate-pulse">
          <CurrentIcon className="w-7 h-7 text-indigo-600" />
        </div>
      </div>

      <div className="text-center">
        <p className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
          {Math.round(progress)}%
        </p>
        <p className="text-base font-semibold text-gray-800 mt-1">{LOADER_STEPS[stepIndex].label}</p>
        <p className="text-xs text-gray-400 mt-0.5">{LOADER_STEPS[stepIndex].detail}</p>
      </div>

      <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex items-center gap-2 w-full justify-between">
        {LOADER_STEPS.map((step, i) => {
          const StepIcon = step.icon;
          const done = i < stepIndex, active = i === stepIndex;
          return (
            <div key={i} className="flex flex-col items-center gap-1 flex-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                done ? "bg-indigo-600 text-white shadow-md" : active ? "bg-indigo-100 text-indigo-600 ring-2 ring-indigo-400 ring-offset-1" : "bg-gray-100 text-gray-300"
              }`}>
                {done ? <CheckCircle className="w-4 h-4" /> : <StepIcon className="w-4 h-4" />}
              </div>
              <span className={`text-[10px] font-medium text-center leading-tight hidden sm:block ${
                active ? "text-indigo-600" : done ? "text-gray-500" : "text-gray-300"
              }`}>{step.label.replace("…", "")}</span>
            </div>
          );
        })}
      </div>

      <p className="text-xs text-gray-400 text-center">
        This usually takes 20–40 seconds. Please don't close the page.
      </p>
    </div>
  );
}

// ── Circular score ring (same as resume page) ────────────────
function CircularScore({ score, label, icon: Icon, sublabel }: {
  score: number; label: string; icon: React.ElementType; sublabel: string;
}) {
  const r = 44, circ = 2 * Math.PI * r;
  return (
    <div className="flex flex-col items-center gap-2 w-full">
      <div className="flex items-center gap-1.5 w-full">
        <Icon className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
        <span className="text-xs font-semibold text-gray-600 leading-tight">{label}</span>
      </div>
      <div className="relative w-24 h-24 flex items-center justify-center">
        <svg width="96" height="96" viewBox="0 0 96 96" className="absolute top-0 left-0">
          <circle cx="48" cy="48" r={r} fill="none" stroke="#f3f4f6" strokeWidth="8" />
          <circle cx="48" cy="48" r={r} fill="none" strokeWidth="8" strokeLinecap="round"
            strokeDasharray={circ} strokeDashoffset={circ - (score / 100) * circ}
            transform="rotate(-90 48 48)" className={getScoreRing(score)}
            style={{ transition: "stroke-dashoffset 1s ease" }} />
        </svg>
        <div className="relative flex items-baseline gap-0.5">
          <span className={`text-2xl font-black ${getScoreColor(score)}`}>{score}</span>
          <span className="text-[10px] text-gray-400 font-medium">/100</span>
        </div>
      </div>
      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${getScoreBg(score)}`}>{sublabel}</span>
    </div>
  );
}

// ── Types ────────────────────────────────────────────────────
interface LinkedInResult {
  id?: string;
  profileUrl?: string;
  score: number;
  profileCompletenessScore: number;
  keywordOptimizationScore: number;
  headlineScore: number;
  aboutScore: number;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  recommendedKeywords: string[];
  personalBrandingTips: string[];
  summary: string;
  aiGeneratedAt?: string;
  createdAt?: string;
}

interface HistoryItem {
  id: string;
  profile_url?: string;
  profile_text?: string;
  score?: number;
  profile_completeness_score?: number;
  keyword_optimization_score?: number;
  headline_score?: number;
  about_score?: number;
  strengths?: string[];
  weaknesses?: string[];
  suggestions?: string[];
  recommended_keywords?: string[];
  personal_branding_tips?: string[];
  ai_summary?: string;
  ai_generated_at?: string;
  created_at?: string;
}

const mapHistory = (item: HistoryItem): LinkedInResult => ({
  id: item.id,
  profileUrl: item.profile_url,
  score: item.score || 0,
  profileCompletenessScore: item.profile_completeness_score || 0,
  keywordOptimizationScore: item.keyword_optimization_score || 0,
  headlineScore: item.headline_score || 0,
  aboutScore: item.about_score || 0,
  strengths: item.strengths || [],
  weaknesses: item.weaknesses || [],
  suggestions: item.suggestions || [],
  recommendedKeywords: item.recommended_keywords || [],
  personalBrandingTips: item.personal_branding_tips || [],
  summary: item.ai_summary || "",
  aiGeneratedAt: item.ai_generated_at,
  createdAt: item.created_at,
});

// ── Main Page ────────────────────────────────────────────────
export default function LinkedInAnalysisPage() {
  const [profileUrl, setProfileUrl]   = useState("");
  const [profileText, setProfileText] = useState("");
  const [loading, setLoading]         = useState(false);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [result, setResult]           = useState<LinkedInResult | null>(null);
  const [history, setHistory]         = useState<HistoryItem[]>([]);
  const [error, setError]             = useState("");

  const fetchHistory = async () => {
    try {
      setHistoryLoading(true);
      const token = getToken();
      if (!token) { setHistory([]); return; }
      const res  = await fetch(`${API_URL}/api/linkedin/history`, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (data.success) {
        const list: HistoryItem[] = data.data || [];
        setHistory(list);
        if (list.length > 0) setResult(mapHistory(list[0]));
      }
    } catch { /* silent */ }
    finally { setHistoryLoading(false); }
  };

  useEffect(() => { fetchHistory(); }, []);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!profileUrl.trim() && !profileText.trim())
      return setError("Please provide a LinkedIn profile URL or paste your profile text.");

    const token = getToken();
    if (!token) return setError("Please login first.");

    setLoading(true);
    setResult(null);
    try {
      const res  = await fetch(`${API_URL}/api/linkedin/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ profileUrl, profileText }),
      });
      const data = await res.json();
      if (data.success) { setResult(data.data); await fetchHistory(); }
      else setError(data.message || "Analysis failed.");
    } catch { setError("Something went wrong. Please try again."); }
    finally { setLoading(false); }
  };

  const loadHistoryItem = (item: HistoryItem) => {
    setResult(mapHistory(item));
    setProfileUrl(item.profile_url || "");
    setProfileText(item.profile_text || "");
    setError("");
  };

  const SCORE_CARDS = result ? [
    { label: "Overall Score",        score: result.score,                    icon: BarChart3,  sub: getScoreLabel(result.score) },
    { label: "Profile Completeness", score: result.profileCompletenessScore, icon: Hash,     sub: getScoreLabel(result.profileCompletenessScore) },
    { label: "Keyword Optimization", score: result.keywordOptimizationScore, icon: Tag,        sub: getScoreLabel(result.keywordOptimizationScore) },
    { label: "Headline Score",       score: result.headlineScore,            icon: Star,       sub: getScoreLabel(result.headlineScore) },
    { label: "About Score",          score: result.aboutScore,               icon: FileText, sub: getScoreLabel(result.aboutScore) },
  ] : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="p-4 sm:p-6 max-w-7xl mx-auto">

        {/* ── Header ── */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-md shrink-0">
              <User className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">LinkedIn Profile Analyzer</h1>
          </div>
          <p className="text-gray-500 ml-12 sm:ml-14 text-xs sm:text-sm">
            Paste your LinkedIn profile and get AI-powered insights to boost your visibility
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 lg:gap-8 items-start">

          {/* ── Left: Input Panel (takes 1 col) ── */}
          <div className="lg:col-span-1 flex flex-col gap-5">

            {/* Input Form */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="p-4 sm:p-5 border-b border-gray-100 bg-gradient-to-r from-indigo-50 to-transparent">
                <h2 className="text-base sm:text-lg font-bold text-gray-900 flex items-center gap-2">
                  <User className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600" />
                  Analyze Your Profile
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">Enter URL or paste profile text</p>
              </div>

              <div className="p-4 sm:p-5 space-y-4">
                {/* URL input */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                    LinkedIn Profile URL
                  </label>
                  <input
                    type="url"
                    value={profileUrl}
                    onChange={e => setProfileUrl(e.target.value)}
                    placeholder="https://www.linkedin.com/in/your-profile"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all"
                  />
                </div>

                {/* Divider */}
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px bg-gray-100" />
                  <span className="text-xs text-gray-400 font-medium">or</span>
                  <div className="flex-1 h-px bg-gray-100" />
                </div>

                {/* Text area */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                    Paste Profile Text
                  </label>
                  <textarea
                    value={profileText}
                    onChange={e => setProfileText(e.target.value)}
                    rows={12}
                    placeholder="Paste your headline, about section, experience, skills…"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all resize-none leading-relaxed"
                  />
                </div>

                {/* Analyze button */}
                <button
                  onClick={handleAnalyze}
                  disabled={loading}
                  className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold text-sm flex items-center justify-center gap-2 shadow-md hover:from-indigo-700 hover:to-purple-700 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-y-0"
                >
                  {loading
                    ? <><RefreshCw className="w-4 h-4 animate-spin" />Analyzing…</>
                    : <>Analyze Profile<ArrowRight className="w-4 h-4" /></>}
                </button>

                {/* Error */}
                {error && (
                  <div className="flex items-start gap-2 px-3 py-2.5 bg-red-50 border border-red-200 rounded-xl">
                    <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                    <p className="text-xs text-red-600">{error}</p>
                  </div>
                )}
              </div>
            </div>

            {/* ── History Sidebar ── */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="p-4 sm:p-5 border-b border-gray-100 bg-gradient-to-r from-indigo-50 to-transparent">
                <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-indigo-600" />
                  Analysis History
                </h2>
              </div>
              <div className="p-3 max-h-72 overflow-y-auto">
                {historyLoading ? (
                  <div className="flex items-center gap-2 p-3 text-gray-400">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span className="text-xs">Loading history…</span>
                  </div>
                ) : history.length === 0 ? (
                  <div className="text-center py-6">
                    <Clock className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                    <p className="text-xs text-gray-400">No history yet</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {history.map(item => (
                      <button
                        key={item.id}
                        onClick={() => loadHistoryItem(item)}
                        className="w-full text-left p-3 rounded-xl border border-gray-100 hover:border-indigo-200 hover:bg-indigo-50/50 transition-all group"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${getScoreBg(item.score || 0)}`}>
                            Score: {item.score || 0}
                          </span>
                          <ChevronRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-indigo-400 transition-colors" />
                        </div>
                        {item.profile_url && (
                          <p className="text-xs text-indigo-500 truncate">{item.profile_url}</p>
                        )}
                        <p className="text-[10px] text-gray-400 mt-1">
                          {item.created_at ? new Date(item.created_at).toLocaleDateString() : ""}
                        </p>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── Right: Loader / Results / Empty (takes 2 cols) ── */}
          <div className="lg:col-span-2">
            {loading ? (
              <AnalysisLoader />
            ) : result ? (
              <div className="space-y-5">

                {/* Score Cards — 5 in a row, 2-3 on mobile */}
                <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-3">
                  {SCORE_CARDS.map(({ label, score, icon, sub }) => (
                    <div key={label} className="bg-white rounded-2xl p-3 sm:p-4 shadow-md border border-gray-100 flex flex-col items-center">
                      <CircularScore score={score} label={label} icon={icon} sublabel={sub} />
                    </div>
                  ))}
                </div>

                {/* AI Summary */}
                {result.summary && (
                  <div className="rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 p-5 shadow-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="w-5 h-5 text-white shrink-0" />
                      <h3 className="text-sm font-bold text-white">AI Summary</h3>
                    </div>
                    <p className="text-sm text-indigo-100 leading-relaxed">{result.summary}</p>
                  </div>
                )}

                {/* Tabs */}
                <Tabs defaultValue="strengths" className="w-full">
                  <TabsList className="grid w-full grid-cols-4 mb-3">
                    <TabsTrigger value="strengths"  className="flex items-center gap-1 text-xs"><ThumbsUp  className="w-3 h-3 shrink-0" /><span className="hidden sm:inline">Strengths</span><span className="sm:hidden">Strong</span></TabsTrigger>
                    <TabsTrigger value="weaknesses" className="flex items-center gap-1 text-xs"><ThumbsDown className="w-3 h-3 shrink-0" /><span className="hidden sm:inline">Weaknesses</span><span className="sm:hidden">Weak</span></TabsTrigger>
                    <TabsTrigger value="keywords"   className="flex items-center gap-1 text-xs"><Target     className="w-3 h-3 shrink-0" /><span className="hidden sm:inline">Keywords</span><span className="sm:hidden">Keys</span></TabsTrigger>
                    <TabsTrigger value="branding"   className="flex items-center gap-1 text-xs"><Star       className="w-3 h-3 shrink-0" /><span className="hidden sm:inline">Branding</span><span className="sm:hidden">Brand</span></TabsTrigger>
                  </TabsList>

                  <TabsContent value="strengths">
                    <Card className="shadow-md border-gray-100">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                          <ThumbsUp className="w-4 h-4 text-emerald-600" />Key Strengths
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        {safeArr(result.strengths).length
                          ? safeArr(result.strengths).map((s, i) => (
                              <div key={i} className="flex items-start gap-2.5 p-3 bg-emerald-50 border border-emerald-100 rounded-xl">
                                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                                <p className="text-sm text-gray-700">{s}</p>
                              </div>
                            ))
                          : <p className="text-sm text-gray-400 text-center py-6">No strengths identified.</p>}
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="weaknesses">
                    <Card className="shadow-md border-gray-100">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                          <ThumbsDown className="w-4 h-4 text-orange-500" />Areas for Improvement
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        {safeArr(result.weaknesses).length
                          ? safeArr(result.weaknesses).map((w, i) => (
                              <div key={i} className="flex items-start gap-2.5 p-3 bg-orange-50 border border-orange-100 rounded-xl">
                                <AlertCircle className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                                <p className="text-sm text-gray-700">{w}</p>
                              </div>
                            ))
                          : <p className="text-sm text-gray-400 text-center py-6">No weaknesses found. Great profile!</p>}
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="keywords">
                    <Card className="shadow-md border-gray-100">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                          <Target className="w-4 h-4 text-purple-600" />Recommended Keywords
                        </CardTitle>
                        <CardDescription className="text-xs">Add these to boost recruiter visibility</CardDescription>
                      </CardHeader>
                      <CardContent>
                        {safeArr(result.recommendedKeywords).length
                          ? <div className="flex flex-wrap gap-2">
                              {safeArr(result.recommendedKeywords).map(k => (
                                <Badge key={k} className="px-3 py-1 text-xs bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 border-0">
                                  <Zap className="w-3 h-3 mr-1" />{k}
                                </Badge>
                              ))}
                            </div>
                          : <p className="text-sm text-gray-400 text-center py-6">No keyword recommendations available.</p>}
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="branding">
                    <Card className="shadow-md border-gray-100">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                          <Star className="w-4 h-4 text-amber-500" />Personal Branding Tips
                        </CardTitle>
                        <CardDescription className="text-xs">Stand out to recruiters and connections</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        {safeArr(result.personalBrandingTips).length
                          ? safeArr(result.personalBrandingTips).map((tip, i) => (
                              <div key={i} className="flex items-start gap-2.5 p-3 bg-amber-50 border border-amber-100 rounded-xl">
                                <Star className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                                <p className="text-sm text-gray-700">{tip}</p>
                              </div>
                            ))
                          : <p className="text-sm text-gray-400 text-center py-6">No branding tips available.</p>}
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>

                {/* Suggestions */}
                {safeArr(result.suggestions).length > 0 && (
                  <Card className="shadow-md border-amber-100">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Lightbulb className="w-4 h-4 text-amber-500" />Actionable Suggestions
                      </CardTitle>
                      <CardDescription className="text-xs">Specific steps to improve your profile</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {safeArr(result.suggestions).map((s, i) => (
                        <div key={i} className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-100 rounded-xl">
                          <span className="w-6 h-6 rounded-full bg-gradient-to-br from-amber-400 to-amber-500 text-white text-xs font-bold flex items-center justify-center shrink-0">
                            {i + 1}
                          </span>
                          <p className="text-sm text-gray-700">{s}</p>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}
              </div>

            ) : (
              /* Empty State */
              <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-8 sm:p-12 text-center flex flex-col items-center gap-4">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
                  <User className="w-10 h-10 sm:w-12 sm:h-12 text-indigo-300" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-gray-900">No Profile Analyzed Yet</h3>
                  <p className="text-xs sm:text-sm text-gray-400 mt-1 max-w-xs mx-auto">
                    Enter your LinkedIn URL or paste your profile text on the left to get AI-powered insights
                  </p>
                </div>
                <div className="flex items-center gap-2 mt-2 flex-wrap justify-center">
                  {[["1","Paste profile"],["2","Click Analyze"],["3","Get insights"]].map(([n, t], i) => (
                    <div key={n} className="flex items-center gap-2">
                      <div className="flex items-center gap-1.5 text-xs text-gray-500 bg-gray-50 border border-gray-200 rounded-full px-3 py-1.5">
                        <span className="w-4 h-4 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0">{n}</span>
                        {t}
                      </div>
                      {i < 2 && <ChevronRight className="w-3.5 h-3.5 text-gray-300 shrink-0" />}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}