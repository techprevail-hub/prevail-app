"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const navItems = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    label: "Analytics",
    href: "/dashboard/analytics",
    badge: "New",
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
  },
  {
    label: "Activity",
    href: "/dashboard/activity",
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
      </svg>
    ),
  },
  {
    label: "Calendar",
    href: "/dashboard/calendar",
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
  },
  {
    label: "Settings",
    href: "/dashboard/settings",
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l-.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    ),
  },
];

export default function AppSidebar() {
  const pathname = usePathname();

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@600;700;800&family=Inter:wght@400;500;600&display=swap');

        .sidebar {
          width: 220px;
          min-width: 220px;
          height: 100vh;
          background: #ffffff;
          border-right: 1px solid #EBEBF5;
          display: flex;
          flex-direction: column;
          position: sticky;
          top: 0;
          overflow: hidden;
          font-family: 'Inter', system-ui, sans-serif;
          box-shadow: 2px 0 12px rgba(91,91,214,0.04);
        }

        /* Logo */
        .sidebar-logo-area {
          padding: 20px 16px 16px;
          border-bottom: 1px solid #F0F0FA;
        }
        .sidebar-logo-box {
          position: relative;
          width: 130px;
          height: 36px;
          display: block;
        }
        .sidebar-logo-sub {
          font-size: 8px;
          font-weight: 700;
          letter-spacing: .18em;
          color: #C0C0DC;
          margin-top: 8px;
          text-transform: uppercase;
          font-family: 'Inter', system-ui, sans-serif;
          padding-left: 1px;
        }

        /* Section label */
        .sidebar-section-label {
          font-size: 9px;
          font-weight: 700;
          letter-spacing: .14em;
          color: #C0C0DC;
          text-transform: uppercase;
          padding: 12px 14px 6px;
          font-family: 'Inter', system-ui, sans-serif;
        }

        /* Nav */
        .sidebar-nav {
          flex: 1;
          padding: 4px 10px 0;
          display: flex;
          flex-direction: column;
          gap: 1px;
          overflow-y: auto;
        }
        .sidebar-nav::-webkit-scrollbar { width: 0; }

        .sidebar-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 9px 12px;
          border-radius: 10px;
          font-size: 13px;
          font-weight: 500;
          color: #7070A0;
          text-decoration: none;
          transition: background .15s, color .15s, transform .1s;
          position: relative;
        }
        .sidebar-item:hover {
          background: #F4F4FC;
          color: #5B5BD6;
          transform: translateX(1px);
        }
        .sidebar-item.active {
          background: linear-gradient(135deg, rgba(91,91,214,0.12) 0%, rgba(112,64,192,0.08) 100%);
          color: #5B5BD6;
          font-weight: 600;
        }
        .sidebar-item.active::before {
          content: '';
          position: absolute;
          left: 0; top: 20%;
          height: 60%; width: 3px;
          background: linear-gradient(180deg, #5B5BD6, #7040c0);
          border-radius: 0 3px 3px 0;
        }
        .sidebar-icon { flex-shrink: 0; opacity: .6; transition: opacity .15s; }
        .sidebar-item:hover .sidebar-icon,
        .sidebar-item.active .sidebar-icon { opacity: 1; }
        .sidebar-item-label { flex: 1; }

        /* Upgrade card */
        .sidebar-upgrade {
          margin: 10px 10px 6px;
          background: linear-gradient(145deg, #4545c8 0%, #5B5BD6 40%, #7040c0 100%);
          border-radius: 16px;
          padding: 16px 14px;
          color: #fff;
          position: relative;
          overflow: hidden;
        }
        .sidebar-upgrade::before {
          content: '';
          position: absolute;
          width: 80px; height: 80px;
          background: rgba(255,255,255,0.07);
          border-radius: 50%;
          top: -20px; right: -20px;
        }
        .sidebar-upgrade::after {
          content: '';
          position: absolute;
          width: 50px; height: 50px;
          background: rgba(255,255,255,0.05);
          border-radius: 50%;
          bottom: -10px; left: 10px;
        }
        .sidebar-upgrade-tag {
          font-size: 8px;
          font-weight: 800;
          letter-spacing: .16em;
          opacity: .65;
          margin-bottom: 5px;
          text-transform: uppercase;
          font-family: 'Inter', system-ui, sans-serif;
          display: block;
          position: relative; z-index: 1;
        }
        .sidebar-upgrade-desc {
          font-size: 11.5px;
          line-height: 1.55;
          opacity: .9;
          margin-bottom: 12px;
          font-family: 'Inter', system-ui, sans-serif;
          display: block;
          position: relative; z-index: 1;
        }
        .sidebar-upgrade-btn-wrap { position: relative; z-index: 1; }

        /* Bottom */
        .sidebar-bottom {
          padding: 4px 10px 16px;
          display: flex;
          flex-direction: column;
          gap: 1px;
        }
        .sidebar-bottom-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 12px;
          border-radius: 10px;
          font-size: 12.5px;
          font-weight: 500;
          color: #9090BB;
          text-decoration: none;
          transition: background .15s, color .15s;
        }
        .sidebar-bottom-item:hover { background: #F4F4FC; color: #5B5BD6; }
      `}</style>

      <TooltipProvider delayDuration={300}>
        <aside className="sidebar">

          {/* Logo */}
          <div className="sidebar-logo-area">
            <div className="relative w-[150px] h-[48px]">
              <Image
                src="/Prevail-Logo-light.png"   // same as navbar
                alt="Prevail AI"
                fill
                className="object-contain object-left"
                priority
              />
            </div>

            <p className="sidebar-logo-sub">Career Intelligence</p>
          </div>
          <p className="sidebar-section-label">Main Menu</p>

          {/* Nav */}
          <nav className="sidebar-nav">
            {navItems.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/dashboard" && pathname.startsWith(item.href));
              return (
                <Tooltip key={item.href}>
                  <TooltipTrigger asChild>
                    <Link
                      href={item.href}
                      className={`sidebar-item${isActive ? " active" : ""}`}
                    >
                      <span className="sidebar-icon">{item.icon}</span>
                      <span className="sidebar-item-label">{item.label}</span>
                      {item.badge && (
                        <Badge
                          variant="secondary"
                          style={{
                            fontSize: "9px", padding: "1px 6px",
                            background: "rgba(91,91,214,0.12)",
                            color: "#5B5BD6", border: "none",
                            fontWeight: 700, letterSpacing: ".04em",
                          }}
                        >
                          {item.badge}
                        </Badge>
                      )}
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="text-xs">
                    {item.label}
                  </TooltipContent>
                </Tooltip>
              );
            })}
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
                  fontSize: "12px", fontWeight: 700,
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

          {/* Bottom — Help only, no logout */}
          <div className="sidebar-bottom">
            <Link href="/dashboard/help" className="sidebar-bottom-item">
              <span style={{ opacity: 0.6 }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
              </span>
              Help Center
            </Link>
          </div>

        </aside>
      </TooltipProvider>
    </>
  );
}