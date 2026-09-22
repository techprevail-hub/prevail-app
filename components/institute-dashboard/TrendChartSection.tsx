// components/institute-dashboard/TrendChartSection.tsx

"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

// ─── Types ──────────────────────────────────────────────────────────────────

export interface TrendDataPoint {
  month: string;
  progress: number;
  careerReadiness: number;
}

interface TrendChartSectionProps {
  data?: TrendDataPoint[];
  loading?: boolean;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function buildPath(points: { x: number; y: number }[]) {
  if (points.length === 0) return "";
  return points.reduce((acc, point, i) => {
    if (i === 0) return `M ${point.x} ${point.y}`;
    return `${acc} L ${point.x} ${point.y}`;
  }, "");
}

function buildAreaPath(points: { x: number; y: number }[], bottomY: number) {
  if (points.length === 0) return "";
  const linePath = buildPath(points);
  return `${linePath} L ${points[points.length - 1].x} ${bottomY} L ${points[0].x} ${bottomY} Z`;
}

// ─── Custom SVG Chart (Reduced Height) ──────────────────────────────────────

function CustomAreaChart({ data }: { data: TrendDataPoint[] }) {
  const width = 900;
  const height = 200; // ↓ reduced from 300
  const padding = { top: 16, right: 24, bottom: 32, left: 52 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const maxValue = 100;
  const stepX = data.length > 1 ? chartW / (data.length - 1) : 0;

  const progressPoints = data.map((d, i) => ({
    x: padding.left + i * stepX,
    y: padding.top + chartH - (d.progress / maxValue) * chartH,
  }));

  const careerPoints = data.map((d, i) => ({
    x: padding.left + i * stepX,
    y: padding.top + chartH - (d.careerReadiness / maxValue) * chartH,
  }));

  const bottomY = padding.top + chartH;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full">
      <defs>
        {/* Primary gradient (Career Readiness - #6C5CE7) */}
        <linearGradient id="careerFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6C5CE7" stopOpacity={0.2} />
          <stop offset="100%" stopColor="#6C5CE7" stopOpacity={0} />
        </linearGradient>

        {/* Secondary gradient (Progress - #3b82f6) */}
        <linearGradient id="progressFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.2} />
          <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
        </linearGradient>

        {/* Glow filter */}
        <filter id="glow">
          <feGaussianBlur stdDeviation="2" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Grid lines + Y-axis labels */}
      {[0, 25, 50, 75, 100].map((tick) => {
        const y = padding.top + chartH - (tick / maxValue) * chartH;
        return (
          <g key={`grid-${tick}`}>
            <line
              x1={padding.left}
              y1={y}
              x2={padding.left + chartW}
              y2={y}
              stroke="#e2e8f0"
              strokeWidth={1}
              strokeDasharray="4 4"
              opacity={0.6}
            />
            <text
              x={padding.left - 12}
              y={y + 3}
              textAnchor="end"
              fontSize="10"
              fontWeight="500"
              fill="#94a3b8"
              fontFamily="Manrope"
            >
              {tick}%
            </text>
          </g>
        );
      })}

      {/* X-axis labels */}
      {data.map((d, i) => (
        <text
          key={d.month}
          x={padding.left + i * stepX}
          y={height - 10}
          textAnchor="middle"
          fontSize="11"
          fontWeight="500"
          fill="#94a3b8"
          fontFamily="Manrope"
        >
          {d.month}
        </text>
      ))}

      {/* Career Readiness area fill */}
      <motion.path
        d={buildAreaPath(careerPoints, bottomY)}
        fill="url(#careerFill)"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      />

      {/* Career Readiness line */}
      <motion.path
        d={buildPath(careerPoints)}
        fill="none"
        stroke="#6C5CE7"
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
      />

      {/* Progress area fill */}
      <motion.path
        d={buildAreaPath(progressPoints, bottomY)}
        fill="url(#progressFill)"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.4 }}
      />

      {/* Progress line */}
      <motion.path
        d={buildPath(progressPoints)}
        fill="none"
        stroke="#3b82f6"
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.2, ease: "easeOut", delay: 0.1 }}
      />

      {/* Career data points */}
      {careerPoints.map((p, i) => (
        <g key={`c-${i}`}>
          <circle cx={p.x} cy={p.y} r={6} fill="#6C5CE7" opacity={0.1} />
          <motion.circle
            cx={p.x}
            cy={p.y}
            r={4}
            fill="#fff"
            stroke="#6C5CE7"
            strokeWidth={2}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.8 + i * 0.05 }}
          />
        </g>
      ))}

      {/* Progress data points */}
      {progressPoints.map((p, i) => (
        <g key={`p-${i}`}>
          <circle cx={p.x} cy={p.y} r={6} fill="#3b82f6" opacity={0.1} />
          <motion.circle
            cx={p.x}
            cy={p.y}
            r={4}
            fill="#fff"
            stroke="#3b82f6"
            strokeWidth={2}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.8 + i * 0.05 }}
          />
        </g>
      ))}
    </svg>
  );
}

