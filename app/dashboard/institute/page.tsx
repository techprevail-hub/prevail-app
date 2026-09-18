// app/dashboard/institute/page.tsx

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RefreshCw, Sparkles, XCircle } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

import { getInstituteDashboard } from "@/services/instituteDashboard.service";

import type { InstituteDashboardData } from "@/types/institute_Dashboard";

// ─── Import Components ──────────────────────────────────────────────────────

import OverviewCardsSection from "@/components/institute-dashboard/OverviewCardsSection";
import TrendChartSection from "@/components/institute-dashboard/TrendChartSection";
import PlacementOverviewSection from "@/components/institute-dashboard/PlacementOverviewSection";
import StudentsAttentionSection from "@/components/institute-dashboard/StudentsAttentionSection";
import NPSSection from "@/components/institute-dashboard/NPSSection";
import QuickActionsSection from "@/components/institute-dashboard/QuickActionsSection";

// ─── Main Component ─────────────────────────────────────────────────────────

export default function InstituteDashboardPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<InstituteDashboardData | null>(null);

  const hasLoadedRef = useRef(false);

  // ─── Load dashboard ─────────────────────────────────────────────────────
  const loadDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getInstituteDashboard();

      if (response && response.success && response.data) {
        setData(response.data);
      } else {
        setError(response?.message || "Unable to load dashboard data.");
        toast.error(response?.message || "Unable to load dashboard data.");
      }
    } catch (err: any) {
      console.error("Failed to load institute dashboard:", err);
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Unable to load dashboard data.";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  // ─── Initial load (guarded for Strict Mode) ─────────────────────────────
  useEffect(() => {
    if (hasLoadedRef.current) return;
    hasLoadedRef.current = true;
    loadDashboard();
  }, [loadDashboard]);

  // ─── Error state ────────────────────────────────────────────────────────
  if (error && !data) {
    return (
      <div className="p-6">
        <Card className="border-0 shadow-sm">
          <CardContent className="flex flex-col items-center gap-4 py-16 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="rounded-full bg-red-50 p-4"
            >
              <XCircle className="h-8 w-8 text-red-500" />
            </motion.div>
            <div>
              <h3 className="text-base font-semibold text-slate-800">
                Unable to load dashboard data.
              </h3>
              <p className="text-sm text-slate-500 mt-1">{error}</p>
            </div>
            <Button
              onClick={loadDashboard}
              disabled={loading}
              className="gap-2 bg-gradient-to-r from-[#6C5CE7] to-[#8b7cf7] hover:from-[#5a4bd8] hover:to-[#7a6de7] text-white shadow-lg shadow-[#6C5CE7]/25"
            >
              <RefreshCw
                className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
              />
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const overview = data?.overview;
  const placement = data?.placement;
  const nps = data?.nps;
  const studentsNeedingAttention = data?.studentsNeedingAttention ?? [];
  const isLoading = loading && !data;

  // ─── Trend data from API (adjust key based on your backend) ─────────────
  // If your backend returns `trendData`, use it. Otherwise chart shows empty state.
  const trendData = (data as any)?.trendData as
    | { month: string; progress: number; careerReadiness: number }[]
    | undefined;

  return (
    <div className="space-y-6 p-6">
      {/* ─── Header ─────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
              Institute Overview
            </h1>
            <Sparkles className="h-5 w-5 text-indigo-500" />
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Monitor student progress, career readiness, placements and overall
            institute performance.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          className="gap-2 border-slate-200 hover:border-violet-200 hover:bg-violet-50 transition-all duration-200"
          onClick={loadDashboard}
          disabled={loading}
        >
          <RefreshCw
            className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`}
          />
          Refresh
        </Button>
      </motion.div>

      {/* ─── Overview Cards (Clickable → Navigate) ─────────────────────── */}
      <OverviewCardsSection overview={overview} loading={isLoading} />

      {/* ─── Trend Chart (Real API Data) ────────────────────────────────── */}
      <TrendChartSection data={trendData} loading={isLoading} />

      {/* ─── Placement Overview ─────────────────────────────────────────── */}
      <PlacementOverviewSection placement={placement} loading={isLoading} />

      {/* ─── NPS + Students Needing Attention ───────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <NPSSection nps={nps} loading={isLoading} />
        <StudentsAttentionSection
          students={studentsNeedingAttention}
          loading={isLoading}
        />
      </div>

      {/* ─── Quick Actions ──────────────────────────────────────────────── */}
      <QuickActionsSection />
    </div>
  );
}