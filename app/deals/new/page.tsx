"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "../../../lib/supabaseClient";

const DEAL_TYPES = ["Investment", "BD", "M&A"] as const;
const STAGES = ["Sourced", "Diligencing", "Passed", "Closed"] as const;

export default function NewDealPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [companyName, setCompanyName] = useState("");
  const [description, setDescription] = useState("");
  const [dealType, setDealType] = useState<string>("");
  const [stage, setStage] = useState<string>("");
  const [checkSize, setCheckSize] = useState("");
  const [valuation, setValuation] = useState("");
  const [terms, setTerms] = useState("");

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.replace("/");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});

    const newErrors: Record<string, string> = {};
    if (!companyName.trim()) {
      newErrors.company_name = "Company name is required.";
    }
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session?.user) {
      setErrors({ form: "You must be signed in to post a deal." });
      return;
    }

    setSubmitting(true);

    const { error } = await supabase.from("deals").insert({
      company_name: companyName.trim(),
      description: description.trim() || null,
      deal_type: dealType || null,
      stage: stage || null,
      sourced_by: session.user.id,
      // check_size and valuation stored as text (e.g. "$15M", "$100M pre-money")
      check_size: checkSize.trim() || null,
      valuation: valuation.trim() || null,
      terms: terms.trim() || null,
    });

    if (error) {
      setErrors({ form: error.message });
      setSubmitting(false);
      return;
    }

    router.replace("/deals");
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
        <h2 className="mb-6 text-xl font-semibold text-white">Post a Deal</h2>

        {errors.form && (
          <div className="mb-4 rounded-md border border-red-900/50 bg-red-950/30 px-4 py-3 text-sm text-red-300">
            {errors.form}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="company_name" className="mb-1 block text-sm font-medium text-slate-300">
              Company name <span className="text-red-400">*</span>
            </label>
            <input
              id="company_name"
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-white placeholder-slate-500 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
              placeholder="Acme Inc."
              aria-invalid={!!errors.company_name}
              aria-describedby={errors.company_name ? "company_name_error" : undefined}
            />
            {errors.company_name && (
              <p id="company_name_error" className="mt-1 text-sm text-red-400">
                {errors.company_name}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="description" className="mb-1 block text-sm font-medium text-slate-300">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-white placeholder-slate-500 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
              placeholder="Brief overview of the company and opportunity..."
            />
          </div>

          <div>
            <label htmlFor="deal_type" className="mb-1 block text-sm font-medium text-slate-300">
              Deal type
            </label>
            <select
              id="deal_type"
              value={dealType}
              onChange={(e) => setDealType(e.target.value)}
              className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-white focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
            >
              <option value="">Select...</option>
              {DEAL_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="stage" className="mb-1 block text-sm font-medium text-slate-300">
              Stage
            </label>
            <select
              id="stage"
              value={stage}
              onChange={(e) => setStage(e.target.value)}
              className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-white focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
            >
              <option value="">Select...</option>
              {STAGES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="check_size" className="mb-1 block text-sm font-medium text-slate-300">
              Check size
            </label>
            <input
              id="check_size"
              type="text"
              value={checkSize}
              onChange={(e) => setCheckSize(e.target.value)}
              className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-white placeholder-slate-500 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
              placeholder="e.g. $2M"
            />
          </div>

          <div>
            <label htmlFor="valuation" className="mb-1 block text-sm font-medium text-slate-300">
              Valuation
            </label>
            <input
              id="valuation"
              type="text"
              value={valuation}
              onChange={(e) => setValuation(e.target.value)}
              className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-white placeholder-slate-500 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
              placeholder="e.g. $20M pre"
            />
          </div>

          <div>
            <label htmlFor="terms" className="mb-1 block text-sm font-medium text-slate-300">
              Terms
            </label>
            <textarea
              id="terms"
              value={terms}
              onChange={(e) => setTerms(e.target.value)}
              rows={3}
              className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-white placeholder-slate-500 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
              placeholder="Key terms or notes..."
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="rounded-md bg-sky-500 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-sky-600 transition disabled:opacity-70"
            >
              {submitting ? "Posting..." : "Post Deal"}
            </button>
            <Link
              href="/deals"
              className="rounded-md border border-slate-600 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800 transition"
            >
              Cancel
            </Link>
          </div>
        </form>
      </main>
    </div>
  );
}
