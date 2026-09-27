"use client";

import { useEffect, useState } from "react";
import { Overlay } from "./AddApplicationModal";

export default function ResumeModal({ onClose, onSaved }) {
  const [text, setText] = useState("");
  const [status, setStatus] = useState({ kind: "idle", message: "" });

  // Prefill with the existing resume so editing keeps prior text.
  useEffect(() => {
    fetch("/api/resume")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d?.raw_text && setText(d.raw_text))
      .catch(() => {});
  }, []);

  async function handleSave() {
    if (text.trim().length < 30) {
      setStatus({ kind: "error", message: "Paste a bit more of your resume." });
      return;
    }
    setStatus({ kind: "loading", message: "Saving and embedding…" });

    const res = await fetch("/api/resume", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rawText: text }),
    });

    if (!res.ok) {
      const { error } = await res.json().catch(() => ({}));
      setStatus({ kind: "error", message: error || "Could not save." });
      return;
    }
    onSaved();
  }

  return (
    <Overlay onClose={onClose}>
      <div className="w-full max-w-lg rounded-2xl bg-surface p-6 shadow-lift">
        <h2 className="font-display text-xl">Your resume</h2>
        <p className="mt-1 text-sm text-muted">
          Paste it as plain text. It stays on your account and powers fit scores,
          gap analysis, and cover letters. It never goes to a third party for
          embedding — that runs on the server.
        </p>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={12}
          className="input mt-4 resize-none font-mono text-[13px]"
          placeholder="Paste your full resume here…"
        />

        {status.kind === "error" && (
          <p className="mt-2 text-sm text-stage-rejected">{status.message}</p>
        )}

        <div className="mt-4 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-lg border border-line px-4 py-2 text-sm hover:bg-paper"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={status.kind === "loading"}
            className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-60"
          >
            {status.kind === "loading" ? status.message : "Save resume"}
          </button>
        </div>
      </div>
    </Overlay>
  );
}
