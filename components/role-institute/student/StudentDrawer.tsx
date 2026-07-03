// components/institute/student/StudentDrawer.tsx
"use client";

import {
  Mail, Phone, GraduationCap, BookOpen,
  ShieldCheck, Briefcase, CalendarDays,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Student } from "@/types/student";

interface StudentDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  student: Student | null;
}

function initials(name: string) {
  return name.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase();
}

function readinessColor(score: number) {
  if (score >= 75) return { bar: "bg-emerald-500", text: "text-emerald-700", light: "bg-emerald-50" };
  if (score >= 50) return { bar: "bg-amber-500",   text: "text-amber-700",   light: "bg-amber-50"   };
  return { bar: "bg-rose-500", text: "text-rose-700", light: "bg-rose-50" };
}

const statusStyles: Record<string, string> = {
  Active:   "bg-emerald-100 text-emerald-700",
  Inactive: "bg-slate-100 text-slate-500",
};

const placementStyles: Record<string, string> = {
  Placed:       "bg-violet-100 text-violet-700",
  "Not Placed": "bg-amber-100 text-amber-700",
};

function formatDate(dateStr?: string) {
  if (!dateStr) return "—";
  try {
    return new Date(dateStr).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  } catch {
    return dateStr;
  }
}

function InfoRow({ icon: Icon, label, value }: { icon: any; label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 py-2.5">
      <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0 mt-0.5">
        <Icon className="w-3.5 h-3.5 text-slate-500" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-0.5">{label}</p>
        <div className="text-sm font-medium text-slate-800 truncate">{value}</div>
      </div>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-bold uppercase tracking-widest text-violet-500 mb-1 mt-6 first:mt-0">
      {children}
    </p>
  );
}

export default function StudentDrawer({ open, onOpenChange, student }: StudentDrawerProps) {
  if (!student) return null;

  const rc = readinessColor(student.readiness_score ?? 0);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md p-0 flex flex-col">

        {/* ── Header / Profile ── */}
        <SheetHeader className="p-0">
          <div className="relative bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-600 px-6 pt-8 pb-12">
            <div className="pointer-events-none absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/10 blur-2xl" />
            <SheetTitle className="sr-only">Student details for {student.full_name}</SheetTitle>

            <div className="relative flex flex-col items-center text-center">
              <Avatar className="w-20 h-20 ring-4 ring-white/30 shadow-xl mb-4">
                <AvatarImage src={student.profile_image} alt={student.full_name} />
                <AvatarFallback className="bg-white/20 text-white text-xl font-bold backdrop-blur-sm">
                  {initials(student.full_name)}
                </AvatarFallback>
              </Avatar>
              <h2 className="text-xl font-bold text-white mb-1">{student.full_name}</h2>
              <p className="text-sm text-white/70 font-mono">{student.student_id}</p>
            </div>
          </div>
        </SheetHeader>

        {/* ── Scrollable Body ── */}
        <div className="flex-1 overflow-y-auto px-6 pb-6 -mt-6">
          {/* Quick stat chips floating above the body */}
          <div className="flex gap-3 mb-2 relative">
            <div className={`flex-1 ${rc.light} rounded-2xl px-4 py-3 shadow-sm border border-white`}>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Readiness</p>
              <div className="flex items-baseline gap-1">
                <span className={`text-xl font-bold ${rc.text}`}>{student.readiness_score ?? 0}</span>
                <span className="text-xs text-slate-400">%</span>
              </div>
            </div>
            <div className="flex-1 bg-white rounded-2xl px-4 py-3 shadow-sm border border-slate-100">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Status</p>
              <Badge className={`${statusStyles[student.status] ?? "bg-slate-100 text-slate-600"} border-0 text-xs font-bold px-2`}>
                {student.status}
              </Badge>
            </div>
          </div>

          {/* ── Profile section ── */}
          <SectionLabel>Profile</SectionLabel>
          <div className="bg-white rounded-2xl border border-slate-100 divide-y divide-slate-50 px-4">
            <InfoRow icon={Mail} label="Email" value={student.email} />
            <InfoRow icon={Phone} label="Phone" value={student.phone || "—"} />
          </div>

          {/* ── Academic Information ── */}
          <SectionLabel>Academic Information</SectionLabel>
          <div className="bg-white rounded-2xl border border-slate-100 divide-y divide-slate-50 px-4">
            <InfoRow icon={GraduationCap} label="Department" value={student.department} />
            <InfoRow icon={BookOpen} label="Semester" value={`Semester ${student.semester}`} />
          </div>

          {/* ── Career Information ── */}
          <SectionLabel>Career Information</SectionLabel>
          <div className="bg-white rounded-2xl border border-slate-100 px-4 divide-y divide-slate-50">
            <div className="flex items-start gap-3 py-2.5">
              <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <ShieldCheck className="w-3.5 h-3.5 text-slate-500" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Readiness Score</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${rc.bar} transition-all duration-700`} style={{ width: `${student.readiness_score ?? 0}%` }} />
                  </div>
                  <span className={`text-xs font-bold ${rc.text}`}>{student.readiness_score ?? 0}%</span>
                </div>
              </div>
            </div>
            <InfoRow
              icon={Briefcase}
              label="Placement Status"
              value={
                <Badge className={`${placementStyles[student.placement_status] ?? "bg-slate-100 text-slate-600"} border-0 text-xs font-semibold px-2.5`}>
                  {student.placement_status}
                </Badge>
              }
            />
          </div>

          {/* ── Account ── */}
          <SectionLabel>Account</SectionLabel>
          <div className="bg-white rounded-2xl border border-slate-100 divide-y divide-slate-50 px-4">
            <InfoRow
              icon={ShieldCheck}
              label="Status"
              value={
                <Badge className={`${statusStyles[student.status] ?? "bg-slate-100 text-slate-600"} border-0 text-xs font-semibold px-2.5`}>
                  {student.status}
                </Badge>
              }
            />
            <InfoRow icon={CalendarDays} label="Created At" value={formatDate(student.created_at)} />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}