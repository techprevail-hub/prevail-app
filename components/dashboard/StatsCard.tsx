"use client";

import { useRouter } from "next/navigation";
import { LucideIcon, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";

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
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  isFirstCard?: boolean;
  chartData?: number[];
}

const colorTokens: Record<string, { 
  light: string; 
  icon: string; 
  text: string; 
  border: string; 
  gradient: string; 
  ring: string; 
  glow: string;
  dark: string;
  hover: string;
  bgGradient: string;
  shadow: string;
  from: string;
  to: string;
  chartColor: string;
}> = {
  violet: { 
    light: "bg-violet-50/80", 
    icon: "text-violet-600", 
    text: "text-violet-700", 
    border: "border-violet-200/50", 
    gradient: "from-violet-500 to-indigo-500",
    ring: "stroke-violet-500",
    glow: "shadow-violet-200/50",
    dark: "bg-violet-100",
    hover: "hover:border-violet-300/70",
    bgGradient: "from-violet-500/10 to-indigo-500/5",
    shadow: "shadow-violet-500/20",
    from: "#8b5cf6",
    to: "#6366f1",
    chartColor: "#8b5cf6"
  },
  emerald: { 
    light: "bg-emerald-50/80", 
    icon: "text-emerald-600", 
    text: "text-emerald-700", 
    border: "border-emerald-200/50", 
    gradient: "from-emerald-500 to-teal-500",
    ring: "stroke-emerald-500",
    glow: "shadow-emerald-200/50",
    dark: "bg-emerald-100",
    hover: "hover:border-emerald-300/70",
    bgGradient: "from-emerald-500/10 to-teal-500/5",
    shadow: "shadow-emerald-500/20",
    from: "#10b981",
    to: "#14b8a6",
    chartColor: "#10b981"
  },
  sky: { 
    light: "bg-sky-50/80", 
    icon: "text-sky-600", 
    text: "text-sky-700", 
    border: "border-sky-200/50", 
    gradient: "from-sky-500 to-cyan-500",
    ring: "stroke-sky-500",
    glow: "shadow-sky-200/50",
    dark: "bg-sky-100",
    hover: "hover:border-sky-300/70",
    bgGradient: "from-sky-500/10 to-cyan-500/5",
    shadow: "shadow-sky-500/20",
    from: "#0ea5e9",
    to: "#06b6d4",
    chartColor: "#0ea5e9"
  },
  rose: { 
    light: "bg-rose-50/80", 
    icon: "text-rose-600", 
    text: "text-rose-700", 
    border: "border-rose-200/50", 
    gradient: "from-rose-500 to-pink-500",
    ring: "stroke-rose-500",
    glow: "shadow-rose-200/50",
    dark: "bg-rose-100",
    hover: "hover:border-rose-300/70",
    bgGradient: "from-rose-500/10 to-pink-500/5",
    shadow: "shadow-rose-500/20",
    from: "#f43f5e",
    to: "#ec4899",
    chartColor: "#f43f5e"
  },
  amber: { 
    light: "bg-amber-50/80", 
    icon: "text-amber-600", 
    text: "text-amber-700", 
    border: "border-amber-200/50", 
    gradient: "from-amber-500 to-orange-500",
    ring: "stroke-amber-500",
    glow: "shadow-amber-200/50",
    dark: "bg-amber-100",
    hover: "hover:border-amber-300/70",
    bgGradient: "from-amber-500/10 to-orange-500/5",
    shadow: "shadow-amber-500/20",
    from: "#f59e0b",
    to: "#f97316",
    chartColor: "#f59e0b"
  },
  indigo: { 
    light: "bg-indigo-50/80", 
    icon: "text-indigo-600", 
    text: "text-indigo-700", 
    border: "border-indigo-200/50", 
    gradient: "from-indigo-500 to-purple-500",
    ring: "stroke-indigo-500",
    glow: "shadow-indigo-200/50",
    dark: "bg-indigo-100",
    hover: "hover:border-indigo-300/70",
    bgGradient: "from-indigo-500/10 to-purple-500/5",
    shadow: "shadow-indigo-500/20",
    from: "#6366f1",
    to: "#8b5cf6",
    chartColor: "#6366f1"
  },
};

