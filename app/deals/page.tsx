"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "../../lib/supabaseClient";

type DealRow = {
  id: string;
  company_name: string;
  deal_type: string | null;
  stage: string | null;
  created_at: string;
  sourced_by: string;
  users: { name: string | null } | null;
};

export default function DealsPage() {
  const router = useRouter();
  const [deals, setDeals] = useState<DealRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDeals() {
      const { data, error } = await supabase
        .from("deals")
        .select("id, company_name, deal_type, stage, created_at, sourced_by, users!sourced_by(name)")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching deals:", error);
      } else {
        setDeals(data ?? []);
      }
      setLoading(false);
    }

    fetchDeals();
  }, []);

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.replace("/");
  }

  function formatDate(iso: string) {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-10 border-b border-slate-800 bg-slate-950/95 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-4">
          <Link href="/deals" className="text-lg font-semibold tracking-tight text-white">
            KOTA Deal Network
          </Link>
          <button
            type="button"
            onClick={handleSignOut}
            className="rounded-md px-3 py-1.5 text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition"
          >
            Sign out
          </button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-6">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">Deals</h2>
          <Link
            href="/deals/new"
            className="inline-flex items-center justify-center rounded-md bg-sky-500 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-sky-600 transition"
          >
            Post a Deal
          </Link>
        </div>

        {loading ? (
          <p className="text-slate-400 text-sm">Loading deals...</p>
        ) : deals.length === 0 ? (
          <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-12 text-center">
            <p className="text-slate-400">No deals yet. Be the first to post one.</p>
          </div>
        ) : (
          <ul className="space-y-4">
            {deals.map((deal) => (
              <li key={deal.id}>
                <Link
                  href={`/deals/${deal.id}`}
                  className="block rounded-lg border border-slate-800 bg-slate-900/50 p-4 transition hover:border-slate-700"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <h3 className="font-medium text-white">{deal.company_name}</h3>
                    <span className="text-xs text-slate-500">
                      {formatDate(deal.created_at)}
                    </span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {deal.deal_type && (
                      <span className="inline-flex items-center rounded-md bg-sky-500/20 px-2 py-0.5 text-xs font-medium text-sky-300">
                        {deal.deal_type}
                      </span>
                    )}
                    {deal.stage && (
                      <span className="inline-flex items-center rounded-md bg-slate-700 px-2 py-0.5 text-xs font-medium text-slate-300">
                        {deal.stage}
                      </span>
                    )}
                  </div>
                  <p className="mt-2 text-sm text-slate-400">
                    Sourced by {deal.users?.name ?? "Unknown"}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
