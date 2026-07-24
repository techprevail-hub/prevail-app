"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { supabase } from "@/lib/supabaseClient";

export default function LoginPage() {
  const router = useRouter();
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [authErrorMsg, setAuthErrorMsg] = useState("");

  // ─── Existing useEffect 1 ──────────────────────────────────────────────
  useEffect(() => {
    const remember = localStorage.getItem("rememberMe") === "true";
    if (remember) setRememberMe(true);
  }, []);

  // ─── Existing useEffect 2 ──────────────────────────────────────────────
  useEffect(() => {
    const err = localStorage.getItem("authError");
    if (err) {
      setAuthErrorMsg(err);
      localStorage.removeItem("authError");
    }
  }, []);

  // ─── NEW: useEffect for Invitation Token (no useSearchParams) ──────────
  useEffect(() => {
    // Read token directly from URL using window.location
    const urlParams = new URLSearchParams(window.location.search);
    const inviteToken = urlParams.get("inviteToken");

    if (inviteToken) {
      localStorage.setItem("inviteToken", inviteToken);
      console.log("Invitation Token Saved:", inviteToken);
      
      // Optional: Clean the URL to remove the token parameter
      // This prevents the token from being visible in the URL after saving
      if (window.history && window.history.replaceState) {
        const cleanUrl = window.location.pathname;
        window.history.replaceState({}, document.title, cleanUrl);
        console.log("URL cleaned, token removed from address bar");
      }
    }
  }, []);

  // ─── Google Login ──────────────────────────────────────────────────────
  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
    } catch (err) {
      console.error("Google login error:", err);
      setError("Failed to sign in with Google");
    }
  };

  // ─── LinkedIn Login ────────────────────────────────────────────────────
  const handleLinkedInLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "linkedin_oidc",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
    } catch (err) {
      console.error("LinkedIn login error:", err);
      setError("Failed to sign in with LinkedIn");
    }
  };

  // ─── Remember Me ───────────────────────────────────────────────────────
  const handleRememberMe = (checked: boolean) => {
    setRememberMe(checked);
    localStorage.setItem("rememberMe", String(checked));
  };

  return (
    <div className="h-dvh w-screen overflow-hidden flex items-center justify-center p-4 bg-gradient-to-br from-[#F5F5FF] to-[#E8E8FF] font-[Inter,system-ui,sans-serif]">

      {/* Shell */}
      <div
        className="flex w-full overflow-hidden rounded-3xl"
        style={{
          maxWidth: 980,
          height: "min(640px, calc(100dvh - 32px))",
          boxShadow: "0 24px 64px rgba(91,91,214,0.15), 0 4px 16px rgba(0,0,0,0.05)",
        }}
      >

        {/* ── Left Panel ── */}
        <div
          className="relative hidden sm:flex flex-col justify-between overflow-hidden text-white p-8 lg:p-9"
          style={{
            flex: "0 0 52%",
            background: "linear-gradient(150deg, #4a4ab5 0%, #6d6dd6 50%, #8b5ecf 100%)",
          }}
        >
          {/* Blobs */}
          <div
            className="absolute rounded-full pointer-events-none"
            style={{ width: 320, height: 320, background: "#A8D0FF", filter: "blur(80px)", opacity: 0.18, top: -100, right: -80 }}
          />
          <div
            className="absolute rounded-full pointer-events-none"
            style={{ width: 220, height: 220, background: "#C8A8FF", filter: "blur(70px)", opacity: 0.18, bottom: 40, left: -60 }}
          />
          <div
            className="absolute rounded-full pointer-events-none"
            style={{ width: 150, height: 150, background: "#8080FF", filter: "blur(55px)", opacity: 0.22, bottom: -30, right: 40 }}
          />

          {/* Logo */}
          <div className="relative z-10">
            <Image
              src="/Prevail-Logo-light.png"
              alt="Prevail AI"
              width={150}
              height={38}
              className="h-[38px] w-auto object-contain brightness-0 invert"
              priority
            />
          </div>

          {/* Hero */}
          <div className="relative z-10">
            <h1
              className="font-[Outfit,system-ui,sans-serif] font-black leading-[1.06] tracking-[-0.03em] mb-3"
              style={{ fontSize: "clamp(34px,3.8vw,48px)" }}
            >
              <span
                className="block"
                style={{
                  background: "linear-gradient(90deg,#fff 0%,rgba(255,255,255,0.7) 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Your career,
              </span>
              <span
                className="block"
                style={{
                  background: "linear-gradient(90deg,#fff 0%,rgba(255,255,255,0.7) 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                on autopilot.
              </span>
            </h1>
            <p className="text-[13px] leading-[1.7] opacity-85 max-w-[310px] mb-5">
              Prevail uses predictive AI to map your next move — before the market does.
              Sign in and stay three steps ahead.
            </p>

            {/* Stats */}
            <div
              className="flex items-center w-fit gap-0 rounded-xl px-[18px] py-3"
              style={{
                background: "rgba(255,255,255,0.12)",
                border: "1px solid rgba(255,255,255,0.2)",
                backdropFilter: "blur(12px)",
              }}
            >
              {[
                { num: "94%",  label: "match accuracy" },
                { num: "2.4×", label: "faster placement" },
                { num: "50k+", label: "careers guided" },
              ].map(({ num, label }, i) => (
                <div key={label} className="flex items-center">
                  {i > 0 && <div className="w-px h-7 mx-0" style={{ background: "rgba(255,255,255,0.25)" }} />}
                  <div className={`flex flex-col items-center gap-px ${i === 0 ? "pr-[14px]" : i === 2 ? "pl-[14px]" : "px-[14px]"}`}>
                    <span className="font-[Outfit,system-ui,sans-serif] text-[18px] font-extrabold tracking-[-0.02em] leading-none">
                      {num}
                    </span>
                    <span className="text-[9.5px] opacity-70 font-medium tracking-[0.04em] whitespace-nowrap">
                      {label}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Badge */}
          <div className="relative z-10">
            <span
              className="inline-flex items-center gap-[7px] px-[14px] py-[7px] rounded-full text-[9.5px] font-semibold tracking-[0.12em] w-fit"
              style={{
                background: "rgba(255,255,255,0.12)",
                border: "1px solid rgba(255,255,255,0.2)",
                backdropFilter: "blur(8px)",
              }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full shrink-0"
                style={{
                  background: "#4ade80",
                  boxShadow: "0 0 7px #4ade80",
                  animation: "pdot 2.2s ease-in-out infinite",
                }}
              />
              NEURAL ORACLE V4.2 — NOW LIVE
            </span>
          </div>

          <style>{`
            @keyframes pdot {
              0%,100% { opacity:1; transform:scale(1); }
              50%      { opacity:.4; transform:scale(1.5); }
            }
          `}</style>
        </div>

        {/* ── Right Panel ── */}
        <div className="flex-1 bg-white flex flex-col justify-center overflow-hidden px-7 py-6 lg:px-9">

          {/* Eyebrow */}
          <span className="inline-flex items-center gap-1.5 text-[10.5px] font-semibold tracking-[0.08em] text-[#5B5BD6] bg-[rgba(91,91,214,0.08)] px-[11px] py-1 rounded-full w-fit mb-2.5">
            ✦ &nbsp;Welcome back
          </span>

          <h2 className="font-[Outfit,system-ui,sans-serif] text-[24px] font-extrabold text-[#0D0D2B] tracking-[-0.025em] leading-[1.2] mb-1.5">
            Sign in to your workspace
          </h2>
          <p className="text-[13px] text-[#9595BB] leading-[1.55] mb-6">
            Pick up right where you left off. Your AI oracle is ready.
          </p>

          {/* Auth Error */}
          {authErrorMsg && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-3 py-2.5 rounded-xl mb-4 text-xs font-medium">
              {authErrorMsg}
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-3 py-2.5 rounded-xl mb-4 text-xs font-medium">
              {error}
            </div>
          )}

          {/* Divider */}
          <div className="flex items-center gap-2.5 mb-3">
            <div className="flex-1 h-px bg-[#EBEBF5]" />
            <span className="text-[9.5px] font-semibold tracking-[0.1em] text-[#ABABCC] whitespace-nowrap">
              SIGN IN WITH
            </span>
            <div className="flex-1 h-px bg-[#EBEBF5]" />
          </div>

          {/* Google */}
          <button
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-2.5 px-3.5 py-2.5 bg-white border-[1.5px] border-[#E2E2F0] rounded-xl text-[13px] font-medium text-[#0D0D2B] mb-2.5 transition-all hover:border-[#5B5BD6] hover:-translate-y-px hover:shadow-[0_4px_12px_rgba(91,91,214,0.09)] active:translate-y-0"
          >
            <svg viewBox="0 0 24 24" width="17" height="17">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          {/* LinkedIn */}
          <button
            onClick={handleLinkedInLogin}
            className="w-full flex items-center justify-center gap-2.5 px-3.5 py-2.5 bg-white border-[1.5px] border-[#E2E2F0] rounded-xl text-[13px] font-medium text-[#0D0D2B] mb-4 transition-all hover:border-[#5B5BD6] hover:-translate-y-px hover:shadow-[0_4px_12px_rgba(91,91,214,0.09)] active:translate-y-0"
          >
            <svg viewBox="0 0 24 24" width="17" height="17" fill="#0A66C2">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
            </svg>
            Continue with LinkedIn
          </button>

          {/* Remember Me */}
          <div className="flex items-center gap-2 mb-5">
            <input
              id="remember"
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => handleRememberMe(e.target.checked)}
              className="w-4 h-4 cursor-pointer accent-[#5B5BD6]"
            />
            <label htmlFor="remember" className="text-[12px] text-[#5B5B80] cursor-pointer select-none">
              Remember me
            </label>
          </div>

          <p className="text-center text-[12.5px] text-[#9595BB] mb-1.5">
            New to our platform?{" "}
            <a href="/signup" className="text-[#5B5BD6] font-semibold no-underline hover:underline">
              Create a new account →
            </a>
          </p>
          <p className="text-center text-[9.5px] tracking-[0.04em] text-[#ABABCC]">
            © 2024 Prevail AI · Trusted by 50,000+ professionals
          </p>
        </div>

      </div>
    </div>
  );
}