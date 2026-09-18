"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Target, TrendingUp, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

// ─── Types ──────────────────────────────────────────────────────────────────

interface CareerReadinessData {
  overall?: number;
  ready?: number;
  developing?: number;
  needsSupport?: number;
}

interface ProgressData {
  averageProgress?: number;
  onTrack?: number;
  needsAttention?: number;
}

interface CareerProgressSectionProps {
  careerReadiness?: CareerReadinessData;
  progress?: ProgressData;
  loading?: boolean;
}

// ─── Progress Bar ───────────────────────────────────────────────────────────

function ProgressBar({
  value,
  colorClass = "bg-violet-500",
  delay = 0,
}: {
  value: number;
  colorClass?: string;
  delay?: number;
}) {
  const safe = Math.max(0, Math.min(100, value || 0));
  return (
    <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
      <motion.div
        className={`h-full ${colorClass} rounded-full`}
        initial={{ width: 0 }}
        animate={{ width: `${safe}%` }}
        transition={{ duration: 0.8, delay, ease: "easeOut" }}
      />
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────

export default function CareerProgressSection({
  careerReadiness,
  progress,
  loading,
}: CareerProgressSectionProps) {
  const router = useRouter();

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      {/* Career Readiness */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15 }}
      >
        <Card className="border-0 shadow-sm h-full overflow-hidden">
          <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-violet-50/60 to-slate-50/60 px-6 py-4">
            <CardTitle className="text-base font-semibold text-slate-800 flex items-center gap-2">
              <Target className="h-4 w-4 text-violet-600" />
              Career Readiness
            </CardTitle>
            <CardDescription className="text-xs text-slate-500 mt-1">
              Overall student career readiness breakdown
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-5">
            {loading ? (
              <>
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-2.5 w-full" />
                <div className="grid grid-cols-3 gap-3">
                  <Skeleton className="h-16 w-full rounded-xl" />
                  <Skeleton className="h-16 w-full rounded-xl" />
                  <Skeleton className="h-16 w-full rounded-xl" />
                </div>
              </>
            ) : (
              <>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
                    {careerReadiness?.overall ?? 0}%
                  </span>
                  <span className="text-sm text-slate-500">
                    Overall Career Readiness
                  </span>
                </div>

                <ProgressBar
                  value={careerReadiness?.overall ?? 0}
                  colorClass="bg-gradient-to-r from-violet-500 to-indigo-500"
                  delay={0.2}
                />

                <div className="grid grid-cols-3 gap-3">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 }}
                    className="rounded-xl bg-emerald-50/60 border border-emerald-100 p-3 text-center"
                  >
                    <p className="text-[11px] font-medium text-emerald-700 uppercase tracking-wide">
                      Ready
                    </p>
                    <p className="text-xl font-bold text-emerald-700 mt-1">
                      {careerReadiness?.ready ?? 0}
                    </p>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.35 }}
                    className="rounded-xl bg-amber-50/60 border border-amber-100 p-3 text-center"
                  >
                    <p className="text-[11px] font-medium text-amber-700 uppercase tracking-wide">
                      Developing
                    </p>
                    <p className="text-xl font-bold text-amber-700 mt-1">
                      {careerReadiness?.developing ?? 0}
                    </p>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 }}
                    className="rounded-xl bg-rose-50/60 border border-rose-100 p-3 text-center"
                  >
                    <p className="text-[11px] font-medium text-rose-700 uppercase tracking-wide">
                      Needs Support
                    </p>
                    <p className="text-xl font-bold text-rose-700 mt-1">
                      {careerReadiness?.needsSupport ?? 0}
                    </p>
                  </motion.div>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1.5 text-violet-700 hover:text-violet-800 hover:bg-violet-50 -ml-2 group"
                  onClick={() =>
                    router.push(
                      "/dashboard/institute/reports/careerPerformanceReport"
                    )
                  }
                >
                  View Career Performance
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Student Progress */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card className="border-0 shadow-sm h-full overflow-hidden">
          <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-blue-50/60 to-slate-50/60 px-6 py-4">
            <CardTitle className="text-base font-semibold text-slate-800 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-blue-600" />
              Student Progress
            </CardTitle>
            <CardDescription className="text-xs text-slate-500 mt-1">
              Overall academic and career progress
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-5">
            {loading ? (
              <>
                <Skeleton className="h-8 w-24" />
                <div className="grid grid-cols-2 gap-3">
                  <Skeleton className="h-16 w-full rounded-xl" />
                  <Skeleton className="h-16 w-full rounded-xl" />
                </div>
              </>
            ) : (
              <>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                    {progress?.averageProgress ?? 0}%
                  </span>
                  <span className="text-sm text-slate-500">
                    Average Progress
                  </span>
                </div>

                <ProgressBar
                  value={progress?.averageProgress ?? 0}
                  colorClass="bg-gradient-to-r from-blue-500 to-cyan-500"
                  delay={0.25}
                />

                <div className="grid grid-cols-2 gap-3">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.35 }}
                    className="rounded-xl bg-emerald-50/60 border border-emerald-100 p-3"
                  >
                    <p className="text-[11px] font-medium text-emerald-700 uppercase tracking-wide">
                      On Track
                    </p>
                    <p className="text-xl font-bold text-emerald-700 mt-1">
                      {progress?.onTrack ?? 0}
                    </p>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 }}
                    className="rounded-xl bg-amber-50/60 border border-amber-100 p-3"
                  >
                    <p className="text-[11px] font-medium text-amber-700 uppercase tracking-wide">
                      Needs Attention
                    </p>
                    <p className="text-xl font-bold text-amber-700 mt-1">
                      {progress?.needsAttention ?? 0}
                    </p>
                  </motion.div>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1.5 text-blue-700 hover:text-blue-800 hover:bg-blue-50 -ml-2 group"
                  onClick={() =>
                    router.push("/dashboard/institute/reports/progressReport")
                  }
                >
                  View Progress Report
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}