"use client";

import { useState } from "react";

export default function AddApplicationModal({ onClose, onCreated }) {
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [status, setStatus] = useState({ kind: "idle", message: "" });

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus({
      kind: "loading",
      message: jobDescription
        ? "Reading the posting and scoring fit…"
        : "Saving…",
    });

    const res = await fetch("/api/applications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ company, role, sourceUrl, jobDescription }),
    });

    if (!res.ok) {
      const { error } = await res.json().catch(() => ({}));
      setStatus({ kind: "error", message: error || "Something went wrong." });
      return;
    }

    const { application } = await res.json();
    onCreated(application);
  }

  return (
    <Overlay onClose={onClose}>
      <div className="w-full max-w-lg rounded-2xl bg-surface p-6 shadow-lift">
        <h2 className="font-display text-xl">Add a job</h2>
        <p className="mt-1 text-sm text-muted">
          Paste the description and TrackWise fills in the rest and scores the
          fit. Company and role are optional if the posting includes them.
        </p>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Company">
              <input
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="input"
                placeholder="Optional"
              />
            </Field>
            <Field label="Role">
              <input
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="input"
                placeholder="Optional"
              />
            </Field>
          </div>

          <Field label="Posting URL">
            <input
              value={sourceUrl}
              onChange={(e) => setSourceUrl(e.target.value)}
              className="input"
              placeholder="https://…  (optional)"
            />
          </Field>

          <Field label="Job description">
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              rows={8}
              className="input resize-none font-mono text-[13px]"
              placeholder="Paste the full posting here to unlock fit scoring."
            />
          </Field>

          {status.kind === "error" && (
            <p className="text-sm text-stage-rejected">{status.message}</p>
          )}

          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-line px-4 py-2 text-sm hover:bg-paper"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={status.kind === "loading" || (!company && !jobDescription)}
              className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-60"
            >
              {status.kind === "loading" ? status.message : "Add job"}
            </button>
          </div>
        </form>
      </div>
    </Overlay>
  );
}

/* Small shared bits kept local to avoid over-splitting files. */
export function Overlay({ children, onClose }) {
  return (
    <div
      className="fixed inset-0 z-40 grid place-items-center bg-ink/30 p-4"
      onClick={onClose}
    >
      <div onClick={(e) => e.stopPropagation()}>{children}</div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm">{label}</span>
      {children}
    </label>
  );
}
