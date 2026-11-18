"use client";

import type { ElementType, ReactNode } from "react";
import Link from "next/link";
import {
  CalendarDays,
  Clock3,
  Video,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Avatar,
  AvatarFallback,
} from "@/components/ui/avatar";

const HEADING = "font-['Plus_Jakarta_Sans',sans-serif]";
const PRIMARY = "text-[#6C5CE7]";

export const BOX =
  "rounded-3xl bg-white p-5 shadow-sm ring-1 ring-violet-100 sm:p-6";

export const formatCurrency = (amount: number, currency = "INR") => {
  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amount || 0);
  } catch {
    return `${currency} ${amount || 0}`;
  }
};

export const parseDate = (date?: string | null) => {
  const d = date ? new Date(`${date.slice(0, 10)}T00:00:00`) : null;
  return d && !Number.isNaN(d.getTime()) ? d : null;
};

export const formatDate = (date?: string | null) =>
  parseDate(date)?.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }) ?? "Date unavailable";

export const formatTime = (time?: string | null) => {
  if (!time) return "Time unavailable";

  const [h, m] = time.split(":");
  const d = new Date();

  d.setHours(Number(h), Number(m), 0, 0);

  return Number.isNaN(d.getTime())
    ? time
    : d.toLocaleTimeString("en-IN", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
};

export const getInitials = (name?: string | null) =>
  name?.trim()
    ? name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((p) => p[0])
        .join("")
        .toUpperCase()
    : "C";

export const getAmount = (
  amounts: { currency: string; amount: number }[] | undefined,
  currency = "INR"
) =>
  amounts?.find(
    (a) => a.currency?.toUpperCase() === currency.toUpperCase()
  )?.amount || 0;

export const pct = (value: number | null | undefined) =>
  Math.min(Math.max(Number(value) || 0, 0), 100);

export const greeting = () => {
  const hour = new Date().getHours();

  return hour < 12
    ? "Good morning"
    : hour < 17
      ? "Good afternoon"
      : "Good evening";
};

export const statusStyle = (status: string) =>
  ({
    confirmed: "border-emerald-200 bg-emerald-50 text-emerald-700",
    completed: "border-blue-200 bg-blue-50 text-blue-700",
    pending: "border-amber-200 bg-amber-50 text-amber-700",
    cancelled: "border-red-200 bg-red-50 text-red-700",
  })[status?.toLowerCase()] ??
  "border-slate-200 bg-slate-50 text-slate-600";

export function Panel({
  title,
  icon: Icon,
  action,
  className,
  href,
  children,
}: {
  title: string;
  icon: ElementType;
  action?: ReactNode;
  className?: string;
  href?: string;
  children: ReactNode;
}) {
  return (
    <section
      className={cn(
        BOX,
        className,
        href &&
          "transition-all duration-200 hover:shadow-md hover:shadow-violet-100"
      )}
    >
      <div className="mb-5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-50 text-[#6C5CE7]">
            <Icon className="h-[18px] w-[18px]" />
          </span>

          <h2 className={cn(HEADING, "text-base font-bold text-slate-900")}>
            {title}
          </h2>
        </div>

        {action}
      </div>

      {children}

      {href && (
        <Link
          href={href}
          aria-label={`View ${title}`}
          className="mt-4 inline-flex text-xs font-semibold text-[#6C5CE7] hover:underline"
        >
          View all
        </Link>
      )}
    </section>
  );
}

export function Empty({
  icon: Icon,
  text,
}: {
  icon: ElementType;
  text: string;
}) {
  return (
    <div className="rounded-2xl bg-violet-50/60 px-4 py-9 text-center">
      <Icon className="mx-auto h-7 w-7 text-violet-300" />
      <p className="mt-2 text-sm text-[#787680]">{text}</p>
    </div>
  );
}

export function Bar({
  value,
  fill = "bg-[#6C5CE7]",
  className,
}: {
  value: number | null | undefined;
  fill?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "h-2 w-full overflow-hidden rounded-full bg-violet-100",
        className
      )}
    >
      <div
        className={cn(
          "h-full rounded-full transition-all duration-500",
          fill
        )}
        style={{ width: `${pct(value)}%` }}
      />
    </div>
  );
}

export function StatTile({
  label,
  value,
  icon: Icon,
  tone,
  href,
}: {
  label: string;
  value: string | number;
  icon: ElementType;
  tone: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        BOX,
        "flex items-center gap-4 !p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:shadow-violet-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6C5CE7]"
      )}
    >
      <span
        className={cn(
          "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl",
          tone
        )}
      >
        <Icon className="h-5 w-5" />
      </span>

      <div className="min-w-0">
        <p className="truncate text-sm text-[#787680]">{label}</p>
        <p className={cn(HEADING, "truncate text-2xl font-extrabold", PRIMARY)}>
          {value}
        </p>
      </div>
    </Link>
  );
}

