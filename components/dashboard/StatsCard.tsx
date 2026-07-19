"use client";

import { useRouter } from "next/navigation";
import { LucideIcon } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Badge } from "@/components/ui/badge";

interface StatsCardProps {
  label: string;
  icon: LucideIcon;
  color: "violet" | "emerald" | "sky" | "rose" | "amber" | "indigo";
  description: string;
  href: string;
  score?: number | null;
  scoreSuffix?: string;
  changeValue?: string | null;
  isJourney?: boolean;
  variant?: "metric" | "activity";
}

const colorTokens = {
  violet:  { text: "text-[#6C5CE7]", soft: "bg-[#6C5CE7]/10", grad: "from-[#6C5CE7] to-[#a29bfe]" },
  emerald: { text: "text-emerald-600", soft: "bg-emerald-50", grad: "from-emerald-500 to-teal-400" },
  sky:     { text: "text-sky-600", soft: "bg-sky-50", grad: "from-sky-500 to-cyan-400" },
  rose:    { text: "text-rose-600", soft: "bg-rose-50", grad: "from-rose-500 to-pink-400" },
  amber:   { text: "text-[#AC5D00]", soft: "bg-[#AC5D00]/10", grad: "from-[#AC5D00] to-[#e67e22]" },
  indigo:  { text: "text-indigo-600", soft: "bg-indigo-50", grad: "from-indigo-500 to-purple-400" },
};

export default function StatsCard({
  label, icon: Icon, color, description, href, score, scoreSuffix, changeValue, isJourney, variant = "metric"
}: StatsCardProps) {
  const router = useRouter();
  const t = colorTokens[color];
  const [animatedScore, setAnimatedScore] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (isInView && score) {
      let start = 0;
      const end = score;
      const duration = 2000;
      const step = (timestamp: number) => {
        if (!start) start = timestamp;
        const progress = Math.min((timestamp - start) / duration, 1);
        setAnimatedScore(Math.floor(progress * end));
        if (progress < 1) window.requestAnimationFrame(step);
      };
      window.requestAnimationFrame(step);
    }
  }, [isInView, score]);

  if (variant === "activity") {
    return (
      <div 
        onClick={() => router.push(href)}
        className="group flex items-center justify-between p-5 bg-white/40 border-b border-slate-100 last:border-0 hover:bg-white transition-all cursor-pointer hover:shadow-lg hover:shadow-[#AC5D00]/5"
      >
        <div className="flex items-center gap-4">
          <div className={`w-11 h-11 rounded-2xl ${t.soft} flex items-center justify-center transition-all group-hover:scale-110 group-hover:bg-[#AC5D00] group-hover:text-white`}>
            <Icon className={`w-5 h-5 transition-colors ${t.text} group-hover:text-white`} />
          </div>
          <div>
            <p className="text-sm font-extrabold text-slate-800">{label}</p>
            <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">{description}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xl font-black text-slate-900 leading-none">{score || 0}</p>
          {changeValue && <Badge className={`mt-2 bg-transparent border-none p-0 text-[10px] font-black group-hover:text-[#AC5D00] transition-colors ${t.text}`}>{changeValue}</Badge>}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      ref={ref}
      onClick={() => router.push(href)}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      whileHover={{ 
        y: -10, 
        rotateX: 2, 
        rotateY: -2,
        boxShadow: "0 20px 40px rgba(172, 93, 0, 0.12)"
      }}
      className="relative flex flex-col bg-white/80 backdrop-blur-md rounded-[2.5rem] p-7 border border-white shadow-xl cursor-pointer overflow-hidden group transition-all duration-300 hover:border-[#AC5D00]/30"
    >
      <div className="flex items-center justify-between mb-6">
        <div className={`w-14 h-14 rounded-[1.25rem] ${t.soft} flex items-center justify-center transition-all group-hover:bg-[#AC5D00]`}>
          <Icon className={`w-7 h-7 transition-colors ${t.text} group-hover:text-white`} />
        </div>
        {changeValue && (
          <Badge className={`px-3 py-1 rounded-full text-[10px] font-black transition-colors group-hover:bg-[#AC5D00] group-hover:text-white ${t.text} ${t.soft} border-none shadow-sm`}>
            {changeValue}
          </Badge>
        )}
      </div>

      <div className="relative z-10">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{label}</p>
        <div className="flex items-baseline gap-1">
          <span className="text-4xl font-black text-slate-900 tracking-tight group-hover:text-[#AC5D00] transition-colors">
            {score !== null ? animatedScore : "—"}
          </span>
          <span className="text-base font-bold text-slate-400">{scoreSuffix}</span>
        </div>
        <p className="text-xs text-slate-500 mt-2 font-semibold opacity-80">{description}</p>
      </div>

      <div className="mt-8 h-12 flex items-end gap-1.5 opacity-20 group-hover:opacity-100 transition-opacity">
        {[30, 50, 40, 90, 60, 80, 45, 95].map((h, i) => (
          <motion.div
            key={i}
            initial={{ height: 0 }}
            animate={isInView ? { height: `${h}%` } : {}}
            transition={{ delay: i * 0.05, duration: 1 }}
            className={`flex-1 rounded-full bg-gradient-to-t ${t.grad} group-hover:from-[#AC5D00] group-hover:to-[#f39c12]`}
          />
        ))}
      </div>
    </motion.div>
  );
}