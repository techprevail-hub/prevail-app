// app/dashboard/layout.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import DashboardShell from "@/components/layout/DashboardShell";
import DashboardNavbar from "@/components/layout/navbar";
import { usePathname } from "next/navigation";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  // ── Auto-redirect when session expires ──────────────────────────
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT" || event === "TOKEN_REFRESHED" && !session) {
        // Clear storage and redirect
        localStorage.removeItem("userRole");
        localStorage.removeItem("userName");
        localStorage.removeItem("token");
        window.location.replace("/login");
      }

      // If there's no session at all on any auth event, redirect
      if (!session && event !== "INITIAL_SESSION") {
        localStorage.removeItem("userRole");
        localStorage.removeItem("userName");
        localStorage.removeItem("token");
        window.location.replace("/login");
      }
    });

    // Also check session immediately on mount
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        localStorage.removeItem("userRole");
        localStorage.removeItem("userName");
        localStorage.removeItem("token");
        window.location.replace("/login");
      }
    };

    checkSession();

    return () => subscription.unsubscribe();
  }, []);

  const getTitle = () => {
    if (pathname.includes("/institute")) return "Institute Dashboard";
    if (pathname.includes("/coach"))     return "Coach Dashboard";
    if (pathname.includes("/seeker"))    return "Job Seeker Dashboard";
    return "Dashboard";
  };

  const getSubtitle = () => {
    if (pathname.includes("/institute")) return "Campus-wide Career Readiness Overview";
    if (pathname.includes("/coach"))     return "Manage your coaching business and clients";
    if (pathname.includes("/seeker"))    return "Track your career preparation journey";
    return "Welcome to your dashboard";
  };

  return (
    <DashboardShell>
      <DashboardNavbar title={getTitle()} subtitle={getSubtitle()} />
      <main className="flex-1 overflow-y-auto">
        <div className="p-6">{children}</div>
      </main>
    </DashboardShell>
  );
}