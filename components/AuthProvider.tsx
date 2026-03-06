"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "../lib/supabaseClient";
import { ensureUserRecord } from "../app/actions/auth";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    let isMounted = true;

    async function initAuth() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const isLoginRoute = pathname === "/";
      const isProtectedRoute = !isLoginRoute;

      if (!session) {
        if (isProtectedRoute) {
          router.replace("/");
        }
        if (isMounted) setLoading(false);
        return;
      }

      // Redirect authenticated users from login page to deals
      if (isLoginRoute) {
        router.replace("/deals");
        if (isMounted) setLoading(false);
        return;
      }

      const user = session.user;
      const userPayload = {
        id: user.id,
        email: user.email ?? null,
        name:
          (user.user_metadata as { full_name?: string })?.full_name ??
          (user.user_metadata as { name?: string })?.name ??
          null,
        avatar_url:
          (user.user_metadata as { avatar_url?: string })?.avatar_url ?? null,
      };

      try {
        const { error } = await ensureUserRecord(userPayload);
        if (error) {
          console.error("[AuthProvider] public.users upsert failed:", error);
        } else {
          console.log("[AuthProvider] public.users upsert ok for", user.id);
        }
      } catch (err) {
        console.error("[AuthProvider] public.users upsert error:", err);
      }

      if (isMounted) setLoading(false);
    }

    initAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const isLoginRoute = pathname === "/";
      const isProtectedRoute = !isLoginRoute;

      if (!session && isProtectedRoute) {
        router.replace("/");
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [pathname, router]);

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-slate-400 text-sm">Loading...</p>
      </main>
    );
  }

  return <>{children}</>;
}
