"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, BarChart3 } from "lucide-react";
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

// ─── Custom SVG Chart ───────────────────────────────────────────────────────

function CustomAreaChart({ data }: { data: TrendDataPoint[] }) {
  const width = 800;
  const height = 280;
  const padding = { top: 20, right: 20, bottom: 40, left: 50 };
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
        <linearGradient id="progressFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
          <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
        </linearGradient>
        <linearGradient id="careerFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
        </linearGradient>
      </defs>

      {/* Grid lines + Y axis labels */}
      {[0, 25, 50, 75, 100].map((tick) => {
        const y = padding.top + chartH - (tick / maxValue) * chartH;
        return (
          <g key={tick}>
            <line
              x1={padding.left}
              y1={y}
              x2={padding.left + chartW}
              y2={y}
              stroke="#e2e8f0"
              strokeDasharray="3 3"
            />
            <text
              x={padding.left - 8}
              y={y + 4}
              textAnchor="end"
              fontSize="11"
              fill="#94a3b8"
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
          y={height - 12}
          textAnchor="middle"
          fontSize="12"
          fill="#94a3b8"
        >
          {d.month}
        </text>
      ))}

      {/* Career area + line */}
      <motion.path
        d={buildAreaPath(careerPoints, bottomY)}
        fill="url(#careerFill)"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.3 }}
      />
      <motion.path
        d={buildPath(careerPoints)}
        fill="none"
        stroke="#3b82f6"
        strokeWidth={2.5}
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
      />

      {/* Progress area + line */}
      <motion.path
        d={buildAreaPath(progressPoints, bottomY)}
        fill="url(#progressFill)"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.5 }}
      />
      <motion.path
        d={buildPath(progressPoints)}
        fill="none"
        stroke="#8b5cf6"
        strokeWidth={2.5}
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
      />

      {/* Data points */}
      {careerPoints.map((p, i) => (
        <motion.circle
          key={`c-${i}`}
          cx={p.x}
          cy={p.y}
          r={4}
          fill="#3b82f6"
          stroke="#fff"
          strokeWidth={2}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.8 + i * 0.05 }}
        />
      ))}
      {progressPoints.map((p, i) => (
        <motion.circle
          key={`p-${i}`}
          cx={p.x}
          cy={p.y}
          r={4}
          fill="#8b5cf6"
          stroke="#fff"
          strokeWidth={2}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.8 + i * 0.05 }}
        />
      ))}
    </svg>
  );
}

// ─── Empty State ────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-[320px] text-center">
      <div className="rounded-full bg-slate-50 p-4 mb-3">
        <BarChart3 className="h-7 w-7 text-slate-400" />
      </div>
      <p className="text-sm font-semibold text-slate-700">
        No trend data available yet
      </p>
      <p className="text-xs text-slate-500 mt-1">
        Trend will appear once activity data is recorded.
      </p>
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────

export default function TrendChartSection({
  data,
  loading,
}: TrendChartSectionProps) {
  if (loading) {
    return (
      <Card className="border-0 shadow-sm">
        <CardHeader className="border-b border-slate-100 bg-slate-50/60 px-6 py-4">
          <div className="space-y-2">
            <div className="h-5 w-40 bg-slate-200 rounded animate-pulse" />
            <div className="h-3 w-64 bg-slate-100 rounded animate-pulse" />
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="h-[320px] bg-slate-50 rounded-xl animate-pulse" />
        </CardContent>
      </Card>
    );
  }

  const hasData = Boolean(data && data.length > 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
    >
      <Card className="border-0 shadow-sm overflow-hidden">
        <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-slate-50/80 to-violet-50/40 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold text-slate-800 flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-violet-600" />
                Progress Trend
              </CardTitle>
              <CardDescription className="text-xs text-slate-500 mt-1">
                Month-wise student progress and career readiness
              </CardDescription>
            </div>
            {hasData && (
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-50 border border-violet-100">
                <TrendingUp className="h-3.5 w-3.5 text-violet-600" />
                <span className="text-xs font-medium text-violet-700">
                  Trending Up
                </span>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {hasData ? (
            <>
              <div className="h-[320px] w-full">
                <CustomAreaChart data={data!} />
              </div>

              {/* Legend */}
              <div className="flex items-center justify-center gap-6 mt-4">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-violet-500" />
                  <span className="text-xs font-medium text-slate-600">
                    Student Progress
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-blue-500" />
                  <span className="text-xs font-medium text-slate-600">
                    Career Readiness
                  </span>
                </div>
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