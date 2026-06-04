// app/onboarding/page.tsx
"use client";

import { useEffect, useState } from "react";
import { onboardingConfig } from "@/lib/onboardingConfig";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function Onboarding() {
  console.log("=== ONBOARDING PAGE LOADED ===");
  console.log("localStorage userRole:", localStorage.getItem("userRole"));
  console.log("localStorage userId:", localStorage.getItem("userId"));
  
  const router = useRouter();

  const [role, setRole] = useState<string | null>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<any>({});
  const [textValue, setTextValue] = useState("");
  const [animating, setAnimating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const storedRole = localStorage.getItem("userRole");
    const storedUserId = localStorage.getItem("userId");

    console.log("=== USEFFECT TRIGGERED ===");
    console.log("Stored Role:", storedRole);
    console.log("Stored UserId:", storedUserId);
    console.log("Available onboarding config keys:", Object.keys(onboardingConfig));

    if (!storedRole) {
      console.log("No role found, redirecting to select-role");
      router.replace("/select-role");
      return;
    }

    // Check if role exists in config
    const roleQuestions = onboardingConfig[storedRole as keyof typeof onboardingConfig];
    
    console.log(`Questions found for role "${storedRole}":`, roleQuestions);

    if (!roleQuestions || roleQuestions.length === 0) {
      console.error(`No onboarding questions found for role: ${storedRole}`);
      setError(`No onboarding questions found for role: ${storedRole}`);
      
      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        if (storedRole === "student" || storedRole === "job_seeker") {
          router.replace("/dashboard/seeker");
        } else if (storedRole === "coach") {
          router.replace("/dashboard/coach");
        } else if (storedRole === "institute") {
          router.replace("/dashboard/institute");
        } else {
          router.replace("/dashboard");
        }
      }, 2000);
      return;
    }

    console.log("Setting role and questions...");
    setRole(storedRole);
    setQuestions(roleQuestions);
    setIsLoading(false);
    console.log("State updated successfully, questions length:", roleQuestions.length);
    
  }, [router]);

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
      const userRole = localStorage.getItem("userRole");

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
      }

      // Now insert the new onboarding data
      const { error: insertError } = await supabase
        .from("onboarding")
        .insert([
          {
            user_id: userId,
            role: userRole,
            data: finalData,
            created_at: new Date().toISOString(),
          }
        ]);

      if (insertError) {
        console.error("Error saving onboarding:", insertError);
        setIsSubmitting(false);
        
        if (insertError.code === "23505") {
          alert("Your information was already saved. Redirecting to dashboard...");
        } else {
          alert("There was an error saving your information. Please try again.");
          return;
        }
      }

      console.log("Onboarding data saved successfully");
      
      // ✅ UPDATE USER ROLE IN USERS TABLE (Save role permanently)
      const { error: roleUpdateError } = await supabase
        .from("users")
        .update({
          role: userRole,
        })
        .eq("id", userId);

      if (roleUpdateError) {
        console.error("Role update error:", roleUpdateError);
        // Continue anyway, the onboarding data is saved
      } else {
        console.log("Role updated successfully in users table");
      }
      
      // Add a delay to ensure the database write is complete
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Redirect based on role
      if (userRole === "student" || userRole === "job_seeker") {
        window.location.href = "/dashboard/seeker";
      } else if (userRole === "coach") {
        window.location.href = "/dashboard/coach";
      } else if (userRole === "institute") {
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

  // Show error state
  if (error) {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#F0F0FF",
        fontFamily: "'DM Sans', system-ui, sans-serif"
      }}>
        <div style={{ textAlign: "center", padding: "20px" }}>
          <div style={{
            width: "48px",
            height: "48px",
            background: "#fee2e2",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 20px"
          }}>
            <span style={{ fontSize: "24px" }}>⚠️</span>
          </div>
          <h2 style={{ color: "#0F0F2D", marginBottom: "8px" }}>Configuration Error</h2>
          <p style={{ color: "#4B4B6B" }}>{error}</p>
          <p style={{ color: "#9999BB", marginTop: "16px", fontSize: "14px" }}>
            Redirecting to dashboard...
          </p>
        </div>
      </div>
    );
  }

  // Show loading state
  if (isLoading) {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#F0F0FF",
        fontFamily: "'DM Sans', system-ui, sans-serif"
      }}>
        <div style={{ textAlign: "center" }}>
          <div style={{
            width: "48px",
            height: "48px",
            border: "3px solid #E4E4F0",
            borderTopColor: "#5B5BD6",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
            margin: "0 auto 20px"
          }} />
          <p style={{ color: "#4B4B6B" }}>Loading your questions...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  const current = questions[step];
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
        }

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
        }

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
        <div style={{ width: "100%", maxWidth: "560px", marginBottom: "12px" }}>
          <span className="ob-badge">ONBOARDING — {role?.toUpperCase()}</span>
        </div>

        <div className={`ob-card${animating ? " animating" : ""}`}>
          <div className="ob-step-label">Step {step + 1} of {questions.length}</div>
          <div className="ob-progress-bar">
            <div className="ob-progress-fill" style={{ width: `${progress}%` }} />
          </div>

          <h2 className="ob-question">{current?.question}</h2>

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