"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { supabase } from "@/lib/supabaseClient";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"email" | "otp">("email");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [authErrorMsg, setAuthErrorMsg] = useState("");

  // Load saved email on mount
  useEffect(() => {
    const savedEmail = localStorage.getItem("rememberedEmail");
    const remember = localStorage.getItem("rememberMe") === "true";
    
    if (remember && savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  // Check for auth error in localStorage
  useEffect(() => {
    const err = localStorage.getItem("authError");
    if (err) {
      setAuthErrorMsg(err);
      localStorage.removeItem("authError");
    }
  }, []);

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
    } catch (error) {
      console.error("Google login error:", error);
      setError("Failed to sign in with Google");
    }
  };

  const handleLinkedInLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "linkedin_oidc",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
    } catch (error) {
      console.error("LinkedIn login error:", error);
      setError("Failed to sign in with LinkedIn");
    }
  };

  // Function to check if user exists in users table
  const checkUserExists = async (email: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("email")
        .eq("email", email)
        .maybeSingle();

      if (error) {
        console.error("Error checking user:", error);
        return false;
      }

      return !!data;
    } catch (error) {
      console.error("Error checking user existence:", error);
      return false;
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // First, check if user exists in database
      const userExists = await checkUserExists(email);
      
      if (!userExists) {
        throw new Error("No account found with this email address. Please sign up first.");
      }

      // Send OTP
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: false, // Only existing users can login
        },
      });

      if (error) throw error;

      // Handle "Remember Me" functionality for email
      if (rememberMe) {
        localStorage.setItem("rememberedEmail", email);
        localStorage.setItem("rememberMe", "true");
      } else {
        localStorage.removeItem("rememberedEmail");
        localStorage.setItem("rememberMe", "false");
      }

      setStep("otp");
    } catch (error: any) {
      setError(error.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Verify OTP
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: "email",
      });

      if (error) throw error;

      if (data.user) {
        // ✅ ADD TOKEN STORAGE
        if (data.session?.access_token) {
          localStorage.setItem(
            "token",
            data.session.access_token
          );
        }

        // ✅ ADD THESE localStorage SETTINGS
        localStorage.setItem(
          "userName",
          data.user.user_metadata?.name || ""
        );
        localStorage.setItem(
          "userEmail",
          data.user.email || ""
        );
        localStorage.setItem(
          "userId",
          data.user.id
        );

        // Store user ID in localStorage temporarily
        localStorage.setItem("userId", data.user.id);
        
        // Check if user has a role
        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("role")
          .eq("id", data.user.id)
          .maybeSingle();

        if (userError) {
          console.error("Error fetching user role:", userError);
        }

        // Role-based redirect logic
        if (!userData?.role) {
          // No role assigned - go to select role page
          router.replace("/select-role");
          return;
        }

        // User has role - redirect to appropriate dashboard
        if (userData.role === "student" || userData.role === "job_seeker") {
          router.replace("/dashboard/seeker");
        } else if (userData.role === "coach") {
          router.replace("/dashboard/coach");
        } else if (userData.role === "institute") {
          router.replace("/dashboard/institute");
        } else {
          router.replace("/select-role");
        }
      }
    } catch (error: any) {
      console.error("OTP verification error:", error);
      setError(error.message || "Invalid OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&family=Inter:wght@400;500;600&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .lp-root {
          height: 100dvh;
          width: 100vw;
          overflow: hidden;
          background: linear-gradient(135deg, #F5F5FF 0%, #E8E8FF 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px;
          font-family: 'Inter', system-ui, sans-serif;
        }

        .lp-shell {
          display: flex;
          width: 100%;
          max-width: 980px;
          height: min(640px, calc(100dvh - 32px));
          border-radius: 24px;
          overflow: hidden;
          box-shadow:
            0 24px 64px rgba(91,91,214,0.15),
            0 4px 16px rgba(0,0,0,0.05);
        }

        .lp-left {
          flex: 0 0 52%;
          background: linear-gradient(150deg, #4a4ab5 0%, #6d6dd6 50%, #8b5ecf 100%);
          padding: 32px 36px;
          color: #fff;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          position: relative;
          overflow: hidden;
        }

        .lp-blob { position:absolute; border-radius:50%; pointer-events:none; }
        .lp-blob-1 { width:320px; height:320px; background:#A8D0FF; filter:blur(80px); opacity:.18; top:-100px; right:-80px; }
        .lp-blob-2 { width:220px; height:220px; background:#C8A8FF; filter:blur(70px); opacity:.18; bottom:40px; left:-60px; }
        .lp-blob-3 { width:150px; height:150px; background:#8080FF; filter:blur(55px); opacity:.22; bottom:-30px; right:40px; }

        .lp-logo { position:relative; z-index:1; }
        .lp-logo-img { width:auto; height:38px; object-fit:contain; display:block; filter: brightness(0) invert(1); }

        .lp-hero { position:relative; z-index:1; }
        .lp-hero-title {
          font-family: 'Outfit', system-ui, sans-serif;
          font-size: clamp(34px, 3.8vw, 48px);
          font-weight: 900;
          line-height: 1.06;
          letter-spacing: -0.03em;
          margin-bottom: 12px;
        }
        .lp-hero-title span {
          display: block;
          background: linear-gradient(90deg, #fff 0%, rgba(255,255,255,0.7) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .lp-hero-desc {
          font-family: 'Inter', system-ui, sans-serif;
          font-size: 13px;
          line-height: 1.7;
          opacity: 0.85;
          max-width: 310px;
          margin-bottom: 22px;
        }

        .lp-stats {
          display: flex;
          align-items: center;
          background: rgba(255,255,255,0.12);
          border: 1px solid rgba(255,255,255,0.2);
          backdrop-filter: blur(12px);
          border-radius: 12px;
          padding: 12px 18px;
          width: fit-content;
          gap: 0;
        }
        .lp-stat { display:flex; flex-direction:column; align-items:center; gap:1px; padding:0 14px; }
        .lp-stat:first-child { padding-left:0; }
        .lp-stat-num {
          font-family: 'Outfit', system-ui, sans-serif;
          font-size: 18px;
          font-weight: 800;
          letter-spacing: -0.02em;
          line-height: 1;
        }
        .lp-stat-label { font-size:9.5px; opacity:.7; font-weight:500; letter-spacing:.04em; white-space:nowrap; }
        .lp-stat-div { width:1px; height:28px; background:rgba(255,255,255,.25); flex-shrink:0; }

        .lp-badge {
          position: relative;
          z-index: 1;
          display: inline-flex;
          align-items: center;
          gap: 7px;
          background: rgba(255,255,255,.12);
          border: 1px solid rgba(255,255,255,.2);
          backdrop-filter: blur(8px);
          padding: 7px 14px;
          border-radius: 100px;
          font-family: 'Inter', system-ui, sans-serif;
          font-size: 9.5px;
          font-weight: 600;
          letter-spacing: .12em;
          width: fit-content;
        }
        .lp-badge-dot {
          width: 6px; height: 6px;
          border-radius: 50%;
          background: #4ade80;
          box-shadow: 0 0 7px #4ade80;
          flex-shrink: 0;
          animation: pdot 2.2s ease-in-out infinite;
        }
        @keyframes pdot {
          0%,100% { opacity:1; transform:scale(1); }
          50%      { opacity:.4; transform:scale(1.5); }
        }

        .lp-right {
          flex: 1;
          background: #fff;
          padding: 28px 36px 24px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          overflow: hidden;
        }

        .lp-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-family: 'Inter', system-ui, sans-serif;
          font-size: 10.5px;
          font-weight: 600;
          letter-spacing: .08em;
          color: #5B5BD6;
          background: rgba(91,91,214,.08);
          padding: 4px 11px;
          border-radius: 100px;
          margin-bottom: 10px;
          width: fit-content;
        }

        .lp-title {
          font-family: 'Outfit', system-ui, sans-serif;
          font-size: 24px;
          font-weight: 800;
          color: #0D0D2B;
          letter-spacing: -0.025em;
          line-height: 1.2;
          margin-bottom: 5px;
        }
        .lp-subtitle {
          font-family: 'Inter', system-ui, sans-serif;
          font-size: 13px;
          color: #9595BB;
          line-height: 1.55;
          margin-bottom: 20px;
        }

        .lp-field      { margin-bottom: 12px; }
        .lp-field-last { margin-bottom: 12px; }
        .lp-field-row  { display:flex; justify-content:space-between; align-items:center; margin-bottom:5px; }

        .lp-label {
          display: block;
          font-family: 'Inter', system-ui, sans-serif;
          font-size: 9.5px;
          font-weight: 700;
          letter-spacing: .1em;
          color: #5B5B80;
          margin-bottom: 5px;
          text-transform: uppercase;
        }
        .lp-forgot {
          font-family: 'Inter', system-ui, sans-serif;
          font-size: 11.5px;
          color: #5B5BD6;
          font-weight: 600;
          text-decoration: none;
        }
        .lp-forgot:hover { text-decoration: underline; }

        .lp-input {
          width: 100%;
          padding: 10px 14px;
          background: #F4F4FC;
          border: 1.5px solid #E2E2F0;
          border-radius: 10px;
          font-family: 'Inter', system-ui, sans-serif;
          font-size: 13.5px;
          color: #0D0D2B;
          outline: none;
          transition: border-color .18s, background .18s, box-shadow .18s;
          box-sizing: border-box;
          -webkit-appearance: none;
          appearance: none;
        }
        .lp-input::placeholder { color: #B0B0CC; }
        .lp-input:focus {
          border-color: #5B5BD6;
          background: #fff;
          box-shadow: 0 0 0 3px rgba(91,91,214,.1);
        }

        /* Remember Me Checkbox Styles */
        .lp-checkbox-wrapper {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 18px;
        }
        .lp-checkbox {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
        }
        .lp-checkbox input {
          width: 16px;
          height: 16px;
          cursor: pointer;
          accent-color: #5B5BD6;
        }
        .lp-checkbox label {
          font-family: 'Inter', system-ui, sans-serif;
          font-size: 12px;
          color: #5B5B80;
          cursor: pointer;
          user-select: none;
        }
        .lp-forgot-small {
          font-family: 'Inter', system-ui, sans-serif;
          font-size: 12px;
          color: #5B5BD6;
          font-weight: 500;
          text-decoration: none;
        }
        .lp-forgot-small:hover { text-decoration: underline; }

        .lp-btn-primary {
          width: 100%;
          padding: 11px;
          background: linear-gradient(135deg, #5B5BD6 0%, #6d3db5 100%);
          color: #fff;
          border: none;
          border-radius: 10px;
          font-family: 'Outfit', system-ui, sans-serif;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          letter-spacing: .01em;
          box-shadow: 0 4px 14px rgba(91,91,214,.32);
          margin-bottom: 16px;
          transition: opacity .18s, transform .14s, box-shadow .18s;
        }
        .lp-btn-primary:hover {
          opacity: .92;
          transform: translateY(-1px);
          box-shadow: 0 8px 22px rgba(91,91,214,.38);
        }
        .lp-btn-primary:active { transform: translateY(0); }
        .lp-btn-primary:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        .lp-divider { display:flex; align-items:center; gap:9px; margin-bottom:12px; }
        .lp-div-line { flex:1; height:1px; background:#EBEBF5; }
        .lp-div-text {
          font-family: 'Inter', system-ui, sans-serif;
          font-size: 9.5px;
          font-weight: 600;
          letter-spacing: .1em;
          color: #ABABCC;
          white-space: nowrap;
        }

        .lp-btn-social {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 9px;
          padding: 10px 14px;
          background: #fff;
          border: 1.5px solid #E2E2F0;
          border-radius: 10px;
          font-family: 'Inter', system-ui, sans-serif;
          font-size: 13px;
          font-weight: 500;
          color: #0D0D2B;
          cursor: pointer;
          margin-bottom: 9px;
          transition: border-color .18s, transform .14s, box-shadow .14s;
        }
        .lp-btn-social:hover {
          border-color: #5B5BD6;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(91,91,214,.09);
        }

        .lp-footer {
          text-align: center;
          font-family: 'Inter', system-ui, sans-serif;
          font-size: 12.5px;
          color: #9595BB;
          margin: 14px 0 6px;
        }
        .lp-footer a { color:#5B5BD6; font-weight:600; text-decoration:none; }
        .lp-footer a:hover { text-decoration:underline; }
        .lp-copy {
          text-align: center;
          font-family: 'Inter', system-ui, sans-serif;
          font-size: 9.5px;
          letter-spacing: .04em;
          color: #ABABCC;
        }
        .error-message {
          background: #fee2e2;
          border: 1px solid #fecaca;
          color: #dc2626;
          padding: 10px 12px;
          border-radius: 10px;
          margin-bottom: 16px;
          font-size: 12px;
          font-weight: 500;
        }

        .auth-error-message {
          background: #fee2e2;
          color: #dc2626;
          padding: 10px;
          border-radius: 8px;
          margin-bottom: 12px;
          font-size: 13px;
          font-weight: 500;
        }

        .otp-info {
          font-size: 12px;
          color: #888;
          margin-top: -8px;
          margin-bottom: 12px;
          text-align: center;
        }

        @media (max-width: 820px) {
          .lp-left { flex: 0 0 46%; padding: 28px; }
          .lp-right { padding: 24px 28px 20px; }
          .lp-hero-title { font-size: 32px; }
        }

        @media (max-width: 600px) {
          .lp-root { padding: 0; align-items: stretch; }
          .lp-shell {
            flex-direction: column;
            border-radius: 0;
            height: 100dvh;
            max-width: 100%;
          }
          .lp-left {
            flex: 0 0 auto;
            padding: 24px 20px 20px;
          }
          .lp-hero-title { font-size: 28px; }
          .lp-hero-desc  { font-size: 12px; margin-bottom: 14px; }
          .lp-stats { padding: 10px 14px; }
          .lp-stat-num { font-size: 15px; }
          .lp-right {
            flex: 1;
            padding: 20px;
            overflow-y: auto;
          }
          .lp-title { font-size: 20px; }
          .lp-subtitle { margin-bottom: 14px; }
        }
      `}</style>

      <div className="lp-root">
        <div className="lp-shell">

          <div className="lp-left">
            <div className="lp-blob lp-blob-1" />
            <div className="lp-blob lp-blob-2" />
            <div className="lp-blob lp-blob-3" />

            <div className="lp-logo">
              <Image
                src="/Prevail-Logo-light.png"
                alt="Prevail AI"
                width={150}
                height={38}
                className="lp-logo-img"
                priority
              />
            </div>

            <div className="lp-hero">
              <h1 className="lp-hero-title">
                <span>Your career,</span>
                <span>on autopilot.</span>
              </h1>
              <p className="lp-hero-desc">
                Prevail uses predictive AI to map your next move — before the
                market does. Sign in and stay three steps ahead.
              </p>
              <div className="lp-stats">
                <div className="lp-stat">
                  <span className="lp-stat-num">94%</span>
                  <span className="lp-stat-label">match accuracy</span>
                </div>
                <div className="lp-stat-div" />
                <div className="lp-stat">
                  <span className="lp-stat-num">2.4×</span>
                  <span className="lp-stat-label">faster placement</span>
                </div>
                <div className="lp-stat-div" />
                <div className="lp-stat">
                  <span className="lp-stat-num">50k+</span>
                  <span className="lp-stat-label">careers guided</span>
                </div>
              </div>
            </div>

            <div>
              <span className="lp-badge">
                <span className="lp-badge-dot" />
                NEURAL ORACLE V4.2 — NOW LIVE
              </span>
            </div>
          </div>

          <div className="lp-right">
            <div className="lp-eyebrow">✦ &nbsp;Welcome back</div>
            <h2 className="lp-title">Sign in to your workspace</h2>
            <p className="lp-subtitle">
              Pick up right where you left off. Your AI oracle is ready.
            </p>

            {/* Auth Error Message */}
            {authErrorMsg && (
              <div className="auth-error-message">
                {authErrorMsg}
              </div>
            )}

            {error && <div className="error-message">{error}</div>}

            <form onSubmit={step === "email" ? handleSendOtp : handleVerifyOtp}>
              {/* EMAIL FIELD */}
              {step === "email" && (
                <div className="lp-field">
                  <label className="lp-label">Work Email</label>
                  <input
                    className="lp-input"
                    type="email"
                    placeholder="you@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    required
                  />
                </div>
              )}

              {/* OTP FIELD */}
              {step === "otp" && (
                <>
                  <div className="lp-field">
                    <label className="lp-label">Enter OTP</label>
                    <input
                      className="lp-input"
                      type="text"
                      placeholder="Enter 6-digit OTP"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      maxLength={6}
                      required
                    />
                  </div>
                  <div className="otp-info">
                    OTP sent to <b>{email}</b>
                  </div>
                </>
              )}

              {/* Remember Me Checkbox - Only show in email step */}
              {step === "email" && (
                <div className="lp-checkbox-wrapper">
                  <label className="lp-checkbox">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                    />
                    <label>Remember me</label>
                  </label>
                  <a href="/forgot-password" className="lp-forgot-small">Need help?</a>
                </div>
              )}

              <button type="submit" className="lp-btn-primary" disabled={loading}>
                {loading
                  ? "Please wait..."
                  : step === "email"
                  ? "Send OTP →"
                  : "Verify & Sign In →"}
              </button>
            </form>

            <div className="lp-divider">
              <span className="lp-div-line" />
              <span className="lp-div-text">OR SIGN IN WITH</span>
              <span className="lp-div-line" />
            </div>

            <button className="lp-btn-social" onClick={handleGoogleLogin}>
              <svg viewBox="0 0 24 24" width="17" height="17">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>

            <button className="lp-btn-social" onClick={handleLinkedInLogin}>
              <svg viewBox="0 0 24 24" width="17" height="17" fill="#0A66C2">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
              Continue with LinkedIn
            </button>

            <p className="lp-footer">
              New to our platform?{" "}
              <a href="/signup">Create a new account →</a>
            </p>
            <p className="lp-copy">© 2024 Prevail AI · Trusted by 50,000+ professionals</p>
          </div>

        </div>
      </div>
    </>
  );
}