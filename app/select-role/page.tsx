"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

const roles = [
  {
    key: "student",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="28" height="28">
        <path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c3 3 9 3 12 0v-5" />
      </svg>
    ),
    title: "Student",
    desc: "Elevate your learning path with AI-driven career forecasting and skill mapping.",
  },
  {
    key: "job_seeker",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="28" height="28">
        <rect x="2" y="7" width="20" height="14" rx="2" />
        <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
      </svg>
    ),
    title: "Job Seeker",
    desc: "Optimize your profile for the digital oracle and match with high-impact opportunities.",
    featured: true,
  },
  {
    key: "coach",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="28" height="28">
        <circle cx="10" cy="8" r="4" /><path d="M2 20c0-4 3.6-7 8-7s8 3 8 7" /><path d="M17 13l2 2 4-4" />
      </svg>
    ),
    title: "Career Coach",
    desc: "Scale your impact with intelligent insights and automated client progress tracking.",
  },
  {
    key: "institute",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="28" height="28">
        <path d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M20 10v11M8 14v3M12 14v3M16 14v3" />
      </svg>
    ),
    title: "Institute",
    desc: "Future-proof your curriculum with industry-aligned intelligence and cohort analytics.",
  },
];

export default function SelectRole() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      try {
        // Get userId from localStorage
        let storedUserId = localStorage.getItem("userId");
        
        if (storedUserId) {
          setUserId(storedUserId);
          
          // Check if user already has a role
          const { data: user, error: userError } = await supabase
            .from("users")
            .select("role")
            .eq("id", storedUserId)
            .maybeSingle();
          
          if (userError) {
            console.error("Error fetching user:", userError);
          }
          
          // If user already has a role, redirect to dashboard
          if (user?.role) {
            console.log("User already has role:", user.role);
            localStorage.setItem("userRole", user.role);
            
            if (user.role === "student" || user.role === "job_seeker") {
              router.replace("/dashboard/seeker");
            } else if (user.role === "coach") {
              router.replace("/dashboard/coach");
            } else if (user.role === "institute") {
              router.replace("/dashboard/institute");
            } else {
              router.replace("/dashboard");
            }
            return;
          }
          
          setIsChecking(false);
          return;
        }
        
        // If no userId in localStorage, get from session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError || !session?.user?.id) {
          console.error("Session error:", sessionError);
          router.replace("/login");
          return;
        }
        
        const userId = session.user.id;
        setUserId(userId);
        localStorage.setItem("userId", userId);
        
        // Check if user has role
        const { data: user, error: userError } = await supabase
          .from("users")
          .select("role")
          .eq("id", userId)
          .maybeSingle();
        
        if (user?.role) {
          localStorage.setItem("userRole", user.role);
          
          if (user.role === "student" || user.role === "job_seeker") {
            router.replace("/dashboard/seeker");
          } else if (user.role === "coach") {
            router.replace("/dashboard/coach");
          } else if (user.role === "institute") {
            router.replace("/dashboard/institute");
          } else {
            router.replace("/dashboard");
          }
          return;
        }
        
        setIsChecking(false);
        
      } catch (error) {
        console.error("Error checking user:", error);
        setIsChecking(false);
      }
    };
    
    checkUser();
  }, [router]);

  const selectRole = async (role: string) => {
    setError(null);
    
    try {
      let id: string | null = userId;
      
      if (!id) {
        id = localStorage.getItem("userId");
      }
      
      if (!id) {
        const { data: { session } } = await supabase.auth.getSession();
        id = session?.user?.id || null;
      }
      
      if (!id) {
        throw new Error("User not authenticated. Please sign in again.");
      }
      
      // Store role in localStorage only (will be saved to DB during onboarding)
      localStorage.setItem("userRole", role);
      console.log("Role stored in localStorage:", role);
      
      // Always redirect to onboarding for new users to complete their profile
      console.log("Redirecting to onboarding...");
      setLoading(false);
      router.replace("/onboarding");
      
    } catch (err) {
      console.error("Error selecting role:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
      setLoading(false);
    }
  };

  if (isChecking) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#F0F0FF',
        fontFamily: "'DM Sans', system-ui, sans-serif"
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '48px',
            height: '48px',
            border: '3px solid #E4E4F0',
            borderTopColor: '#5B5BD6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }} />
          <p style={{ color: '#4B4B6B' }}>Verifying your account...</p>
          <style>{`
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .role-root {
          min-height: 100svh;
          background: #F0F0FF;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 48px 20px 40px;
          font-family: 'DM Sans', system-ui, sans-serif;
        }
        .role-header { text-align: center; margin-bottom: 48px; }
        .role-badge {
          display: inline-block;
          background: white;
          border: 1.5px solid #E4E4F0;
          padding: 6px 18px;
          border-radius: 100px;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: .14em;
          color: #4B4B6B;
          margin-bottom: 18px;
        }
        .role-title {
          font-size: clamp(34px, 5vw, 52px);
          font-weight: 800;
          color: #0F0F2D;
          letter-spacing: -.025em;
          line-height: 1.1;
          margin-bottom: 14px;
        }
        .role-title-accent { color: #5B5BD6; }
        .role-subtitle { font-size: 16px; color: #9999BB; line-height: 1.65; }
        .role-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 18px;
          width: 100%;
          max-width: 980px;
        }
        .role-card {
          background: white;
          border: 2px solid #E4E4F0;
          border-radius: 20px;
          padding: 28px 22px 24px;
          cursor: pointer;
          position: relative;
          display: flex;
          flex-direction: column;
          transition: all 0.2s ease;
        }
        .role-card:hover { 
          border-color: #5B5BD6; 
          box-shadow: 0 8px 32px rgba(91,91,214,.15); 
          transform: translateY(-2px); 
        }
        .role-card.selected { 
          border-color: #5B5BD6; 
          box-shadow: 0 8px 40px rgba(91,91,214,.18); 
          transform: translateY(-3px); 
        }
        .role-card.disabled {
          opacity: 0.6;
          cursor: not-allowed;
          pointer-events: none;
        }
        .role-pin {
          position: absolute; top: 14px; right: 14px;
          width: 10px; height: 10px; background: #5B5BD6; border-radius: 50%;
        }
        .role-icon {
          width: 52px; height: 52px;
          background: #F5F5FF;
          border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
          color: #4B4B6B;
          margin-bottom: 18px;
          transition: all 0.2s ease;
        }
        .role-card:hover .role-icon { 
          background: rgba(91,91,214,.12); 
          color: #5B5BD6; 
        }
        .role-icon.sel { 
          background: rgba(91,91,214,.12); 
          color: #5B5BD6; 
        }
        .role-card-title { 
          font-size: 18px; 
          font-weight: 700; 
          color: #0F0F2D; 
          margin-bottom: 8px; 
          transition: color 0.2s ease;
        }
        .role-card:hover .role-card-title {
          color: #5B5BD6;
        }
        .role-card-desc { font-size: 13px; color: #9999BB; line-height: 1.6; flex: 1; }
        .role-cta {
          display: inline-flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          margin-top: 20px;
          padding-top: 12px;
          font-size: 13px;
          font-weight: 700;
          font-family: 'DM Sans', system-ui, sans-serif;
          border-top: 1.5px solid #E4E4F0;
          background: transparent;
          color: #5B5BD6;
          transition: all 0.2s ease;
          letter-spacing: .03em;
        }
        .role-card:hover .role-cta {
          border-top-color: #5B5BD6;
          gap: 8px;
        }
        .role-cta span {
          transition: transform 0.2s ease;
        }
        .role-card:hover .role-cta span:last-child {
          transform: translateX(4px);
        }
        .role-footnote {
          display: flex; align-items: center; gap: 8px;
          margin-top: 36px; font-size: 13px; color: #9999BB; font-weight: 500;
        }
        .error-message {
          background: #fee2e2;
          border: 1px solid #fecaca;
          color: #dc2626;
          padding: 12px 20px;
          border-radius: 12px;
          margin-bottom: 24px;
          max-width: 980px;
          width: 100%;
          text-align: center;
          font-size: 14px;
          font-weight: 500;
        }
        @media (max-width: 900px) { .role-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 500px) { .role-grid { grid-template-columns: 1fr; } .role-root { padding: 32px 16px; } }
      `}</style>

      <div className="role-root">
        <div className="role-header">
          <div><span className="role-badge">IDENTITY VERIFICATION</span></div>
          <h1 className="role-title">
            Choose Your <span className="role-title-accent">Journey</span>
          </h1>
          <p className="role-subtitle">
            Step into the future of career intelligence. Select the path<br />
            that reflects your current objective.
          </p>
        </div>

        {error && (
          <div className="error-message">
            ⚠️ {error}
          </div>
        )}

        <div className="role-grid">
          {roles.map((r) => {
            const isSel = selected === r.key;
            const isLoading = loading && selected === r.key;
            return (
              <div
                key={r.key}
                className={`role-card ${isSel ? "selected" : ""} ${loading ? "disabled" : ""}`}
                onClick={() => {
                  if (!loading && !error) {
                    setSelected(r.key);
                    selectRole(r.key);
                  }
                }}
              >
                {isSel && <div className="role-pin" />}

                <div className={`role-icon${isSel ? " sel" : ""}`}>{r.icon}</div>

                <p className="role-card-title">{r.title}</p>
                <p className="role-card-desc">{r.desc}</p>

                <div className="role-cta">
                  <span>{isLoading ? "Processing..." : "Select Path"}</span>
                  <span>{isLoading ? "..." : "→"}</span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="role-footnote">
          <svg viewBox="0 0 20 20" fill="none" stroke="#5B5BD6" strokeWidth="2" width="18" height="18">
            <circle cx="10" cy="10" r="9" /><path d="M6 10l3 3 5-5" />
          </svg>
          All paths include our standard Career Core AI features
        </div>
      </div>
    </>
  );
}