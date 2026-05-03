// app/dashboard/layout.tsx
"use client";

import { SidebarProvider } from "@/components/layout/DashboardShell";
import DashboardShell from "@/components/layout/DashboardShell";
import AppSidebar from "@/components/layout/app-sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <style>{`
        .dash-layout {
          display: flex;
          height: 100dvh;
          width: 100vw;
          overflow: hidden;
          background: #F0F0FF;
        }
        .dash-main {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          min-width: 0;
        }
        .dash-content {
          flex: 1;
          overflow-y: auto;
          padding: 24px 28px;
        }
        /* Scrollbar styling */
        .dash-content::-webkit-scrollbar { width: 5px; }
        .dash-content::-webkit-scrollbar-track { background: transparent; }
        .dash-content::-webkit-scrollbar-thumb { background: #D0D0EE; border-radius: 10px; }
        .dash-content::-webkit-scrollbar-thumb:hover { background: #5B5BD6; }
      `}</style>

      <div className="dash-layout">
        <div className="dash-main">
          <DashboardShell>
            {children}
          </DashboardShell>
        </div>
      </div>
    </SidebarProvider>
  );
}