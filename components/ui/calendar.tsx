"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";

import { cn } from "@/lib/utils";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn(
        "p-3 rounded-2xl bg-gradient-to-br from-white to-violet-50/20 border border-slate-200/70 shadow-sm",
        className
      )}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        month_caption: "flex justify-center pt-1 relative items-center mb-2",
        caption_label: "text-sm font-bold text-slate-900 tracking-tight",
        nav: "space-x-1 flex items-center",
        button_previous: cn(
          "h-8 w-8 bg-white hover:bg-violet-50 border border-slate-200 hover:border-violet-300 rounded-lg inline-flex items-center justify-center text-slate-600 hover:text-[#6C5CE7] transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed absolute left-1"
        ),
        button_next: cn(
          "h-8 w-8 bg-white hover:bg-violet-50 border border-slate-200 hover:border-violet-300 rounded-lg inline-flex items-center justify-center text-slate-600 hover:text-[#6C5CE7] transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed absolute right-1"
        ),
        month_grid: "w-full border-collapse space-y-1",
        weekdays: "flex w-full mb-2",
        weekday:
          "text-violet-500/80 rounded-md w-9 font-bold text-[10px] uppercase tracking-wider",
        week: "flex w-full mt-1",
        day: cn(
          "h-9 w-9 text-center text-sm p-0 relative",
          "focus-within:relative focus-within:z-20"
        ),
        day_button: cn(
          "h-9 w-9 p-0 font-medium rounded-xl text-slate-700 hover:bg-violet-50 hover:text-[#6C5CE7] transition-all duration-200"
        ),
        selected:
          "bg-gradient-to-br from-[#6C5CE7] to-[#a29bfe] text-white font-bold rounded-xl hover:from-[#5a4bd8] hover:to-[#8b7cf7] hover:text-white shadow-lg shadow-violet-500/40 scale-105 [&>button]:text-white [&>button]:hover:bg-transparent [&>button]:hover:text-white",
        today:
          "bg-emerald-50 text-emerald-700 font-bold border-2 border-emerald-400 rounded-xl hover:bg-emerald-100 [&>button]:text-emerald-700",
        outside: "text-slate-300 opacity-50",
        disabled: "text-slate-300 opacity-40",
        hidden: "invisible",
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation, ...chevronProps }) => {
          const Icon = orientation === "left" ? ChevronLeft : ChevronRight;
          return <Icon className="h-4 w-4" {...chevronProps} />;
        },
        ...props.components,
      }}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };