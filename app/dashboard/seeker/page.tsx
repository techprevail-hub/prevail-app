"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  FileText, User, ShieldCheck, Mic,
  Camera, Users, TrendingUp, Sparkles,
  ChevronRight,
  MapPin, Briefcase, ArrowUpRight,
  Flame, Loader2, Target,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import StatsCard from "@/components/dashboard/StatsCard";
import DashboardSection from "@/components/dashboard/DashboardSection";
import HeroSection from "@/components/dashboard/HeroSection";
import { api } from "@/utils/apiServices";

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

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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
        setDashboardData(response.data);
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
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-5 py-2 lg:py-3 space-y-5">

        {/* ── 1. PREMIUM HERO SECTION ─────────────────────────────────────── */}
        <FadeIn delay={0}>
          <HeroSection user={user} score={overallScore} />
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