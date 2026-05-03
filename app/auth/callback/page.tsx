"use client";

export const dynamic = "force-dynamic";

import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function CallbackPage() {
  const router = useRouter();
  const [redirectTo, setRedirectTo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Handle redirect
  useEffect(() => {
    if (redirectTo) {
      router.push(redirectTo);
    }
  }, [redirectTo, router]);

  useEffect(() => {
    const handleAuth = async () => {
      try {
        console.log("Starting auth callback...");

        // ✅ SAFE ENV ACCESS (VERY IMPORTANT)
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

        if (!supabaseUrl || !supabaseKey) {
          throw new Error("Missing Supabase environment variables");
        }

        // ✅ Create client at runtime (fixes build crash)
        const supabase = createClient(supabaseUrl, supabaseKey);

        // Get session
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError || !session?.user) {
          console.error("Session error:", sessionError);
          setRedirectTo("/login");
          return;
        }

        const user = session.user;

        const userName =
          user.user_metadata?.full_name ||
          user.user_metadata?.name ||
          `${user.user_metadata?.first_name || ""} ${
            user.user_metadata?.last_name || ""
          }`.trim() ||
          user.email?.split("@")[0] ||
          "User";

        // Check if user exists
        const { data: existingUser } = await supabase
          .from("users")
          .select("id, role")
          .eq("id", user.id)
          .maybeSingle();

        if (existingUser) {
          await supabase.auth.signOut();

          const errorMessage = encodeURIComponent(
            "You already have an account. Please login using email."
          );

          setRedirectTo(`/auth/error?message=${errorMessage}`);
          return;
        }

        // Insert new user
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
          setError(insertError.message);
          return;
        }

        // Get role
        const { data: finalUser } = await supabase
          .from("users")
          .select("role")
          .eq("id", user.id)
          .maybeSingle();

        let userRole = finalUser?.role;

        // Optional backend sync
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
          console.warn("API sync failed (non-critical):", apiError);
        }

        // Redirect based on role
        if (userRole) {
          setRedirectTo("/dashboard");
        } else {
          localStorage.setItem("userId", user.id);
          setRedirectTo("/select-role");
        }
      } catch (err) {
        console.error("Auth callback error:", err);

        setError(
          err instanceof Error ? err.message : "Authentication failed"
        );

        setTimeout(() => {
          setRedirectTo("/login");
        }, 3000);
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
        <div style={{ textAlign: "center" }}>
          <h3 style={{ color: "#DC2626" }}>Authentication Error</h3>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  // Loading UI
  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }}>
      <p>Logging you in...</p>
    </div>
  );
}