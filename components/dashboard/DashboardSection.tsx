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
      <div className="flex items-center justify-between">
        <div className="flex items-start gap-3">
          {Icon && (
            <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Icon className="w-5 h-5 text-violet-600" />
            </div>
          )}
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-xl font-bold text-slate-900">{title}</h2>
              {badge && (
                <Badge className="bg-violet-100 text-violet-700 border-0 text-xs font-bold px-2.5 py-0.5">
                  {badge}
                </Badge>
              )}
            </div>
            {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
          </div>
        </div>

        {action && (
          <button
            onClick={action.onClick}
            className="text-sm font-semibold text-violet-600 hover:text-violet-800 transition-colors flex items-center gap-1"
          >
            {action.label}
            <span className="text-lg leading-none">→</span>
          </button>
        )}
      </div>

      {/* Content */}
      {children}
    </section>
  );
}