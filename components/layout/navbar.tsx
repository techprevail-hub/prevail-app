"use client";

import { useEffect, useState } from "react";
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
import { useRouter } from "next/navigation";
import Link from "next/link";

interface DashboardNavbarProps {
  title: string;
  subtitle?: string;
}

const roleLabel: Record<string, string> = {
  student:    "Student",
  job_seeker: "Job Seeker",
  coach:      "Career Coach",
  institute:  "Institute",
};

const roleTitles: Record<string, { title: string; subtitle: string }> = {
  student: {
    title: "Student Dashboard",
    subtitle: "Your Learning Journey"
  },
  job_seeker: {
    title: "Job Seeker Dashboard",
    subtitle: "Career Opportunities & Matches"
  },
  coach: {
    title: "Career Coach Dashboard",
    subtitle: "Client Progress & Insights"
  },
  institute: {
    title: "Institute Dashboard",
    subtitle: "Campus-wide Career Readiness Overview"
  },
};

export default function DashboardNavbar({ title, subtitle }: DashboardNavbarProps) {
  const router = useRouter();
  const { toggle, isOpen } = useSidebar();
  const [profile, setProfile]   = useState<any>(null);
  const [initials, setInitials] = useState("U");
  const [notifCount]            = useState(3);
  const [displayTitle, setDisplayTitle] = useState(title);
  const [displaySubtitle, setDisplaySubtitle] = useState(subtitle || "");
  const [storedRole, setStoredRole] = useState<string | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Safe localStorage access - only on client side
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const role = localStorage.getItem("userRole");
      setStoredRole(role);
    }
  }, []);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // Get current session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("Session error:", sessionError);
          return;
        }
        
        if (!session?.user) {
          console.log("No active session");
          return;
        }
        
        const user = session.user;
        console.log("User ID:", user.id);
        
        // Try to get user data from localStorage first (fast fallback)
        let userRole = storedRole;
        let userName = null;
        
        if (typeof window !== 'undefined') {
          userName = localStorage.getItem("userName");
          userRole = userRole || localStorage.getItem("userRole");
        }
        
        if (!userName) {
          userName = user.user_metadata?.full_name || user.email?.split("@")[0] || "User";
        }
        
        if (userRole && roleTitles[userRole]) {
          console.log("Using role from localStorage:", userRole);
          setDisplayTitle(roleTitles[userRole].title);
          setDisplaySubtitle(roleTitles[userRole].subtitle);
        }
        
        // Try to fetch from Supabase
        // First try 'users' table
        try {
          const { data, error } = await supabase
            .from("users")
            .select("name, role")
            .eq("id", user.id)
            .maybeSingle();
          
          if (!error && data) {
            console.log("Data from users table:", data);
            userRole = data.role;
            userName = data.name || userName;
            // Store in localStorage for future use
            if (typeof window !== 'undefined') {
              if (data.role) localStorage.setItem("userRole", data.role);
              if (data.name) localStorage.setItem("userName", data.name);
            }
          }
        } catch (err) {
          console.log("Error fetching from users table:", err);
        }
        
        // If not found in users, try 'profiles' table
        if (!userRole) {
          try {
            const { data, error } = await supabase
              .from("profiles")
              .select("first_name, last_name, role")
              .eq("id", user.id)
              .maybeSingle();
            
            if (!error && data) {
              console.log("Data from profiles table:", data);
              userRole = data.role;
              userName = `${data.first_name || ""} ${data.last_name || ""}`.trim() || userName;
              // Store in localStorage for future use
              if (typeof window !== 'undefined') {
                if (data.role) localStorage.setItem("userRole", data.role);
              }
            }
          } catch (err) {
            console.log("Error fetching from profiles table:", err);
          }
        }
        
        // Set profile data
        setProfile({
          name: userName,
          role: userRole,
          email: user.email
        });
        
        // Set initials
        const nameParts = userName.split(" ") || [];
        const first = nameParts[0]?.[0] || user.email?.[0] || "U";
        const last = nameParts[1]?.[0] || "";
        setInitials((first + last).toUpperCase());
        
        // Update title based on role
        if (userRole && roleTitles[userRole]) {
          console.log("Setting title for role:", userRole);
          setDisplayTitle(roleTitles[userRole].title);
          setDisplaySubtitle(roleTitles[userRole].subtitle);
        } else {
          console.log("No role found, using default title");
          setDisplayTitle(title);
          setDisplaySubtitle(subtitle || "");
        }
        
      } catch (error) {
        console.error("Error in fetchProfile:", error);
        // Keep default title on error
        setDisplayTitle(title);
        setDisplaySubtitle(subtitle || "");
      }
    };
    
    fetchProfile();
  }, [title, subtitle, storedRole]);

  const handleLogout = async () => {
    if (isLoggingOut) return; // Prevent multiple logout attempts
    
    setIsLoggingOut(true);
    
    try {
      // Clear localStorage first
      if (typeof window !== 'undefined') {
        localStorage.removeItem("userRole");
        localStorage.removeItem("userName");
        localStorage.removeItem("supabase.auth.token");
        // Clear any other app-specific items
        sessionStorage.clear();
      }
      
      // Sign out from Supabase
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error("Error signing out:", error);
        // Still try to redirect even if signout fails
      }
      
      // Force a hard navigation to login page
      // Using window.location.href for a full page refresh to clear all state
      window.location.href = "/login";
      
    } catch (error) {
      console.error("Logout error:", error);
      // Fallback navigation
      window.location.href = "/login";
    } finally {
      setIsLoggingOut(false);
    }
  };

  // Get profile path based on user role
  const getProfilePath = () => {
    const userRole = profile?.role || storedRole;
    if (userRole === "student" || userRole === "job_seeker") {
      return "/dashboard/seeker/seekers-profile";
    } else if (userRole === "coach") {
      return "/dashboard/coach/profile";
    } else if (userRole === "institute") {
      return "/dashboard/institute/profile";
    }
    return "/dashboard/settings";
  };

  const displayName = profile?.name || profile?.email?.split("@")[0] || "User";
  // Use storedRole from state instead of directly accessing localStorage
  const userRole = profile?.role || storedRole || "member";
  const roleDisplay = roleLabel[userRole] || "Member";

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

        /* Left */
        .navbar-left { display: flex; align-items: center; gap: 14px; min-width: 0; }

        /* Hamburger toggle button - always shows menu icon */
        .navbar-hamburger {
          width: 40px;
          height: 40px;
          border-radius: 12px;
          background: #F4F4FC;
          border: 1.5px solid #E8E8F4;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; color: #7070A0;
          flex-shrink: 0; padding: 0;
          transition: background .15s, border-color .15s, color .15s;
        }
        .navbar-hamburger:hover {
          background: #EAEAF8;
          border-color: #5B5BD6;
          color: #5B5BD6;
        }
        .navbar-hamburger.active {
          background: rgba(91,91,214,0.1);
          border-color: #5B5BD6;
          color: #5B5BD6;
        }

        .navbar-title-wrap { min-width: 0; }
        .navbar-title {
          font-family: 'Outfit', system-ui, sans-serif;
          font-size: 22px;
          font-weight: 800;
          color: #0D0D2B;
          letter-spacing: -0.025em;
          line-height: 1.2;
          margin: 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .navbar-subtitle {
          font-size: 12px;
          color: #9595BB;
          margin: 2px 0 0 0;
          line-height: 1.2;
          white-space: nowrap;
        }

        /* Right */
        .navbar-right {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-shrink: 0;
        }

        /* Icon button (bell) */
        .navbar-icon-btn {
          width: 40px;
          height: 40px;
          border-radius: 12px;
          background: #F4F4FC;
          border: 1.5px solid #E8E8F4;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; color: #7070A0;
          position: relative;
          transition: background .15s, border-color .15s, color .15s;
          flex-shrink: 0;
          padding: 0;
        }
        .navbar-icon-btn:hover {
          background: #EAEAF8;
          border-color: #5B5BD6;
          color: #5B5BD6;
        }

        /* Notif badge */
        .navbar-notif-badge {
          position: absolute;
          top: 4px; right: 4px;
          width: 18px;
          height: 18px;
          background: #5B5BD6;
          border-radius: 50%;
          border: 2px solid white;
          display: flex; align-items: center; justify-content: center;
          font-size: 9px;
          font-weight: 800;
          color: white;
          line-height: 1;
        }

        /* User chip */
        .navbar-user-chip {
          display: flex; align-items: center; gap: 10px;
          padding: 4px 6px 4px 14px;
          background: #F4F4FC;
          border: 1.5px solid #E8E8F4;
          border-radius: 14px;
          cursor: pointer;
          transition: border-color .15s, background .15s;
          height: 48px;
          outline: none;
        }
        .navbar-user-chip:hover { border-color: #5B5BD6; background: #EEEEFF; }

        .navbar-user-info { text-align: right; }
        .navbar-user-name {
          font-size: 14px;
          font-weight: 600;
          color: #0D0D2B;
          line-height: 1.3;
          white-space: nowrap;
          max-width: 140px;
          overflow: hidden;
          text-overflow: ellipsis;
          font-family: 'Inter', system-ui, sans-serif;
        }
        .navbar-user-role {
          font-size: 11px;
          color: #5B5BD6;
          font-weight: 600;
          line-height: 1.2;
          font-family: 'Inter', system-ui, sans-serif;
          letter-spacing: .02em;
        }

        .navbar-avatar {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          background: linear-gradient(135deg, #5B5BD6, #7040c0);
          display: flex; align-items: center; justify-content: center;
          font-size: 12px;
          font-weight: 800;
          color: #fff;
          font-family: 'Outfit', system-ui, sans-serif;
          overflow: hidden; flex-shrink: 0;
          letter-spacing: .03em;
        }
        .navbar-avatar img { width:100%; height:100%; object-fit:cover; border-radius:10px; }

        /* Dropdown header */
        .nb-dd-header {
          padding: 12px 14px 10px;
          border-bottom: 1px solid #F0F0FA;
          margin-bottom: 4px;
        }
        .nb-dd-name  { font-size:14px; font-weight:700; color:#0D0D2B; margin:0 0 2px; font-family:'Inter',system-ui,sans-serif; }
        .nb-dd-email { font-size:11.5px; color:#9595BB; margin:0; font-family:'Inter',system-ui,sans-serif; }

        /* Responsive */
        @media (max-width: 768px) {
          .navbar { padding: 0 20px; height: 64px; min-height: 64px; }
          .navbar-title  { font-size: 18px; }
          .navbar-subtitle { display: none; }
          .navbar-user-info { display: none; }
          .navbar-user-chip { padding: 4px; }
        }
        @media (max-width: 480px) {
          .navbar-notif-btn { display: none; }
          .navbar-hamburger { width: 36px; height: 36px; }
          .navbar-icon-btn { width: 36px; height: 36px; }
        }
      `}</style>

      <TooltipProvider delayDuration={300}>
        <header className="navbar">

          {/* ── LEFT ── */}
          <div className="navbar-left">

            {/* Hamburger — always shows menu icon */}
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  className={`navbar-hamburger ${isOpen ? "active" : ""}`}
                  onClick={toggle}
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

            {/* Page title - dynamically changes based on role */}
            <div className="navbar-title-wrap">
              <h1 className="navbar-title">{displayTitle}</h1>
              {displaySubtitle && <p className="navbar-subtitle">{displaySubtitle}</p>}
            </div>
          </div>

          {/* ── RIGHT ── */}
          <div className="navbar-right">

            {/* Notification bell */}
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="navbar-icon-btn navbar-notif-btn">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                  </svg>
                  {notifCount > 0 && (
                    <span className="navbar-notif-badge">
                      {notifCount > 9 ? "9+" : notifCount}
                    </span>
                  )}
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs">
                {notifCount} new notifications
              </TooltipContent>
            </Tooltip>

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
                  <p className="nb-dd-email">{profile?.email || ""}</p>
                </div>

                {/* My Profile - Redirects to seeker profile page */}
                <DropdownMenuItem style={{ borderRadius: 8, fontSize: 13, gap: 9, cursor: "pointer" }} asChild>
                  <Link href={getProfilePath()}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
                    My Profile
                  </Link>
                </DropdownMenuItem>

                {/* Help Center */}
                <DropdownMenuItem style={{ borderRadius: 8, fontSize: 13, gap: 9, cursor: "pointer" }} asChild>
                  <Link href="/dashboard/help">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                    Help Center
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuSeparator style={{ background: "#F0F0FA", margin: "4px 0" }} />

                {/* Plan badge */}
                <div style={{ padding: "8px 10px" }}>
                  <div style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    background: "linear-gradient(135deg,rgba(91,91,214,0.08),rgba(112,64,192,0.06))",
                    borderRadius: 10, padding: "10px 12px",
                    border: "1px solid rgba(91,91,214,0.12)",
                  }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: "#5B5BD6", fontFamily: "'Inter',system-ui,sans-serif" }}>Free Plan</span>
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
                    borderRadius: 8, 
                    fontSize: 13, 
                    gap: 9, 
                    cursor: isLoggingOut ? "not-allowed" : "pointer", 
                    color: "#c04444",
                    opacity: isLoggingOut ? 0.6 : 1
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                  {isLoggingOut ? "Signing out..." : "Sign out"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

          </div>
        </header>
      </TooltipProvider>
    </>
  );
}