// 3D Pie Chart with Depth
function ThreeDPieChart({ score, color }: { score: number; color: { from: string; to: string } }) {
  const circumference = 2 * Math.PI * 38;
  const offset = circumference - (score / 100) * circumference;
  const [isAnimated, setIsAnimated] = useState(false);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  useEffect(() => {
    if (isInView) {
      setTimeout(() => setIsAnimated(true), 300);
    }
  }, [isInView]);

  const getScoreColor = (s: number) => {
    if (s >= 80) return "#10b981";
    if (s >= 60) return "#8b5cf6";
    if (s >= 40) return "#f59e0b";
    return "#ef4444";
  };

  const scoreColor = getScoreColor(score);

  return (
    <div ref={ref} className="relative w-12 h-12 flex items-center justify-center flex-shrink-0">
      <div 
        className="absolute inset-0 rounded-full blur-xl opacity-40"
        style={{ 
          background: `radial-gradient(circle, ${scoreColor}33 0%, transparent 70%)`,
          transform: 'translateZ(-10px)'
        }}
      />
      
      <svg className="w-full h-full transform -rotate-90 drop-shadow-lg" viewBox="0 0 88 88">
        <circle
          cx="44"
          cy="44"
          r="38"
          fill="none"
          stroke="#f1f5f9"
          strokeWidth="8"
          className="opacity-50"
        />
        <motion.circle
          cx="44"
          cy="44"
          r="38"
          fill="none"
          stroke={scoreColor}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: isAnimated ? offset : circumference }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="drop-shadow-lg"
          style={{ filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.1))' }}
        />
        {isAnimated && (
          <motion.circle
            cx="44"
            cy="6"
            r="4"
            fill={scoreColor}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.6 }}
            className="shadow-lg"
          />
        )}
      </svg>
      
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.span 
          className="text-base font-extrabold text-slate-900 drop-shadow-md"
          initial={{ scale: 0, rotateX: 90 }}
          animate={{ scale: isAnimated ? 1 : 0, rotateX: isAnimated ? 0 : 90 }}
          transition={{ delay: 0.5, type: "spring", stiffness: 200, damping: 15 }}
          style={{ textShadow: '0 2px 4px rgba(0,0,0,0.1)' }}
        >
          {score}
        </motion.span>
      </div>
    </div>
  );
}

// Animated Counter
function AnimatedCounter3D({ value, suffix = "" }: { value: number; suffix?: string }) {
  const [displayValue, setDisplayValue] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });

  useEffect(() => {
    if (isInView) {
      let start = 0;
      const duration = 1200;
      const steps = 60;
      const increment = value / steps;
      const interval = duration / steps;

      const timer = setInterval(() => {
        start += increment;
        if (start >= value) {
          setDisplayValue(value);
          clearInterval(timer);
        } else {
          setDisplayValue(Math.round(start));
        }
      }, interval);

      return () => clearInterval(timer);
    }
  }, [isInView, value]);

  return (
    <span 
      ref={ref} 
      className="text-2xl font-black text-slate-900 tabular-nums"
      style={{ 
        textShadow: '0 2px 4px rgba(0,0,0,0.05), 0 4px 8px rgba(0,0,0,0.03)',
      }}
    >
      {displayValue}{suffix}
    </span>
  );
}

