"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, BadgeCheck } from "lucide-react";

import { cn } from "@/lib/utils";
import { Coach, getInitials, getStartingPrice } from "@/types/seeker/coach-types";

const MAX_SERVICE_PREVIEW = 2;
const HEADING = "font-['Plus_Jakarta_Sans',sans-serif]";

// Exported so Coachdetailpanel can reuse it.
export function CoachAvatar({
  name,
  src,
  className,
}: {
  name: string;
  src?: string | null;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);

  return (
    <div
      className={cn(
        "flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl",
        "bg-gradient-to-br from-[#6C5CE7] to-[#8E7BFF] text-lg font-semibold text-white",
        "shadow-lg shadow-[#6C5CE7]/20 ring-4 ring-white",
        className
      )}
    >
      {src && !failed ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={name}
          className="h-full w-full object-cover"
          onError={() => setFailed(true)}
        />
      ) : (
        getInitials(name)
      )}
    </div>
  );
}

function Stat({
  value,
  label,
  accent,
}: {
  value: string;
  label: string;
  accent?: boolean;
}) {
  return (
    <div className="min-w-0 flex-1 px-2 text-center first:pl-0 last:pr-0">
      <p
        className={cn(
          HEADING,
          "truncate text-sm font-bold",
          accent ? "text-[#AC5D00]" : "text-slate-900"
        )}
      >
        {value}
      </p>
      <p className="text-[11px] text-[#787680]">{label}</p>
    </div>
  );
}

interface CoachCardProps {
  coach: Coach;
  onSelect: (coach: Coach) => void;
}

export default function CoachCard({ coach, onSelect }: CoachCardProps) {
  const profile = coach.profile;
  const services = coach.services || [];
  const preview = services.slice(0, MAX_SERVICE_PREVIEW);
  const remaining = services.length - preview.length;
  const startingPrice = getStartingPrice(services)?.replace(/^From\s/, "");

  const open = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    onSelect(coach);
  };

  return (
    <motion.article
      onClick={() => onSelect(coach)}
      whileHover={{ y: -3 }}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
      className="group flex h-full cursor-pointer flex-col rounded-3xl border border-violet-100 bg-white p-5 shadow-sm transition-all hover:border-violet-200 hover:shadow-lg hover:shadow-violet-100"
    >
      {/* Identity */}
      <div className="flex items-center gap-3.5">
        <CoachAvatar
          name={coach.name}
          src={profile?.profileImageUrl}
          className="h-16 w-16 rounded-full text-lg shadow-none ring-2 ring-violet-100"
        />

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <h2
              className={cn(
                HEADING,
                "truncate text-base font-bold tracking-tight text-slate-900"
              )}
            >
              {coach.name || "Coach"}
            </h2>
            {coach.profileCompleted && (
              <BadgeCheck size={16} className="shrink-0 fill-[#6C5CE7] text-white" />
            )}
          </div>
          <p className="mt-0.5 truncate text-xs font-semibold text-[#6C5CE7]">
            {profile?.specialization || "General career coaching"}
          </p>
        </div>
      </div>

      <p className="mt-3 line-clamp-2 min-h-[2.5rem] text-xs leading-5 text-slate-600">
        {profile?.headline || profile?.bio || "Professional Coach"}
      </p>

      {/* Services preview (headings only) */}
      {preview.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {preview.map((s) => (
            <span
              key={s.id}
              className="max-w-[9rem] truncate rounded-full bg-violet-50 px-2.5 py-1 text-[11px] font-medium text-[#6C5CE7]"
            >
              {s.name}
            </span>
          ))}
          {remaining > 0 && (
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-[#787680]">
              +{remaining}
            </span>
          )}
        </div>
      )}

      {/* Stats */}
      <div className="mt-4 flex divide-x divide-violet-100 rounded-2xl bg-violet-50/70 py-2.5">
        <Stat
          value={
            profile?.experienceYears
              ? `${profile.experienceYears} ${profile.experienceYears === 1 ? "yr" : "yrs"}`
              : "—"
          }
          label="Experience"
        />
        <Stat value={String(services.length)} label="Services" />
        <Stat value={startingPrice ?? "—"} label="Starts at" accent />
      </div>

      {/* Action */}
      <div className="mt-auto pt-4">
        <button
          type="button"
          onClick={open}
          className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-[#6C5CE7] px-3 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-[#5b4bd6] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6C5CE7] focus-visible:ring-offset-2"
        >
          View profile
          <ArrowRight
            size={14}
            className="transition-transform duration-300 group-hover:translate-x-1"
          />
        </button>
      </div>
    </motion.article>
  );
}

export function CoachCardSkeleton() {
  return (
    <div className="animate-pulse space-y-3 rounded-3xl border border-violet-100 bg-white p-5">
      <div className="flex items-center gap-3.5">
        <div className="h-16 w-16 shrink-0 rounded-full bg-violet-100" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-28 rounded bg-violet-100" />
          <div className="h-3 w-20 rounded bg-violet-50" />
        </div>
      </div>
      <div className="h-8 rounded bg-violet-50" />
      <div className="h-12 rounded-2xl bg-violet-50" />
      <div className="h-9 rounded-xl bg-violet-100" />
    </div>
  );
}