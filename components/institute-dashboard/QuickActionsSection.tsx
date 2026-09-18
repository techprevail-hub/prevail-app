"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, Send, Users, Briefcase, Award, BarChart3 } from "lucide-react";
import { motion } from "framer-motion";

// ─── Types ──────────────────────────────────────────────────────────────────

interface QuickAction {
  label: string;
  icon: any;
  path: string;
  color: string;
}

// ─── Actions Configuration ──────────────────────────────────────────────────

const actions: QuickAction[] = [
  {
    label: "Invite Students",
    icon: Send,
    path: "/dashboard/institute/invite-students",
    color: "violet",
  },
  {
    label: "Invite Coaches",
    icon: Send,
    path: "/dashboard/institute/invite-coaches",
    color: "indigo",
  },
  {
    label: "View Students",
    icon: Users,
    path: "/dashboard/institute/students",
    color: "blue",
  },
  {
    label: "View Placement",
    icon: Briefcase,
    path: "/dashboard/institute/placement",
    color: "emerald",
  },
  {
    label: "View NPS",
    icon: Award,
    path: "/dashboard/institute/nps",
    color: "amber",
  },
  {
    label: "View Reports",
    icon: BarChart3,
    path: "/dashboard/institute/reports",
    color: "rose",
  },
];

// ─── Color Classes ──────────────────────────────────────────────────────────

const colorClasses: Record<string, string> = {
  violet:
    "border-violet-200 hover:border-violet-300 hover:bg-violet-50 text-violet-700",
  indigo:
    "border-indigo-200 hover:border-indigo-300 hover:bg-indigo-50 text-indigo-700",
  blue: "border-blue-200 hover:border-blue-300 hover:bg-blue-50 text-blue-700",
  emerald:
    "border-emerald-200 hover:border-emerald-300 hover:bg-emerald-50 text-emerald-700",
  amber:
    "border-amber-200 hover:border-amber-300 hover:bg-amber-50 text-amber-700",
  rose: "border-rose-200 hover:border-rose-300 hover:bg-rose-50 text-rose-700",
};

// ─── Main Component ─────────────────────────────────────────────────────────

export default function QuickActionsSection() {
  const router = useRouter();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
    >
      <Card className="border-0 shadow-sm overflow-hidden">
        <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-slate-50/80 to-violet-50/40 px-6 py-4">
          <CardTitle className="text-base font-semibold text-slate-800 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-indigo-600" />
            Quick Actions
          </CardTitle>
          <CardDescription className="text-xs text-slate-500 mt-1">
            Jump to the most common tasks
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {actions.map((action, index) => (
              <motion.div
                key={action.label}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.05 * index }}
                whileHover={{ scale: 1.02 }}
              >
                <Button
                  variant="outline"
                  className={`w-full justify-start gap-3 h-12 border transition-all duration-200 ${colorClasses[action.color]}`}
                  onClick={() => router.push(action.path)}
                >
                  <action.icon className="h-4 w-4" />
                  <span className="text-sm font-medium">{action.label}</span>
                </Button>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}