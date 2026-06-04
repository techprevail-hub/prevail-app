// app/onboarding/page.tsx
"use client";

import { useEffect, useState } from "react";
import { onboardingConfig } from "@/lib/onboardingConfig";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function Onboarding() {
  const router = useRouter();

  const [role, setRole] = useState<string | null>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<any>({});
  const [textValue, setTextValue] = useState("");
  const [animating, setAnimating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // New loading state

  useEffect(() => {
    const storedRole = localStorage.getItem("userRole");

    console.log("Stored Role:", storedRole);

    if (!storedRole) {
      setIsLoading(false);
      router.push("/select-role");
      return;
    }

    const roleQuestions =
      onboardingConfig[
        storedRole as keyof typeof onboardingConfig
      ];

    console.log("Questions Found:", roleQuestions);

    setRole(storedRole);
    setQuestions(roleQuestions || []);

    setIsLoading(false);
  }, [router]);

  // Check for loading state
  if (isLoading) {
    return (
      <div style={{
        minHeight: "100vh", display: "flex", alignItems: "center",
        justifyContent: "center", background: "#F0F0FF",
        fontFamily: "'DM Sans', system-ui, sans-serif"
      }}>
        <div style={{ textAlign: "center" }}>
          <div style={{
            width: "48px", height: "48px",
            border: "3px solid #E4E4F0", borderTopColor: "#5B5BD6",
            borderRadius: "50%", animation: "spin 1s linear infinite",
            margin: "0 auto 20px"
          }} />
          <p style={{ color: "#4B4B6B" }}>Preparing your experience...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  // Check if no role found
  if (!role) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          background: "#F0F0FF",
          fontFamily: "'DM Sans', system-ui, sans-serif",
        }}
      >
        <div style={{ textAlign: "center", padding: "20px" }}>
          <p style={{ color: "#4B4B6B", fontSize: "16px" }}>No role found. Redirecting...</p>
        </div>
      </div>
    );
  }

  // Check if role exists but no questions found
  if (role && questions.length === 0) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          fontFamily: "'DM Sans', system-ui, sans-serif",
          background: "#F0F0FF",
        }}
      >
        <div style={{ textAlign: "center", padding: "20px" }}>
          <h2 style={{ color: "#0F0F2D", marginBottom: "12px" }}>No Onboarding Questions Found</h2>
          <p style={{ color: "#4B4B6B" }}>No onboarding questions found for role: {role}</p>
          <button
            onClick={() => router.push("/select-role")}
            style={{
              marginTop: "24px",
              padding: "12px 24px",
              background: "#5B5BD6",
              color: "white",
              border: "none",
              borderRadius: "12px",
              cursor: "pointer",
              fontWeight: "600",
            }}
          >
            Go Back to Select Role
          </button>
        </div>
      </div>
    );
  }

  const goToNext = (key: string, value: any) => {
    const newAnswers = { ...answers, [key]: value };
    setAnswers(newAnswers);
    setTextValue("");

    if (step < questions.length - 1) {
      setAnimating(true);
      setTimeout(() => {
        setStep(step + 1);
        setAnimating(false);
      }, 220);
    } else {
      handleSubmit(newAnswers);
    }
  };

  const handleAnswer = (value: any) => {
    const key = questions[step].key;
    goToNext(key, value);
  };

  const handleTextSubmit = () => {
    if (!textValue.trim()) return;
    handleAnswer(textValue.trim());
  };

  const handleSubmit = async (finalData: any) => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      const userId = localStorage.getItem("userId");

      if (!userId) {
        console.error("User ID not found");
        setIsSubmitting(false);
        router.push("/login");
        return;
      }

      // First, try to delete any existing onboarding data for this user
      const { error: deleteError } = await supabase
        .from("onboarding")
        .delete()
        .eq("user_id", userId);

      if (deleteError) {
        console.error("Error deleting existing onboarding:", deleteError);
        // Continue anyway, maybe there's no existing data
      }

      // Now insert the new onboarding data
      const { error: insertError } = await supabase
        .from("onboarding")
        .insert([
          {
            user_id: userId,
            role: role,
            data: finalData,
            created_at: new Date().toISOString(),
          }
        ]);

      if (insertError) {
        console.error("Error saving onboarding:", insertError);
        setIsSubmitting(false);
        
        // Show specific error message based on error type
        if (insertError.code === "23505") {
          alert("Your information was already saved. Redirecting to dashboard...");
          // UPDATED: Role-based redirect after onboarding complete with correct role condition
          if (role === "student" || role === "job_seeker") {
            window.location.href = "/dashboard/seeker";
          } else if (role === "coach") {
            window.location.href = "/dashboard/coach";
          } else if (role === "institute") {
            window.location.href = "/dashboard/institute";
          } else {
            window.location.href = "/dashboard";
          }
        } else {
          alert("There was an error saving your information. Please try again.");
        }
        return;
      }

      console.log("Onboarding data saved successfully");
      
      // ✅ UPDATE USER ROLE IN USERS TABLE
      const { error: roleUpdateError } = await supabase
        .from("users")
        .update({
          role: role,
        })
        .eq("id", userId);

      if (roleUpdateError) {
        console.error("Role update error:", roleUpdateError);
        setIsSubmitting(false);
        alert("There was an error updating your role. Please try again.");
        return;
      }
      
      console.log("Role updated successfully");
      
      // Add a delay to ensure the database write is complete
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // UPDATED: Role-based redirect after onboarding complete with correct role condition
      if (role === "student" || role === "job_seeker") {
        window.location.href = "/dashboard/seeker";
      } else if (role === "coach") {
        window.location.href = "/dashboard/coach";
      } else if (role === "institute") {
        window.location.href = "/dashboard/institute";
      } else {
        window.location.href = "/dashboard";
      }
      
    } catch (error) {
      console.error("Unexpected error during onboarding submission:", error);
      setIsSubmitting(false);
      alert("An unexpected error occurred. Please try again.");
    }
  };

  const handleBack = () => {
    if (step === 0) return;
    setAnimating(true);
    setTimeout(() => {
      setStep(step - 1);
      setTextValue("");
      setAnimating(false);
    }, 220);
  };

  const current = questions[step];
  
  // Debug logs
  console.log("Current Role State:", role);
  console.log("Current Questions State:", questions);
  console.log("Current Step:", step);
  console.log("Current Question:", current);
  
  const progress = ((step + 1) / questions.length) * 100;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }

        .ob-root {
          min-height: 100svh;
          background: #F0F0FF;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 48px 20px 40px;
          font-family: 'DM Sans', system-ui, sans-serif;
        }

        .ob-card {
          background: white;
          border: 2px solid #E4E4F0;
          border-radius: 24px;
          padding: 48px 44px 40px;
          width: 100%;
          max-width: 560px;
          box-shadow: 0 8px 48px rgba(91,91,214,.08);
          transition: opacity 0.22s ease, transform 0.22s ease;
        }
        .ob-card.animating {
          opacity: 0;
          transform: translateY(10px);
        }

        .ob-badge {
          display: inline-block;
          background: white;
          border: 1.5px solid #E4E4F0;
          padding: 6px 18px;
          border-radius: 100px;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: .14em;
          color: #4B4B6B;
          margin-bottom: 36px;
          text-align: center;
          width: 100%;
          text-align: left;
        }

        .ob-step-label {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: .12em;
          color: #5B5BD6;
          margin-bottom: 8px;
          text-transform: uppercase;
        }

        .ob-progress-bar {
          width: 100%;
          height: 4px;
          background: #F0F0FF;
          border-radius: 100px;
          margin-bottom: 36px;
          overflow: hidden;
        }
        .ob-progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #5B5BD6, #7B7BFF);
          border-radius: 100px;
          transition: width 0.4s cubic-bezier(.4,0,.2,1);
        }

        .ob-question {
          font-size: clamp(22px, 4vw, 28px);
          font-weight: 800;
          color: #0F0F2D;
          letter-spacing: -.02em;
          line-height: 1.2;
          margin-bottom: 32px;
        }

        /* Text / Number input */
        .ob-input {
          width: 100%;
          padding: 16px 20px;
          border: 2px solid #E4E4F0;
          border-radius: 14px;
          font-size: 15px;
          font-family: 'DM Sans', system-ui, sans-serif;
          font-weight: 500;
          color: #0F0F2D;
          background: #FAFAFF;
          outline: none;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
          margin-bottom: 16px;
        }
        .ob-input:focus {
          border-color: #5B5BD6;
          box-shadow: 0 0 0 3px rgba(91,91,214,.1);
          background: white;
        }
        .ob-input::placeholder { color: #C0C0D8; }

        /* Continue / Submit button */
        .ob-btn-primary {
          width: 100%;
          padding: 16px 24px;
          background: #5B5BD6;
          color: white;
          font-size: 15px;
          font-weight: 700;
          font-family: 'DM Sans', system-ui, sans-serif;
          border: none;
          border-radius: 14px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: space-between;
          transition: all 0.2s ease;
          letter-spacing: .01em;
        }
        .ob-btn-primary:hover:not(:disabled) {
          background: #4A4AC5;
          transform: translateY(-1px);
          box-shadow: 0 6px 24px rgba(91,91,214,.3);
        }
        .ob-btn-primary:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }

        /* Select options */
        .ob-options {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-bottom: 0;
        }
        .ob-option {
          padding: 16px 20px;
          border: 2px solid #E4E4F0;
          border-radius: 14px;
          background: white;
          font-size: 15px;
          font-weight: 600;
          font-family: 'DM Sans', system-ui, sans-serif;
          color: #0F0F2D;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: space-between;
          transition: all 0.18s ease;
          text-align: left;
        }
        .ob-option:hover:not(:disabled) {
          border-color: #5B5BD6;
          background: #F5F5FF;
          color: #5B5BD6;
          transform: translateX(3px);
        }
        .ob-option:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .ob-option .ob-option-arrow {
          opacity: 0;
          transition: opacity 0.18s ease, transform 0.18s ease;
          color: #5B5BD6;
          font-size: 18px;
        }
        .ob-option:hover:not(:disabled) .ob-option-arrow {
          opacity: 1;
          transform: translateX(3px);
        }

        /* Boolean buttons */
        .ob-bool-group {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }
        .ob-bool-btn {
          padding: 20px 16px;
          border: 2px solid #E4E4F0;
          border-radius: 14px;
          background: white;
          font-size: 15px;
          font-weight: 700;
          font-family: 'DM Sans', system-ui, sans-serif;
          color: #0F0F2D;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          transition: all 0.18s ease;
        }
        .ob-bool-btn:hover:not(:disabled) {
          border-color: #5B5BD6;
          background: #F5F5FF;
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(91,91,214,.12);
        }
        .ob-bool-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .ob-bool-btn .ob-bool-icon {
          font-size: 28px;
        }
        .ob-bool-btn .ob-bool-label {
          font-size: 15px;
          font-weight: 700;
          color: #0F0F2D;
        }
        .ob-bool-btn:hover:not(:disabled) .ob-bool-label {
          color: #5B5BD6;
        }

        /* Footer nav */
        .ob-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: 28px;
        }
        .ob-back-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          font-weight: 600;
          font-family: 'DM Sans', system-ui, sans-serif;
          color: #9999BB;
          background: none;
          border: none;
          cursor: pointer;
          padding: 8px 0;
          transition: color 0.18s ease;
        }
        .ob-back-btn:hover:not(:disabled) { color: #5B5BD6; }
        .ob-back-btn:disabled { opacity: 0.3; cursor: not-allowed; }

        .ob-dots {
          display: flex;
          gap: 6px;
          align-items: center;
        }
        .ob-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #E4E4F0;
          transition: all 0.2s ease;
        }
        .ob-dot.active {
          background: #5B5BD6;
          width: 20px;
          border-radius: 100px;
        }
        .ob-dot.done {
          background: #5B5BD6;
          opacity: 0.35;
        }

        .ob-footnote {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: 28px;
          font-size: 13px;
          color: #9999BB;
          font-weight: 500;
        }

        @media (max-width: 500px) {
          .ob-card { padding: 32px 24px 28px; }
          .ob-root { padding: 32px 16px; }
        }
      `}</style>

      <div className="ob-root">

        {/* Top badge */}
        <div style={{ width: "100%", maxWidth: "560px", marginBottom: "12px" }}>
          <span className="ob-badge">ONBOARDING — {role?.replace("_", " ").toUpperCase()}</span>
        </div>

        {/* Main card */}
        <div className={`ob-card${animating ? " animating" : ""}`}>

          {/* Progress */}
          <div className="ob-step-label">Step {step + 1} of {questions.length}</div>
          <div className="ob-progress-bar">
            <div className="ob-progress-fill" style={{ width: `${progress}%` }} />
          </div>

          {/* Question */}
          <h2 className="ob-question">{current?.question || "Loading..."}</h2>

          {/* Answer inputs */}
          {current?.type === "text" && (
            <>
              <input
                className="ob-input"
                placeholder="Type your answer..."
                value={textValue}
                onChange={(e) => setTextValue(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleTextSubmit()}
                autoFocus
                disabled={isSubmitting}
              />
              <button
                className="ob-btn-primary"
                onClick={handleTextSubmit}
                disabled={!textValue.trim() || isSubmitting}
              >
                <span>{step === questions.length - 1 ? "Finish" : "Continue"}</span>
                <span>→</span>
              </button>
            </>
          )}

          {current?.type === "number" && (
            <>
              <input
                className="ob-input"
                type="number"
                placeholder="Enter a number..."
                value={textValue}
                onChange={(e) => setTextValue(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleTextSubmit()}
                autoFocus
                disabled={isSubmitting}
              />
              <button
                className="ob-btn-primary"
                onClick={handleTextSubmit}
                disabled={!textValue.trim() || isSubmitting}
              >
                <span>{step === questions.length - 1 ? "Finish" : "Continue"}</span>
                <span>→</span>
              </button>
            </>
          )}

          {current?.type === "boolean" && (
            <div className="ob-bool-group">
              <button 
                className="ob-bool-btn" 
                onClick={() => handleAnswer(true)}
                disabled={isSubmitting}
              >
                <span className="ob-bool-icon">✓</span>
                <span className="ob-bool-label">Yes</span>
              </button>
              <button 
                className="ob-bool-btn" 
                onClick={() => handleAnswer(false)}
                disabled={isSubmitting}
              >
                <span className="ob-bool-icon">✕</span>
                <span className="ob-bool-label">No</span>
              </button>
            </div>
          )}

          {current?.type === "select" && (
            <div className="ob-options">
              {current.options.map((opt: string) => (
                <button
                  key={opt}
                  className="ob-option"
                  onClick={() => handleAnswer(opt)}
                  disabled={isSubmitting}
                >
                  <span>{opt}</span>
                  <span className="ob-option-arrow">→</span>
                </button>
              ))}
            </div>
          )}

          {/* Footer: back + dots */}
          <div className="ob-footer">
            <button
              className="ob-back-btn"
              onClick={handleBack}
              disabled={step === 0 || isSubmitting}
            >
              ← Back
            </button>

            <div className="ob-dots">
              {questions.map((_, i) => (
                <div
                  key={i}
                  className={`ob-dot ${i === step ? "active" : i < step ? "done" : ""}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Footnote */}
        <div className="ob-footnote">
          <svg viewBox="0 0 20 20" fill="none" stroke="#5B5BD6" strokeWidth="2" width="18" height="18">
            <circle cx="10" cy="10" r="9" /><path d="M6 10l3 3 5-5" />
          </svg>
          Your answers help us personalize your Career Core AI experience
        </div>

      </div>
    </>
  );
}