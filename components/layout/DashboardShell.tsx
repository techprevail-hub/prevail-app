"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import AppSidebar from "@/components/layout/app-sidebar";

// ─── Context ────────────────────────────────────────────────────

interface SidebarContextType {
  isOpen: boolean;
  toggle: () => void;
  close:  () => void;
}

const SidebarContext = createContext<SidebarContextType>({
  isOpen: true,
  toggle: () => {},
  close:  () => {},
});

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(true);
  const toggle = () => setIsOpen((prev) => !prev);
  const close  = () => setIsOpen(false);

  return (
    <SidebarContext.Provider value={{ isOpen, toggle, close }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  return useContext(SidebarContext);
}

// ─── Shell ──────────────────────────────────────────────────────
// NOTE: DashboardShell must be rendered INSIDE SidebarProvider.
// The correct usage in your layout.tsx is:
//
//   <SidebarProvider>
//     <DashboardShell>{children}</DashboardShell>
//   </SidebarProvider>
//
// If SidebarProvider wraps DashboardShell in layout.tsx already, you're good.
// If not, the simplest fix is to have DashboardShell wrap itself — see below.

export default function DashboardShell({ children }: { children: ReactNode }) {
  return (
    // Self-contained: SidebarProvider lives here so toggle always works
    // regardless of how the parent layout is structured.
    <SidebarProvider>
      <DashboardShellInner>{children}</DashboardShellInner>
    </SidebarProvider>
  );
}

// Inner shell that can safely consume the context
function DashboardShellInner({ children }: { children: ReactNode }) {
  const { isOpen } = useSidebar();

  return (
    <>
      <style>{`
        .dash-layout {
          display: flex;
          height: 100dvh;
          width: 100vw;
          overflow: hidden;
          background: #F0F0FF;
          position: relative;
        }

        .dash-sidebar-wrapper {
          flex-shrink: 0;
          width: 220px;
          transition: width 0.25s ease, opacity 0.2s ease;
          overflow: hidden;
        }
        .dash-sidebar-wrapper.closed {
          width: 0;
          opacity: 0;
        }

        .dash-main {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          min-width: 0;
        }

        @media (max-width: 768px) {
          .dash-sidebar-wrapper {
            position: fixed;
            top: 0; left: 0;
            height: 100dvh;
            z-index: 100;
            width: 220px;
            transform: translateX(0);
            transition: transform 0.25s ease, opacity 0.2s ease;
            box-shadow: 4px 0 24px rgba(0,0,0,0.12);
          }
          .dash-sidebar-wrapper.closed {
            width: 220px;
            opacity: 1;
            transform: translateX(-100%);
          }
        }

        .dash-sidebar-backdrop {
          display: none;
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.35);
          z-index: 99;
          backdrop-filter: blur(2px);
        }
      `}</style>

      <div className="dash-layout">
        <div className={`dash-sidebar-wrapper${isOpen ? "" : " closed"}`}>
          <AppSidebar />
        </div>

        <MobileBackdrop />

        <div className="dash-main">
          {children}
        </div>
      </div>
    </>
  );
}

function MobileBackdrop() {
  const { isOpen, close } = useSidebar();
  if (!isOpen) return null;
  return (
    <div
      className="dash-sidebar-backdrop"
      onClick={close}
      aria-hidden="true"
    />
  );
}