"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  FileText, User, ShieldCheck, Mic,
  Camera, Users, TrendingUp, Sparkles,
  CheckCircle2, Circle, ChevronRight,
  BookOpen, MapPin, Briefcase, ArrowUpRight, Activity,
  Flame, Zap, Loader2, Target, BarChart3, Clock,
  Award, Rocket, Star,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import StatsCard from "@/components/dashboard/StatsCard";
import DashboardSection from "@/components/dashboard/DashboardSection";
import { api } from "@/utils/apiServices";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
interface UserData { name: string; role: string; email: string; }

// ─── Data ─────────────────────────────────────────────────────────────────────
const careerSteps = [
  { key: "resume",    label: "Resume Optimised",  icon: FileText, done: false  },
  { key: "linkedin",  label: "LinkedIn Updated",   icon: User,     done: false  },
  { key: "headshot",  label: "Headshot Created",   icon: Camera,   done: false  },
  { key: "interview", label: "Mock Interview Done", icon: Mic,      done: false },
  { key: "coach",     label: "Coach Session Done",  icon: Users,    done: false },
];

const jobSnapshot = {
  topRoles: [
    { role: "AI / ML Engineer",    openings: "18,420", growth: "+42%" },
    { role: "Full Stack Developer", openings: "32,810", growth: "+19%" },
    { role: "Data Scientist",       openings: "14,560", growth: "+27%" },
  ],
  trendingSkills: ["Generative AI", "React / Next.js", "Kubernetes", "TypeScript", "Prompt Engineering"],
  topLocations: ["Bengaluru", "Hyderabad", "Mumbai", "Remote"],
};

const colorTokens: Record<string, { light: string; icon: string; text: string; border: string; gradient: string; dark: string; glow: string }> = {
  violet:  { light: "bg-violet-50", icon: "text-violet-600", text: "text-violet-700", border: "border-violet-200", gradient: "from-violet-500 to-indigo-500", dark: "bg-violet-600", glow: "shadow-violet-200" },
  emerald: { light: "bg-emerald-50", icon: "text-emerald-600", text: "text-emerald-700", border: "border-emerald-200", gradient: "from-emerald-500 to-teal-500", dark: "bg-emerald-600", glow: "shadow-emerald-200" },
  sky:     { light: "bg-sky-50", icon: "text-sky-600", text: "text-sky-700", border: "border-sky-200", gradient: "from-sky-500 to-cyan-500", dark: "bg-sky-600", glow: "shadow-sky-200" },
  rose:    { light: "bg-rose-50", icon: "text-rose-600", text: "text-rose-700", border: "border-rose-200", gradient: "from-rose-500 to-pink-500", dark: "bg-rose-600", glow: "shadow-rose-200" },
  amber:   { light: "bg-amber-50", icon: "text-amber-600", text: "text-amber-700", border: "border-amber-200", gradient: "from-amber-500 to-orange-500", dark: "bg-amber-600", glow: "shadow-amber-200" },
  indigo:  { light: "bg-indigo-50", icon: "text-indigo-600", text: "text-indigo-700", border: "border-indigo-200", gradient: "from-indigo-500 to-purple-500", dark: "bg-indigo-600", glow: "shadow-indigo-200" },
};

