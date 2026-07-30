"use client";

import {
  Mail,
  GraduationCap,
  GitBranch,
  CalendarDays,
  ShieldCheck,
  Clock,
} from "lucide-react";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Student } from "@/types/student";

interface StudentDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  student: Student | null;
}

function initials(name: string) {
  if (!name) return "?";
  return name.split(" ")
    .map(n => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function formatDate(dateString: string) {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

interface InfoRowProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

function InfoRow({ icon, label, value }: InfoRowProps) {
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-slate-50 last:border-0">
      <div className="w-9 h-9 rounded-lg bg-violet-50 flex items-center justify-center flex-shrink-0 text-violet-600">
        {icon}
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{label}</p>
        <p className="text-sm font-medium text-slate-800 mt-0.5">{value || "-"}</p>
      </div>
    </div>
  );
}

const statusStyles: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700 border-amber-200",
  accepted: "bg-emerald-100 text-emerald-700 border-emerald-200",
  cancelled: "bg-slate-100 text-slate-600 border-slate-200",
  expired: "bg-red-100 text-red-700 border-red-200",
};

export default function StudentDrawer({ open, onOpenChange, student }: StudentDrawerProps) {
  if (!student) return null;

  const statusClass = statusStyles[student.status] || statusStyles.pending;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md p-0 flex flex-col">
        
        {/* ── Header ── */}
        <SheetHeader className="p-0">
          <SheetTitle className="sr-only">
            Student invitation for {student.student_name}
          </SheetTitle>
          <div className="sticky top-0 z-10 bg-white/90 backdrop-blur-sm border-b border-slate-100 px-6 py-5">
            <h2 className="text-xl font-bold text-slate-900">
              Student invitation for {student.student_name}
            </h2>
            <p className="text-sm text-slate-500 mt-0.5">
              {student.email}
            </p>
          </div>
        </SheetHeader>

        {/* ── Body ── */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-7">

          {/* ── Avatar Row ── */}
          <div className="flex items-center gap-4">
            <Avatar className="w-16 h-16 ring-4 ring-violet-50 shadow-sm">
              <AvatarFallback className="bg-violet-100 text-violet-700 text-lg font-bold">
                {initials(student.student_name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-base font-semibold text-slate-900">{student.student_name}</p>
              <Badge variant="outline" className={`${statusClass} border-0 px-2.5 py-1 text-xs font-medium mt-1`}>
                {student.status.charAt(0).toUpperCase() + student.status.slice(1)}
              </Badge>
            </div>
          </div>

          {/* ── Profile ── */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Profile</h3>
            <div className="bg-slate-50/60 rounded-xl px-4 divide-y divide-slate-100">
              <InfoRow icon={<Mail className="w-4 h-4" />} label="Email" value={student.email} />
              <InfoRow icon={<GraduationCap className="w-4 h-4" />} label="Course" value={student.course} />
            </div>
          </div>

          {/* ── Academic Information ── */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Academic Information</h3>
            <div className="bg-slate-50/60 rounded-xl px-4 divide-y divide-slate-100">
              <InfoRow icon={<GitBranch className="w-4 h-4" />} label="Branch" value={student.branch} />
              <InfoRow icon={<CalendarDays className="w-4 h-4" />} label="Batch" value={student.batch} />
            </div>
          </div>

          {/* ── Invitation Details ── */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Invitation Details</h3>
            <div className="bg-slate-50/60 rounded-xl px-4 divide-y divide-slate-100">
              <InfoRow 
                icon={<ShieldCheck className="w-4 h-4" />} 
                label="Status" 
                value={student.status.charAt(0).toUpperCase() + student.status.slice(1)} 
              />
              <InfoRow 
                icon={<CalendarDays className="w-4 h-4" />} 
                label="Invited At" 
                value={formatDate(student.invited_at)} 
              />
              <InfoRow 
                icon={<Clock className="w-4 h-4" />} 
                label="Accepted At" 
                value={student.accepted_at ? formatDate(student.accepted_at) : "Not Accepted Yet"} 
              />
              <InfoRow 
                icon={<CalendarDays className="w-4 h-4" />} 
                label="Expires At" 
                value={formatDate(student.expires_at)} 
              />
              <InfoRow 
                icon={<Clock className="w-4 h-4" />} 
                label="Created At" 
                value={formatDate(student.created_at)} 
              />
            </div>
          </div>

        </div>

      </SheetContent>
    </Sheet>
  );
}