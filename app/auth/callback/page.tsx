"use client";

export const dynamic = "force-dynamic";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { api } from "@/utils/apiServices";

export default function CallbackPage() {
  const router = useRouter();
  const [redirectTo, setRedirectTo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(true);

  // Handle redirects
  useEffect(() => {
    if (redirectTo) {
      console.log(`Redirecting to: ${redirectTo}`);
      router.replace(redirectTo);
    }
  }, [redirectTo, router]);

  useEffect(() => {
    const handleAuth = async () => {
      try {
        console.log("Starting auth callback...");

        // ─── Step 1: Get the current session ──────────────────────────
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError || !session?.user) {
          console.error("Session error:", sessionError);
          setRedirectTo("/login");
          return;
        }

        const user = session.user;
        
        // Store token for API calls
        if (session?.access_token) {
          localStorage.setItem("token", session.access_token);
        }
        
        console.log("User authenticated:", user.id);

        // ─── Step 2: Get user name from metadata ──────────────────────
        const userName =
          user.user_metadata?.full_name ||
          user.user_metadata?.name ||
          `${user.user_metadata?.first_name || ""} ${user.user_metadata?.last_name || ""}`.trim() ||
          user.email?.split("@")[0] ||
          "User";

        // Store user info in localStorage
        localStorage.setItem("userName", userName);
        localStorage.setItem("userEmail", user.email || "");
        localStorage.setItem("userId", user.id);

        // ─── Step 3: Check if user exists in database ──────────────────
        const { data: existingUser, error: fetchError } = await supabase
          .from("users")
          .select("id, role")
          .eq("id", user.id)
          .maybeSingle();

        if (fetchError) {
          console.error("Error checking existing user:", fetchError);
        }

        // ─── Step 4: If user doesn't exist, create them ──────────────
        if (!existingUser) {
          console.log("Creating new user...");
          const { error: insertError } = await supabase
            .from("users")
            .insert([
              {
                id: user.id,
                email: user.email,
                name: userName,
                role: null,
              },
            ]);

          if (insertError) {
            console.error("Insert error:", insertError);
            setError(insertError.message);
            return;
          }

          console.log("User created successfully");
        } else {
          console.log("Existing user found:", existingUser);
        }

        // ─── Step 5: Check for invitation token ──────────────────────
        const inviteToken = localStorage.getItem("inviteToken");
        const inviteType = localStorage.getItem("inviteType");

        console.log("Invite Token:", inviteToken);
        console.log("Invite Type:", inviteType);

        if (inviteToken && inviteType) {
          try {
            console.log("Processing invitation...");

            let response;

            // ─── Step 5a: Call the appropriate API based on type ──────
            if (inviteType === "student") {
              console.log("Accepting student invitation...");
              response = await api.post(
                "/api/role-institute/student-invitations/accept",
                {
                  token: inviteToken,
                }
              );
            } else if (inviteType === "coach") {
              console.log("Accepting coach invitation...");
              response = await api.post(
                "/api/role-institute/coach-invitations/accept",
                {
                  token: inviteToken,
                }
              );
            } else {
              console.warn(`Unknown invitation type: ${inviteType}, defaulting to student`);
              // Default to student for backward compatibility
              response = await api.post(
                "/api/role-institute/student-invitations/accept",
                {
                  token: inviteToken,
                }
              );
            }

            console.log("Invitation acceptance response:", response);

            // ─── Step 5b: Handle successful acceptance ────────────────
            if (response?.success) {
              console.log(`Invitation accepted successfully for ${inviteType}!`);
              
              // Remove both token and type after successful acceptance
              localStorage.removeItem("inviteToken");
              localStorage.removeItem("inviteType");
              console.log("Invitation token and type removed from localStorage");

              // ─── Step 5c: Redirect based on invitation type ──────────
              if (inviteType === "student") {
                setRedirectTo("/dashboard/seeker");
              } else if (inviteType === "coach") {
                setRedirectTo("/dashboard/coach");
              } else {
                // Fallback for unknown type
                setRedirectTo("/dashboard/seeker");
              }
              return; // ✅ Stop execution here
            } else {
              console.error("Invitation acceptance failed:", response?.message || "Unknown error");
              // Continue with normal flow if invitation acceptance fails
            }
          } catch (inviteError) {
            console.error("Error accepting invitation:", inviteError);
            // Continue with normal flow if invitation acceptance fails
            // Don't block the user from logging in
          }
        } else {
          console.log("No invitation token or type found in localStorage");
        }

        // ─── Step 6: Normal flow - Check user role and redirect ──────
        
        // If user exists (or was just created)
        if (existingUser) {
          // If user already has a role
          if (existingUser.role) {
            console.log("User has role:", existingUser.role);
            
            // Check if onboarding already exists for this user
            const { data: onboardingData, error: onboardingError } = await supabase
              .from("onboarding")
              .select("id")
              .eq("user_id", user.id)
              .maybeSingle();

            if (onboardingError) {
              console.error("Error checking onboarding:", onboardingError);
            }

            console.log("Onboarding data exists:", !!onboardingData);

            // If onboarding data exists, user has completed onboarding
            if (onboardingData) {
              console.log("User has completed onboarding, redirecting to dashboard");
              // User has completed onboarding - go to dashboard
              if (existingUser.role === "student" || existingUser.role === "job_seeker") {
                setRedirectTo("/dashboard/seeker");
              } else if (existingUser.role === "coach") {
                setRedirectTo("/dashboard/coach");
              } else if (existingUser.role === "institute") {
                setRedirectTo("/dashboard/institute");
              } else {
                setRedirectTo("/select-role");
              }
            } else {
              console.log("User has role but no onboarding data, redirecting to onboarding");
              // User has role but hasn't completed onboarding
              localStorage.setItem("userRole", existingUser.role);
              setRedirectTo("/onboarding");
            }
            return;
          } else {
            // User exists but no role assigned
            console.log("Existing user has no role");
            localStorage.setItem("userId", user.id);
            setRedirectTo("/select-role");
            return;
          }
        } else {
          // This is a new user (just inserted)
          console.log("New user created, redirecting to select-role");
          localStorage.setItem("userId", user.id);
          setRedirectTo("/select-role");
        }
        
      } catch (err) {
        console.error("Auth callback error:", err);
        setError(err instanceof Error ? err.message : "Authentication failed");
        
        setTimeout(() => {
          setRedirectTo("/login");
        }, 3000);
      } finally {
        setIsProcessing(false);
      }
    };

    handleAuth();
  }, []);

  // Error UI
  if (error) {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#F0F0FF"
      }}>
        <div style={{ textAlign: "center", maxWidth: "400px", padding: "20px" }}>
          <h3 style={{ color: "#DC2626", marginBottom: "10px" }}>Authentication Error</h3>
          <p style={{ color: "#666", marginBottom: "20px" }}>{error}</p>
          <button
            onClick={() => router.push("/login")}
            style={{
              padding: "10px 20px",
              background: "#6B4EFF",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer"
            }}
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // Loading UI
  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      background: "#F0F0FF"
    }}>
      <div style={{ textAlign: "center" }}>
        <div style={{
          width: "40px",
          height: "40px",
          border: "3px solid #6B4EFF",
          borderTop: "3px solid transparent",
          borderRadius: "50%",
          animation: "spin 1s linear infinite",
          margin: "0 auto 20px"
        }} />
        <p>Logging you in...</p>
      </div>
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}