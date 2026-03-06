"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "../../../lib/supabaseClient";

type Deal = {
  id: string;
  company_name: string;
  description: string | null;
  deal_type: string | null;
  stage: string | null;
  check_size: string | null;
  valuation: string | null;
  terms: string | null;
  created_at: string;
  sourced_by: string;
  users: { name: string | null } | null;
};

type CommentRow = {
  id: string;
  body: string;
  created_at: string;
  user_id: string;
  users: { name: string | null } | null;
};

export default function DealDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [deal, setDeal] = useState<Deal | null>(null);
  const [comments, setComments] = useState<CommentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentBody, setCommentBody] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);

  useEffect(() => {
    if (!id) return;

    async function fetchDeal() {
      const { data, error } = await supabase
        .from("deals")
        .select(
          "id, company_name, description, deal_type, stage, check_size, valuation, terms, created_at, sourced_by, users!sourced_by(name)"
        )
        .eq("id", id)
        .single();

      if (error || !data) {
        setDeal(null);
        setLoading(false);
        return;
      }
      setDeal(data);
      setLoading(false);
    }

    fetchDeal();
  }, [id]);

  useEffect(() => {
    if (!id) return;

    async function fetchComments() {
      const { data } = await supabase
        .from("comments")
        .select("id, body, created_at, user_id, users!user_id(name)")
        .eq("deal_id", id)
        .order("created_at", { ascending: true });
      setComments(data ?? []);
    }

    if (deal) fetchComments();
  }, [id, deal]);

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.replace("/");
  }

  async function handleAddComment(e: React.FormEvent) {
    e.preventDefault();
    const body = commentBody.trim();
    if (!body || !id) return;

    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session?.user) return;

    setSubmittingComment(true);
    const { error } = await supabase.from("comments").insert({
      deal_id: id,
      user_id: session.user.id,
      body,
    });

    if (!error) {
      setCommentBody("");
      const { data } = await supabase
        .from("comments")
        .select("id, body, created_at, user_id, users!user_id(name)")
        .eq("deal_id", id)
        .order("created_at", { ascending: true });
      setComments(data ?? []);
    }
    setSubmittingComment(false);
  }

  function formatDate(iso: string) {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  if (loading) {
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
          <p className="text-slate-400 text-sm">Loading...</p>
        </main>
      </div>
    );
  }

  if (!deal) {
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
          <p className="text-slate-400">Deal not found.</p>
          <Link href="/deals" className="mt-2 inline-block text-sm text-sky-400 hover:underline">
            Back to deals
          </Link>
        </main>
      </div>
    );
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
        <Link href="/deals" className="mb-4 inline-block text-sm text-slate-400 hover:text-white">
          ← Back to deals
        </Link>

        <article className="rounded-lg border border-slate-800 bg-slate-900/50 p-6">
          <h1 className="text-2xl font-semibold text-white">{deal.company_name}</h1>
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

          {deal.description && (
            <div className="mt-4">
              <h2 className="text-sm font-medium text-slate-400">Description</h2>
              <p className="mt-1 whitespace-pre-wrap text-slate-200">{deal.description}</p>
            </div>
          )}

          <div className="mt-4 flex flex-wrap gap-6 text-sm">
            {deal.check_size && (
              <div>
                <span className="text-slate-500">Check size</span>
                <p className="text-slate-200">{deal.check_size}</p>
              </div>
            )}
            {deal.valuation && (
              <div>
                <span className="text-slate-500">Valuation</span>
                <p className="text-slate-200">{deal.valuation}</p>
              </div>
            )}
            {deal.terms && (
              <div className="min-w-0 flex-1">
                <span className="text-slate-500">Terms</span>
                <p className="mt-0.5 whitespace-pre-wrap text-slate-200">{deal.terms}</p>
              </div>
            )}
          </div>

          <p className="mt-4 text-sm text-slate-400">
            Sourced by {deal.users?.name ?? "Unknown"} · {formatDate(deal.created_at)}
          </p>
        </article>

        <section className="mt-8">
          <h2 className="mb-4 text-lg font-semibold text-white">Comments</h2>

          {comments.length === 0 ? (
            <p className="text-sm text-slate-500">No comments yet.</p>
          ) : (
            <ul className="space-y-4">
              {comments.map((c) => (
                <li
                  key={c.id}
                  className="rounded-lg border border-slate-800 bg-slate-900/50 p-4"
                >
                  <p className="text-slate-200">{c.body}</p>
                  <p className="mt-2 text-xs text-slate-500">
                    {c.users?.name ?? "Unknown"} · {formatDate(c.created_at)}
                  </p>
                </li>
              ))}
            </ul>
          )}

          <form onSubmit={handleAddComment} className="mt-4">
            <textarea
              value={commentBody}
              onChange={(e) => setCommentBody(e.target.value)}
              placeholder="Add a comment..."
              rows={3}
              className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-white placeholder-slate-500 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
            />
            <button
              type="submit"
              disabled={submittingComment || !commentBody.trim()}
              className="mt-2 rounded-md bg-sky-500 px-4 py-2 text-sm font-medium text-white hover:bg-sky-600 transition disabled:opacity-70"
            >
              {submittingComment ? "Posting..." : "Post comment"}
            </button>
          </form>
        </section>
      </main>
    </div>
  );
}
