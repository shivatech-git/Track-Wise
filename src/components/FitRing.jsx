// The signature element: a compact ring that reads a job's fit at a glance.
// Color shifts red -> amber -> green with the score, so a wall of cards is
// scannable without reading a single number.

function scoreColor(score) {
  if (score >= 75) return "#16624F"; // strong
  if (score >= 50) return "#B8862B"; // decent
  if (score >= 25) return "#C08A70"; // weak
  return "#A8654A"; // poor
}

export default function FitRing({ score, size = 44, stroke = 4 }) {
  const hasScore = typeof score === "number";
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = hasScore ? Math.max(0, Math.min(100, score)) : 0;
  const offset = circumference - (pct / 100) * circumference;
  const color = hasScore ? scoreColor(pct) : "#D8D4CC";

  return (
    <div
      className="relative shrink-0"
      style={{ width: size, height: size }}
      title={hasScore ? `Fit score ${pct}/100` : "No fit score yet"}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#EDEAE3"
          strokeWidth={stroke}
        />
        {hasScore && (
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
          />
        )}
      </svg>
      <span
        className="absolute inset-0 grid place-items-center text-[11px] font-semibold"
        style={{ color: hasScore ? color : "#9A9A94" }}
      >
        {hasScore ? pct : "–"}
      </span>
    </div>
  );
}
