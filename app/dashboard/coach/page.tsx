"use client";

import { useCallback, useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { getCoachDashboard } from "@/services/role-coach/coachDashboard.service";
import type { CoachDashboardData } from "@/types/role-coach/coachDashboard.types";

import { DashboardSections } from "@/components/role-coach/dashboard/dashboard-sections";

export default function CoachDashboardPage() {
  const [dashboard, setDashboard] = useState<CoachDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getCoachDashboard();

      if (!data?.coach || !data?.overview) {
        throw new Error("Invalid dashboard response received from the server.");
      }

      setDashboard(data);
    } catch (err) {
      console.error("Coach dashboard error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load coach dashboard."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  return (
    <main className="min-h-screen space-y-5 bg-gradient-to-b from-[#F6F4FF] to-white p-4 md:p-6 lg:p-8">
      {(loading || error) && (
        <div
          role={error ? "alert" : "status"}
          aria-live="polite"
          className={cn(
            "flex flex-wrap items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-sm",
            error
              ? "border-red-200 bg-red-50 text-red-700"
              : "border-violet-100 bg-white/80 text-slate-500"
          )}
        >
          <p>
            {error
              ? `Dashboard data could not be loaded: ${error}`
              : "Loading your latest dashboard data…"}
          </p>

          {error && (
            <Button
              size="sm"
              onClick={loadDashboard}
              className="rounded-xl bg-[#6C5CE7] hover:bg-[#5b4bd6]"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Try again
            </Button>
          )}
        </div>
      )}

      <DashboardSections dashboard={dashboard} loading={loading} />
    </main>
  );
}