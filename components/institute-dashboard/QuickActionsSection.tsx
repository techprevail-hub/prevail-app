// components/institute-dashboard/QuickActionsSection.tsx

"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Sparkles,
  Send,
  Users,
  Briefcase,
  Award,
  BarChart3,
  ArrowRight,
} from "lucide-react";
import { motion } from "framer-motion";

// ─── Types ──────────────────────────────────────────────────────────────────

interface QuickAction {
  label: string;
  icon: any;
  path: string;
  bgGradient: string;
  iconBg: string;
}

// ─── Actions Configuration ──────────────────────────────────────────────────

const actions: QuickAction[] = [
  {
    label: "Invite Students",
    icon: Send,
    path: "/dashboard/institute/invite-students",
    bgGradient: "from-violet-50 to-purple-50",
    iconBg: "from-violet-400 to-purple-500",
  },
  {
    label: "Invite Coaches",
    icon: Send,
    path: "/dashboard/institute/invite-coaches",
    bgGradient: "from-indigo-50 to-blue-50",
    iconBg: "from-indigo-400 to-blue-500",
  },
  {
    label: "Manage Students",
    icon: Users,
    path: "/dashboard/institute/students",
    bgGradient: "from-blue-50 to-cyan-50",
    iconBg: "from-blue-400 to-cyan-500",
  },
  {
    label: "Placement",
    icon: Briefcase,
    path: "/dashboard/institute/placement",
    bgGradient: "from-emerald-50 to-teal-50",
    iconBg: "from-emerald-400 to-teal-500",
  },
  {
    label: "NPS Analytics",
    icon: Award,
    path: "/dashboard/institute/nps",
    bgGradient: "from-amber-50 to-orange-50",
    iconBg: "from-amber-400 to-orange-500",
  },
  {
    label: "Reports",
    icon: BarChart3,
    path: "/dashboard/institute/reports",
    bgGradient: "from-rose-50 to-pink-50",
    iconBg: "from-rose-400 to-pink-500",
  },
];

// ─── Action Button Component (Compact) ──────────────────────────────────────

interface ActionButtonProps {
  action: QuickAction;
  delay: number;
}

function ActionButton({ action, delay }: ActionButtonProps) {
  const router = useRouter();

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.4,
        delay,
        type: "spring",
        stiffness: 200,
        damping: 20,
      }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
    >
      <button
        onClick={() => router.push(action.path)}
        className={`relative w-full group rounded-xl border border-white/40 bg-gradient-to-br ${action.bgGradient} backdrop-blur-sm hover:border-white/80 hover:shadow-lg hover:shadow-current/10 transition-all duration-300 p-3 text-left overflow-hidden`}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

        <div className="relative flex items-center gap-2.5">
          <motion.div
            className={`shrink-0 rounded-lg bg-gradient-to-br ${action.iconBg} p-2 shadow-md text-white group-hover:shadow-lg transition-all duration-300`}
            whileHover={{ rotate: 6, scale: 1.1 }}
          >
            <action.icon className="h-3.5 w-3.5" />
          </motion.div>

          <p className="font-semibold text-slate-800 text-xs group-hover:text-slate-900 transition-colors truncate flex-1">
            {action.label}
          </p>

          <ArrowRight className="h-3 w-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
        </div>
      </button>
    </motion.div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────

export default function QuickActionsSection() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.52 }}
    >
      <Card className="border-0 bg-white/80 backdrop-blur-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden relative">
        <div className="absolute -top-32 -right-32 w-80 h-80 rounded-full bg-gradient-to-bl from-violet-200/10 to-purple-200/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full bg-gradient-to-tr from-blue-200/10 to-cyan-200/10 blur-3xl pointer-events-none" />

        <CardHeader className="border-b border-white/40 bg-gradient-to-r from-white/50 via-violet-50/30 to-white/50 px-5 py-3 relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.div
                className="rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 p-1.5 shadow-lg"
                animate={{ rotate: 360 }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              >
                <Sparkles className="h-3.5 w-3.5 text-white" />
              </motion.div>
              <div>
                <CardTitle className="text-sm font-bold text-slate-900">
                  Quick Actions
                </CardTitle>
                <CardDescription className="text-[11px] text-slate-600 mt-0.5">
                  Fast access to common tasks
                </CardDescription>
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="px-2.5 py-1 rounded-full bg-gradient-to-r from-violet-100 to-purple-100 border border-violet-200/60 text-[10px] font-bold text-violet-700"
            >
              {actions.length} Actions
            </motion.div>
          </div>
        </CardHeader>

        <CardContent className="p-4 relative">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
            {actions.map((action, index) => (
              <ActionButton
                key={action.label}
                action={action}
                delay={0.05 * index}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}