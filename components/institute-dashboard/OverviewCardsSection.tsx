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
  ArrowUpRight,
} from "lucide-react";
import { motion } from "framer-motion";

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

// ─── Card Config ────────────────────────────────────────────────────────────

const cardConfigs = [
  {
    key: "totalStudents",
    title: "Total Students",
    subtitle: "Enrolled in platform",
    icon: Users,
    gradient: "from-violet-500 to-purple-600",
    bgGradient: "from-violet-50 to-purple-50",
    textColor: "text-violet-700",
    glowColor: "shadow-violet-500/30",
    ringColor: "ring-violet-100",
    path: "/dashboard/institute/students",
    suffix: "",
  },
  {
    key: "totalCoaches",
    title: "Total Coaches",
    subtitle: "Active instructors",
    icon: GraduationCap,
    gradient: "from-indigo-500 to-blue-600",
    bgGradient: "from-indigo-50 to-blue-50",
    textColor: "text-indigo-700",
    glowColor: "shadow-indigo-500/30",
    ringColor: "ring-indigo-100",
    path: "/dashboard/institute/coaches",
    suffix: "",
  },
  {
    key: "careerReadiness",
    title: "Career Readiness",
    subtitle: "Institute average",
    icon: Target,
    gradient: "from-fuchsia-500 to-pink-600",
    bgGradient: "from-fuchsia-50 to-pink-50",
    textColor: "text-fuchsia-700",
    glowColor: "shadow-fuchsia-500/30",
    ringColor: "ring-fuchsia-100",
    path: "/dashboard/institute/reports/careerPerformanceReport",
    suffix: "%",
  },
  {
    key: "averageProgress",
    title: "Avg Progress",
    subtitle: "Student advancement",
    icon: TrendingUp,
    gradient: "from-blue-500 to-cyan-600",
    bgGradient: "from-blue-50 to-cyan-50",
    textColor: "text-blue-700",
    glowColor: "shadow-blue-500/30",
    ringColor: "ring-blue-100",
    path: "/dashboard/institute/reports/progressReport",
    suffix: "%",
  },
  {
    key: "placementRate",
    title: "Placement Rate",
    subtitle: "Successfully placed",
    icon: Briefcase,
    gradient: "from-emerald-500 to-teal-600",
    bgGradient: "from-emerald-50 to-teal-50",
    textColor: "text-emerald-700",
    glowColor: "shadow-emerald-500/30",
    ringColor: "ring-emerald-100",
    path: "/dashboard/institute/placement",
    suffix: "%",
  },
];

// ─── Overview Stat Card ─────────────────────────────────────────────────────

function OverviewCard({
  title,
  subtitle,
  value,
  icon: Icon,
  gradient,
  bgGradient,
  textColor,
  glowColor,
  ringColor,
  delay = 0,
  path,
  suffix,
}: {
  title: string;
  subtitle: string;
  value: string | number;
  icon: any;
  gradient: string;
  bgGradient: string;
  textColor: string;
  glowColor: string;
  ringColor: string;
  delay?: number;
  path?: string;
  suffix?: string;
}) {
  const router = useRouter();

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: "easeOut" }}
      whileHover={{ y: -6, transition: { duration: 0.25 } }}
      onClick={() => path && router.push(path)}
      className="cursor-pointer group"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          path && router.push(path);
        }
      }}
    >
      <Card className="relative overflow-hidden border-0 shadow-lg shadow-slate-200/60 h-full bg-white hover:shadow-2xl hover:shadow-slate-300/50 transition-all duration-400 rounded-2xl">
        {/* Top gradient bar */}
        <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${gradient}`} />

        {/* Background decorative circles */}
        <div
          className={`absolute -top-10 -right-10 w-32 h-32 rounded-full bg-gradient-to-br ${bgGradient} opacity-80 blur-2xl group-hover:opacity-100 group-hover:scale-110 transition-all duration-500`}
        />
        <div
          className={`absolute -bottom-12 -left-12 w-28 h-28 rounded-full bg-gradient-to-tr ${bgGradient} opacity-40 blur-3xl group-hover:opacity-70 transition-all duration-500`}
        />

        <CardContent className="p-5 pt-6 relative h-full flex flex-col">
          {/* Title row with icon */}
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                {title}
              </p>
            </div>

            {/* Icon with glow effect */}
            <div className="relative shrink-0">
              {/* Glow ring behind icon */}
              <div
                className={`absolute inset-0 rounded-xl bg-gradient-to-br ${gradient} opacity-40 blur-md group-hover:opacity-70 transition-opacity duration-300`}
              />
              <div
                className={`relative rounded-xl p-2.5 bg-gradient-to-br ${gradient} shadow-lg ${glowColor} transition-all duration-300 group-hover:scale-110 group-hover:rotate-6 ring-4 ring-white`}
              >
                <Icon className="h-4.5 w-4.5 text-white" strokeWidth={2.5} />
              </div>
            </div>
          </div>

          {/* Big value */}
          <div className="flex items-baseline gap-1.5 mb-2">
            <p className={`text-3xl font-bold ${textColor} tracking-tight leading-none`}>
              {value}
            </p>
            {suffix && (
              <span className={`text-lg font-bold ${textColor} opacity-70`}>
                {suffix}
              </span>
            )}
          </div>

          {/* Subtitle at bottom */}
          <div className="mt-auto flex items-center justify-between gap-2">
            <p className="text-[11px] font-medium text-slate-500 leading-tight">
              {subtitle}
            </p>

            {/* Hover arrow indicator */}
            <div
              className={`flex items-center justify-center w-6 h-6 rounded-lg bg-gradient-to-br ${bgGradient} ring-1 ${ringColor} opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0`}
            >
              <ArrowUpRight className={`h-3 w-3 ${textColor}`} strokeWidth={2.5} />
            </div>
          </div>

          {/* Bottom subtle shimmer */}
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-slate-200/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ─── Skeleton ───────────────────────────────────────────────────────────────

function OverviewSkeleton() {
  return (
    <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
      <div className="h-1.5 bg-slate-100" />
      <CardContent className="p-5 pt-6">
        <div className="flex items-start justify-between mb-3">
          <div className="space-y-3">
            <Skeleton className="h-3 w-24" />
          </div>
          <Skeleton className="h-10 w-10 rounded-xl" />
        </div>
        <Skeleton className="h-8 w-20 mb-2" />
        <Skeleton className="h-3 w-28 mt-4" />
      </CardContent>
    </Card>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────

export default function OverviewCardsSection({
  overview,
  loading,
}: OverviewCardsSectionProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <OverviewSkeleton key={i} />
        ))}
      </div>
    );
  }

  const values: Record<string, string | number> = {
    totalStudents: overview?.totalStudents ?? 0,
    totalCoaches: overview?.totalCoaches ?? 0,
    careerReadiness: overview?.careerReadiness ?? 0,
    averageProgress: overview?.averageProgress ?? 0,
    placementRate: overview?.placementRate ?? 0,
  };

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      {cardConfigs.map((config, index) => (
        <OverviewCard
          key={config.key}
          title={config.title}
          subtitle={config.subtitle}
          value={values[config.key]}
          icon={config.icon}
          gradient={config.gradient}
          bgGradient={config.bgGradient}
          textColor={config.textColor}
          glowColor={config.glowColor}
          ringColor={config.ringColor}
          delay={index * 0.06}
          path={config.path}
          suffix={config.suffix}
        />
      ))}
    </div>
  );
}