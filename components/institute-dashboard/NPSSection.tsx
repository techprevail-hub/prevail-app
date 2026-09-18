"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Award, ArrowRight, TrendingUp, Sparkles } from "lucide-react";
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
  if (score >= 50)
    return {
      label: "Excellent",
      color: "#10b981",
      colorTo: "#059669",
      bg: "from-emerald-50 to-teal-50",
      pill: "bg-emerald-50 text-emerald-700 border-emerald-100",
      ring: "ring-emerald-100",
    };
  if (score >= 0)
    return {
      label: "Good",
      color: "#06b6d4",
      colorTo: "#3b82f6",
      bg: "from-cyan-50 to-blue-50",
      pill: "bg-cyan-50 text-cyan-700 border-cyan-100",
      ring: "ring-cyan-100",
    };
  if (score >= -50)
    return {
      label: "Fair",
      color: "#f59e0b",
      colorTo: "#f97316",
      bg: "from-amber-50 to-orange-50",
      pill: "bg-amber-50 text-amber-700 border-amber-100",
      ring: "ring-amber-100",
    };
  return {
    label: "Needs Work",
    color: "#ef4444",
    colorTo: "#dc2626",
    bg: "from-rose-50 to-red-50",
    pill: "bg-rose-50 text-rose-700 border-rose-100",
    ring: "ring-rose-100",
  };
}

// ─── NPS Gauge (Enhanced) ───────────────────────────────────────────────────

function NPSGauge({ score }: { score: number }) {
  const theme = getNpsTheme(score);
  const normalized = Math.max(0, Math.min(100, (score + 100) / 2));

  // SVG dimensions
  const size = 200;
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = Math.PI * radius; // half circle
  const strokeDashoffset = circumference - (normalized / 100) * circumference;

  return (
    <div className="relative flex flex-col items-center">
      <svg
        width={size}
        height={size / 2 + 20}
        viewBox={`0 0 ${size} ${size / 2 + 20}`}
      >
        <defs>
          <linearGradient id="npsGradient" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={theme.color} />
            <stop offset="100%" stopColor={theme.colorTo} />
          </linearGradient>
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
          transition={{ duration: 1.4, ease: "easeOut" }}
        />

        {/* Glow dot at the end of the arc */}
        <motion.circle
          cx={
            size / 2 +
            radius * Math.cos(Math.PI * (1 - normalized / 100))
          }
          cy={
            size / 2 -
            radius * Math.sin(Math.PI * (1 - normalized / 100))
          }
          r={6}
          fill="#fff"
          stroke={theme.color}
          strokeWidth={3}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.2, duration: 0.3 }}
        />
      </svg>

      {/* Score text (overlaid) */}
      <div className="absolute top-[58%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-4xl font-bold tracking-tight"
          style={{ color: theme.color }}
        >
          {score}
        </motion.p>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-[10px] uppercase tracking-widest text-slate-400 font-medium mt-0.5"
        >
          NPS Score
        </motion.p>
      </div>

      {/* Rating pill */}
      <motion.div
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.4 }}
        className={`mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full border ${theme.pill}`}
      >
        <Sparkles className="h-3 w-3" />
        <span className="text-[11px] font-semibold">{theme.label}</span>
      </motion.div>
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────

export default function NPSSection({ nps, loading }: NPSSectionProps) {
  const router = useRouter();
  const score = nps?.averageScore ?? 0;
  const theme = getNpsTheme(score);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.35 }}
    >
      <Card className="border-0 shadow-sm h-full overflow-hidden relative">
        {/* Decorative gradient blob */}
        <div
          className={`absolute -top-16 -right-16 w-48 h-48 rounded-full bg-gradient-to-br ${theme.bg} opacity-60 blur-3xl pointer-events-none`}
        />

        <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-indigo-50/60 via-slate-50/60 to-violet-50/40 px-6 py-4 relative">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-base font-semibold text-slate-800 flex items-center gap-2">
                <div className="rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 p-1.5 shadow-sm shadow-indigo-500/30">
                  <Award className="h-3.5 w-3.5 text-white" />
                </div>
                Student NPS
              </CardTitle>
              <CardDescription className="text-xs text-slate-500 mt-1">
                Net Promoter Score average
              </CardDescription>
            </div>
            <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-emerald-50 border border-emerald-100">
              <TrendingUp className="h-3 w-3 text-emerald-600" />
              <span className="text-[10px] font-semibold text-emerald-700">
                Live
              </span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6 flex flex-col items-center justify-center gap-4 relative">
          {loading ? (
            <>
              <Skeleton className="h-32 w-44 rounded-2xl" />
              <Skeleton className="h-8 w-32" />
            </>
          ) : (
            <>
              <NPSGauge score={score} />

              <Button
                variant="ghost"
                size="sm"
                className="gap-1.5 text-indigo-700 hover:text-indigo-800 hover:bg-indigo-50 group mt-1"
                onClick={() => router.push("/dashboard/institute/nps")}
              >
                View NPS Reports
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}