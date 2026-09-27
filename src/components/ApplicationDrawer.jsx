"use client";

import { useEffect, useState } from "react";
import FitRing from "./FitRing";

export default function ApplicationDrawer({
  app,
  hasResume,
  onClose,
  onChange,
  onDelete,
}) {
  const [notes, setNotes] = useState(app.notes ?? "");
  const [gap, setGap] = useState(null);
  const [gapLoading, setGapLoading] = useState(false);
  const [letter, setLetter] = useState("");
  const [letterLoading, setLetterLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Load the most recent saved cover letter, if any.
  useEffect(() => {
    fetch(`/api/cover-letter?applicationId=${app.id}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d?.content && setLetter(d.content))
      .catch(() => {});
  }, [app.id]);

  async function saveNotes() {
    onChange({ id: app.id, notes });
    await fetch(`/api/applications/${app.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notes }),
    });
  }

  async function runGap() {
    setGapLoading(true);
    setGap(null);
    const res = await fetch("/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ applicationId: app.id }),
    });
    setGapLoading(false);
    if (res.ok) setGap(await res.json());
  }

  async function makeLetter() {
    setLetterLoading(true);
    const res = await fetch("/api/cover-letter", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ applicationId: app.id }),
    });
    setLetterLoading(false);
    if (res.ok) {
      const { content } = await res.json();
      setLetter(content);
    }
  }

  async function remove() {
    if (!confirm("Delete this application? This can't be undone.")) return;
    await fetch(`/api/applications/${app.id}`, { method: "DELETE" });
    onDelete(app.id);
  }

  const parsed = app.parsed || {};

  return (
    <div className="fixed inset-0 z-40 flex justify-end bg-ink/30" onClick={onClose}>
      <aside
        className="drawer-in h-full w-full max-w-md overflow-y-auto bg-surface shadow-lift"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 flex items-start gap-3 border-b border-line bg-surface p-5">
          <FitRing score={app.match_score} size={52} stroke={5} />
          <div className="min-w-0 flex-1">
            <h2 className="truncate font-display text-xl">{app.role}</h2>
            <div className="truncate text-sm text-muted">{app.company}</div>
            {parsed.seniority && parsed.seniority !== "unknown" && (
              <div className="mt-1 text-xs text-muted capitalize">
                {parsed.seniority}
                {parsed.salary ? ` · ${parsed.salary}` : ""}
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            className="rounded-lg px-2 py-1 text-muted hover:bg-paper"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="space-y-6 p-5">
          {app.source_url && (
            <a
              href={app.source_url}
              target="_blank"
              rel="noreferrer"
              className="inline-block text-sm text-accent hover:underline"
            >
              View original posting
            </a>
          )}

          {parsed.required_skills?.length > 0 && (
            <Section title="Skills the role wants">
              <div className="flex flex-wrap gap-1.5">
                {parsed.required_skills.map((s) => (
                  <span
                    key={s}
                    className="rounded-md bg-paper px-2 py-1 text-xs"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </Section>
          )}

          <Section title="Gap analysis">
            {!hasResume ? (
              <p className="text-sm text-muted">Add a resume to analyze gaps.</p>
            ) : gap ? (
              <div className="space-y-3 text-sm">
                <Row label="You have" items={gap.matched} tone="accent" />
                <Row label="Missing" items={gap.missing} tone="rejected" />
                {gap.advice && (
                  <p className="rounded-lg bg-paper p-3 text-muted">
                    {gap.advice}
                  </p>
                )}
              </div>
            ) : (
              <button
                onClick={runGap}
                disabled={gapLoading}
                className="rounded-lg border border-line px-3 py-1.5 text-sm hover:bg-paper disabled:opacity-60"
              >
                {gapLoading ? "Analyzing…" : "Analyze gaps"}
              </button>
            )}
          </Section>

          <Section title="Cover letter">
            {!hasResume ? (
              <p className="text-sm text-muted">
                Add a resume to draft a letter.
              </p>
            ) : (
              <>
                <div className="flex gap-2">
                  <button
                    onClick={makeLetter}
                    disabled={letterLoading}
                    className="rounded-lg border border-line px-3 py-1.5 text-sm hover:bg-paper disabled:opacity-60"
                  >
                    {letterLoading
                      ? "Drafting…"
                      : letter
                        ? "Regenerate"
                        : "Draft letter"}
                  </button>
                  {letter && (
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(letter);
                        setCopied(true);
                        setTimeout(() => setCopied(false), 1500);
                      }}
                      className="rounded-lg border border-line px-3 py-1.5 text-sm hover:bg-paper"
                    >
                      {copied ? "Copied" : "Copy"}
                    </button>
                  )}
                </div>
                {letter && (
                  <textarea
                    value={letter}
                    onChange={(e) => setLetter(e.target.value)}
                    rows={12}
                    className="input mt-3 resize-none text-[13px] leading-relaxed"
                  />
                )}
              </>
            )}
          </Section>

          <Section title="Notes">
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              onBlur={saveNotes}
              rows={4}
              className="input resize-none text-sm"
              placeholder="Recruiter name, referral, follow-up date…"
            />
          </Section>

          <button
            onClick={remove}
            className="text-sm text-stage-rejected hover:underline"
          >
            Delete application
          </button>
        </div>
      </aside>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <section>
      <h3 className="mb-2 text-sm font-medium">{title}</h3>
      {children}
    </section>
  );
}

function Row({ label, items, tone }) {
  if (!items?.length) return null;
  const color = tone === "accent" ? "text-accent" : "text-stage-rejected";
  return (
    <div>
      <span className={`text-xs font-medium ${color}`}>{label}</span>
      <div className="mt-1 flex flex-wrap gap-1.5">
        {items.map((s) => (
          <span key={s} className="rounded-md bg-paper px-2 py-1 text-xs">
            {s}
          </span>
        ))}
      </div>
    </div>
  );
}