export function SessionRow({
  session,
}: {
  session: {
    id: string;
    sessionDate: string;
    serviceName?: string | null;
    clientName?: string | null;
    startTime?: string | null;
    durationMinutes?: number | null;
    status: string;
    meetingUrl?: string | null;
  };
}) {
  const date = parseDate(session.sessionDate);

  return (
    <div className="flex items-center gap-3 rounded-2xl bg-violet-50/50 p-3 transition-colors hover:bg-violet-50 sm:gap-4">
      <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-xl bg-white text-[#6C5CE7] shadow-sm">
        <span className={cn(HEADING, "text-lg font-extrabold leading-none")}>
          {date?.getDate() ?? "--"}
        </span>
        <span className="mt-0.5 text-[10px] font-semibold uppercase">
          {date?.toLocaleDateString("en-IN", { month: "short" }) ?? "---"}
        </span>
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold text-slate-900">
          {session.serviceName || "Coaching Session"}
        </p>
        <p className="truncate text-sm text-[#787680]">
          With {session.clientName || "Client"}
        </p>
        <p className="mt-0.5 flex items-center gap-1 text-xs text-[#787680]">
          <Clock3 className="h-3 w-3" />
          {formatTime(session.startTime)}
          {session.durationMinutes
            ? ` · ${session.durationMinutes} min`
            : ""}
        </p>
      </div>

      <div className="flex shrink-0 flex-col items-end gap-2 sm:flex-row sm:items-center">
        <Badge
          variant="outline"
          className={cn("capitalize", statusStyle(session.status))}
        >
          {session.status}
        </Badge>

        {session.meetingUrl && (
          <Button
            size="sm"
            className="rounded-xl bg-[#6C5CE7] hover:bg-[#5b4bd6]"
            onClick={() =>
              window.open(
                session.meetingUrl!,
                "_blank",
                "noopener,noreferrer"
              )
            }
          >
            <Video className="mr-1.5 h-4 w-4" />
            Join
          </Button>
        )}
      </div>
    </div>
  );
}

export function EarningsBars({
  data,
  currency,
}: {
  data: {
    month: string;
    label: string;
    earnings: { currency: string; amount: number }[];
  }[];
  currency: string;
}) {
  const rows = data.map((item) => ({
    ...item,
    amount: getAmount(item.earnings, currency),
  }));

  const max = Math.max(...rows.map((row) => row.amount), 1);

  return (
    <div className="flex h-36 items-end gap-2">
      {rows.map((row, index) => (
        <div
          key={row.month}
          className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-1.5"
        >
          <div className="flex h-full w-full items-end">
            <div
              title={`${row.label}: ${formatCurrency(row.amount, currency)}`}
              className={cn(
                "w-full rounded-t-lg",
                index === rows.length - 1 ? "bg-white" : "bg-white/30"
              )}
              style={{
                height: `${
                  row.amount > 0
                    ? Math.max((row.amount / max) * 100, 6)
                    : 3
                }%`,
              }}
            />
          </div>
          <span className="text-[11px] text-white/80">
            {row.label.split(" ")[0]}
          </span>
        </div>
      ))}
    </div>
  );
}

export function Donut({
  segments,
  total,
  loading = false,
}: {
  segments: { label: string; value: number; hex: string }[];
  total: number;
  loading?: boolean;
}) {
  const size = 168;
  const stroke = 18;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const active = segments.filter((segment) => segment.value > 0);
  const gap = active.length > 1 ? 4 : 0;

  let offset = 0;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        style={{ transform: "rotate(-90deg)" }}
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#EDE9FE"
          strokeWidth={stroke}
        />

        {total > 0 &&
          active.map((segment) => {
            const length = (segment.value / total) * circumference;

            const circle = (
              <circle
                key={segment.label}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke={segment.hex}
                strokeWidth={stroke}
                strokeDasharray={`${Math.max(length - gap, 0)} ${circumference}`}
                strokeDashoffset={-offset}
              />
            );

            offset += length;
            return circle;
          })}
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={cn(HEADING, "text-4xl font-extrabold leading-none", PRIMARY)}>
          {loading ? "—" : total}
        </span>
        <span className="mt-1.5 text-xs text-[#787680]">Total sessions</span>
      </div>
    </div>
  );
}