// components/institute-dashboard/NPSSection.tsx

"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Award, ArrowRight, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

// ─── Types ──────────────────────────────────────────────────────────────────

interface NPSData {
  averageScore?: number;
}

interface NPSSectionProps {
  nps?: NPSData;
  loading?: boolean;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function getNpsTheme(score: number) {
  if (score >= 70)
    return {
      label: "Excellent",
      color: "#10b981",
      colorTo: "#059669",
      bg: "from-emerald-50 to-teal-50",
      pill: "bg-emerald-50 text-emerald-700 border-emerald-200",
      ring: "ring-emerald-100",
      glow: "shadow-emerald-500/20",
    };
  if (score >= 50)
    return {
      label: "Very Good",
      color: "#06b6d4",
      colorTo: "#3b82f6",
      bg: "from-cyan-50 to-blue-50",
      pill: "bg-cyan-50 text-cyan-700 border-cyan-200",
      ring: "ring-cyan-100",
      glow: "shadow-blue-500/20",
    };
  if (score >= 30)
    return {
      label: "Good",
      color: "#f59e0b",
      colorTo: "#f97316",
      bg: "from-amber-50 to-orange-50",
      pill: "bg-amber-50 text-amber-700 border-amber-200",
      ring: "ring-amber-100",
      glow: "shadow-amber-500/20",
    };
  return {
    label: "Needs Work",
    color: "#ef4444",
    colorTo: "#dc2626",
    bg: "from-rose-50 to-red-50",
    pill: "bg-rose-50 text-rose-700 border-rose-200",
    ring: "ring-rose-100",
    glow: "shadow-red-500/20",
  };
}

// ─── NPS Gauge Component (Reduced Size) ─────────────────────────────────────

function NPSGauge({ score }: { score: number }) {
  const theme = getNpsTheme(score);
  const normalized = Math.max(0, Math.min(100, Math.max(-100, score)));
  const scaledScore = (normalized + 100) / 2;

  const size = 130; // ↓ reduced from 180
  const strokeWidth = 10; // ↓ reduced from 12
  const radius = (size - strokeWidth) / 2;
  const circumference = Math.PI * radius;
  const strokeDashoffset = circumference - (scaledScore / 100) * circumference;

  return (
    <div className="relative flex flex-col items-center justify-center">
      <motion.svg
        width={size}
        height={size / 2 + 22}
        viewBox={`0 0 ${size} ${size / 2 + 22}`}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <defs>
          <linearGradient id="npsGradient" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={theme.color} />
            <stop offset="100%" stopColor={theme.colorTo} />
          </linearGradient>
          <filter id="npsGlow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Background arc */}
        <path
          d={`M ${strokeWidth / 2} ${size / 2} A ${radius} ${radius} 0 0 1 ${
            size - strokeWidth / 2
          } ${size / 2}`}
          fill="none"
          stroke="#e2e8f0"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          opacity={0.6}
        />

        {/* Animated progress arc */}
        <motion.path
          d={`M ${strokeWidth / 2} ${size / 2} A ${radius} ${radius} 0 0 1 ${
            size - strokeWidth / 2
          } ${size / 2}`}
          fill="none"
          stroke="url(#npsGradient)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.8, ease: "easeOut" }}
          filter="url(#npsGlow)"
        />

        {/* Animated end dot */}
        <motion.circle
          cx={size / 2 + radius * Math.cos(Math.PI * (1 - scaledScore / 100))}
          cy={size / 2 - radius * Math.sin(Math.PI * (1 - scaledScore / 100))}
          r={5}
          fill="#fff"
          stroke={theme.color}
          strokeWidth={2.5}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.4, duration: 0.4 }}
        />
      </motion.svg>

      {/* Score display */}
      <div className="absolute top-[52%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-3xl font-bold tracking-tight"
          style={{ color: theme.color }}
        >
          {score}
        </motion.p>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-[9px] uppercase tracking-widest text-slate-400 font-semibold mt-0.5"
        >
          NPS Score
        </motion.p>
      </div>

      {/* Status badge */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.6 }}
        className={`mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full border ${theme.pill} font-semibold text-[11px]`}
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        >
          <Sparkles className="h-3 w-3" />
        </motion.div>
        {theme.label}
      </motion.div>
    </div>
  );
}

// ─── Loading Skeleton ───────────────────────────────────────────────────────

function LoadingSkeleton() {
  return (
    <Card className="border-0 bg-white/70 backdrop-blur-xl h-full">
      <CardHeader className="border-b border-white/40 px-5 py-3 bg-gradient-to-r from-white/50 to-white/30">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-3 w-40 mt-1.5" />
      </CardHeader>
      <CardContent className="p-4 flex flex-col items-center justify-center gap-3">
        <Skeleton className="h-24 w-32 rounded-full" />
        <Skeleton className="h-7 w-32" />
      </CardContent>
    </Card>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────

export default function NPSSection({ nps, loading }: NPSSectionProps) {
  const router = useRouter();
  const score = Math.round(nps?.averageScore ?? 0);
  const theme = getNpsTheme(score);

  if (loading) {
    return <LoadingSkeleton />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      className="h-full"
    >
      <Card className="border-0 bg-white/80 backdrop-blur-xl shadow-md hover:shadow-lg transition-all duration-300 h-full overflow-hidden relative flex flex-col">
        {/* Decorative gradient blob */}
        <div
          className={`absolute -top-20 -right-20 w-48 h-48 rounded-full bg-gradient-to-bl ${theme.bg} opacity-40 blur-3xl pointer-events-none`}
        />

        <CardHeader className={`border-b border-white/40 bg-gradient-to-r ${theme.bg} px-5 py-3 relative`}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <div className="rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 p-1.5 shadow-md">
                  <Award className="h-3.5 w-3.5 text-white" />
                </div>
                Student NPS
              </CardTitle>
              <CardDescription className="text-[11px] text-slate-600 mt-0.5">
                Net Promoter Score average
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-4 flex flex-col items-center justify-center gap-3 relative flex-1">
          <NPSGauge score={score} />

          {/* Action button */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.8 }}
            className="w-full"
          >
            <Button
              variant="ghost"
              size="sm"
              className="w-full gap-2 text-[#6C5CE7] hover:text-[#5a4bd8] hover:bg-[#6C5CE7]/5 group border border-[#6C5CE7]/20 hover:border-[#6C5CE7]/40 rounded-lg text-xs h-8"
              onClick={() => router.push("/dashboard/institute/nps")}
            >
              View NPS Reports
              <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
            </Button>
          </motion.div>

          {/* Insight badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 2 }}
            className="w-full p-2 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200/60"
          >
            <p className="text-[10px] font-medium text-blue-900 text-center">
              <span className="font-bold">{Math.round(score / 10)}/10</span> • Likely to recommend
            </p>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
}