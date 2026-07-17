// components/dashboard/DashboardSection.tsx
"use client";

import { LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface DashboardSectionProps {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  badge?: string;
  action?: { label: string; onClick: () => void };
  children: React.ReactNode;
  className?: string;
}

export default function DashboardSection({
  title, subtitle, icon: Icon, badge, action, children, className = "",
}: DashboardSectionProps) {
  return (
    <section className={`space-y-5 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          {Icon && (
            <div className="relative flex-shrink-0">
              <div className="absolute inset-0 rounded-2xl bg-violet-500/25 blur-lg" />
              <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 shadow-lg shadow-violet-500/30 ring-1 ring-white/40">
                <Icon className="h-5 w-5 text-white" strokeWidth={2.2} />
              </div>
            </div>
          )}
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-xl font-bold tracking-tight text-slate-900">{title}</h2>
              {badge && (
                <Badge className="bg-gradient-to-r from-violet-100 to-indigo-100 text-violet-700 ring-1 ring-violet-200/70 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5">
                  {badge}
                </Badge>
              )}
            </div>
            {subtitle && <p className="mt-0.5 text-sm text-slate-500">{subtitle}</p>}
          </div>
        </div>

        {action && (
          <button
            onClick={action.onClick}
            className="group inline-flex items-center gap-1.5 rounded-full border border-violet-200/70 bg-white/70 px-4 py-1.5 text-sm font-semibold text-violet-600 shadow-sm backdrop-blur-sm transition-all hover:border-violet-300 hover:bg-white hover:shadow-md hover:text-violet-700"
          >
            {action.label}
            <span className="text-base leading-none transition-transform group-hover:translate-x-0.5">→</span>
          </button>
        )}
      </div>

      {/* Content */}
      {children}
    </section>
  );
}
