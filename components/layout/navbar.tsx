"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useSidebar } from "@/components/layout/DashboardShell";
import Link from "next/link";
import NotificationDropdown from "@/components/notification/NotificationDropdown";

// ─── Types ────────────────────────────────────────────────────────────────────

interface DashboardNavbarProps {
  title: string;
  subtitle?: string;
}

interface ProfileState {
  name: string;
  role: string;
  email: string;
  avatar_url?: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const ROLE_LABELS: Record<string, string> = {
  student:    "Student",
  job_seeker: "Job Seeker",
  coach:      "Career Coach",
  institute:  "Institute",
};

const ROLE_TITLES: Record<string, { title: string; subtitle: string }> = {
  student:    { title: "Student Dashboard",       subtitle: "Your Learning Journey" },
  job_seeker: { title: "Job Seeker Dashboard",    subtitle: "Career Opportunities & Matches" },
  coach:      { title: "Career Coach Dashboard",  subtitle: "Client Progress & Insights" },
  institute:  { title: "Institute Dashboard",     subtitle: "Campus-wide Career Readiness Overview" },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getInitials(name: string, email: string): string {
  const parts = name.trim().split(" ");
  const first = parts[0]?.[0] ?? email[0] ?? "U";
  const last  = parts[1]?.[0] ?? "";
  return (first + last).toUpperCase();
}

function getProfilePath(role: string): string {
  if (role === "student" || role === "job_seeker") return "/dashboard/seeker/seekers-profile";
  if (role === "coach")     return "/dashboard/coach/coach-profile";
  if (role === "institute") return "/dashboard/institute/institute-profile";
  return "/dashboard/seeker/seekers-profile";
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function DashboardNavbar({ title, subtitle }: DashboardNavbarProps) {
  // Import toggle/isOpen from YOUR DashboardShell context, not shadcn's useSidebar
  const { toggle, isOpen } = useSidebar();

  const [profile,      setProfile]      = useState<ProfileState | null>(null);
  const [initials,     setInitials]     = useState("U");
  const [displayTitle, setDisplayTitle] = useState(title);
  const [displaySub,   setDisplaySub]   = useState(subtitle ?? "");
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Ref to block any async profile work the instant logout begins
  const loggingOutRef = useRef(false);

  // ── Fetch profile ──────────────────────────────────────────────────────────

  useEffect(() => {
    async function fetchProfile() {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError || !session?.user) return;
        if (loggingOutRef.current) return;

        const user = session.user;

        // Use cached values as instant defaults while DB loads
        const cachedRole = localStorage.getItem("userRole") ?? "";
        const cachedName =
          localStorage.getItem("userName") ??
          user.user_metadata?.full_name ??
          user.email?.split("@")[0] ??
          "User";

        if (cachedRole && ROLE_TITLES[cachedRole]) {
          setDisplayTitle(ROLE_TITLES[cachedRole].title);
          setDisplaySub(ROLE_TITLES[cachedRole].subtitle);
        }

        // Try users table first, then profiles table
        let dbRole = "";
        let dbName = cachedName;

        const { data: userData } = await supabase
          .from("users")
          .select("name, role")
          .eq("id", user.id)
          .maybeSingle();

        if (userData) {
          dbRole = userData.role ?? "";
          dbName = userData.name ?? dbName;
        } else {
          const { data: profileData } = await supabase
            .from("profiles")
            .select("first_name, last_name, role")
            .eq("id", user.id)
            .maybeSingle();

          if (profileData) {
            dbRole = profileData.role ?? "";
            dbName = `${profileData.first_name ?? ""} ${profileData.last_name ?? ""}`.trim() || dbName;
          }
        }

        if (loggingOutRef.current) return;

        const resolvedRole = dbRole || cachedRole;
        const resolvedName = dbName;

        // Persist resolved values for next load
        if (dbRole) localStorage.setItem("userRole", dbRole);
        if (dbName) localStorage.setItem("userName", dbName);

        setProfile({ name: resolvedName, role: resolvedRole, email: user.email ?? "" });
        setInitials(getInitials(resolvedName, user.email ?? ""));

        if (resolvedRole && ROLE_TITLES[resolvedRole]) {
          setDisplayTitle(ROLE_TITLES[resolvedRole].title);
          setDisplaySub(ROLE_TITLES[resolvedRole].subtitle);
        } else {
          setDisplayTitle(title);
          setDisplaySub(subtitle ?? "");
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
        setDisplayTitle(title);
        setDisplaySub(subtitle ?? "");
      }
    }

    fetchProfile();
  }, [title, subtitle]);

  // ── Sign out ───────────────────────────────────────────────────────────────

  const handleLogout = async () => {
    if (isLoggingOut) return;

    loggingOutRef.current = true;
    setIsLoggingOut(true);

    // 1. Clear storage immediately — session is gone from our side right now
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userName");
    localStorage.removeItem("userRole");
    sessionStorage.clear();

    // 2. Safety net: if Supabase hangs (e.g. expired/missing token),
    //    force-redirect after 1.5 s no matter what.
    const forceRedirect = setTimeout(() => {
      window.location.replace("/login");
    }, 1500);

    try {
      // signOut with scope "local" skips the server call entirely —
      // it only clears the local session, so it never hangs on a bad token.
      await supabase.auth.signOut({ scope: "local" });
    } catch (err) {
      console.error("Sign out error:", err);
    } finally {
      clearTimeout(forceRedirect);
      window.location.replace("/login");
    }
  };

  // ── Derived display values ─────────────────────────────────────────────────

  const displayName = profile?.name ?? "User";
  const userRole    = profile?.role ?? "";
  const roleDisplay = ROLE_LABELS[userRole] ?? "Member";
  const profilePath = getProfilePath(userRole);

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@700;800&family=Inter:wght@400;500;600;700&display=swap');

        .navbar {
          height: 72px;
          min-height: 72px;
          background: rgba(255,255,255,0.97);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border-bottom: 1px solid #EBEBF5;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 28px;
          position: sticky;
          top: 0;
          z-index: 50;
          font-family: 'Inter', system-ui, sans-serif;
          gap: 16px;
        }

        .navbar-left { display: flex; align-items: center; gap: 14px; min-width: 0; }

        .navbar-hamburger {
          width: 40px; height: 40px;
          border-radius: 12px;
          background: #F4F4FC;
          border: 1.5px solid #E8E8F4;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; color: #7070A0;
          flex-shrink: 0; padding: 0;
          transition: background .15s, border-color .15s, color .15s;
        }
        .navbar-hamburger:hover  { background: #EAEAF8; border-color: #5B5BD6; color: #5B5BD6; }
        .navbar-hamburger.active { background: rgba(91,91,214,0.1); border-color: #5B5BD6; color: #5B5BD6; }

        .navbar-title-wrap { min-width: 0; }
        .navbar-title {
          font-family: 'Outfit', system-ui, sans-serif;
          font-size: 22px; font-weight: 800;
          color: #0D0D2B;
          letter-spacing: -0.025em; line-height: 1.2;
          margin: 0;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .navbar-subtitle {
          font-size: 12px; color: #9595BB;
          margin: 2px 0 0 0; line-height: 1.2; white-space: nowrap;
        }

        .navbar-right { display: flex; align-items: center; gap: 12px; flex-shrink: 0; }

        .navbar-user-chip {
          display: flex; align-items: center; gap: 10px;
          padding: 4px 6px 4px 14px;
          background: #F4F4FC;
          border: 1.5px solid #E8E8F4;
          border-radius: 14px;
          cursor: pointer;
          transition: border-color .15s, background .15s;
          height: 48px; outline: none;
        }
        .navbar-user-chip:hover { border-color: #5B5BD6; background: #EEEEFF; }

        .navbar-user-info { text-align: right; }
        .navbar-user-name {
          font-size: 14px; font-weight: 600; color: #0D0D2B;
          line-height: 1.3; white-space: nowrap;
          max-width: 140px; overflow: hidden; text-overflow: ellipsis;
          font-family: 'Inter', system-ui, sans-serif;
        }
        .navbar-user-role {
          font-size: 11px; color: #5B5BD6; font-weight: 600;
          line-height: 1.2; font-family: 'Inter', system-ui, sans-serif;
          letter-spacing: .02em;
        }

        .navbar-avatar {
          width: 36px; height: 36px; border-radius: 10px;
          background: linear-gradient(135deg, #5B5BD6, #7040c0);
          display: flex; align-items: center; justify-content: center;
          font-size: 12px; font-weight: 800; color: #fff;
          font-family: 'Outfit', system-ui, sans-serif;
          overflow: hidden; flex-shrink: 0; letter-spacing: .03em;
        }
        .navbar-avatar img { width:100%; height:100%; object-fit:cover; border-radius:10px; }

        .nb-dd-header {
          padding: 12px 14px 10px;
          border-bottom: 1px solid #F0F0FA;
          margin-bottom: 4px;
        }
        .nb-dd-name  { font-size:14px; font-weight:700; color:#0D0D2B; margin:0 0 2px; font-family:'Inter',system-ui,sans-serif; }
        .nb-dd-email { font-size:11.5px; color:#9595BB; margin:0; font-family:'Inter',system-ui,sans-serif; }

        @media (max-width: 768px) {
          .navbar { padding: 0 20px; height: 64px; min-height: 64px; }
          .navbar-title  { font-size: 18px; }
          .navbar-subtitle { display: none; }
          .navbar-user-info { display: none; }
          .navbar-user-chip { padding: 4px; }
        }
        @media (max-width: 480px) {
          .navbar-hamburger { width: 36px; height: 36px; }
        }
      `}</style>

      <TooltipProvider delayDuration={300}>
        <header className="navbar">

          {/* ── LEFT ── */}
          <div className="navbar-left">

            {/* Hamburger — calls YOUR DashboardShell toggle, not shadcn's */}
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  className={`navbar-hamburger${isOpen ? " active" : ""}`}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    toggle();
                  }}
                  aria-label={isOpen ? "Close sidebar" : "Open sidebar"}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <line x1="3" y1="6"  x2="21" y2="6"  />
                    <line x1="3" y1="12" x2="21" y2="12" />
                    <line x1="3" y1="18" x2="21" y2="18" />
                  </svg>
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs">
                {isOpen ? "Collapse sidebar" : "Expand sidebar"}
              </TooltipContent>
            </Tooltip>

            {/* Page title */}
            <div className="navbar-title-wrap">
              <h1 className="navbar-title">{displayTitle}</h1>
              {displaySub && <p className="navbar-subtitle">{displaySub}</p>}
            </div>
          </div>

          {/* ── RIGHT ── */}
          <div className="navbar-right">

            {/* Notification Dropdown - Replaced the bell icon */}
            <NotificationDropdown />

            {/* User dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="navbar-user-chip" role="button" tabIndex={0}>
                  <div className="navbar-user-info">
                    <p className="navbar-user-name">{displayName}</p>
                    <p className="navbar-user-role">{roleDisplay}</p>
                  </div>
                  <div className="navbar-avatar">
                    {profile?.avatar_url
                      ? <img src={profile.avatar_url} alt="avatar" />
                      : initials}
                  </div>
                </div>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                align="end"
                sideOffset={8}
                style={{
                  minWidth: 220,
                  borderRadius: 14,
                  border: "1px solid #EBEBF5",
                  boxShadow: "0 8px 32px rgba(91,91,214,0.12)",
                  padding: "4px",
                  fontFamily: "'Inter', system-ui, sans-serif",
                }}
              >
                <div className="nb-dd-header">
                  <p className="nb-dd-name">{displayName}</p>
                  <p className="nb-dd-email">{profile?.email ?? ""}</p>
                </div>

                <DropdownMenuItem style={{ borderRadius: 8, fontSize: 13, gap: 9, cursor: "pointer" }} asChild>
                  <Link href={profilePath}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="8" r="4"/>
                      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
                    </svg>
                    My Profile
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem style={{ borderRadius: 8, fontSize: 13, gap: 9, cursor: "pointer" }} asChild>
                  <Link href="/dashboard/help">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"/>
                      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
                      <line x1="12" y1="17" x2="12.01" y2="17"/>
                    </svg>
                    Help Center
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuSeparator style={{ background: "#F0F0FA", margin: "4px 0" }} />

                <div style={{ padding: "8px 10px" }}>
                  <div style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    background: "linear-gradient(135deg,rgba(91,91,214,0.08),rgba(112,64,192,0.06))",
                    borderRadius: 10, padding: "10px 12px",
                    border: "1px solid rgba(91,91,214,0.12)",
                  }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: "#5B5BD6", fontFamily: "'Inter',system-ui,sans-serif" }}>
                      Free Plan
                    </span>
                    <Badge style={{
                      fontSize: "10px", padding: "3px 8px",
                      background: "linear-gradient(135deg,#5B5BD6,#7040c0)",
                      color: "#fff", border: "none", fontWeight: 700,
                      letterSpacing: ".04em", cursor: "pointer",
                    }}>
                      Upgrade ✦
                    </Badge>
                  </div>
                </div>

                <DropdownMenuSeparator style={{ background: "#F0F0FA", margin: "4px 0" }} />

                <DropdownMenuItem
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  style={{
                    borderRadius: 8, fontSize: 13, gap: 9,
                    cursor: isLoggingOut ? "not-allowed" : "pointer",
                    color: "#c04444",
                    opacity: isLoggingOut ? 0.6 : 1,
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                    <polyline points="16 17 21 12 16 7"/>
                    <line x1="21" y1="12" x2="9" y2="12"/>
                  </svg>
                  {isLoggingOut ? "Signing out…" : "Sign out"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

          </div>
        </header>
      </TooltipProvider>
    </>
  );
}