// ─── Empty State ────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-[200px] text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 p-3 mb-3"
      >
        <BarChart3 className="h-6 w-6 text-slate-400" />
      </motion.div>
      <p className="text-sm font-semibold text-slate-800">
        No trend data yet
      </p>
      <p className="text-xs text-slate-600 mt-1">
        Trends will appear as students progress through the platform
      </p>
    </div>
  );
}

// ─── Loading State ───────────────────────────────────────────────────────────

function LoadingSkeleton() {
  return (
    <Card className="border-0 bg-white/70 backdrop-blur-xl shadow-md">
      <CardHeader className="border-b border-white/40 bg-gradient-to-r from-white/50 to-white/30 px-5 py-3">
        <div className="space-y-2">
          <div className="h-5 w-40 bg-slate-200 rounded-lg animate-pulse" />
          <div className="h-3 w-56 bg-slate-100 rounded-lg animate-pulse" />
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="h-[200px] bg-gradient-to-br from-slate-100 to-slate-50 rounded-xl animate-pulse" />
      </CardContent>
    </Card>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────

export default function TrendChartSection({
  data,
  loading,
}: TrendChartSectionProps) {
  if (loading) {
    return <LoadingSkeleton />;
  }

  const hasData = Boolean(data && data.length > 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.1 }}
    >
      <Card className="border-0 bg-white/80 backdrop-blur-xl shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden relative">
        {/* Decorative gradient */}
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-gradient-to-bl from-[#6C5CE7]/5 to-transparent pointer-events-none -z-10" />

        <CardHeader className="border-b border-white/40 bg-gradient-to-r from-white/50 to-violet-50/30 px-5 py-3">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <div className="rounded-lg bg-gradient-to-br from-[#6C5CE7] to-violet-600 p-1.5 shadow-md">
                  <BarChart3 className="h-3.5 w-3.5 text-white" />
                </div>
                Progress Trends
              </CardTitle>
              <CardDescription className="text-[11px] text-slate-600 mt-1">
                Month-by-month progress & career readiness
              </CardDescription>
            </div>
            {hasData && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/60"
              >
                <TrendingUp className="h-3 w-3 text-emerald-600" />
                <span className="text-[10px] font-semibold text-emerald-700">
                  Trending Up
                </span>
              </motion.div>
            )}
          </div>
        </CardHeader>

        <CardContent className="p-4">
          {hasData ? (
            <>
              <div className="h-[200px] w-full mb-3">
                <CustomAreaChart data={data!} />
              </div>

              {/* Legend */}
              <div className="flex flex-wrap items-center justify-center gap-6 p-2.5 rounded-lg bg-gradient-to-r from-slate-50/60 to-violet-50/30 border border-white/60">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="flex items-center gap-2"
                >
                  <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-br from-[#6C5CE7] to-violet-600 shadow-md" />
                  <span className="text-xs font-medium text-slate-700">
                    Career Readiness
                  </span>
                </motion.div>
                <div className="w-px h-5 bg-slate-200/60" />
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="flex items-center gap-2"
                >
                  <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 shadow-md" />
                  <span className="text-xs font-medium text-slate-700">
                    Student Progress
                  </span>
                </motion.div>
              </div>
            </>
          ) : (
            <EmptyState />
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}