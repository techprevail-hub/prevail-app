"use client";

import { useRouter } from "next/navigation";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  label: string;
  icon: LucideIcon;
  color: "violet" | "emerald" | "sky" | "rose" | "amber" | "indigo";
  description: string;
  href: string;
  isJourney?: boolean;
  score?: number | null;
  scoreSuffix?: string;
  changeValue?: string | null;
}

const colorTokens: Record<string, { light: string; icon: string; text: string; border: string; gradient: string }> = {
  violet: { light: "bg-violet-50", icon: "text-violet-600", text: "text-violet-700", border: "border-violet-200", gradient: "from-violet-500 to-indigo-500" },
  emerald: { light: "bg-emerald-50", icon: "text-emerald-600", text: "text-emerald-700", border: "border-emerald-200", gradient: "from-emerald-500 to-teal-500" },
  sky: { light: "bg-sky-50", icon: "text-sky-600", text: "text-sky-700", border: "border-sky-200", gradient: "from-sky-500 to-cyan-500" },
  rose: { light: "bg-rose-50", icon: "text-rose-600", text: "text-rose-700", border: "border-rose-200", gradient: "from-rose-500 to-pink-500" },
  amber: { light: "bg-amber-50", icon: "text-amber-600", text: "text-amber-700", border: "border-amber-200", gradient: "from-amber-500 to-orange-500" },
  indigo: { light: "bg-indigo-50", icon: "text-indigo-600", text: "text-indigo-700", border: "border-indigo-200", gradient: "from-indigo-500 to-purple-500" },
};

export default function StatsCard({
  label,
  icon: Icon,
  color = "violet",
  description,
  href,
  isJourney = false,
  score,
  scoreSuffix = "",
  changeValue,
}: StatsCardProps) {
  const router = useRouter();
  const c = colorTokens[color] || colorTokens.violet;

  const handleClick = () => {
    router.push(href);
  };

  return (
    <div
      onClick={handleClick}
      className="group bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg hover:border-slate-200 transition-all duration-300 cursor-pointer overflow-hidden relative"
    >
      {/* Subtle gradient overlay on hover */}
      <div className={`absolute inset-0 bg-gradient-to-br ${c.light} opacity-0 group-hover:opacity-30 transition-opacity duration-300 pointer-events-none`} />

      <div className="relative p-4">
        {/* Top row - icon and change badge */}
        <div className="flex items-start justify-between mb-3">
          <div className={`w-10 h-10 rounded-xl ${c.light} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
            <Icon className={`w-5 h-5 ${c.icon}`} />
          </div>
          {changeValue && (
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
              changeValue.includes("+") || changeValue.includes("Career Ready")
                ? "bg-emerald-100 text-emerald-700"
                : changeValue.includes("In Progress")
                ? "bg-amber-100 text-amber-700"
                : "bg-slate-100 text-slate-600"
            }`}>
              {changeValue}
            </span>
          )}
        </div>

        {/* Label */}
        <p className="text-sm font-semibold text-slate-800 group-hover:text-violet-700 transition-colors duration-200">
          {label}
        </p>

        {/* Description */}
        <p className="text-xs text-slate-400 mt-0.5">{description}</p>

        {/* Score */}
        {isJourney && score !== null && score !== undefined ? (
          <div className="mt-3 flex items-end gap-1">
            <span className="text-2xl font-bold text-slate-900">{score}</span>
            <span className="text-xs text-slate-400 font-medium pb-0.5">{scoreSuffix}</span>
          </div>
        ) : (
          <div className="mt-3">
            <span className="text-2xl font-bold text-slate-900">
              {score !== null && score !== undefined ? score : "--"}
            </span>
            {scoreSuffix && (
              <span className="text-xs text-slate-400 font-medium ml-0.5">{scoreSuffix}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}