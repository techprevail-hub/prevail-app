// components/institute-dashboard/PlacementOverviewSection.tsx

"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Briefcase, TrendingUp, Users, DollarSign, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

// ─── Types ──────────────────────────────────────────────────────────────────

interface PlacementData {
  placementRate?: number;
  placedStudents?: number;
  averagePackage?: number;
  campusPlaced?: number;
  offCampusPlaced?: number;
  submitted?: number;
  notPlaced?: number;
  notSubmitted?: number;
}

interface PlacementOverviewSectionProps {
  placement?: PlacementData;
  loading?: boolean;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatPackage(value: number | null | undefined) {
  if (value === null || value === undefined) return "—";
  return `₹${value} LPA`;
}

// ─── Loading Skeleton ───────────────────────────────────────────────────────

function LoadingSkeleton() {
  return (
    <Card className="border-0 bg-white/70 backdrop-blur-xl h-full">
      <CardHeader className="border-b border-white/40 px-5 py-3 bg-gradient-to-r from-white/50 to-white/30">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-3 w-56 mt-1.5" />
      </CardHeader>
      <CardContent className="p-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-xl" />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Stat Tile Component (Compact) ──────────────────────────────────────────

interface StatTileProps {
  label: string;
  value: string | number;
  subtext?: string;
  icon: any;
  bgGradient: string;
  iconColor: string;
  delay?: number;
}

function StatTile({
  label,
  value,
  subtext,
  icon: Icon,
  bgGradient,
  iconColor,
  delay = 0,
}: StatTileProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, delay, type: "spring", stiffness: 180 }}
    >
      <div
        className={`relative overflow-hidden rounded-xl bg-gradient-to-br ${bgGradient} border border-white/40 backdrop-blur-sm p-3.5 h-full group hover:shadow-lg hover:shadow-current/10 transition-all duration-300 cursor-default`}
      >
        {/* Decorative corner */}
        <div className="absolute -top-6 -right-6 w-20 h-20 rounded-full bg-white/10 blur-xl group-hover:bg-white/20 transition-colors" />

        <div className="relative flex items-center gap-3">
          {/* Icon */}
          <div className={`w-9 h-9 rounded-lg ${iconColor} flex items-center justify-center shadow-md shrink-0`}>
            <Icon className="h-4 w-4 text-white" />
          </div>

          {/* Text */}
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-semibold text-white/70 uppercase tracking-wider truncate">
              {label}
            </p>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: delay + 0.2 }}
              className="text-lg font-bold text-white leading-tight"
            >
              {value}
            </motion.p>
            {subtext && (
              <p className="text-[10px] text-white/60 truncate mt-0.5">
                {subtext}
              </p>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────

export default function PlacementOverviewSection({
  placement,
  loading,
}: PlacementOverviewSectionProps) {
  const router = useRouter();

  if (loading) {
    return <LoadingSkeleton />;
  }

  const placementRate = placement?.placementRate ?? 0;
  const placedStudents = placement?.placedStudents ?? 0;
  const avgPackage = placement?.averagePackage ?? 0;
  const campusPlaced = placement?.campusPlaced ?? 0;
  const offCampusPlaced = placement?.offCampusPlaced ?? 0;
  const submitted = placement?.submitted ?? 0;
  const notPlaced = placement?.notPlaced ?? 0;
  const notSubmitted = placement?.notSubmitted ?? 0;

  const totalStudents = submitted;
  const placementPercentage =
    totalStudents > 0 ? Math.round((placedStudents / totalStudents) * 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.28 }}
    >
      <Card className="border-0 bg-white/80 backdrop-blur-xl shadow-md hover:shadow-lg transition-all duration-300 h-full overflow-hidden relative">
        {/* Decorative gradient elements */}
        <div className="absolute -top-32 -right-32 w-80 h-80 rounded-full bg-gradient-to-bl from-emerald-200/10 to-transparent pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full bg-gradient-to-tr from-blue-200/10 to-transparent pointer-events-none" />

        <CardHeader className="border-b border-white/40 bg-gradient-to-r from-white/50 to-emerald-50/30 px-5 py-3 relative">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-gradient-to-br from-emerald-400 to-teal-600 p-1.5 shadow-lg">
                <Briefcase className="h-3.5 w-3.5 text-white" />
              </div>
              <div>
                <CardTitle className="text-sm font-bold text-slate-900">
                  Placement Overview
                </CardTitle>
                <CardDescription className="text-[11px] text-slate-600 mt-0.5">
                  Campus & off-campus placement metrics
                </CardDescription>
              </div>
            </div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/60"
            >
              <TrendingUp className="h-3 w-3 text-emerald-600" />
              <span className="text-[10px] font-semibold text-emerald-700">
                {placementRate}% Rate
              </span>
            </motion.div>
          </div>
        </CardHeader>

        <CardContent className="p-4 space-y-3 relative">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatTile
              label="Placement Rate"
              value={`${placementRate}%`}
              icon={TrendingUp}
              bgGradient="from-emerald-400 via-emerald-500 to-teal-600"
              iconColor="bg-emerald-300/40"
              delay={0}
            />
            <StatTile
              label="Placed Students"
              value={placedStudents}
              subtext={`Out of ${submitted}`}
              icon={Users}
              bgGradient="from-blue-400 via-blue-500 to-cyan-600"
              iconColor="bg-blue-300/40"
              delay={0.08}
            />
            <StatTile
              label="Avg Package"
              value={formatPackage(avgPackage)}
              icon={DollarSign}
              bgGradient="from-violet-400 via-purple-500 to-indigo-600"
              iconColor="bg-violet-300/40"
              delay={0.16}
            />
            <StatTile
              label="Campus Placed"
              value={campusPlaced}
              subtext={`+${offCampusPlaced} off-campus`}
              icon={Briefcase}
              bgGradient="from-orange-400 via-orange-500 to-red-600"
              iconColor="bg-orange-300/40"
              delay={0.24}
            />
          </div>

          {/* Breakdown Stats + Action in one row */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-3 border-t border-white/40">
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.32 }}
              className="p-3 rounded-lg bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200/60 flex items-center justify-between"
            >
              <div>
                <p className="text-[10px] font-semibold text-emerald-700 uppercase tracking-wider">
                  Placed
                </p>
                <p className="text-xl font-bold text-emerald-600">{placedStudents}</p>
              </div>
              <div className="w-12 bg-emerald-200/30 rounded-full h-1.5 overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-emerald-400 to-teal-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${placementPercentage}%` }}
                  transition={{ duration: 1.2, ease: "easeOut", delay: 0.5 }}
                />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="p-3 rounded-lg bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200/60 flex items-center justify-between"
            >
              <p className="text-[10px] font-semibold text-amber-700 uppercase tracking-wider">
                Not Placed
              </p>
              <p className="text-xl font-bold text-amber-600">{notPlaced}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.48 }}
              className="p-3 rounded-lg bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200/60 flex items-center justify-between"
            >
              <p className="text-[10px] font-semibold text-slate-700 uppercase tracking-wider">
                Not Submitted
              </p>
              <p className="text-xl font-bold text-slate-600">{notSubmitted}</p>
            </motion.div>

            {/* CTA inline */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.56 }}
              className="flex items-center justify-center"
            >
              <Button
                variant="ghost"
                size="sm"
                className="w-full gap-1.5 text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50 group border border-emerald-200/60 hover:border-emerald-300 rounded-lg text-xs h-9"
                onClick={() => router.push("/dashboard/institute/placement")}
              >
                View Report
                <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
              </Button>
            </motion.div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}