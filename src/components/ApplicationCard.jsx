import FitRing from "./FitRing";

export default function ApplicationCard({ app, stages, onOpen, onMove }) {
  const idx = stages.findIndex((s) => s.key === app.status);
  const prev = stages[idx - 1];
  const next = stages[idx + 1];
  const skills = app.parsed?.required_skills?.slice(0, 3) ?? [];

  return (
    <div className="group rounded-xl border border-line bg-surface shadow-card hover:shadow-lift transition-shadow">
      <button
        onClick={onOpen}
        className="w-full text-left p-3 flex gap-3"
        aria-label={`Open ${app.role} at ${app.company}`}
      >
        <FitRing score={app.match_score} />
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-medium">{app.role}</div>
          <div className="truncate text-sm text-muted">{app.company}</div>
          {skills.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {skills.map((s) => (
                <span
                  key={s}
                  className="rounded-md bg-paper px-1.5 py-0.5 text-[11px] text-muted"
                >
                  {s}
                </span>
              ))}
            </div>
          )}
        </div>
      </button>

      {/* Stage controls. Simple, reliable move-left / move-right between columns.
          (Swap for drag-and-drop with @hello-pangea/dnd later — same handler.) */}
      <div className="flex items-center justify-between border-t border-line px-2 py-1.5">
        <button
          disabled={!prev}
          onClick={() => prev && onMove(app.id, prev.key)}
          className="rounded px-2 py-0.5 text-xs text-muted hover:text-ink disabled:opacity-30"
          title={prev ? `Move to ${prev.label}` : ""}
        >
          ← {prev?.label ?? ""}
        </button>
        <button
          disabled={!next}
          onClick={() => next && onMove(app.id, next.key)}
          className="rounded px-2 py-0.5 text-xs text-muted hover:text-ink disabled:opacity-30"
          title={next ? `Move to ${next.label}` : ""}
        >
          {next?.label ?? ""} →
        </button>
      </div>
    </div>
  );
}