// Sparkline Chart Component - Smaller Size
function Sparkline({ data, color, trend }: { data: number[]; color: string; trend?: "up" | "down" | "neutral" }) {
  const [isAnimated, setIsAnimated] = useState(false);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  useEffect(() => {
    if (isInView) {
      setTimeout(() => setIsAnimated(true), 400);
    }
  }, [isInView]);

  // Smaller dimensions
  const width = 80;
  const height = 30;
  const padding = 2;
  const minValue = Math.min(...data);
  const maxValue = Math.max(...data);
  const range = maxValue - minValue || 1;

  const points = data.map((value, index) => {
    const x = padding + (index / (data.length - 1)) * (width - padding * 2);
    const y = height - padding - ((value - minValue) / range) * (height - padding * 2);
    return `${x},${y}`;
  }).join(" ");

  const gradientId = `sparkline-gradient-${Math.random().toString(36).substr(2, 9)}`;

  const getTrendColor = () => {
    if (trend === "up") return "#10b981";
    if (trend === "down") return "#ef4444";
    return color;
  };

  const lineColor = getTrendColor();

  return (
    <div ref={ref} className="relative flex-shrink-0">
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className="overflow-visible"
      >
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={lineColor} stopOpacity="0.25" />
            <stop offset="100%" stopColor={lineColor} stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Area fill */}
        {isAnimated && (
          <motion.polygon
            points={`${points} ${width - padding},${height - padding} ${padding},${height - padding}`}
            fill={`url(#${gradientId})`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          />
        )}

        {/* Line path */}
        <motion.polyline
          points={points}
          fill="none"
          stroke={lineColor}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ 
            pathLength: isAnimated ? 1 : 0,
            opacity: isAnimated ? 1 : 0
          }}
          transition={{ duration: 1, ease: "easeInOut", delay: 0.1 }}
        />

        {/* Glow line behind */}
        <motion.polyline
          points={points}
          fill="none"
          stroke={lineColor}
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.12"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ 
            pathLength: isAnimated ? 1 : 0,
            opacity: isAnimated ? 0.12 : 0
          }}
          transition={{ duration: 1, ease: "easeInOut", delay: 0.1 }}
        />

        {/* End dot - smaller */}
        {isAnimated && data.length > 0 && (
          <motion.circle
            cx={width - padding}
            cy={height - padding - ((data[data.length - 1] - minValue) / range) * (height - padding * 2)}
            r="2.5"
            fill={lineColor}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.8, type: "spring", stiffness: 300 }}
          />
        )}

        {/* Start dot - smaller */}
        {isAnimated && data.length > 0 && (
          <motion.circle
            cx={padding}
            cy={height - padding - ((data[0] - minValue) / range) * (height - padding * 2)}
            r="1.5"
            fill={lineColor}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.6 }}
            opacity="0.5"
          />
        )}
      </svg>
    </div>
  );
}

