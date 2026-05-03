// app/auth/callback/page.tsx (updated version)
"use client";

import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_KEY!
);

export default function CallbackPage() {
  const router = useRouter();
  const [redirectTo, setRedirectTo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (redirectTo) {
      router.push(redirectTo);
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
        console.log("User found:", user.id, user.email);

        // Get the user's name from metadata
        const userName = user.user_metadata?.full_name || 
                        user.user_metadata?.name ||
                        `${user.user_metadata?.first_name || ""} ${user.user_metadata?.last_name || ""}`.trim() ||
                        user.email?.split("@")[0] ||
                        "User";

        // Check if user already exists in 'users' table
        const { data: existingUser, error: fetchError } = await supabase
          .from("users")
          .select("id, role")
          .eq("id", user.id)
          .maybeSingle();

        if (fetchError) {
          console.error("Error fetching user:", fetchError);
        }

        console.log("Existing user:", existingUser);

        // If user already exists, redirect to error page
        if (existingUser) {
          // ❌ Already exists → block login and redirect to error page
          await supabase.auth.signOut();
          
          // Redirect to the error page with a message
          const errorMessage = encodeURIComponent("You already have an account. Please login using email.");
          setRedirectTo(`/auth/error?message=${errorMessage}`);
          return;
        }

        // ✅ New user → allow signup
        const userData = {
          id: user.id,
          email: user.email,
          name: userName,
          role: null,
        };

        const { error: insertError } = await supabase
          .from("users")
          .insert([userData]);

        if (insertError) {
          setError(insertError.message);
          return;
        }
        
        // Get the user's role from 'users' table
        const { data: finalUser, error: finalFetchError } = await supabase
          .from("users")
          .select("role")
          .eq("id", user.id)
          .maybeSingle();

        if (finalFetchError) {
          console.error("Error fetching final user:", finalFetchError);
        }

        console.log("User role:", finalUser?.role);

        // Try to sync with backend API (optional)
        let userRole = finalUser?.role;

        try {
          const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
          
          if (apiBaseUrl) {
            const res = await fetch(`${apiBaseUrl}/api/user/sync`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                id: user.id,
                email: user.email,
                name: userName,
              }),
            });

            if (res.ok) {
              const result = await res.json();
              userRole = result.user?.role || userRole;
            }
          }
        } catch (apiError) {
          console.warn("API sync error (non-critical):", apiError);
        }

        // Role logic
        if (userRole) {
          console.log("User has role, redirecting to dashboard");
          setRedirectTo("/dashboard");
        } else {
          console.log("User has no role, redirecting to role selection");
          localStorage.setItem("userId", user.id);
          setRedirectTo("/select-role");
        }
        
      } catch (error) {
        console.error("Auth callback error:", error);
        setError(error instanceof Error ? error.message : "Authentication failed");
        setTimeout(() => {
          setRedirectTo("/login");
        }, 3000);
      }
    };

    handleAuth();
  }, []);

  if (error) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#F0F0FF',
        fontFamily: "'DM Sans', system-ui, sans-serif"
      }}>
        <div style={{ textAlign: 'center', maxWidth: '400px', padding: '20px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            background: '#FEE2E2',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px'
          }}>
            <span style={{ fontSize: '24px' }}>⚠️</span>
          </div>
          <h3 style={{ color: '#DC2626', marginBottom: '10px' }}>Authentication Error</h3>
          <p style={{ color: '#4B4B6B', marginBottom: '20px' }}>{error}</p>
          <p style={{ color: '#9999BB', fontSize: '14px' }}>Redirecting to login...</p>
        </div>
      </div>
    );
  }

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
        <p style={{ color: '#4B4B6B' }}>Logging you in...</p>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </div>
  );
}