"use client";

import type { ElementType, ReactNode } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Clock3, Users, Video } from "lucide-react";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const HEADING = "font-['Plus_Jakarta_Sans',sans-serif]";
const PRIMARY = "text-[#6C5CE7]";

export const BOX =
  "rounded-3xl bg-white p-5 shadow-sm ring-1 ring-violet-100 sm:p-6";

/* -------------------------------------------------------------------------- */
/* FORMATTERS                                                                 */
/* -------------------------------------------------------------------------- */

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

/** "Asia/Kolkata" -> "Asia/Kolkata (UTC+05:30)" */
export const formatTimezone = (timezone?: string | null) => {
  if (!timezone) return null;

  try {
    const offset = new Intl.DateTimeFormat("en", {
      timeZone: timezone,
      timeZoneName: "longOffset",
    })
      .formatToParts(new Date())
      .find((part) => part.type === "timeZoneName")
      ?.value.replace("GMT", "UTC");

    const label = timezone.replace(/_/g, " ");
    return offset && offset !== "UTC" ? `${label} (${offset})` : label;
  } catch {
    return timezone;
  }
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

/* -------------------------------------------------------------------------- */
/* CHIP (small pill used in headers, stat cells and cards)                     */
/* -------------------------------------------------------------------------- */

const CHIP_TONES = {
  violet: "bg-violet-100 text-[#6C5CE7]",
  amber: "bg-amber-50 text-[#AC5D00]",
  green: "bg-emerald-50 text-emerald-700",
  blue: "bg-blue-50 text-blue-700",
  slate: "bg-slate-100 text-slate-600",
  solid: "bg-[#6C5CE7] text-white",
} as const;

export function Chip({
  tone = "violet",
  className,
  children,
}: {
  tone?: keyof typeof CHIP_TONES;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2 py-0.5 text-[10px] font-semibold leading-4",
        CHIP_TONES[tone],
        className
      )}
    >
      {children}
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/* PANEL                                                                      */
/* -------------------------------------------------------------------------- */

const ACCENTS = {
  violet: "bg-[#6C5CE7]",
  amber: "bg-[#AC5D00]",
  slate: "bg-[#787680]",
} as const;

export function Panel({
  title,
  subtitle,
  icon: Icon,
  accent,
  action,
  className,
  href,
  children,
}: {
  title: string;
  subtitle?: string;
  /** Icon tile (old style). Ignored when `accent` is set. */
  icon?: ElementType;
  /** Vertical accent bar beside the title (new style). */
  accent?: keyof typeof ACCENTS;
  action?: ReactNode;
  className?: string;
  /** Renders a "View all" link under the content. */
  href?: string;
  children: ReactNode;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={cn(BOX, className)}
    >
      <div className="mb-5 flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          {accent ? (
            <span
              aria-hidden
              className={cn("h-6 w-1.5 shrink-0 rounded-full", ACCENTS[accent])}
            />
          ) : (
            Icon && (
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-[#6C5CE7]">
                <Icon className="h-[18px] w-[18px]" />
              </span>
            )
          )}

          <div className="min-w-0">
            <h2
              className={cn(
                HEADING,
                "truncate text-base font-bold leading-tight text-slate-900"
              )}
            >
              {title}
            </h2>
            {subtitle && (
              <p className="mt-0.5 truncate text-xs text-[#787680]">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {action && <div className="shrink-0">{action}</div>}
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
    </motion.section>
  );
}

/* -------------------------------------------------------------------------- */
/* EMPTY STATES                                                               */
/* -------------------------------------------------------------------------- */

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

/** Richer empty state: icon, title, helper text and an optional action. */
export function EmptyState({
  icon: Icon,
  title,
  text,
  action,
  compact = false,
}: {
  icon: ElementType;
  title: string;
  text: string;
  action?: ReactNode;
  compact?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center rounded-2xl bg-violet-50/60 px-5 text-center",
        compact ? "py-7" : "py-10"
      )}
    >
      <motion.span
        animate={{ y: [0, -4, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-violet-400 shadow-sm ring-1 ring-violet-100"
      >
        <Icon className="h-6 w-6" />
      </motion.span>

      <p className={cn(HEADING, "mt-4 text-sm font-bold text-slate-900")}>
        {title}
      </p>
      <p className="mt-1 max-w-xs text-xs leading-5 text-[#787680]">{text}</p>

      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* PROGRESS BAR                                                               */
/* -------------------------------------------------------------------------- */

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
      <motion.div
        className={cn("h-full rounded-full", fill)}
        initial={{ width: 0 }}
        animate={{ width: `${pct(value)}%` }}
        transition={{ duration: 0.7, ease: "easeOut" }}
      />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* PROGRESS RING                                                              */
/* -------------------------------------------------------------------------- */

export function ProgressRing({
  value,
  size = 72,
  stroke = 7,
  loading = false,
}: {
  value: number | null | undefined;
  size?: number;
  stroke?: number;
  loading?: boolean;
}) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = pct(value);

  return (
    <div
      className="relative shrink-0"
      style={{ width: size, height: size }}
      role="img"
      aria-label={`${progress}% complete`}
    >
      <svg
        width={size}
        height={size}
        style={{ transform: "rotate(-90deg)" }}
        aria-hidden
      >
        <defs>
          <linearGradient id="ring-gradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#6C5CE7" />
            <stop offset="100%" stopColor="#A29BFE" />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#EDE9FE"
          strokeWidth={stroke}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="url(#ring-gradient)"
          strokeWidth={stroke}
          strokeLinecap="round"
          initial={{ strokeDasharray: `0 ${circumference}` }}
          animate={{
            strokeDasharray: `${loading ? 0 : (progress / 100) * circumference} ${circumference}`,
          }}
          transition={{ duration: 0.9, ease: "easeOut" }}
        />
      </svg>

      <span
        className={cn(
          HEADING,
          "absolute inset-0 flex items-center justify-center text-sm font-extrabold",
          PRIMARY
        )}
      >
        {loading ? "—" : `${progress}%`}
      </span>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* STAT STRIP (single card, divided cells)                                     */
/* -------------------------------------------------------------------------- */

export function StatStrip({ children }: { children: ReactNode }) {
  return (
    <section
      className={cn(
        BOX,
        "grid grid-cols-1 !p-0 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5",
        "[&>*]:border-b [&>*]:border-violet-100 [&>*:last-child]:border-b-0",
        "xl:[&>*]:border-b-0 xl:[&>*]:border-r xl:[&>*:last-child]:border-r-0"
      )}
    >
      {children}
    </section>
  );
}

export function StatCell({
  label,
  icon: Icon,
  chip,
  chipTone = "violet",
  value,
  unit,
  footnote,
  href,
}: {
  label: string;
  icon: ElementType;
  chip?: string;
  chipTone?: keyof typeof CHIP_TONES;
  value: string | number;
  unit?: string;
  footnote?: ReactNode;
  href?: string;
}) {
  const content = (
    <>
      <div className="flex items-center justify-between gap-2">
        <span className="flex min-w-0 items-center gap-2 text-xs font-medium text-[#787680]">
          <Icon className="h-4 w-4 shrink-0 text-[#6C5CE7]" />
          <span className="truncate">{label}</span>
        </span>
        {chip && <Chip tone={chipTone}>{chip}</Chip>}
      </div>

      <p className="mt-3 flex items-baseline gap-1.5">
        <span
          className={cn(HEADING, "text-2xl font-extrabold leading-none", "text-slate-900")}
        >
          {value}
        </span>
        {unit && (
          <span className="text-xs font-medium text-[#787680]">{unit}</span>
        )}
      </p>

      {footnote && (
        <div className="mt-2 text-[11px] leading-4 text-[#787680]">
          {footnote}
        </div>
      )}
    </>
  );

  const classes =
    "block p-4 transition-colors hover:bg-violet-50/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#6C5CE7] sm:p-5";

  return href ? (
    <Link href={href} className={classes}>
      {content}
    </Link>
  ) : (
    <div className={classes}>{content}</div>
  );
}

/* -------------------------------------------------------------------------- */
/* STAT TILE (kept for other pages that still use it)                          */
/* -------------------------------------------------------------------------- */

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

/* -------------------------------------------------------------------------- */
/* SESSION ROW                                                                */
/* -------------------------------------------------------------------------- */

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
          {session.durationMinutes ? ` · ${session.durationMinutes} min` : ""}
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
              window.open(session.meetingUrl!, "_blank", "noopener,noreferrer")
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

/* -------------------------------------------------------------------------- */
/* SERVICE CARD                                                               */
/* -------------------------------------------------------------------------- */

export function ServiceCard({
  service,
}: {
  service: {
    id: string;
    name: string;
    category?: string | null;
    description?: string | null;
    durationMinutes?: number | null;
    totalBookings: number;
    isActive: boolean;
  };
}) {
  return (
    <div className="flex flex-col rounded-2xl bg-violet-50/50 p-4 ring-1 ring-violet-100 transition-colors hover:bg-violet-50">
      <div className="flex items-center justify-between gap-2">
        <Chip tone="violet" className="uppercase tracking-wide">
          {service.category || "Service"}
        </Chip>
        <Chip tone={service.isActive ? "green" : "slate"}>
          <span
            className={cn(
              "h-1.5 w-1.5 rounded-full",
              service.isActive ? "bg-emerald-500" : "bg-slate-400"
            )}
          />
          {service.isActive ? "Active" : "Paused"}
        </Chip>
      </div>

      <h3 className={cn(HEADING, "mt-3 text-sm font-bold text-slate-900")}>
        {service.name}
      </h3>

      <p className="mt-1 line-clamp-2 flex-1 text-xs leading-5 text-[#787680]">
        {service.description || "No description added yet."}
      </p>

      <div className="mt-4 flex items-center justify-between border-t border-violet-100 pt-3 text-xs">
        <span className="flex items-center gap-1.5 font-semibold text-slate-700">
          <Users className="h-3.5 w-3.5 text-[#6C5CE7]" />
          {service.totalBookings}{" "}
          {service.totalBookings === 1 ? "Booking" : "Bookings"}
        </span>
        <span className="flex items-center gap-1.5 text-[#787680]">
          <Clock3 className="h-3.5 w-3.5" />
          {service.durationMinutes
            ? `${service.durationMinutes} mins / session`
            : "Flexible"}
        </span>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* EARNINGS BARS                                                              */
/* -------------------------------------------------------------------------- */

export function EarningsBars({
  data,
  currency,
  variant = "dark",
}: {
  data: {
    month: string;
    label: string;
    earnings: { currency: string; amount: number }[];
  }[];
  currency: string;
  /** "dark" = white bars for gradient cards, "light" = violet bars for white cards */
  variant?: "dark" | "light";
}) {
  const rows = data.map((item) => ({
    ...item,
    amount: getAmount(item.earnings, currency),
  }));

  const max = Math.max(...rows.map((row) => row.amount), 1);
  const light = variant === "light";

  return (
    <div
      className={cn(
        "flex items-end gap-2",
        light ? "h-32 rounded-2xl bg-violet-50/60 p-3" : "h-36"
      )}
    >
      {rows.map((row, index) => {
        const isLast = index === rows.length - 1;
        const height =
          row.amount > 0 ? Math.max((row.amount / max) * 100, 6) : 6;

        return (
          <div
            key={row.month}
            className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-1.5"
          >
            <div className="flex h-full w-full items-end">
              <motion.div
                title={`${row.label}: ${formatCurrency(row.amount, currency)}`}
                initial={{ height: 0 }}
                animate={{ height: `${height}%` }}
                transition={{ duration: 0.6, delay: index * 0.05, ease: "easeOut" }}
                className={cn(
                  "w-full rounded-t-lg",
                  light
                    ? isLast
                      ? "bg-[#6C5CE7]"
                      : "bg-violet-200"
                    : isLast
                      ? "bg-white"
                      : "bg-white/30"
                )}
              />
            </div>
            <span
              className={cn(
                "text-[10px]",
                light ? "text-[#787680]" : "text-white/80"
              )}
            >
              {row.label.split(" ")[0]}
            </span>
          </div>
        );
      })}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* DONUT                                                                      */
/* -------------------------------------------------------------------------- */

export function Donut({
  segments,
  total,
  loading = false,
  size = 168,
  label = "Total sessions",
}: {
  segments: { label: string; value: number; hex: string }[];
  total: number;
  loading?: boolean;
  size?: number;
  label?: string;
}) {
  const stroke = Math.round(size * 0.108);
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const active = segments.filter((segment) => segment.value > 0);
  const gap = active.length > 1 ? 4 : 0;

  let offset = 0;

  return (
    <div
      className="relative shrink-0"
      style={{ width: size, height: size }}
      role="img"
      aria-label={`${total} ${label.toLowerCase()}`}
    >
      <svg
        width={size}
        height={size}
        style={{ transform: "rotate(-90deg)" }}
        aria-hidden
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
            const dash = Math.max(length - gap, 0);

            const circle = (
              <motion.circle
                key={segment.label}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke={segment.hex}
                strokeWidth={stroke}
                strokeLinecap={gap ? "round" : "butt"}
                strokeDashoffset={-offset}
                initial={{ strokeDasharray: `0 ${circumference}` }}
                animate={{ strokeDasharray: `${dash} ${circumference}` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            );

            offset += length;
            return circle;
          })}
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className={cn(
            HEADING,
            "font-extrabold leading-none",
            PRIMARY,
            size >= 150 ? "text-4xl" : "text-3xl"
          )}
        >
          {loading ? "—" : total}
        </span>
        <span className="mt-1 text-[9px] font-semibold uppercase tracking-wider text-[#787680]">
          {label}
        </span>
      </div>
    </div>
  );
}