// ─── ENHANCED GRAPH LINE ─────────────────────────────────────────────────────
function EnhancedGraphLine({ score }: { score: number }) {
  const [animated, setAnimated] = useState(false);
  useEffect(() => { 
    const t = setTimeout(() => setAnimated(true), 400); 
    return () => clearTimeout(t); 
  }, []);

  const base = Math.max(score - 35, 15);
  const raw = [
    base, 
    base + Math.floor(Math.random() * 5) + 2, 
    base + Math.floor(Math.random() * 8) + 3, 
    base + Math.floor(Math.random() * 10) + 5, 
    base + Math.floor(Math.random() * 12) + 7, 
    base + Math.floor(Math.random() * 15) + 10, 
    base + Math.floor(Math.random() * 18) + 12, 
    base + Math.floor(Math.random() * 20) + 15, 
    base + Math.floor(Math.random() * 22) + 18, 
    score
  ];
  
  const smoothed = raw.map((v, i, arr) => {
    if (i === 0 || i === arr.length - 1) return v;
    return (arr[i-1] + v + arr[i+1]) / 3;
  });

  const w = 400, h = 90, pad = 12;
  const min = Math.min(...smoothed) - 3;
  const max = Math.max(...smoothed) + 3;
  const range = max - min || 1;

  const pts = smoothed.map((v, i) => ({
    x: pad + (i / (smoothed.length - 1)) * (w - pad * 2),
    y: pad + (1 - (v - min) / range) * (h - pad * 2),
    value: v
  }));

  let linePath = "";
  for (let i = 0; i < pts.length; i++) {
    if (i === 0) {
      linePath = `M ${pts[i].x} ${pts[i].y}`;
    } else {
      const prev = pts[i - 1];
      const cp1x = (prev.x + pts[i].x) / 2;
      linePath += ` C ${cp1x} ${prev.y} ${cp1x} ${pts[i].y} ${pts[i].x} ${pts[i].y}`;
    }
  }

  const areaPath = `${linePath} L ${pts[pts.length-1].x} ${h - pad} L ${pts[0].x} ${h - pad} Z`;

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ height: 90 }}>
        <defs>
          <linearGradient id="enhancedLineGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#8b5cf6" />
            <stop offset="50%" stopColor="#7c3aed" />
            <stop offset="100%" stopColor="#6d28d9" />
          </linearGradient>
          <linearGradient id="enhancedAreaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.3" />
            <stop offset="40%" stopColor="#7c3aed" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#6d28d9" stopOpacity="0.02" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <path d={areaPath} fill="url(#enhancedAreaGrad)" />
        <path
          d={linePath}
          fill="none"
          stroke="url(#enhancedLineGrad)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={500}
          strokeDashoffset={animated ? 0 : 500}
          style={{ transition: "stroke-dashoffset 1.8s cubic-bezier(0.34,1.56,0.64,1)" }}
          filter="url(#glow)"
        />
        {pts.map((p, i) => (
          <circle
            key={i}
            cx={p.x} 
            cy={p.y} 
            r={i === pts.length - 1 ? 6 : 3.5}
            fill={i === pts.length - 1 ? "#7c3aed" : "#8b5cf6"}
            opacity={animated ? 1 : 0}
            style={{ 
              transition: `opacity 0.4s ease ${0.8 + i * 0.06}s, transform 0.3s ease`,
              transform: animated ? "scale(1)" : "scale(0)"
            }}
          />
        ))}
        {animated && (
          <g>
            <text 
              x={pts[pts.length-1].x + 10} 
              y={pts[pts.length-1].y + 5}
              fontSize="13" 
              fontWeight="800" 
              fill="#7c3aed"
              className="drop-shadow-lg"
            >
              {Math.round(pts[pts.length-1].value)}
            </text>
          </g>
        )}
      </svg>
    </div>
  );
}

// ─── Career Score Donut ─────────────────────────────────────────────────────
function CareerScoreDonut({ score }: { score: number }) {
  const [drawn, setDrawn] = useState(0);
  const r = 52, circ = 2 * Math.PI * r;
  useEffect(() => { const t = setTimeout(() => setDrawn(score), 300); return () => clearTimeout(t); }, [score]);
  return (
    <div className="relative w-32 h-32 flex-shrink-0">
      <svg width="128" height="128" viewBox="0 0 128 128" className="-rotate-90">
        <defs>
          <linearGradient id="scoreGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#7c3aed" />
            <stop offset="100%" stopColor="#6366f1" />
          </linearGradient>
          <filter id="donutGlow">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <circle cx="64" cy="64" r={r} fill="none" stroke="rgba(109,40,217,0.12)" strokeWidth="12" />
        <circle 
          cx="64" cy="64" r={r} 
          fill="none" 
          stroke="url(#scoreGrad)" 
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={circ - (drawn / 100) * circ}
          style={{ transition: "stroke-dashoffset 1.4s cubic-bezier(0.34,1.56,0.64,1)" }}
          filter="url(#donutGlow)"
        />
        <circle 
          cx="64" cy="64" r={r + 4} 
          fill="none" 
          stroke="rgba(124,58,237,0.1)" 
          strokeWidth="1"
          strokeDasharray="4 8"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold text-violet-700 leading-none">{score}</span>
        <span className="text-xs text-slate-500 font-semibold">/100</span>
      </div>
    </div>
  );
}

