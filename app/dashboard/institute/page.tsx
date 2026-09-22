// app/dashboard/institute/page.tsx

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RefreshCw, XCircle } from "lucide-react";
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
      <div className="p-4 sm:p-6">
        <Card className="border-0 shadow-md bg-white/80 backdrop-blur-xl">
          <CardContent className="flex flex-col items-center gap-4 py-16 text-center">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              className="rounded-2xl bg-gradient-to-br from-red-50 to-pink-50 border border-red-100 p-4"
            >
              <XCircle className="h-8 w-8 text-red-500" />
            </motion.div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Unable to load dashboard
              </h3>
              <p className="text-sm text-slate-600 mt-2">{error}</p>
            </div>
            <Button
              onClick={loadDashboard}
              disabled={loading}
              className="gap-2 bg-gradient-to-r from-[#6C5CE7] to-[#8b7cf7] hover:from-[#5a4bd8] hover:to-[#7a6de7] text-white shadow-lg shadow-[#6C5CE7]/30 mt-2"
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
  const trendData = (data as any)?.trendData as
    | { month: string; progress: number; careerReadiness: number }[]
    | undefined;

  return (
    <div className="p-3 sm:p-4">
      <div className="max-w-7xl mx-auto space-y-3">
        {/* ─── Bento Grid Layout ───────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 auto-rows-max">
          {/* Row 1: Overview Cards (spans full width) */}
          <div className="lg:col-span-12">
            <OverviewCardsSection overview={overview} loading={isLoading} />
          </div>

          {/* Row 2: Trend Chart (left, large) + NPS (right, compact) */}
          <div className="lg:col-span-8">
            <TrendChartSection data={trendData} loading={isLoading} />
          </div>
          <div className="lg:col-span-4">
            <NPSSection nps={nps} loading={isLoading} />
          </div>

          {/* Row 3: Placement Overview */}
          <div className="lg:col-span-12">
            <PlacementOverviewSection placement={placement} loading={isLoading} />
          </div>

          {/* Row 4: Students Needing Attention (full width) */}
          <div className="lg:col-span-12">
            <StudentsAttentionSection
              students={studentsNeedingAttention}
              loading={isLoading}
            />
          </div>

          {/* Row 5: Quick Actions (full width) */}
          <div className="lg:col-span-12">
            <QuickActionsSection />
          </div>
        </div>
      </div>
    </div>
  );
}