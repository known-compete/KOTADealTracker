"use client";

import { useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function HomePage() {
  const [loading, setLoading] = useState(false);

  async function handleSignInWithGoogle() {
    try {
      setLoading(true);

      const origin = window.location.origin;

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: origin,
        },
      });

      if (error) {
        console.error("Error signing in with Google:", error.message);
        return;
      }

      if (data?.url) {
        window.location.href = data.url;
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-6 text-center">
        <h1 className="text-3xl font-semibold tracking-tight">
          KOTA Deal Network
        </h1>
        <p className="text-sm text-slate-400">
          Private deal-sharing for operators, investors, and advisors.
        </p>

        <button
          type="button"
          onClick={handleSignInWithGoogle}
          className="inline-flex w-full items-center justify-center rounded-md bg-sky-500 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-sky-600 transition disabled:opacity-70"
          disabled={loading}
        >
          {loading ? "Redirecting..." : "Sign in with Google"}
        </button>
      </div>
    </main>
  );
}
