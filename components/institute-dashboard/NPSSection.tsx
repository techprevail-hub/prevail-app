"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Award, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

// ─── Types ──────────────────────────────────────────────────────────────────

interface NPSData {
  averageScore?: number;
}

interface NPSSectionProps {
  nps?: NPSData;
  loading?: boolean;
}

// ─── NPS Gauge ──────────────────────────────────────────────────────────────

function NPSGauge({ score }: { score: number }) {
  // Normalize NPS from [-100, 100] to [0, 100] for gauge
  const normalized = Math.max(0, Math.min(100, (score + 100) / 2));
  const radius = 70;
  const circumference = Math.PI * radius; // Half circle
  const strokeDashoffset = circumference - (normalized / 100) * circumference;

  // Color based on score
  const getColor = () => {
    if (score >= 50) return "#10b981"; // emerald
    if (score >= 0) return "#06b6d4"; // cyan
    if (score >= -50) return "#f59e0b"; // amber
    return "#ef4444"; // red
  };

  const getLabel = () => {
    if (score >= 50) return "Excellent";
    if (score >= 0) return "Good";
    if (score >= -50) return "Needs Improvement";
    return "Poor";
  };

  return (
    <div className="relative flex flex-col items-center">
      <svg width="180" height="110" viewBox="0 0 180 110">
        {/* Background arc */}
        <path
          d="M 20 100 A 70 70 0 0 1 160 100"
          fill="none"
          stroke="#e2e8f0"
          strokeWidth="12"
          strokeLinecap="round"
        />
        {/* Animated progress arc */}
        <motion.path
          d="M 20 100 A 70 70 0 0 1 160 100"
          fill="none"
          stroke={getColor()}
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        />
        {/* Score text */}
        <text
          x="90"
          y="90"
          textAnchor="middle"
          className="fill-slate-800 text-2xl font-bold"
          style={{ fontSize: "28px", fontWeight: "bold" }}
        >
          {score}
        </text>
      </svg>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="text-xs font-medium mt-1"
        style={{ color: getColor() }}
      >
        {getLabel()}
      </motion.p>
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────

export default function NPSSection({ nps, loading }: NPSSectionProps) {
  const router = useRouter();
  const score = nps?.averageScore ?? 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.35 }}
    >
      <Card className="border-0 shadow-sm h-full overflow-hidden">
        <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-indigo-50/60 to-slate-50/60 px-6 py-4">
          <CardTitle className="text-base font-semibold text-slate-800 flex items-center gap-2">
            <Award className="h-4 w-4 text-indigo-600" />
            Student NPS
          </CardTitle>
          <CardDescription className="text-xs text-slate-500 mt-1">
            Net Promoter Score average
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 flex flex-col items-center justify-center gap-3 min-h-[200px]">
          {loading ? (
            <>
              <Skeleton className="h-24 w-40" />
              <Skeleton className="h-4 w-32" />
            </>
          ) : (
            <>
              <NPSGauge score={score} />
              <Button
                variant="ghost"
                size="sm"
                className="gap-1.5 text-indigo-700 hover:text-indigo-800 hover:bg-indigo-50 mt-2 group"
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