// Trend Indicator Component
function TrendIndicator({ trend, trendValue, color }: { trend?: "up" | "down" | "neutral"; trendValue?: string; color: string }) {
  if (!trend) return null;
  
  const getTrendColor = () => {
    if (trend === "up") return "text-emerald-600 bg-emerald-50 border-emerald-200";
    if (trend === "down") return "text-rose-600 bg-rose-50 border-rose-200";
    return "text-slate-500 bg-slate-50 border-slate-200";
  };

  const getTrendIcon = () => {
    if (trend === "up") return <TrendingUp className="w-3 h-3" />;
    if (trend === "down") return <TrendingDown className="w-3 h-3" />;
    return <Minus className="w-3 h-3" />;
  };

  return (
    <motion.div 
      className={`flex items-center gap-1 px-2 py-0.5 rounded-full border ${getTrendColor()} text-[10px] font-semibold`}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.4 }}
    >
      {getTrendIcon()}
      <span>{trendValue || (trend === "up" ? "+" : trend === "down" ? "-" : "")}</span>
    </motion.div>
  );
}

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
  trend,
  trendValue,
  isFirstCard = false,
  chartData = [10, 25, 15, 40, 30, 55, 45, 70, 60, 85, 75, 90],
}: StatsCardProps) {
  const router = useRouter();
  const c = colorTokens[color] || colorTokens.violet;
  const cardRef = useRef(null);
  const isInView = useInView(cardRef, { once: true, amount: 0.2 });
  const [isHovered, setIsHovered] = useState(false);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [mouseX, setMouseX] = useState(0);
  const [mouseY, setMouseY] = useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateXValue = ((y - centerY) / centerY) * -12;
    const rotateYValue = ((x - centerX) / centerX) * 12;
    setRotateX(rotateXValue);
    setRotateY(rotateYValue);
    setMouseX((x / rect.width) * 100);
    setMouseY((y / rect.height) * 100);
  };

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => {
    setIsHovered(false);
    setRotateX(0);
    setRotateY(0);
  };

  const handleClick = () => {
    router.push(href);
  };

  const showPercentage = score !== null && score !== undefined && !isJourney;

  // First card - Original design without trend and with progress bar
  if (isFirstCard) {
    return (
      <motion.div
        ref={cardRef}
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ 
          opacity: isInView ? 1 : 0, 
          y: isInView ? 0 : 40,
          scale: isInView ? 1 : 0.95
        }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        className="group cursor-pointer relative"
        style={{ perspective: '1200px' }}
      >
        <motion.div 
          className={`absolute -inset-1 rounded-2xl bg-gradient-to-r ${c.gradient} opacity-0 group-hover:opacity-30 transition-opacity duration-500 blur-2xl`}
          animate={{
            scale: isHovered ? 1.05 : 1,
            opacity: isHovered ? 0.3 : 0,
          }}
          transition={{ duration: 0.3 }}
        />

        <motion.div 
          className={`
            relative bg-white/90 backdrop-blur-sm rounded-2xl 
            border border-slate-100/50 shadow-lg
            transition-all duration-300 overflow-hidden
            ${isHovered ? 'shadow-2xl' : ''}
          `}
          style={{
            transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(${isHovered ? 20 : 0}px)`,
            transition: 'transform 0.1s ease-out',
            background: isHovered ? `linear-gradient(135deg, rgba(255,255,255,0.95), rgba(255,255,255,0.85))` : 'rgba(255,255,255,0.9)',
            borderColor: isHovered ? 'rgba(139, 92, 246, 0.3)' : 'rgba(241, 245, 249, 0.5)',
          }}
        >
          <motion.div 
            className={`absolute inset-0 bg-gradient-to-br ${c.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`}
            animate={{ opacity: isHovered ? 0.6 : 0 }}
            transition={{ duration: 0.3 }}
          />

          <motion.div 
            className="absolute inset-0 pointer-events-none rounded-2xl"
            style={{
              background: `radial-gradient(circle at ${mouseX}% ${mouseY}%, rgba(255,255,255,0.4) 0%, transparent 60%)`,
              opacity: isHovered ? 1 : 0,
              transition: 'opacity 0.3s ease',
            }}
          />

          <div className="relative p-5">
            <div className="flex items-start justify-between mb-3">
              <motion.div 
                className={`w-11 h-11 rounded-xl ${c.light} flex items-center justify-center shadow-sm`}
                animate={{
                  scale: isHovered ? 1.1 : 1,
                  rotate: isHovered ? [0, -5, 5, 0] : 0,
                }}
                transition={{ duration: 0.4 }}
                style={{
                  boxShadow: isHovered ? `0 8px 25px -5px ${c.from}40` : '0 1px 3px rgba(0,0,0,0.05)',
                }}
              >
                <Icon className={`w-5.5 h-5.5 ${c.icon}`} />
              </motion.div>
              
              {changeValue && (
                <motion.span 
                  className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-sm ${
                    changeValue.includes("+") || changeValue.includes("Career Ready")
                      ? "bg-emerald-100 text-emerald-700 border border-emerald-200/50"
                      : changeValue.includes("In Progress")
                      ? "bg-amber-100 text-amber-700 border border-amber-200/50"
                      : "bg-slate-100 text-slate-600 border border-slate-200/50"
                  }`}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  {changeValue}
                </motion.span>
              )}
            </div>

            <div className="mb-3">
              <p className="text-[10px] font-semibold text-slate-800 flex items-center gap-1.5">
                <span className="truncate">{label}</span>
                <motion.span 
                  className={`w-1 h-1 rounded-full ${c.icon} opacity-0`}
                  animate={{ opacity: isHovered ? 1 : 0 }}
                  transition={{ duration: 0.3 }}
                />
              </p>
              <p className="text-[px] text-slate-400 mt-0.5 line-clamp-1">{description}</p>
            </div>

            <div className="flex items-center justify-between">
              {showPercentage && score !== null && score !== undefined ? (
                <>
                  <div className="flex items-center gap-3">
                    <ThreeDPieChart score={score} color={{ from: c.from, to: c.to }} />
                    <div className="flex flex-col">
                      <AnimatedCounter3D value={score} suffix="%" />
                      <span className="text-[9px] text-slate-400 font-medium">Score</span>
                    </div>
                  </div>
                  <div className="w-14 h-1.5 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                    <motion.div 
                      className={`h-full bg-gradient-to-r ${c.gradient} rounded-full`}
                      initial={{ width: 0 }}
                      animate={{ width: isInView ? `${score}%` : 0 }}
                      transition={{ delay: 0.6, duration: 0.8, ease: "easeOut" }}
                      style={{ boxShadow: `0 2px 8px ${c.from}60` }}
                    />
                  </div>
                </>
              ) : isJourney && score !== null && score !== undefined ? (
                <>
                  <div className="flex items-end gap-1">
                    <AnimatedCounter3D value={score} />
                    <span className="text-[10px] text-slate-400 font-medium pb-0.5">{scoreSuffix}</span>
                  </div>
                  <div className="w-14 h-1.5 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                    <motion.div 
                      className={`h-full bg-gradient-to-r ${c.gradient} rounded-full`}
                      initial={{ width: 0 }}
                      animate={{ width: isInView ? `${Math.min(score, 100)}%` : 0 }}
                      transition={{ delay: 0.6, duration: 0.8, ease: "easeOut" }}
                      style={{ boxShadow: `0 2px 8px ${c.from}60` }}
                    />
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold text-slate-900">
                    {score !== null && score !== undefined ? score : "--"}
                  </span>
                  {scoreSuffix && (
                    <span className="text-[10px] text-slate-400 font-medium">{scoreSuffix}</span>
                  )}
                </div>
              )}
            </div>

            <motion.div 
              className={`mt-3 h-[2px] bg-gradient-to-r ${c.gradient} rounded-full`}
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: isInView ? 1 : 0, opacity: isInView ? 0.8 : 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              style={{ transformOrigin: "left", boxShadow: `0 2px 12px ${c.from}50` }}
            />
          </div>
        </motion.div>
      </motion.div>
    );
  }

  // Other cards - With Sparkline Chart
  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 40, scale: 0.95 }}
      animate={{ 
        opacity: isInView ? 1 : 0, 
        y: isInView ? 0 : 40,
        scale: isInView ? 1 : 0.95
      }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      className="group cursor-pointer relative"
      style={{ perspective: '1200px' }}
    >
      <motion.div 
        className={`absolute -inset-1 rounded-2xl bg-gradient-to-r ${c.gradient} opacity-0 group-hover:opacity-30 transition-opacity duration-500 blur-2xl`}
        animate={{
          scale: isHovered ? 1.05 : 1,
          opacity: isHovered ? 0.3 : 0,
        }}
        transition={{ duration: 0.3 }}
      />

      <motion.div 
        className={`
          relative bg-white/90 backdrop-blur-sm rounded-2xl 
          border border-slate-100/50 shadow-lg
          transition-all duration-300 overflow-hidden
          ${isHovered ? 'shadow-2xl' : ''}
        `}
        style={{
          transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(${isHovered ? 20 : 0}px)`,
          transition: 'transform 0.1s ease-out',
          background: isHovered ? `linear-gradient(135deg, rgba(255,255,255,0.95), rgba(255,255,255,0.85))` : 'rgba(255,255,255,0.9)',
          borderColor: isHovered ? 'rgba(139, 92, 246, 0.3)' : 'rgba(241, 245, 249, 0.5)',
        }}
      >
        <motion.div 
          className={`absolute inset-0 bg-gradient-to-br ${c.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`}
          animate={{ opacity: isHovered ? 0.6 : 0 }}
          transition={{ duration: 0.3 }}
        />

        <motion.div 
          className="absolute inset-0 pointer-events-none rounded-2xl"
          style={{
            background: `radial-gradient(circle at ${mouseX}% ${mouseY}%, rgba(255,255,255,0.4) 0%, transparent 60%)`,
            opacity: isHovered ? 1 : 0,
            transition: 'opacity 0.3s ease',
          }}
        />

        <div className="relative p-5">
          <div className="flex items-start justify-between mb-3">
            <motion.div 
              className={`w-11 h-11 rounded-xl ${c.light} flex items-center justify-center shadow-sm`}
              animate={{
                scale: isHovered ? 1.1 : 1,
                rotate: isHovered ? [0, -5, 5, 0] : 0,
              }}
              transition={{ duration: 0.4 }}
              style={{
                boxShadow: isHovered ? `0 8px 25px -5px ${c.from}40` : '0 1px 3px rgba(0,0,0,0.05)',
              }}
            >
              <Icon className={`w-5.5 h-5.5 ${c.icon}`} />
            </motion.div>
            
            <div className="flex items-center gap-2">
              {/* Trend Indicator */}
              {trend && (
                <TrendIndicator trend={trend} trendValue={trendValue} color={c.from} />
              )}
              
              {changeValue && (
                <motion.span 
                  className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-sm ${
                    changeValue.includes("+") || changeValue.includes("Career Ready")
                      ? "bg-emerald-100 text-emerald-700 border border-emerald-200/50"
                      : changeValue.includes("In Progress")
                      ? "bg-amber-100 text-amber-700 border border-amber-200/50"
                      : "bg-slate-100 text-slate-600 border border-slate-200/50"
                  }`}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  {changeValue}
                </motion.span>
              )}
            </div>
          </div>

          <div className="mb-2">
            <p className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
              <span className="truncate">{label}</span>
              <motion.span 
                className={`w-1 h-1 rounded-full ${c.icon} opacity-0`}
                animate={{ opacity: isHovered ? 1 : 0 }}
                transition={{ duration: 0.3 }}
              />
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">{description}</p>
          </div>

          <div className="flex items-center justify-between">
            {showPercentage && score !== null && score !== undefined ? (
              <>
                <div className="flex items-center gap-3">
                  <ThreeDPieChart score={score} color={{ from: c.from, to: c.to }} />
                  <div className="flex flex-col">
                    <AnimatedCounter3D value={score} suffix="%" />
                    <span className="text-[9px] text-slate-400 font-medium">Score</span>
                  </div>
                </div>
              </>
            ) : isJourney && score !== null && score !== undefined ? (
              <>
                <div className="flex items-end gap-1">
                  <AnimatedCounter3D value={score} />
                  <span className="text-[10px] text-slate-400 font-medium pb-0.5">{scoreSuffix}</span>
                </div>
                <Sparkline 
                  data={chartData} 
                  color={c.chartColor}
                  trend={trend}
                />
              </>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold text-slate-900">
                  {score !== null && score !== undefined ? score : "--"}
                </span>
                {scoreSuffix && (
                  <span className="text-[10px] text-slate-400 font-medium">{scoreSuffix}</span>
                )}
              </div>
            )}
          </div>

          <motion.div 
            className={`mt-3 h-[2px] bg-gradient-to-r ${c.gradient} rounded-full`}
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: isInView ? 1 : 0, opacity: isInView ? 0.8 : 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            style={{ transformOrigin: "left", boxShadow: `0 2px 12px ${c.from}50` }}
          />
        </div>
      </motion.div>
    </motion.div>
  );
}