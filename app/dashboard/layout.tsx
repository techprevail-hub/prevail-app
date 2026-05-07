// app/dashboard/layout.tsx
"use client";

import { SidebarProvider } from "@/components/layout/DashboardShell";
import DashboardShell from "@/components/layout/DashboardShell";
import AppSidebar from "@/components/layout/app-sidebar";
import DashboardNavbar from "@/components/layout/navbar";
import { usePathname } from "next/navigation";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  
  // Determine title and subtitle based on route
  const getTitle = () => {
    if (pathname.includes("/institute")) return "Institute Dashboard";
    if (pathname.includes("/coach")) return "Coach Dashboard";
    if (pathname.includes("/seeker")) return "Job Seeker Dashboard";
    return "Dashboard";
  };

  const getSubtitle = () => {
    if (pathname.includes("/institute")) return "Campus-wide Career Readiness Overview";
    if (pathname.includes("/coach")) return "Manage your coaching business and clients";
    if (pathname.includes("/seeker")) return "Track your career preparation journey";
    return "Welcome to your dashboard";
  };

  return (
    <SidebarProvider>
      <div className="flex h-screen w-screen overflow-hidden bg-gray-50">
        <AppSidebar />
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          <DashboardNavbar title={getTitle()} subtitle={getSubtitle()} />
          <main className="flex-1 overflow-y-auto">
            <div className="p-6">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}