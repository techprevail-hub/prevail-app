"use client";

export const dynamic = "force-dynamic";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function CallbackPage() {
  const router = useRouter();
  const [redirectTo, setRedirectTo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(true);

  // Handle redirects
  useEffect(() => {
    if (redirectTo) {
      console.log(`Redirecting to: ${redirectTo}`);
      router.replace(redirectTo); // Use replace instead of push to avoid back button issues
    }
  }, [redirectTo, router]);

  useEffect(() => {
    const handleAuth = async () => {
      try {
        console.log("Starting auth callback...");

        // Get the current session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError || !session?.user) {
          console.error("Session error:", sessionError);
          setRedirectTo("/login");
          return;
        }

        const user = session.user;
        
        // ✅ ADD TOKEN STORAGE FOR GOOGLE/LINKEDIN LOGIN
        if (session?.access_token) {
          localStorage.setItem(
            "token",
            session.access_token
          );
        }
        
        console.log("User authenticated:", user.id);

        // Get user name from metadata
        const userName =
          user.user_metadata?.full_name ||
          user.user_metadata?.name ||
          `${user.user_metadata?.first_name || ""} ${user.user_metadata?.last_name || ""}`.trim() ||
          user.email?.split("@")[0] ||
          "User";

        // ✅ ADD THESE localStorage SETTINGS
        localStorage.setItem("userName", userName);
        localStorage.setItem("userEmail", user.email || "");
        localStorage.setItem("userId", user.id);

        // Check if user exists in database
        const { data: existingUser, error: fetchError } = await supabase
          .from("users")
          .select("id, role")
          .eq("id", user.id)
          .maybeSingle();

        if (fetchError) {
          console.error("Error checking existing user:", fetchError);
        }

        // If user exists but has no role or different scenario
        if (existingUser) {
          console.log("Existing user found:", existingUser);
          
          // If user already has a role, redirect directly
          if (existingUser.role) {
            console.log("User has role:", existingUser.role);
            
            if (existingUser.role === "student" || existingUser.role === "job-seeker") {
              setRedirectTo("/dashboard/seeker");
            } else if (existingUser.role === "coach") {
              setRedirectTo("/dashboard/coach");
            } else if (existingUser.role === "institute") {
              setRedirectTo("/dashboard/institute");
            } else {
              // Invalid role - send to select-role
              localStorage.setItem("userId", user.id);
              setRedirectTo("/select-role");
            }
            return;
          } else {
            // User exists but no role assigned
            console.log("Existing user has no role");
            localStorage.setItem("userId", user.id);
            setRedirectTo("/select-role");
            return;
          }
        }

        // New user - insert into database
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

        // Store userId in localStorage for select-role page
        localStorage.setItem("userId", user.id);
        
        // Redirect to select role page for new users
        setRedirectTo("/select-role");
        
      } catch (err) {
        console.error("Auth callback error:", err);
        setError(err instanceof Error ? err.message : "Authentication failed");
        
        // Don't auto-redirect on error, let user see the error
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