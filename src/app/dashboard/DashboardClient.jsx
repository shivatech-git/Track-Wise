"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import KanbanBoard from "@/components/KanbanBoard";
import AddApplicationModal from "@/components/AddApplicationModal";
import ResumeModal from "@/components/ResumeModal";
import ApplicationDrawer from "@/components/ApplicationDrawer";

export default function DashboardClient({
  initialApplications,
  hasResume,
  userEmail,
}) {
  const router = useRouter();
  const supabase = createClient();

  const [apps, setApps] = useState(initialApplications);
  const [addOpen, setAddOpen] = useState(false);
  const [resumeOpen, setResumeOpen] = useState(false);
  const [activeId, setActiveId] = useState(null);

  const activeApp = apps.find((a) => a.id === activeId) || null;

  const stats = useMemo(() => {
    const scored = apps.filter((a) => typeof a.match_score === "number");
    const avg = scored.length
      ? Math.round(
          scored.reduce((s, a) => s + a.match_score, 0) / scored.length
        )
      : null;
    const active = apps.filter((a) =>
      ["applied", "interviewing", "offer"].includes(a.status)
    ).length;
    return { total: apps.length, active, avg };
  }, [apps]);

  // Optimistic local updates, then a background revalidate keeps SSR in sync.
  function upsertLocal(app) {
    setApps((prev) => {
      const exists = prev.some((a) => a.id === app.id);
      return exists
        ? prev.map((a) => (a.id === app.id ? { ...a, ...app } : a))
        : [app, ...prev];
    });
  }
  function removeLocal(id) {
    setApps((prev) => prev.filter((a) => a.id !== id));
  }

  async function moveStage(id, status) {
    upsertLocal({ id, status });
    await fetch(`/api/applications/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    router.refresh();
  }

  async function signOut() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-line bg-surface/80 backdrop-blur sticky top-0 z-20">
        <div className="px-4 sm:px-6 py-3 flex items-center gap-4">
          <div className="font-display text-lg">TrackWise</div>

          <div className="hidden sm:flex items-center gap-5 text-sm text-muted ml-2">
            <span>
              <strong className="text-ink">{stats.total}</strong> tracked
            </span>
            <span>
              <strong className="text-ink">{stats.active}</strong> in play
            </span>
            <span>
              avg fit{" "}
              <strong className="text-ink">
                {stats.avg === null ? "–" : stats.avg}
              </strong>
            </span>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={() => setResumeOpen(true)}
              className="rounded-lg border border-line px-3 py-1.5 text-sm hover:bg-paper"
            >
              {hasResume ? "Resume" : "Add resume"}
            </button>
            <button
              onClick={() => setAddOpen(true)}
              className="rounded-lg bg-accent px-3 py-1.5 text-sm font-medium text-white hover:opacity-90"
            >
              Add job
            </button>
            <button
              onClick={signOut}
              title={userEmail}
              className="rounded-lg border border-line px-3 py-1.5 text-sm hover:bg-paper"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      {!hasResume && (
        <div className="bg-accent-soft border-b border-line px-4 sm:px-6 py-2.5 text-sm text-accent">
          Add your resume to unlock fit scores, gap analysis, and cover letters.{" "}
          <button
            onClick={() => setResumeOpen(true)}
            className="font-medium underline underline-offset-2"
          >
            Add it now
          </button>
        </div>
      )}

      <main className="flex-1 overflow-hidden">
        <KanbanBoard
          apps={apps}
          onOpen={setActiveId}
          onMove={moveStage}
        />
      </main>

      {addOpen && (
        <AddApplicationModal
          onClose={() => setAddOpen(false)}
          onCreated={(app) => {
            upsertLocal(app);
            setAddOpen(false);
            router.refresh();
          }}
        />
      )}

      {resumeOpen && (
        <ResumeModal
          onClose={() => setResumeOpen(false)}
          onSaved={() => {
            setResumeOpen(false);
            router.refresh();
          }}
        />
      )}

      {activeApp && (
        <ApplicationDrawer
          app={activeApp}
          hasResume={hasResume}
          onClose={() => setActiveId(null)}
          onChange={upsertLocal}
          onDelete={(id) => {
            removeLocal(id);
            setActiveId(null);
            router.refresh();
          }}
        />
      )}
    </div>
  );
}
