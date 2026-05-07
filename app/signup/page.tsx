// app/signup/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { supabase } from "@/lib/supabaseClient";

export default function SignupPage() {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"signup" | "verify">("signup");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Validation
    if (!firstName.trim()) {
      setError("First name is required");
      setLoading(false);
      return;
    }

    if (!lastName.trim()) {
      setError("Last name is required");
      setLoading(false);
      return;
    }

    if (!agreeTerms) {
      setError("Please agree to the terms of service and privacy policy");
      setLoading(false);
      return;
    }

    try {
      // First, check if user already exists
      const { data: existingUser } = await supabase
        .from("users")
        .select("email")
        .eq("email", email)
        .maybeSingle();

      if (existingUser) {
        throw new Error("An account with this email already exists. Please login instead.");
      }

      // Send OTP for signup (this will create a pending user)
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: true, // Allow new user creation
          data: {
            first_name: firstName,
            last_name: lastName,
            full_name: `${firstName} ${lastName}`,
          },
        },
      });

      if (error) throw error;

      setStep("verify");
      setResendCooldown(60); // 60 seconds cooldown
    } catch (error: any) {
      setError(error.message || "Failed to send verification code");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    
    setLoading(true);
    setError("");

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: true,
          data: {
            first_name: firstName,
            last_name: lastName,
            full_name: `${firstName} ${lastName}`,
          },
        },
      });

      if (error) throw error;

      setResendCooldown(60);
      setError("");
    } catch (error: any) {
      setError(error.message || "Failed to resend verification code");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Verify the OTP code - this will complete the signup
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: "email",
      });

      if (error) throw error;

      if (data.user) {
        // Create user profile in 'users' table
        const userData = {
          id: data.user.id,
          email: email,
          name: `${firstName} ${lastName}`,
          role: null, // Will be set in select-role
          created_at: new Date().toISOString(),
        };

        const { error: profileError } = await supabase
          .from("users")
          .insert([userData]);

        if (profileError) {
          console.error("Profile creation error:", profileError);
          // Still redirect even if profile creation fails (maybe it already exists)
        }

        // Store user info for role selection
        localStorage.setItem("userId", data.user.id);
        localStorage.setItem("userEmail", email);
        localStorage.setItem("userName", `${firstName} ${lastName}`);
        
        // Redirect to role selection
        router.push("/select-role");
      }
    } catch (error: any) {
      setError(error.message || "Invalid verification code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&family=Inter:wght@400;500;600&display=swap');

        *, *::before, *::after { 
          box-sizing: border-box; 
          margin: 0; 
          padding: 0; 
        }

        body {
          overflow: hidden;
        }

        .signup-root {
          height: 100dvh;
          width: 100vw;
          overflow: hidden;
          background: #EEEEFF;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px;
          font-family: 'Inter', system-ui, sans-serif;
        }

        .signup-shell {
          display: flex;
          width: 100%;
          max-width: 1100px;
          height: min(600px, calc(100dvh - 32px));
          border-radius: 24px;
          overflow: hidden;
          box-shadow: 0 24px 64px rgba(91,91,214,0.18);
        }

        .signup-left {
          flex: 0 0 50%;
          background: linear-gradient(150deg, #2a2a96 0%, #5B5BD6 50%, #6d3db5 100%);
          padding: 40px;
          color: #fff;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          position: relative;
          overflow: hidden;
        }

        .signup-blob { 
          position: absolute; 
          border-radius: 50%; 
          pointer-events: none; 
        }
        .signup-blob-1 { 
          width: 320px; 
          height: 320px; 
          background: #7CBCF2; 
          filter: blur(80px); 
          opacity: .22; 
          top: -100px; 
          right: -80px; 
        }
        .signup-blob-2 { 
          width: 220px; 
          height: 220px; 
          background: #9055f0; 
          filter: blur(70px); 
          opacity: .22; 
          bottom: 40px; 
          left: -60px; 
        }

        .signup-logo { 
          position: relative; 
          z-index: 1; 
        }
        .signup-logo-img { 
          width: auto; 
          height: 38px; 
          object-fit: contain; 
        }

        .signup-hero { 
          position: relative; 
          z-index: 1; 
        }
        .signup-hero-title {
          font-family: 'Outfit', system-ui, sans-serif;
          font-size: 42px;
          font-weight: 900;
          line-height: 1.2;
          margin-bottom: 16px;
        }
        .signup-hero-desc {
          font-size: 14px;
          line-height: 1.6;
          opacity: 0.85;
          margin-bottom: 30px;
        }

        .signup-stats {
          display: flex;
          gap: 20px;
          background: rgba(255,255,255,0.1);
          border: 1px solid rgba(255,255,255,0.16);
          backdrop-filter: blur(12px);
          border-radius: 12px;
          padding: 16px 24px;
          width: fit-content;
        }
        .signup-stat { 
          text-align: center; 
        }
        .signup-stat-num {
          font-family: 'Outfit', system-ui, sans-serif;
          font-size: 22px;
          font-weight: 800;
        }
        .signup-stat-label { 
          font-size: 11px; 
          opacity: 0.7; 
          margin-top: 4px; 
        }

        .signup-right {
          flex: 1;
          background: #fff;
          padding: 32px 40px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .signup-right::-webkit-scrollbar {
          width: 4px;
        }
        .signup-right::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 4px;
        }
        .signup-right::-webkit-scrollbar-thumb {
          background: #5B5BD6;
          border-radius: 4px;
        }

        .signup-eyebrow {
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
          margin-bottom: 16px;
          width: fit-content;
        }

        .signup-title {
          font-family: 'Outfit', system-ui, sans-serif;
          font-size: 24px;
          font-weight: 800;
          color: #0D0D2B;
          margin-bottom: 6px;
        }
        .signup-subtitle {
          font-size: 12px;
          color: #9595BB;
          margin-bottom: 20px;
          line-height: 1.4;
        }

        .signup-field { 
          margin-bottom: 12px; 
        }
        .signup-field-row { 
          display: flex; 
          gap: 12px; 
          margin-bottom: 12px;
        }
        .signup-field-half { 
          flex: 1; 
        }

        .signup-label {
          display: block;
          font-size: 11px;
          font-weight: 600;
          color: #5B5B80;
          margin-bottom: 4px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .signup-input {
          width: 100%;
          padding: 10px 12px;
          background: #F4F4FC;
          border: 1.5px solid #E2E2F0;
          border-radius: 10px;
          font-size: 13px;
          outline: none;
          transition: all 0.2s;
        }
        .signup-input:focus {
          border-color: #5B5BD6;
          background: #fff;
          box-shadow: 0 0 0 3px rgba(91,91,214,.1);
        }

        .signup-otp-info {
          font-size: 12px;
          color: #888;
          margin-top: -8px;
          margin-bottom: 12px;
          text-align: center;
        }

        .signup-checkbox {
          display: flex;
          align-items: center;
          gap: 8px;
          margin: 14px 0 16px;
        }
        .signup-checkbox input {
          width: 14px;
          height: 14px;
          cursor: pointer;
        }
        .signup-checkbox label {
          font-size: 11px;
          color: #5B5B80;
          cursor: pointer;
        }
        .signup-checkbox a {
          color: #5B5BD6;
          text-decoration: none;
          font-weight: 600;
        }

        .signup-btn-primary {
          width: 100%;
          padding: 10px;
          background: linear-gradient(135deg, #5B5BD6 0%, #6d3db5 100%);
          color: #fff;
          border: none;
          border-radius: 10px;
          font-family: 'Outfit', system-ui, sans-serif;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
        }
        .signup-btn-primary:hover { 
          opacity: 0.92; 
          transform: translateY(-1px); 
        }
        .signup-btn-primary:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        .resend-button {
          background: none;
          border: none;
          color: #5B5BD6;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          margin-top: 8px;
          text-decoration: underline;
        }

        .resend-button:disabled {
          color: #ccc;
          cursor: not-allowed;
          text-decoration: none;
        }

        .back-button {
          background: none;
          border: none;
          color: #5B5BD6;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          text-decoration: underline;
          margin-top: 16px;
        }

        .signup-footer {
          text-align: center;
          font-family: 'Inter', system-ui, sans-serif;
          font-size: 11px;
          color: #9595BB;
          margin-top: 16px;
        }
        .signup-footer a { 
          color: #5B5BD6; 
          font-weight: 600; 
          text-decoration: none; 
        }
        .signup-footer a:hover { 
          text-decoration: underline; 
        }

        .error-message {
          background: #fee2e2;
          border: 1px solid #fecaca;
          color: #dc2626;
          padding: 8px 12px;
          border-radius: 8px;
          margin-bottom: 14px;
          font-size: 11px;
          font-weight: 500;
        }

        @media (max-width: 768px) {
          .signup-shell { 
            flex-direction: column; 
            height: auto;
            max-height: 100dvh;
          }
          .signup-left { 
            display: none; 
          }
          .signup-right {
            padding: 24px;
            overflow-y: auto;
          }
        }
      `}</style>

      <div className="signup-root">
        <div className="signup-shell">
          <div className="signup-left">
            <div className="signup-blob signup-blob-1" />
            <div className="signup-blob signup-blob-2" />
            
            <div className="signup-logo">
              <Image
                src="/Prevail-Logo-light.png"
                alt="Prevail AI"
                width={150}
                height={38}
                className="signup-logo-img"
                priority
              />
            </div>

            <div className="signup-hero">
              <h1 className="signup-hero-title">
                Create your free account
              </h1>
              <p className="signup-hero-desc">
                Start sharing jobs and browsing active talent today.<br />
                No credit card required.
              </p>
              <div className="signup-stats">
                <div className="signup-stat">
                  <div className="signup-stat-num">94%</div>
                  <div className="signup-stat-label">match accuracy</div>
                </div>
                <div className="signup-stat">
                  <div className="signup-stat-num">2.4×</div>
                  <div className="signup-stat-label">faster placement</div>
                </div>
                <div className="signup-stat">
                  <div className="signup-stat-num">50k+</div>
                  <div className="signup-stat-label">careers guided</div>
                </div>
              </div>
            </div>
          </div>

          <div className="signup-right">
            <div className="signup-eyebrow">✦ &nbsp;Get started</div>
            <h2 className="signup-title">
              {step === "signup" ? "Create a free employer account" : "Verify your email"}
            </h2>
            <p className="signup-subtitle">
              {step === "signup" 
                ? "Start sharing jobs and browsing active talent today. No credit card required."
                : `Enter the 6-digit code sent to ${email}`}
            </p>

            {error && <div className="error-message">{error}</div>}

            <form onSubmit={step === "signup" ? handleSendOtp : handleVerifyOtp}>
              {/* SIGNUP FORM FIELDS */}
              {step === "signup" && (
                <>
                  <div className="signup-field-row">
                    <div className="signup-field-half">
                      <label className="signup-label">First Name</label>
                      <input
                        className="signup-input"
                        type="text"
                        placeholder="John"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="signup-field-half">
                      <label className="signup-label">Last Name</label>
                      <input
                        className="signup-input"
                        type="text"
                        placeholder="Doe"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="signup-field">
                    <label className="signup-label">Email</label>
                    <input
                      className="signup-input"
                      type="email"
                      placeholder="you@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div className="signup-checkbox">
                    <input
                      type="checkbox"
                      id="terms"
                      checked={agreeTerms}
                      onChange={(e) => setAgreeTerms(e.target.checked)}
                      required
                    />
                    <label htmlFor="terms">
                      I agree to the <a href="/terms">terms of service</a> and{" "}
                      <a href="/privacy">privacy policy</a>
                    </label>
                  </div>
                </>
              )}

              {/* OTP VERIFICATION FIELDS */}
              {step === "verify" && (
                <>
                  <div className="signup-field">
                    <label className="signup-label">Verification Code</label>
                    <input
                      className="signup-input"
                      type="text"
                      placeholder="Enter 6-digit code"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      maxLength={6}
                      required
                    />
                  </div>
                  <div className="signup-otp-info">
                    We've sent a 6-digit code to <b>{email}</b>
                  </div>
                  <button
                    type="button"
                    className="resend-button"
                    onClick={handleResendOtp}
                    disabled={resendCooldown > 0 || loading}
                  >
                    {resendCooldown > 0 
                      ? `Resend code in ${resendCooldown}s` 
                      : "Resend verification code"}
                  </button>
                </>
              )}

              <button type="submit" className="signup-btn-primary" disabled={loading}>
                {loading
                  ? "Please wait..."
                  : step === "signup"
                  ? "Send Verification Code →"
                  : "Verify & Create Account →"}
              </button>
            </form>

            {step === "verify" && (
              <button
                type="button"
                className="back-button"
                onClick={() => {
                  setStep("signup");
                  setOtp("");
                  setError("");
                }}
              >
                ← Back to sign up
              </button>
            )}

            <p className="signup-footer">
              Already have an account?{" "}
              <a href="/login">Login with existing account →</a>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}