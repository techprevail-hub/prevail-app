"use client";

import { useState, useEffect, useRef } from "react";
import { Sparkles } from "lucide-react";

interface UserData { name: string; role: string; email: string; }

// ─── GET GREETING ───────────────────────────────────────────────────────────────
function getTimeBasedGreeting(): string {
  return "AI Intelligence";
}

// ─── ENHANCED GRAPH LINE WITH TOOLTIP ─────────────────────────────────────
function EnhancedGraphLine({ score }: { score: number }) {
  const [animated, setAnimated] = useState(false);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; value: number; index: number } | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  
  useEffect(() => { 
    const t = setTimeout(() => setAnimated(true), 400); 
    return () => clearTimeout(t); 
  }, []);

  // ✅ Use the actual score, don't default to 50
  // If score is 0, show 0 in the graph
  const finalScore = Math.min(Math.max(score, 0), 100);

  // Generate trending data points that naturally increase from bottom to top
  const generateTrendingData = (finalScore: number) => {
    const points = 10;
    const data = [];
    
    // Start from 0
    data.push(0);
    
    // Generate intermediate points with natural progression
    for (let i = 1; i < points - 1; i++) {
      const progress = i / (points - 1);
      // Use exponential curve for natural growth (starts slow, accelerates)
      const baseValue = Math.pow(progress, 1.5) * finalScore;
      
      // Add some natural variation but keep the trending upward
      const variation = (Math.random() - 0.3) * 8;
      let value = Math.min(Math.max(baseValue + variation, 0), 100);
      
      // Ensure the trend is consistently upward
      if (i > 1 && value < data[i - 1]) {
        value = data[i - 1] + Math.random() * 3 + 1;
      }
      
      data.push(Math.round(value));
    }
    
    // Add final score
    data.push(finalScore);
    
    return data;
  };

  const raw = generateTrendingData(finalScore);
  
  const smoothed = raw.map((v, i, arr) => {
    if (i === 0 || i === arr.length - 1) return v;
    const smoothed = (arr[i-1] + v + arr[i+1]) / 3;
    return Math.round(smoothed);
  });

  // Increased padding on the right side to keep distance from percentage markers
  const w = 1200, h = 180, pad = 35;
  const rightPadding = 85; // Extra padding on the right to keep distance from markers
  
  // Use fixed 0-100 scale
  const min = 0;
  const max = 100;
  const range = 100;

  const pts = smoothed.map((v, i) => ({
    x: pad + (i / (smoothed.length - 1)) * (w - pad - rightPadding),
    y: pad + (1 - (Math.min(v, 100) - min) / range) * (h - pad * 2),
    value: v,
    index: i
  }));

  let linePath = "";
  for (let i = 0; i < pts.length; i++) {
    if (i === 0) {
      linePath = `M ${pts[i].x} ${pts[i].y}`;
    } else {
      const prev = pts[i - 1];
      const cp1x = (prev.x + pts[i].x) / 2;
      linePath += ` C ${cp1x} ${prev.y} ${cp1x} ${pts[i].y} ${pts[i].x} ${pts[i].y}`;
    }
  }

  const areaPath = `${linePath} L ${pts[pts.length-1].x} ${h - pad} L ${pad} ${h - pad} Z`;

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current) return;
    
    const rect = svgRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const svgX = (x / rect.width) * w;
    
    let closest = pts[0];
    let minDist = Infinity;
    
    for (const p of pts) {
      const dist = Math.abs(p.x - svgX);
      if (dist < minDist) {
        minDist = dist;
        closest = p;
      }
    }
    
    if (minDist < 80) {
      setTooltip({
        x: closest.x,
        y: closest.y,
        value: Math.round(closest.value),
        index: closest.index
      });
    } else {
      setTooltip(null);
    }
  };

  const handleMouseLeave = () => {
    setTooltip(null);
  };

  // Get milestone messages based on score
  const getMilestoneMessage = (currentScore: number) => {
    if (currentScore >= 100) return "🎉 You've reached 100%! Excellent work!";
    if (currentScore >= 80) return "⭐ Amazing progress! Just a bit more to go!";
    if (currentScore >= 60) return "💪 You're doing great! Keep pushing forward!";
    if (currentScore >= 40) return "📈 Good start! More effort needed to reach the top!";
    if (currentScore >= 20) return "🌱 You're on the right track! Keep building!";
    if (currentScore > 0) return "🚀 Start your journey to 100%!";
    return "📊 Begin by completing your profile milestones";
  };

  const milestoneMessage = getMilestoneMessage(finalScore);

  // Determine if the score is 0 (new user)
  const isZeroScore = finalScore === 0;

  return (
    <div className="relative w-full h-full">
      <svg 
        ref={svgRef}
        viewBox={`0 0 ${w} ${h}`} 
        preserveAspectRatio="none"
        className="w-full h-full cursor-crosshair"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <defs>
          <linearGradient id="enhancedLineGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#a78bfa" />
            <stop offset="50%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#7c3aed" />
          </linearGradient>
          <linearGradient id="enhancedAreaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.45" />
            <stop offset="40%" stopColor="#7c3aed" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#6d28d9" stopOpacity="0.08" />
          </linearGradient>
          <linearGradient id="trendLineGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#7c3aed" stopOpacity="0.1" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="tooltipGlow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="pointGlow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Right side percentage markers - positioned further right */}
        <g>
          {/* 100% marker - Top */}
          <line
            x1={w - 70}
            y1={pad}
            x2={w - 25}
            y2={pad}
            stroke="#22c55e"
            strokeWidth="2"
            strokeDasharray="4 4"
            opacity={isZeroScore ? "0.3" : "0.6"}
          />
          <text 
            x={w - 20} 
            y={pad + 4} 
            fontSize="9" 
            fill="#22c55e" 
            fontWeight="600" 
            fontFamily="system-ui"
            textAnchor="start"
            opacity={isZeroScore ? "0.4" : "1"}
          >
            100%
          </text>
          
          {/* 75% marker */}
          <line
            x1={w - 70}
            y1={pad + (1 - 0.75) * (h - pad * 2)}
            x2={w - 25}
            y2={pad + (1 - 0.75) * (h - pad * 2)}
            stroke="#8b5cf6"
            strokeWidth="1.5"
            strokeDasharray="3 3"
            opacity={isZeroScore ? "0.2" : "0.4"}
          />
          <text 
            x={w - 20} 
            y={pad + (1 - 0.75) * (h - pad * 2) + 4} 
            fontSize="9" 
            fill="#8b5cf6" 
            fontWeight="500" 
            fontFamily="system-ui"
            textAnchor="start"
            opacity={isZeroScore ? "0.3" : "1"}
          >
            75%
          </text>
          
          {/* 50% marker */}
          <line
            x1={w - 70}
            y1={pad + (1 - 0.5) * (h - pad * 2)}
            x2={w - 25}
            y2={pad + (1 - 0.5) * (h - pad * 2)}
            stroke="#f59e0b"
            strokeWidth="1.5"
            strokeDasharray="3 3"
            opacity={isZeroScore ? "0.2" : "0.4"}
          />
          <text 
            x={w - 20} 
            y={pad + (1 - 0.5) * (h - pad * 2) + 4} 
            fontSize="9" 
            fill="#f59e0b" 
            fontWeight="500" 
            fontFamily="system-ui"
            textAnchor="start"
            opacity={isZeroScore ? "0.3" : "1"}
          >
            50%
          </text>
          
          {/* 25% marker */}
          <line
            x1={w - 70}
            y1={pad + (1 - 0.25) * (h - pad * 2)}
            x2={w - 25}
            y2={pad + (1 - 0.25) * (h - pad * 2)}
            stroke="#ef4444"
            strokeWidth="1.5"
            strokeDasharray="3 3"
            opacity={isZeroScore ? "0.2" : "0.4"}
          />
          <text 
            x={w - 20} 
            y={pad + (1 - 0.25) * (h - pad * 2) + 4} 
            fontSize="9" 
            fill="#ef4444" 
            fontWeight="500" 
            fontFamily="system-ui"
            textAnchor="start"
            opacity={isZeroScore ? "0.3" : "1"}
          >
            25%
          </text>
          
          {/* 0% marker - Bottom */}
          <line
            x1={w - 70}
            y1={h - pad}
            x2={w - 25}
            y2={h - pad}
            stroke="#94a3b8"
            strokeWidth="2"
            strokeDasharray="4 4"
            opacity="0.6"
          />
          <text 
            x={w - 20} 
            y={h - pad + 4} 
            fontSize="9" 
            fill="#94a3b8" 
            fontWeight="600" 
            fontFamily="system-ui"
            textAnchor="start"
          >
            0%
          </text>
        </g>

        {/* Animated Grid Background - stops before percentage markers */}
        {Array.from({ length: 6 }).map((_, i) => {
          const yPos = pad + (i / 5) * (h - pad * 2);
          return (
            <line
              key={`h-${i}`}
              x1={pad}
              y1={yPos}
              x2={w - 80}
              y2={yPos}
              stroke="rgba(124,58,237,0.08)"
              strokeWidth="1"
              opacity={i === 0 || i === 5 ? 0.08 : 0.12}
            />
          );
        })}

        {/* Vertical separator line to show the graph area boundary */}
        <line
          x1={w - 80}
          y1={pad}
          x2={w - 80}
          y2={h - pad}
          stroke="rgba(124,58,237,0.1)"
          strokeWidth="1"
          strokeDasharray="4 4"
          opacity="0.3"
        />

        {/* Trending line indicator - only show if score > 0 */}
        {!isZeroScore && (
          <g opacity="0.3">
            <line
              x1={pad}
              y1={h - pad}
              x2={w - 82}
              y2={pad}
              stroke="url(#trendLineGrad)"
              strokeWidth="1"
              strokeDasharray="8 6"
              strokeLinecap="round"
            />
            <polygon
              points={`${w - 82 - 2},${pad + 6} ${w - 82 + 6},${pad} ${w - 82 - 2},${pad - 6}`}
              fill="#7c3aed"
              opacity="0.4"
            />
          </g>
        )}

        {/* Area under curve */}
        <path d={areaPath} fill="url(#enhancedAreaGrad)" />
        
        {/* Main curve line */}
        <path
          d={linePath}
          fill="none"
          stroke={isZeroScore ? "#94a3b8" : "url(#enhancedLineGrad)"}
          strokeWidth={isZeroScore ? "2" : "3.5"}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={2000}
          strokeDashoffset={animated ? 0 : 2000}
          style={{ transition: "stroke-dashoffset 2s cubic-bezier(0.34,1.56,0.64,1)" }}
          filter={isZeroScore ? "none" : "url(#glow)"}
          opacity={isZeroScore ? "0.4" : "1"}
        />
        
        {/* Data points */}
        {pts.map((p, i) => {
          const isLast = i === pts.length - 1;
          const isMid = i > 2 && i < pts.length - 2;
          const isFirst = i === 0;
          
          // If score is 0, show minimal dots
          if (isZeroScore) {
            return (
              <g key={i}>
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={isLast ? 4 : isFirst ? 3 : 2.5}
                  fill={isLast ? "#94a3b8" : "#cbd5e1"}
                  opacity={animated ? (isLast ? 0.6 : 0.3) : 0}
                  style={{
                    transition: `all 0.4s ease ${0.8 + i * 0.05}s`,
                    transform: animated ? "scale(1)" : "scale(0)"
                  }}
                />
              </g>
            );
          }
          
          return (
            <g key={i}>
              {isLast && animated && (
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={14}
                  fill="none"
                  stroke="rgba(124,58,237,0.3)"
                  strokeWidth="2"
                  opacity={animated ? 1 : 0}
                  style={{
                    animation: "pulse-ring 2s ease-out infinite",
                    transformOrigin: `${p.x} ${p.y}`
                  }}
                />
              )}
              
              <circle
                cx={p.x}
                cy={p.y}
                r={isLast ? 7 : isMid ? 4.5 : isFirst ? 3.5 : 3}
                fill={isLast ? "#7c3aed" : isFirst ? "#94a3b8" : "#a78bfa"}
                opacity={animated ? 1 : 0}
                style={{
                  transition: `all 0.4s ease ${0.8 + i * 0.05}s`,
                  transform: animated ? "scale(1)" : "scale(0)",
                  filter: isLast ? "drop-shadow(0 0 6px rgba(124,58,237,0.6))" : "none"
                }}
                filter={isLast ? "url(#pointGlow)" : undefined}
              />
            </g>
          );
        })}
        
        {/* Tooltip */}
        {tooltip && !isZeroScore && (
          <g>
            <line
              x1={tooltip.x}
              y1={tooltip.y - 10}
              x2={tooltip.x}
              y2={h - pad}
              stroke="rgba(124,58,237,0.25)"
              strokeWidth="1.5"
              strokeDasharray="6 4"
              opacity="0.6"
            />
            
            <circle
              cx={tooltip.x}
              cy={tooltip.y}
              r="10"
              fill="none"
              stroke="#7c3aed"
              strokeWidth="2"
              opacity="0.7"
              filter="url(#tooltipGlow)"
            />
            
            <circle
              cx={tooltip.x}
              cy={tooltip.y}
              r="5"
              fill="#7c3aed"
              opacity="1"
            />
            
            <foreignObject
              x={tooltip.x - 35}
              y={tooltip.y - 48}
              width="70"
              height="30"
              style={{ overflow: 'visible' }}
            >
              <div className="bg-white/95 backdrop-blur-md px-2.5 py-1.5 rounded-lg shadow-xl border border-violet-200/80 text-center">
                <span className="text-xs font-bold text-violet-700">{tooltip.value}%</span>
              </div>
            </foreignObject>
          </g>
        )}
        
        {/* Score label */}
        {animated && (
          <g>
            <text 
              x={pts[pts.length-1].x + 14} 
              y={pts[pts.length-1].y + 4}
              fontSize="14" 
              fontWeight="900" 
              fill={isZeroScore ? "#94a3b8" : "#7c3aed"}
              style={{ 
                fontFamily: "Plus Jakarta Sans, sans-serif",
                textShadow: isZeroScore ? "none" : "0 4px 12px rgba(124,58,237,0.3)"
              }}
            >
              {Math.round(pts[pts.length-1].value)}%
            </text>
          </g>
        )}
      </svg>

      {/* Milestone message displayed below the graph */}
      <div className="absolute bottom-0 left-0 right-0 flex justify-center">
        <div className={`bg-gradient-to-r ${isZeroScore ? 'from-slate-50 to-slate-100' : 'from-amber-50 to-violet-50'} border ${isZeroScore ? 'border-slate-200/50' : 'border-amber-200/50'} rounded-full px-4 py-1.5 shadow-sm`}>
          <p className={`text-xs font-medium flex items-center gap-2 ${isZeroScore ? 'text-slate-500' : 'text-slate-700'}`}>
            <span className={isZeroScore ? 'text-slate-400' : 'text-amber-500'}>✦</span>
            {milestoneMessage}
            <span className={isZeroScore ? 'text-slate-400' : 'text-amber-500'}>✦</span>
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── HERO SECTION COMPONENT ──────────────────────────────────────────────────
export default function HeroSection({ user, score }: { user: UserData | null; score: number }) {
  const firstName = user?.name?.split(" ")[0] ?? "There";
  const greeting = getTimeBasedGreeting();
  
  // ─── SCROLL ANIMATION STATE ──────────────────────────────────────────────
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          setIsAnimating(true);
          // Reset animation state after animation completes
          setTimeout(() => {
            setIsAnimating(false);
          }, 1200);
        } else {
          setIsVisible(false);
          setIsAnimating(false);
        }
      },
      { 
        threshold: 0.15,
        rootMargin: "-30px 0px -30px 0px"
      }
    );

    const currentRef = sectionRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, []);

  return (
    <div 
      ref={sectionRef}
      className="relative rounded-3xl overflow-hidden shadow-2xl min-h-[240px] lg:min-h-[260px] w-full"
      style={{
        perspective: '1200px',
        transformStyle: 'preserve-3d'
      }}
    >
      {/* Background Layers */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-violet-50/40 to-slate-50" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(124,58,237,0.15),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(167,131,250,0.12),transparent_60%)]" />
      
      {/* Animated Elements */}
      <div className="pointer-events-none absolute -top-20 -right-20 w-96 h-96 rounded-full bg-violet-300/20 blur-3xl animate-pulse" />
      <div className="pointer-events-none absolute -bottom-10 -left-10 w-80 h-80 rounded-full bg-indigo-300/15 blur-3xl" style={{ animation: "float 8s ease-in-out infinite" }} />
      
      {/* Glassmorphism Border Effect */}
      <div className="absolute inset-0 rounded-3xl pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-400/50 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-300/30 to-transparent" />
      </div>

      {/* 3D Split Effect - Diagonal line that separates and rejoins */}
      <div 
        className={`absolute inset-0 pointer-events-none transition-all duration-1000 ease-in-out ${
          isAnimating ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          background: 'linear-gradient(135deg, transparent 49.5%, rgba(124,58,237,0.3) 49.5%, rgba(124,58,237,0.3) 50.5%, transparent 50.5%)',
          backgroundSize: '200% 200%',
          transform: isAnimating ? 'scaleX(1)' : 'scaleX(0)',
          transformOrigin: 'center center',
          transition: 'all 1s cubic-bezier(0.34, 1.56, 0.64, 1)'
        }}
      />

      {/* Main Content */}
      <div className="relative w-full h-full p-4 sm:p-6 lg:p-8">
        <div className="w-full h-full grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-6 lg:gap-8">
          
          {/* ─── LEFT SECTION (30%) ─────────────────────────────────────────── */}
          <div 
            className={`flex flex-col justify-between transition-all duration-1000 ease-out ${
              isVisible ? 'opacity-100 translate-x-0 rotate-y-0' : 'opacity-0 -translate-x-16 rotate-y-12'
            }`}
            style={{
              transformStyle: 'preserve-3d',
              transformOrigin: 'left center',
              transition: 'all 1s cubic-bezier(0.34, 1.56, 0.64, 1)'
            }}
          >
            {/* Text Content */}
            <div className="space-y-4">
              {/* Greeting Badge */}
              <div className="inline-flex items-center gap-2 w-fit bg-gradient-to-r from-violet-100/80 to-indigo-100/80 backdrop-blur-sm px-3 py-1.5 rounded-full border border-violet-200/50">
                <div className="w-2 h-2 rounded-full bg-gradient-to-r from-violet-500 to-indigo-500 animate-pulse" />
                <span className="text-xs font-semibold text-slate-700 tracking-wide">
                  {greeting}
                </span>
                <Sparkles className="w-3 h-3 text-violet-500" />
              </div>

              {/* Main Heading - Clean modern style with darker colors */}
              <div className="space-y-0">
                {/* First Line - "Welcome" - Darker gradient */}
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
                  <span className="bg-gradient-to-r from-violet-700 via-purple-700 to-indigo-700 bg-clip-text text-transparent">
                    Welcome
                  </span>
                </h1>

                {/* Second Line - "back," - Darker gradient */}
                <div className="flex items-end gap-2">
                  <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
                    <span className="bg-gradient-to-r from-violet-700 via-purple-700 to-indigo-700 bg-clip-text text-transparent">
                      back,
                    </span>
                  </h1>

                  {/* First Name - Darker orange with more pop */}
                  <span className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-orange-600 mb-1 drop-shadow-sm">
                    {firstName}
                  </span>
                </div>
              </div>
              
              {/* Description - Removed the line/divider */}
              <p className="text-sm text-slate-500 leading-relaxed">
                Track your career growth with AI-powered insights
              </p>
            </div>
          </div>

          {/* ─── RIGHT SECTION (70%) ────────────────────────────────────────── */}
          <div 
            className={`relative h-[240px] sm:h-[220px] lg:h-[240px] -m-4 sm:-m-6 lg:-m-8 transition-all duration-1000 ease-out ${
              isVisible ? 'opacity-100 translate-x-0 rotate-y-0' : 'opacity-0 translate-x-16 -rotate-y-12'
            }`}
            style={{
              transformStyle: 'preserve-3d',
              transformOrigin: 'right center',
              transition: 'all 1s cubic-bezier(0.34, 1.56, 0.64, 1)'
            }}
          >
            {/* Graph Container */}
            <div className="relative w-full h-full flex items-center justify-center p-4 sm:p-6">
              <div className="w-full h-full">
                <EnhancedGraphLine score={score} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3D Shadow Effect - enhances the split illusion */}
      <div 
        className={`absolute inset-0 pointer-events-none transition-all duration-1000 ease-in-out ${
          isAnimating ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          boxShadow: isAnimating 
            ? 'inset 0 0 40px rgba(124,58,237,0.15), 0 0 60px rgba(124,58,237,0.1)' 
            : 'inset 0 0 0px rgba(124,58,237,0)',
          transition: 'all 1s cubic-bezier(0.34, 1.56, 0.64, 1)'
        }}
      />

      {/* Global Animations */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-12px); }
        }
        @keyframes shimmer {
          0%   { transform: translateX(-100%); opacity: 0; }
          40%  { opacity: 1; }
          100% { transform: translateX(200%); opacity: 0; }
        }
        @keyframes pulse-ring {
          0% {
            r: 14px;
            opacity: 0.8;
          }
          100% {
            r: 28px;
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}