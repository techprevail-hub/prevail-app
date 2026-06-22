// components/layout/app-sidebar.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { supabase } from "@/lib/supabaseClient";
import { useEffect, useState } from "react";
import {
  Home,
  FileText,
  User,
  Camera,
  Mic,
  Users,
  Calendar,
  TrendingUp,
  Settings,
  Briefcase,
  Star,
  BarChart3,
  UserPlus,
  PlusCircle,
  HelpCircle,
  DollarSign,
  Award,
  BookOpen,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type NavItem = {
  label: string;
  href:  string;
  icon:  any;
  badge?: string;
};

// ─── Navigation config ────────────────────────────────────────────────────────

const NAV_CONFIG: Record<string, NavItem[]> = {
  student: [
    { label: "Home",      href: "/dashboard/seeker",           icon: Home },
    { label: "Resume",    href: "/dashboard/seeker/resume",    icon: FileText },
    { label: "LinkedIn",  href: "/dashboard/seeker/linkedin",  icon: User },
    { label: "Headshot",  href: "/dashboard/seeker/headshot",  icon: Camera },
    { label: "Interview", href: "/dashboard/seeker/interview", icon: Mic },
    { label: "Coach",     href: "/dashboard/seeker/coach",     icon: Users },
    { label: "Job Insights",  href: "/dashboard/seeker/job-insights",  icon: BarChart3 },
    { label: "Progress",  href: "/dashboard/seeker/progress",  icon: TrendingUp },
    { label: "Settings",  href: "/dashboard/seeker/settings",  icon: Settings },
  ],
  coach: [
    { label: "Home",      href: "/dashboard/coach",            icon: Home },
    { label: "Services",  href: "/dashboard/coach/services",   icon: Briefcase },
    { label: "Calendar",  href: "/dashboard/coach/calendar",   icon: Calendar },
    { label: "Sessions",  href: "/dashboard/coach/sessions",   icon: BookOpen },
    { label: "Clients",   href: "/dashboard/coach/clients",    icon: Users },
    { label: "Earnings",  href: "/dashboard/coach/earnings",   icon: DollarSign },
    { label: "Analytics", href: "/dashboard/coach/analytics",  icon: BarChart3 },
    { label: "Reviews",   href: "/dashboard/coach/reviews",    icon: Star },
    { label: "Settings",  href: "/dashboard/coach/settings",   icon: Settings },
  ],
  institute: [
    { label: "Home",           href: "/dashboard/institute",                icon: Home },
    { label: "Students",       href: "/dashboard/institute/students",       icon: Users },
    { label: "Coaches",        href: "/dashboard/institute/coaches",        icon: Award },
    { label: "Progress",       href: "/dashboard/institute/progress",       icon: TrendingUp },
    { label: "Placement",      href: "/dashboard/institute/placement",      icon: Briefcase },
    { label: "NPS",            href: "/dashboard/institute/nps",            icon: Star },
    { label: "Reports",        href: "/dashboard/institute/reports",        icon: BarChart3 },
    { label: "Invite Students",href: "/dashboard/institute/invite-students",icon: UserPlus,   badge: "New" },
    { label: "Invite Coaches", href: "/dashboard/institute/invite-coaches", icon: PlusCircle, badge: "New" },
    { label: "Settings",       href: "/dashboard/institute/settings",       icon: Settings },
  ],
};

function getNavItems(role: string): NavItem[] {
  if (role === "job_seeker" || role === "job-seeker") return NAV_CONFIG.student;
  return NAV_CONFIG[role] ?? NAV_CONFIG.student;
}

// Read role from localStorage synchronously so there's zero loading flash
function getInitialRole(): string {
  if (typeof window === "undefined") return "student";
  return localStorage.getItem("userRole") ?? "student";
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function AppSidebar() {
  const pathname = usePathname();

  // Initialise from localStorage immediately — no flash, no spinner
  const [userRole, setUserRole] = useState<string>(getInitialRole);

  useEffect(() => {
    async function syncRole() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) return;

        const { data } = await supabase
          .from("users")
          .select("role")
          .eq("id", session.user.id)
          .maybeSingle();

        if (data?.role) {
          setUserRole(data.role);
          localStorage.setItem("userRole", data.role);
        }
      } catch (err) {
        console.error("AppSidebar: role sync error", err);
      }
    }

    syncRole();

    // Keep role in sync on auth changes (e.g. after login)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (!session?.user) return;
        try {
          const { data } = await supabase
            .from("users")
            .select("role")
            .eq("id", session.user.id)
            .maybeSingle();
          if (data?.role) {
            setUserRole(data.role);
            localStorage.setItem("userRole", data.role);
          }
        } catch (err) {
          console.error("AppSidebar: auth change role error", err);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const navItems = getNavItems(userRole);

  return (
    <TooltipProvider delayDuration={300}>
      <aside className="w-[220px] min-w-[220px] h-screen bg-white border-r border-gray-100 flex flex-col sticky top-0 overflow-hidden shadow-sm">

        {/* Logo */}
        <div className="px-4 py-5 border-b border-gray-100">
          <div className="relative w-[150px] h-[48px]">
            <Image
              src="/Prevail-Logo-light.png"
              alt="Prevail AI"
              fill
              className="object-contain object-left"
              priority
            />
          </div>
          <p className="text-[8px] font-bold tracking-[0.18em] text-gray-400 mt-2 uppercase">
            Career Intelligence
          </p>
        </div>

        {/* Section label */}
        <p className="text-[9px] font-bold tracking-[0.14em] text-gray-400 uppercase px-3.5 pt-3 pb-1.5">
          Main Menu
        </p>

        {/* Navigation */}
        <nav className="flex-1 px-2.5 py-1 overflow-y-auto [&::-webkit-scrollbar]:w-0">
          <div className="flex flex-col gap-0.5">
            {navItems.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/dashboard" && pathname?.startsWith(item.href));
              const Icon = item.icon;

              return (
                <Tooltip key={item.href}>
                  <TooltipTrigger asChild>
                    <Link
                      href={item.href}
                      className={`
                        flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium
                        transition-all duration-150 relative group
                        ${isActive
                          ? "bg-indigo-50 text-indigo-600 font-semibold"
                          : "text-gray-500 hover:bg-gray-50 hover:text-indigo-600"
                        }
                      `}
                    >
                      <Icon className={`w-4 h-4 transition-colors ${isActive ? "text-indigo-600" : "text-gray-400 group-hover:text-indigo-600"}`} />
                      <span className="flex-1">{item.label}</span>
                      {item.badge && (
                        <span className="text-[9px] px-1.5 py-0.5 bg-indigo-100 text-indigo-600 rounded-full font-bold">
                          {item.badge}
                        </span>
                      )}
                      {isActive && (
                        <div className="absolute left-0 top-1/4 h-1/2 w-0.5 bg-gradient-to-b from-indigo-600 to-purple-600 rounded-r" />
                      )}
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="text-xs">
                    {item.label}
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </div>
        </nav>

        {/* Upgrade card */}
        <div className="sidebar-upgrade">
          <span className="sidebar-upgrade-tag">✦ Enterprise Plan</span>
          <span className="sidebar-upgrade-desc">
            Unlock advanced campus analytics &amp; student mapping.
          </span>
          <div className="sidebar-upgrade-btn-wrap">
            <Button
              size="sm"
              style={{
                width: "100%",
                background: "rgba(255,255,255,0.18)",
                border: "1px solid rgba(255,255,255,0.3)",
                color: "#fff",
                fontSize: "12px",
                fontWeight: 700,
                fontFamily: "'Outfit', system-ui, sans-serif",
                letterSpacing: ".02em",
                backdropFilter: "blur(4px)",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.28)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.18)")}
            >
              Upgrade to Pro
            </Button>
          </div>
        </div>

        <Separator style={{ background: "#F0F0FA" }} />

        {/* Help link */}
        <div className="px-2.5 pb-4 pt-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                href="/dashboard/help"
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-gray-400 hover:bg-gray-50 hover:text-indigo-600 transition-all group"
              >
                <HelpCircle className="w-4 h-4 opacity-60 group-hover:opacity-100" />
                Help Center
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right" className="text-xs">
              Help Center
            </TooltipContent>
          </Tooltip>
        </div>

      </aside>
    </TooltipProvider>
  );
}