// ─── FadeIn Animation ─────────────────────────────────────────────────────
function FadeIn({ children, delay = 0, direction = "up" }: {
  children: React.ReactNode; delay?: number; direction?: "up" | "left" | "right";
}) {
  const [show, setShow] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setShow(true), delay);
          observer.disconnect();
        }
      },
      { threshold: 0.08 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [delay]);

  const hidden =
    direction === "left"  ? "opacity-0 -translate-x-6" :
    direction === "right" ? "opacity-0 translate-x-6"  :
                            "opacity-0 translate-y-6";

  return (
    <div ref={ref} className={`transition-all duration-700 ease-out ${show ? "opacity-100 translate-x-0 translate-y-0" : hidden}`}>
      {children}
    </div>
  );
}

// ─── Progress Donut ──────────────────────────────────────────────────────
function ProgressDonut({ pct, color, size = 80 }: { pct: number; color: string; size?: number }) {
  const [drawn, setDrawn] = useState(0);
  const r = (size - 12) / 2, circ = 2 * Math.PI * r;
  useEffect(() => { const t = setTimeout(() => setDrawn(pct), 500); return () => clearTimeout(t); }, [pct]);
  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#ede9fe" strokeWidth="8" />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={circ - (drawn / 100) * circ}
          style={{ transition: "stroke-dashoffset 1s cubic-bezier(0.34,1.2,0.64,1)" }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-sm font-bold" style={{ color }}>{pct}%</span>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Fetch user data from dashboard API
  const fetchDashboard = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await api.get("/api/seeker/dashboard");
      console.log("Dashboard Data:", response);

      if (response.success) {
        // Set dashboard data
        setDashboardData(response.data);
        
        // Set user data from dashboard response
        if (response.data?.user) {
          setUser(response.data.user);
        }
      } else {
        await fetchIndividualData();
      }
    } catch (error) {
      console.log("Error fetching dashboard, trying individual endpoints:", error);
      await fetchIndividualData();
    } finally {
      setLoading(false);
    }
  };

  // Fallback: Fetch individual data from each endpoint
  const fetchIndividualData = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const dashboard: any = {
        user: null,
        careerReadinessScore: 0,
        careerReady: false,
        milestones: {},
        resume: { completed: false, score: 0, atsScore: 0 },
        linkedin: { completed: false, score: 0 },
        headshot: { completed: false, count: 0 },
        interview: { completed: false, count: 0 },
        coach: { completed: false, count: 0 },
      };

      // Try to get user from /api/me as fallback
      try {
        const userRes = await api.get("/api/me");
        if (userRes.success && userRes.user) {
          dashboard.user = userRes.user;
          setUser(userRes.user);
        } else if (userRes.success && userRes.data) {
          dashboard.user = userRes.data;
          setUser(userRes.data);
        }
      } catch (e) { /* ignore */ }

      try {
        const resumeRes = await api.get("/api/resume/score");
        if (resumeRes.success) {
          dashboard.resume.completed = true;
          dashboard.resume.score = resumeRes.score || 0;
          dashboard.resume.atsScore = resumeRes.atsScore || 0;
          dashboard.milestones.resume = true;
        }
      } catch (e) { /* ignore */ }

      try {
        const linkedinRes = await api.get("/api/linkedin/score");
        if (linkedinRes.success) {
          dashboard.linkedin.completed = true;
          dashboard.linkedin.score = linkedinRes.score || 0;
          dashboard.milestones.linkedin = true;
        }
      } catch (e) { /* ignore */ }

      try {
        const headshotRes = await api.get("/api/headshot/history");
        if (headshotRes.success) {
          dashboard.headshot.completed = true;
          dashboard.headshot.count = headshotRes.data?.length || 0;
          dashboard.milestones.headshot = true;
        }
      } catch (e) { /* ignore */ }

      try {
        const interviewRes = await api.get("/api/interview/history");
        if (interviewRes.success) {
          dashboard.interview.completed = true;
          dashboard.interview.count = interviewRes.data?.length || 0;
          dashboard.milestones.interview = true;
        }
      } catch (e) { /* ignore */ }

      try {
        const coachRes = await api.get("/api/coach/history");
        if (coachRes.success) {
          dashboard.coach.completed = true;
          dashboard.coach.count = coachRes.data?.length || 0;
          dashboard.milestones.coach = true;
        }
      } catch (e) { /* ignore */ }

      const scores = [
        dashboard.resume.score || 0,
        dashboard.linkedin.score || 0,
      ].filter(s => s > 0);
      
      if (scores.length > 0) {
        dashboard.careerReadinessScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
      } else {
        dashboard.careerReadinessScore = 0;
      }

      const allMilestones = Object.values(dashboard.milestones);
      dashboard.careerReady = allMilestones.length > 0 && allMilestones.every(v => v === true);

      setDashboardData(dashboard);
    } catch (error) {
      console.log("Error fetching individual data:", error);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const firstName = user?.name?.split(" ")[0] ?? "There";
  
  const milestones = dashboardData?.milestones || {};
  const completedSteps = Object.values(milestones).filter(Boolean).length;
  
  const progressPct = dashboardData?.careerReadinessScore || 
    Math.round((completedSteps / careerSteps.length) * 100);
  
  const overallScore = dashboardData?.careerReadinessScore || 
    Math.round((completedSteps / careerSteps.length) * 100);

  const updatedCareerSteps = careerSteps.map(step => {
    const key = step.key;
    if (milestones[key] === true) {
      return { ...step, done: true };
    }
    return { ...step, done: false };
  });

  // Career Progress Card
  const careerProgressCard = {
    label: "Career Progress",
    icon: Target,
    color: "indigo",
    href: "/dashboard/seeker/progress",
    desc: "Overall readiness",
    score: progressPct,
    scoreSuffix: "%",
    changeValue: dashboardData?.careerReady ? "🎯 Career Ready" : "🔄 In Progress"
  };

  // Journey cards with real data from dashboard API (6 cards including Progress)
  const journeyCards = [
    careerProgressCard,
    { 
      label: "Resume Analyzer", 
      icon: FileText, 
      color: "violet",  
      href: "/dashboard/seeker/resume",    
      desc: "Score out of 100",
      score: dashboardData?.resume?.score || null,
      scoreSuffix: "/100",
      changeValue: dashboardData?.resume?.score ? (dashboardData.resume.score > 50 ? "+5%" : "+2%") : null
    },
    { 
      label: "LinkedIn Analyzer",  
      icon: User,     
      color: "sky",     
      href: "/dashboard/seeker/linkedin",  
      desc: "Score out of 100",
      score: dashboardData?.linkedin?.score || null,
      scoreSuffix: "/100",
      changeValue: dashboardData?.linkedin?.score ? (dashboardData.linkedin.score > 50 ? "+12%" : "+3%") : null
    },
    { 
      label: "AI Headshot",        
      icon: Camera,   
      color: "rose",    
      href: "/dashboard/seeker/headshot",  
      desc: "Professional photos",
      score: dashboardData?.headshot?.count || null,
      scoreSuffix: "",
      changeValue: dashboardData?.headshot?.count ? `+${dashboardData.headshot.count}` : null
    },
    { 
      label: "Mock Interview",     
      icon: Mic,      
      color: "emerald", 
      href: "/dashboard/seeker/interview", 
      desc: "Sessions done",
      score: dashboardData?.interview?.count || null,
      scoreSuffix: "",
      changeValue: dashboardData?.interview?.count ? `+${dashboardData.interview.count}` : null
    },
    { 
      label: "Coach Session",      
      icon: Users,    
      color: "amber",   
      href: "/dashboard/seeker/coach",     
      desc: "Placement ready",
      score: dashboardData?.coach?.count || null,
      scoreSuffix: "",
      changeValue: dashboardData?.coach?.count ? `+${dashboardData.coach.count}` : null
    },
  ];

  // AI Suggestions (replacing Recent Activities)
  const aiSuggestions = [
    { 
      id: 1, 
      icon: FileText, 
      color: "violet",  
      label: "Resume Optimization",            
      sub: dashboardData?.resume?.score 
        ? `Your resume score is ${dashboardData.resume.score}/100. Add more keywords to improve.` 
        : "Upload your resume to get AI-powered analysis and improvement suggestions.",
      cta: dashboardData?.resume?.score ? "Improve Now" : "Upload Resume",
      href: "/dashboard/seeker/resume",
      priority: dashboardData?.resume?.score ? (dashboardData.resume.score < 70 ? "High" : "Medium") : "High"
    },
    { 
      id: 2, 
      icon: User,     
      color: "sky",     
      label: "LinkedIn Profile",            
      sub: dashboardData?.linkedin?.score 
        ? `Your LinkedIn score is ${dashboardData.linkedin.score}/100. Complete your headline and skills section.` 
        : "Optimize your LinkedIn profile to attract more recruiters.",
      cta: dashboardData?.linkedin?.score ? "Fix Now" : "Optimize Now",
      href: "/dashboard/seeker/linkedin",
      priority: dashboardData?.linkedin?.score ? (dashboardData.linkedin.score < 70 ? "High" : "Medium") : "High"
    },
    { 
      id: 3, 
      icon: Mic,      
      color: "emerald", 
      label: "Mock Interview Practice",        
      sub: dashboardData?.interview?.count 
        ? `You've completed ${dashboardData.interview.count} interviews. Try 2 more this week.` 
        : "Start practicing with mock interviews to build confidence.",
      cta: dashboardData?.interview?.count ? "Start Practice" : "Begin Now",
      href: "/dashboard/seeker/interview",
      priority: dashboardData?.interview?.count ? (dashboardData.interview.count < 5 ? "High" : "Low") : "High"
    },
    { 
      id: 4, 
      icon: ShieldCheck, 
      color: "rose",    
      label: "Career Coaching",              
      sub: dashboardData?.coach?.count 
        ? `You've had ${dashboardData.coach.count} coach sessions. Schedule another for personalised guidance.` 
        : "Book your first coach session for personalised career guidance.",
      cta: dashboardData?.coach?.count ? "Book Coach" : "Schedule Now",
      href: "/dashboard/seeker/coach",
      priority: dashboardData?.coach?.count ? (dashboardData.coach.count < 2 ? "High" : "Low") : "High"
    },
  ];

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-start justify-center pt-60">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-violet-600 animate-spin" />
          <p className="text-slate-500 text-sm font-medium">Loading your dashboard…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <style>{`
        @keyframes shimmer {
          0%   { transform: translateX(-100%); opacity: 0; }
          40%  { opacity: 1; }
          100% { transform: translateX(200%); opacity: 0; }
        }
        .animate-\\[shimmer_3s_ease-in-out_infinite\\] {
          animation: shimmer 3s ease-in-out infinite;
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
        .animate-pulse-glow {
          animation: pulse-glow 2s ease-in-out infinite;
        }
      `}</style>
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-5 py-4 lg:py-6 space-y-5">

        {/* ── 1. HERO WELCOME ───────────────────────────────────────────────── */}
        <FadeIn delay={0}>
          <div className="relative rounded-3xl overflow-hidden px-6 py-6 lg:px-8 shadow-2xl shadow-violet-200"
            style={{ background: "linear-gradient(135deg, #ede9fe 0%, #ddd6fe 30%, #c7d2fe 65%, #e0e7ff 100%)" }}>

            <div className="pointer-events-none absolute -top-10 -right-10 w-72 h-72 rounded-full bg-violet-300/30 blur-3xl animate-float" />
            <div className="pointer-events-none absolute bottom-0 left-1/4 w-80 h-40 rounded-full bg-indigo-300/25 blur-3xl" />
            <div className="pointer-events-none absolute top-6 right-1/3 w-32 h-32 rounded-full bg-purple-200/40 blur-2xl" />
            <div className="pointer-events-none absolute top-4 left-1/4 w-12 h-12 rounded-full border-2 border-violet-300/20" />
            <div className="pointer-events-none absolute bottom-8 right-8 w-16 h-16 rounded-full border-2 border-indigo-300/20" />

            <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-3xl">
              <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-violet-400/50 to-transparent animate-[shimmer_3s_ease-in-out_infinite]" />
            </div>

            <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
              <div className="flex-1">
                <div className="inline-flex items-center gap-2 bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 text-xs font-bold px-3 py-1.5 rounded-full mb-3 backdrop-blur-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Intelligence Stream Active
                </div>
                <h1 className="text-2xl lg:text-3xl font-bold text-slate-800 mb-1 tracking-tight">
                  Welcome back, {firstName} 👋
                </h1>
                <p className="text-slate-600 text-sm lg:text-base max-w-md">
                  Track your career journey and stay updated with your overall progress.
                </p>
              </div>

              <div className="flex-1 min-w-[180px] px-2">
                <div className="bg-white/30 backdrop-blur-sm rounded-2xl p-3 border border-white/40 shadow-lg">
                  <div className="flex items-center justify-between mb-1 px-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Performance Trend</span>
                    <span className="text-xs font-bold text-emerald-600 flex items-center gap-0.5 bg-emerald-50/80 px-2 py-0.5 rounded-full">
                      <ArrowUpRight className="w-3 h-3" /> +4%
                    </span>
                  </div>
                  <EnhancedGraphLine score={overallScore || 50} />
                </div>
              </div>

              <div className="flex-shrink-0 flex flex-col items-center gap-1">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Overall Score</p>
                <CareerScoreDonut score={overallScore || 50} />
              </div>
            </div>
          </div>
        </FadeIn>

        {/* ── 2. JOURNEY FEATURES - 6 COLUMN GRID ────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {journeyCards.map((card, index) => (
            <FadeIn key={card.label} delay={60 + index * 40} direction={index % 2 === 0 ? "left" : "right"}>
              <StatsCard
                label={card.label}
                icon={card.icon}
                color={card.color as any}
                description={card.desc}
                href={card.href}
                isJourney={card.label === "Career Progress" ? false : true}
                score={card.score}
                scoreSuffix={card.scoreSuffix}
                changeValue={card.changeValue}
              />
            </FadeIn>
          ))}
        </div>

        {/* ── 3. JOB INSIGHTS SNAPSHOT ────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative">
          {/* Full Insights link in corner */}
          <button
            onClick={() => router.push("/dashboard/seeker/job-insights")}
            className="absolute -top-1 right-0 text-xs font-semibold text-violet-600 hover:text-violet-800 flex items-center gap-1 transition-colors z-10 bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full shadow-sm hover:shadow-md"
          >
            Full Insights <ArrowUpRight className="w-3.5 h-3.5" />
          </button>

          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg hover:border-violet-200 transition-all duration-300 p-4 group">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-100 to-violet-200 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Briefcase className="w-4 h-4 text-violet-600" />
              </div>
              <p className="text-xs font-bold text-slate-800">Top Hiring Roles</p>
            </div>
            <div className="space-y-2.5">
              {jobSnapshot.topRoles.map((r, i) => (
                <div key={r.role} className="flex items-center justify-between gap-2 hover:bg-slate-50 rounded-lg px-2 py-1.5 transition-colors">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span className="text-[10px] font-bold text-slate-300 w-4">{i + 1}</span>
                    <p className="text-xs text-slate-700 truncate">{r.role}</p>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full flex-shrink-0">{r.growth}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg hover:border-rose-200 transition-all duration-300 p-4 group">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-rose-100 to-rose-200 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Flame className="w-4 h-4 text-rose-500" />
              </div>
              <p className="text-xs font-bold text-slate-800">Trending Skills</p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {jobSnapshot.trendingSkills.map((skill, i) => (
                <span key={skill} className={`px-2.5 py-1 rounded-full text-[10px] font-semibold hover:scale-105 transition-transform cursor-default ${
                  i === 0 ? "bg-gradient-to-r from-rose-100 to-rose-200 text-rose-700" :
                  i < 3   ? "bg-gradient-to-r from-violet-100 to-violet-200 text-violet-700" :
                            "bg-gradient-to-r from-slate-100 to-slate-200 text-slate-600"
                }`}>
                  {i === 0 && "🔥 "}{skill}
                </span>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg hover:border-sky-200 transition-all duration-300 p-4 group">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-sky-100 to-sky-200 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <MapPin className="w-4 h-4 text-sky-600" />
              </div>
              <p className="text-xs font-bold text-slate-800">Top Locations</p>
            </div>
            <div className="space-y-2.5">
              {jobSnapshot.topLocations.map((loc, i) => (
                <div key={loc} className="flex items-center gap-2 hover:bg-slate-50 rounded-lg px-2 py-1.5 transition-colors">
                  <span className="text-[10px] font-bold text-slate-300 w-4">{i + 1}</span>
                  <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-violet-600 to-indigo-500 transition-all duration-1000 group-hover:from-violet-700 group-hover:to-indigo-700"
                      style={{ width: `${100 - i * 18}%` }} />
                  </div>
                  <span className="text-[10px] font-semibold text-slate-600 w-16 text-right">{loc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── 4. AI SUGGESTIONS ────────────────────────────────────────────── */}
        <FadeIn delay={100}>
          <DashboardSection 
            title="AI Suggestions" 
            subtitle="Personalised recommendations to boost your career" 
            icon={Sparkles} 
            badge="AI"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {aiSuggestions.map((suggestion) => {
                const Icon = suggestion.icon;
                const c = colorTokens[suggestion.color];
                const priorityColor = suggestion.priority === "High" ? "bg-gradient-to-r from-red-100 to-red-200 text-red-700" : 
                                     suggestion.priority === "Medium" ? "bg-gradient-to-r from-amber-100 to-amber-200 text-amber-700" : 
                                     "bg-gradient-to-r from-emerald-100 to-emerald-200 text-emerald-700";
                
                return (
                  <div
                    key={suggestion.id}
                    onClick={() => router.push(suggestion.href)}
                    className={`group flex items-start gap-3 bg-white rounded-2xl border ${c.border} p-4 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden relative`}
                  >
                    <div className={`absolute inset-0 bg-gradient-to-br ${c.gradient} opacity-0 group-hover:opacity-[0.04] transition-opacity duration-500`} />
                    <div className={`w-10 h-10 rounded-xl ${c.light} flex items-center justify-center flex-shrink-0 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}>
                      <Icon className={`w-5 h-5 ${c.icon}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-semibold text-slate-800 group-hover:text-violet-700 transition-colors">
                          {suggestion.label}
                        </p>
                        <Badge className={`${priorityColor} border-0 text-[10px] font-bold px-2 py-0.5`}>
                          {suggestion.priority}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-500 leading-relaxed">{suggestion.sub}</p>
                      <span className={`inline-flex items-center gap-1 text-xs font-bold ${c.text} mt-1.5 group-hover:gap-2 transition-all`}>
                        {suggestion.cta} <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                      </span>
                    </div>
                    <div className={`w-1 h-12 rounded-full ${c.light} group-hover:${c.dark} transition-all duration-300`} />
                  </div>
                );
              })}
            </div>
          </DashboardSection>
        </FadeIn>

      </div>
    </div>
  );
}