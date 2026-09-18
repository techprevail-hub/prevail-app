"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Briefcase, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatPackage(value: number | null | undefined) {
  if (value === null || value === undefined) return "—";
  return `₹${value} LPA`;
}

// ─── Types ──────────────────────────────────────────────────────────────────

interface PlacementData {
  placementRate?: number;
  placedStudents?: number;
  averagePackage?: number | null;
  submitted?: number;
  notPlaced?: number;
  notSubmitted?: number;
  campusPlaced?: number;
  offCampusPlaced?: number;
}

interface PlacementOverviewSectionProps {
  placement?: PlacementData;
  loading?: boolean;
}

// ─── Placement Stat Box ─────────────────────────────────────────────────────

function PlacementStat({
  label,
  value,
  tone,
  delay = 0,
}: {
  label: string;
  value: string | number;
  tone: "emerald" | "amber" | "blue" | "rose" | "slate";
  delay?: number;
}) {
  const toneClass: Record<string, string> = {
    emerald: "bg-emerald-50/60 border-emerald-100 text-emerald-700",
    amber: "bg-amber-50/60 border-amber-100 text-amber-700",
    blue: "bg-blue-50/60 border-blue-100 text-blue-700",
    rose: "bg-rose-50/60 border-rose-100 text-rose-700",
    slate: "bg-slate-50/60 border-slate-100 text-slate-700",
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay }}
      whileHover={{ scale: 1.02 }}
      className={`rounded-xl border p-3 text-center ${toneClass[tone]}`}
    >
      <p className="text-[11px] font-medium uppercase tracking-wide opacity-80">
        {label}
      </p>
      <p className="text-xl font-bold mt-1">{value}</p>
    </motion.div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────

export default function PlacementOverviewSection({
  placement,
  loading,
}: PlacementOverviewSectionProps) {
  const router = useRouter();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.25 }}
    >
      <Card className="border-0 shadow-sm overflow-hidden">
        <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-emerald-50/60 to-slate-50/60 px-6 py-4">
          <CardTitle className="text-base font-semibold text-slate-800 flex items-center gap-2">
            <Briefcase className="h-4 w-4 text-emerald-600" />
            Placement Overview
          </CardTitle>
          <CardDescription className="text-xs text-slate-500 mt-1">
            Summary of placement performance across the institute
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-16 rounded-xl" />
              ))}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                <PlacementStat
                  label="Placement Rate"
                  value={`${placement?.placementRate ?? 0}%`}
                  tone="emerald"
                  delay={0.05}
                />
                <PlacementStat
                  label="Placed"
                  value={placement?.placedStudents ?? 0}
                  tone="emerald"
                  delay={0.1}
                />
                <PlacementStat
                  label="Avg Package"
                  value={formatPackage(placement?.averagePackage)}
                  tone="amber"
                  delay={0.15}
                />
                <PlacementStat
                  label="Submitted"
                  value={placement?.submitted ?? 0}
                  tone="blue"
                  delay={0.2}
                />
                <PlacementStat
                  label="Not Placed"
                  value={placement?.notPlaced ?? 0}
                  tone="rose"
                  delay={0.25}
                />
                <PlacementStat
                  label="Not Submitted"
                  value={placement?.notSubmitted ?? 0}
                  tone="slate"
                  delay={0.3}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.35 }}
                  className="rounded-xl bg-blue-50/60 border border-blue-100 p-3 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                    <span className="text-sm font-medium text-blue-700">
                      Campus
                    </span>
                  </div>
                  <span className="text-lg font-bold text-blue-700">
                    {placement?.campusPlaced ?? 0}
                  </span>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  className="rounded-xl bg-purple-50/60 border border-purple-100 p-3 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-purple-500" />
                    <span className="text-sm font-medium text-purple-700">
                      Off Campus
                    </span>
                  </div>
                  <span className="text-lg font-bold text-purple-700">
                    {placement?.offCampusPlaced ?? 0}
                  </span>
                </motion.div>
              </div>

              <div className="flex justify-end mt-5">
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1.5 text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50 group"
                  onClick={() => router.push("/dashboard/institute/placement")}
                >
                  View Placement Details
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}