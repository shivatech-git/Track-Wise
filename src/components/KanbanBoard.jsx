import ApplicationCard from "./ApplicationCard";

const STAGES = [
  { key: "saved", label: "Saved", color: "#64748B" },
  { key: "applied", label: "Applied", color: "#3B6FB0" },
  { key: "interviewing", label: "Interviewing", color: "#16624F" },
  { key: "offer", label: "Offer", color: "#B8862B" },
  { key: "rejected", label: "Rejected", color: "#A8654A" },
];

export default function KanbanBoard({ apps, onOpen, onMove }) {
  return (
    <div className="board-scroll h-full overflow-x-auto">
      <div className="flex gap-4 p-4 sm:p-6 min-h-full">
        {STAGES.map((stage) => {
          const items = apps.filter((a) => a.status === stage.key);
          return (
            <section
              key={stage.key}
              className="flex w-72 shrink-0 flex-col"
              aria-label={stage.label}
            >
              <div className="flex items-center gap-2 px-1 pb-3">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ background: stage.color }}
                />
                <h2 className="text-sm font-medium">{stage.label}</h2>
                <span className="text-xs text-muted">{items.length}</span>
              </div>

              <div className="flex flex-col gap-2.5">
                {items.map((app) => (
                  <ApplicationCard
                    key={app.id}
                    app={app}
                    stages={STAGES}
                    onOpen={() => onOpen(app.id)}
                    onMove={onMove}
                  />
                ))}

                {items.length === 0 && (
                  <div className="rounded-lg border border-dashed border-line px-3 py-6 text-center text-xs text-muted">
                    Nothing here yet
                  </div>
                )}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
