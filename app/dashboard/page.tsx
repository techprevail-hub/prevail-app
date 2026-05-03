// app/dashboard/page.tsx
"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import DashboardNavbar from "@/components/layout/navbar";

// Mini sparkline path helper
function sparkPath(vals: number[], w: number, h: number) {
  const max = Math.max(...vals), min = Math.min(...vals);
  const range = max - min || 1;
  const pts = vals.map((v, i) => [
    (i / (vals.length - 1)) * w,
    h - ((v - min) / range) * h * 0.8 - h * 0.1,
  ]);
  return pts.map((p, i) => `${i === 0 ? "M" : "L"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");
}

const chartData = [42, 48, 45, 55, 52, 60, 58, 65, 70, 68, 75, 80];
const months = ["JAN", "MAR", "MAY", "JUL", "SEP", "NOV"];

const topStudents = [
  { name: "Aryan Mehta",      dept: "Computer Science", score: 98, trend: "+4%" },
  { name: "Priya Sharma",     dept: "Data Engineering",  score: 95, trend: "+6%" },
  { name: "Rohan Verma",      dept: "Business Analytics",score: 92, trend: "+2%" },
  { name: "Sneha Patel",      dept: "Finance",           score: 90, trend: "+8%" },
];

export default function DashboardPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [chartPeriod, setChartPeriod] = useState<"6m" | "1y">("1y");

  useEffect(() => {
    const getUser = async () => {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      if (!supabaseUrl || !supabaseKey) {
        console.error("Missing Supabase env variables");
        router.push("/login");
        return;
      }

      const supabase = createClient(supabaseUrl, supabaseKey);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { 
        router.push("/login"); 
        return; 
      }

      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      setProfile(data);
    };
    getUser();
  }, [router]);

  const w = 460, h = 140;
  const path = sparkPath(chartData, w, h);
  const areaPath = `${path} L${w},${h} L0,${h} Z`;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800;900&family=Inter:wght@400;500;600&display=swap');

        .db-wrap {
          font-family: 'Inter', system-ui, sans-serif;
          min-height: 100%;
          display: flex;
          flex-direction: column;
          gap: 0;
        }

        /* ── STAT CARDS ── */
        .db-stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
          margin-bottom: 20px;
        }
        .db-stat-card {
          background: #fff;
          border-radius: 16px;
          padding: 20px 22px;
          border: 1px solid #EBEBF5;
          display: flex;
          flex-direction: column;
          gap: 6px;
          position: relative;
          overflow: hidden;
        }
        .db-stat-tag {
          font-size: 9.5px;
          font-weight: 700;
          letter-spacing: .1em;
          color: #9595BB;
          text-transform: uppercase;
        }
        .db-stat-val {
          font-family: 'Outfit', system-ui, sans-serif;
          font-size: 36px;
          font-weight: 900;
          color: #5B5BD6;
          line-height: 1;
          letter-spacing: -.03em;
          margin: 2px 0;
        }
        .db-stat-sub {
          font-size: 11px;
          color: #5B5BD6;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .db-stat-sub.green { color: #16a34a; }
        .db-stat-sub.amber { color: #d97706; }
        .db-stat-icon {
          position: absolute;
          top: 18px; right: 18px;
          color: #E8E8F8;
        }

        /* ── BOTTOM GRID ── */
        .db-grid {
          display: grid;
          grid-template-columns: 1fr 280px;
          gap: 16px;
          margin-bottom: 20px;
        }

        /* Chart card */
        .db-chart-card {
          background: #fff;
          border-radius: 16px;
          border: 1px solid #EBEBF5;
          padding: 22px 24px 16px;
        }
        .db-chart-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 6px;
        }
        .db-chart-title {
          font-family: 'Outfit', system-ui, sans-serif;
          font-size: 17px;
          font-weight: 800;
          color: #0D0D2B;
          letter-spacing: -.02em;
          margin: 0 0 4px;
        }
        .db-chart-desc { font-size: 12px; color: #9595BB; margin: 0; }
        .db-period-toggle {
          display: flex;
          background: #F4F4FC;
          border-radius: 10px;
          padding: 3px;
          gap: 2px;
        }
        .db-period-btn {
          padding: 5px 12px;
          border-radius: 8px;
          font-size: 11.5px;
          font-weight: 600;
          border: none;
          cursor: pointer;
          font-family: 'Inter', system-ui, sans-serif;
          background: transparent;
          color: #9595BB;
          transition: background .15s, color .15s;
        }
        .db-period-btn.active {
          background: #5B5BD6;
          color: #fff;
          box-shadow: 0 2px 8px rgba(91,91,214,.25);
        }
        .db-chart-svg { width: 100%; overflow: visible; display: block; margin-top: 12px; }
        .db-chart-months {
          display: flex;
          justify-content: space-between;
          margin-top: 8px;
          padding: 0 2px;
        }
        .db-chart-month { font-size: 10px; color: #ABABCC; font-weight: 600; letter-spacing: .06em; }

        /* Insights card */
        .db-insights-card {
          background: #fff;
          border-radius: 16px;
          border: 1px solid #EBEBF5;
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 0;
        }
        .db-insights-title {
          font-family: 'Outfit', system-ui, sans-serif;
          font-size: 16px;
          font-weight: 800;
          color: #0D0D2B;
          letter-spacing: -.02em;
          margin: 0 0 14px;
        }
        .db-insight-item {
          display: flex;
          gap: 12px;
          padding: 11px 0;
          border-bottom: 1px solid #F4F4FC;
        }
        .db-insight-item:last-of-type { border-bottom: none; }
        .db-insight-dot {
          width: 32px; height: 32px;
          border-radius: 9px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          margin-top: 1px;
        }
        .db-insight-dot.blue { background: rgba(91,91,214,.1); color: #5B5BD6; }
        .db-insight-dot.amber { background: rgba(217,119,6,.1); color: #d97706; }
        .db-insight-label {
          font-size: 12.5px;
          font-weight: 700;
          color: #0D0D2B;
          margin: 0 0 2px;
          font-family: 'Inter', system-ui, sans-serif;
        }
        .db-insight-desc { font-size: 11px; color: #9595BB; margin: 0; line-height: 1.5; }

        /* Workshop banner */
        .db-workshop {
          margin-top: 14px;
          border-radius: 12px;
          overflow: hidden;
          position: relative;
          height: 80px;
          background: linear-gradient(135deg, #2a2a96 0%, #5B5BD6 100%);
          display: flex;
          align-items: flex-end;
          padding: 12px 14px;
        }
        .db-workshop-tag {
          font-size: 8.5px;
          font-weight: 800;
          letter-spacing: .12em;
          color: rgba(255,255,255,.65);
          text-transform: uppercase;
          display: block;
          margin-bottom: 3px;
          font-family: 'Inter', system-ui, sans-serif;
        }
        .db-workshop-title {
          font-family: 'Outfit', system-ui, sans-serif;
          font-size: 14px;
          font-weight: 800;
          color: #fff;
          margin: 0;
          letter-spacing: -.01em;
        }

        /* ── TOP STUDENTS ── */
        .db-students-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-bottom: 14px;
        }
        .db-students-title {
          font-family: 'Outfit', system-ui, sans-serif;
          font-size: 18px;
          font-weight: 800;
          color: #0D0D2B;
          letter-spacing: -.02em;
          margin: 0 0 3px;
        }
        .db-students-sub { font-size: 12px; color: #9595BB; margin: 0; }
        .db-view-all {
          font-size: 12.5px;
          font-weight: 600;
          color: #5B5BD6;
          text-decoration: none;
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .db-view-all:hover { text-decoration: underline; }

        .db-students-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 14px;
        }
        .db-student-card {
          background: #fff;
          border-radius: 14px;
          border: 1px solid #EBEBF5;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          transition: box-shadow .15s, transform .15s;
        }
        .db-student-card:hover {
          box-shadow: 0 6px 20px rgba(91,91,214,.1);
          transform: translateY(-1px);
        }
        .db-student-avatar {
          width: 40px; height: 40px;
          border-radius: 12px;
          background: linear-gradient(135deg, #5B5BD6, #7040c0);
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Outfit', system-ui, sans-serif;
          font-size: 15px;
          font-weight: 800;
          color: #fff;
        }
        .db-student-name {
          font-size: 13.5px;
          font-weight: 700;
          color: #0D0D2B;
          margin: 0 0 2px;
          font-family: 'Inter', system-ui, sans-serif;
        }
        .db-student-dept { font-size: 11px; color: #9595BB; margin: 0; }
        .db-student-score-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .db-student-score {
          font-family: 'Outfit', system-ui, sans-serif;
          font-size: 22px;
          font-weight: 900;
          color: #5B5BD6;
          letter-spacing: -.03em;
        }
        .db-student-trend {
          font-size: 11px;
          font-weight: 600;
          color: #16a34a;
          background: rgba(22,163,74,.08);
          padding: 3px 8px;
          border-radius: 100px;
        }
        .db-student-bar-bg {
          height: 4px;
          background: #F0F0FF;
          border-radius: 10px;
          overflow: hidden;
        }
        .db-student-bar {
          height: 100%;
          background: linear-gradient(90deg, #5B5BD6, #7040c0);
          border-radius: 10px;
        }

        @media (max-width: 900px) {
          .db-stats { grid-template-columns: repeat(3,1fr); }
          .db-grid { grid-template-columns: 1fr; }
          .db-students-grid { grid-template-columns: repeat(2,1fr); }
        }
      `}</style>

      <div className="db-wrap">
        <DashboardNavbar
          title="Institute Dashboard"
          subtitle="Campus-wide Career Readiness Overview"
        />

        <div className="dash-content">

          {/* Stat cards */}
          <div className="db-stats">
            <div className="db-stat-card">
              <span className="db-stat-tag">Total Students</span>
              <span className="db-stat-val">1,200</span>
              <span className="db-stat-sub green">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="18 15 12 9 6 15"/></svg>
                +4% from last semester
              </span>
              <span className="db-stat-icon">
                <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
              </span>
            </div>

            <div className="db-stat-card">
              <span className="db-stat-tag">Avg Resume Score</span>
              <span className="db-stat-val">78%</span>
              <span className="db-stat-sub amber">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="18 15 12 9 6 15"/></svg>
                Top 10% Tier AI Validation
              </span>
              <span className="db-stat-icon">
                <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
                </svg>
              </span>
            </div>

            <div className="db-stat-card">
              <span className="db-stat-tag">Placement Readiness</span>
              <span className="db-stat-val">65%</span>
              <span className="db-stat-sub" style={{ color: "#5B5BD6" }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
                780 Students Industry-Ready
              </span>
              <span className="db-stat-icon">
                <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                </svg>
              </span>
            </div>
          </div>

          {/* Chart + Insights */}
          <div className="db-grid">
            {/* Chart */}
            <div className="db-chart-card">
              <div className="db-chart-header">
                <div>
                  <h3 className="db-chart-title">Student Performance Growth</h3>
                  <p className="db-chart-desc">Aggregate readiness score across all departments.</p>
                </div>
                <div className="db-period-toggle">
                  <button
                    className={`db-period-btn${chartPeriod === "6m" ? " active" : ""}`}
                    onClick={() => setChartPeriod("6m")}
                  >6 Months</button>
                  <button
                    className={`db-period-btn${chartPeriod === "1y" ? " active" : ""}`}
                    onClick={() => setChartPeriod("1y")}
                  >1 Year</button>
                </div>
              </div>

              <svg viewBox={`0 0 ${w} ${h}`} className="db-chart-svg" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#5B5BD6" stopOpacity="0.18"/>
                    <stop offset="100%" stopColor="#5B5BD6" stopOpacity="0"/>
                  </linearGradient>
                </defs>
                <path d={areaPath} fill="url(#chartGrad)" />
                <path d={path} fill="none" stroke="#5B5BD6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>

              <div className="db-chart-months">
                {months.map((m) => <span key={m} className="db-chart-month">{m}</span>)}
              </div>
            </div>

            {/* Insights */}
            <div className="db-insights-card">
              <h3 className="db-insights-title">Quick Insights</h3>

              <div className="db-insight-item">
                <div className="db-insight-dot blue">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
                </div>
                <div>
                  <p className="db-insight-label">Resume Momentum</p>
                  <p className="db-insight-desc">Computer Science students improved score by 12% this month.</p>
                </div>
              </div>

              <div className="db-insight-item">
                <div className="db-insight-dot amber">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                </div>
                <div>
                  <p className="db-insight-label">Preparation Gap</p>
                  <p className="db-insight-desc">Soft skills training needed for Finance department cohorts.</p>
                </div>
              </div>

              <div className="db-workshop">
                <div>
                  <span className="db-workshop-tag">Next Workshop</span>
                  <h4 className="db-workshop-title">AI Mock Interviews • Dec 14</h4>
                </div>
              </div>
            </div>
          </div>

          {/* Top Students */}
          <div>
            <div className="db-students-header">
              <div>
                <h3 className="db-students-title">Top-performing Students</h3>
                <p className="db-students-sub">Recognizing excellence in placement readiness.</p>
              </div>
              <a href="#" className="db-view-all">
                View All Students
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
              </a>
            </div>

            <div className="db-students-grid">
              {topStudents.map((s) => (
                <div key={s.name} className="db-student-card">
                  <div className="db-student-avatar">
                    {s.name.split(" ").map((n) => n[0]).join("")}
                  </div>
                  <div>
                    <p className="db-student-name">{s.name}</p>
                    <p className="db-student-dept">{s.dept}</p>
                  </div>
                  <div className="db-student-score-row">
                    <span className="db-student-score">{s.score}</span>
                    <span className="db-student-trend">{s.trend}</span>
                  </div>
                  <div className="db-student-bar-bg">
                    <div className="db-student-bar" style={{ width: `${s.score}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>{/* /dash-content */}
      </div>
    </>
  );
}