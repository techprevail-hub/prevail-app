"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Users,
  GraduationCap,
  Target,
  TrendingUp,
  Briefcase,
  DollarSign,
  AlertTriangle,
} from "lucide-react";
import { motion } from "framer-motion";

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatPackage(value: number | null | undefined) {
  if (value === null || value === undefined) return "—";
  return `₹${value} LPA`;
}

// ─── Types ──────────────────────────────────────────────────────────────────

interface OverviewData {
  totalStudents?: number;
  totalCoaches?: number;
  careerReadiness?: number;
  averageProgress?: number;
  placementRate?: number;
  averagePackage?: number | null;
  needsAttention?: number;
}

interface OverviewCardsSectionProps {
  overview?: OverviewData;
  loading?: boolean;
}

// ─── Overview Stat Card (Clickable) ─────────────────────────────────────────

function OverviewCard({
  title,
  value,
  icon: Icon,
  accentClass,
  iconBgClass,
  hint,
  delay = 0,
  path,
}: {
  title: string;
  value: string | number;
  icon: any;
  accentClass: string;
  iconBgClass: string;
  hint?: string;
  delay?: number;
  path?: string;
}) {
  const router = useRouter();
  const isClickable = Boolean(path);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      whileHover={isClickable ? { y: -4, transition: { duration: 0.2 } } : {}}
      onClick={() => path && router.push(path)}
      className={isClickable ? "cursor-pointer" : ""}
      role={isClickable ? "button" : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onKeyDown={(e) => {
        if (isClickable && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          router.push(path!);
        }
      }}
    >
      <Card
        className={`relative overflow-hidden border-0 shadow-sm transition-all duration-300 h-full bg-white/80 backdrop-blur-sm ${
          isClickable
            ? "hover:shadow-lg hover:border-violet-200 ring-0 hover:ring-1 hover:ring-violet-100"
            : ""
        }`}
      >
        {/* Gradient accent line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-500/0 via-violet-500/60 to-violet-500/0" />

        <CardContent className="p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                {title}
              </p>
              <p className={`text-2xl font-bold mt-2 ${accentClass}`}>
                {value}
              </p>
              {hint && (
                <p className="text-[11px] text-slate-400 mt-1">{hint}</p>
              )}
            </div>
            <div
              className={`rounded-xl p-2.5 shrink-0 ${iconBgClass} shadow-sm transition-transform duration-300 ${
                isClickable ? "group-hover:scale-110" : ""
              }`}
            >
              <Icon className="h-5 w-5" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ─── Overview Skeleton ──────────────────────────────────────────────────────

function OverviewSkeleton() {
  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-7 w-16" />
          </div>
          <Skeleton className="h-10 w-10 rounded-xl" />
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────

export default function OverviewCardsSection({
  overview,
  loading,
}: OverviewCardsSectionProps) {
  const skeletonCount = 5;

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <OverviewSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      <OverviewCard
        title="Total Students"
        value={overview?.totalStudents ?? 0}
        icon={Users}
        accentClass="text-slate-800"
        iconBgClass="bg-slate-100 text-slate-600"
        delay={0}
        path="/dashboard/institute/students"
      />
      <OverviewCard
        title="Total Coaches"
        value={overview?.totalCoaches ?? 0}
        icon={GraduationCap}
        accentClass="text-indigo-700"
        iconBgClass="bg-indigo-50 text-indigo-600"
        delay={0.05}
        path="/dashboard/institute/coaches"
      />
      <OverviewCard
        title="Career Readiness"
        value={`${overview?.careerReadiness ?? 0}%`}
        icon={Target}
        accentClass="text-violet-700"
        iconBgClass="bg-violet-50 text-violet-600"
        delay={0.1}
        path="/dashboard/institute/reports/careerPerformanceReport"
      />
      <OverviewCard
        title="Average Progress"
        value={`${overview?.averageProgress ?? 0}%`}
        icon={TrendingUp}
        accentClass="text-blue-700"
        iconBgClass="bg-blue-50 text-blue-600"
        delay={0.15}
        path="/dashboard/institute/reports/progressReport"
      />
      <OverviewCard
        title="Placement Rate"
        value={`${overview?.placementRate ?? 0}%`}
        icon={Briefcase}
        accentClass="text-emerald-700"
        iconBgClass="bg-emerald-50 text-emerald-600"
        delay={0.2}
        path="/dashboard/institute/placement"
      />
    </div>
  );
}