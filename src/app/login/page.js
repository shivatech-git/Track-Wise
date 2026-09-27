import AuthForm from "@/components/AuthForm";

export default function LoginPage() {
  return (
    <main className="min-h-screen grid lg:grid-cols-2">
      {/* Left: the pitch. The hero is the pipeline idea, not a big number. */}
      <section className="hidden lg:flex flex-col justify-between bg-ink text-paper p-12">
        <div className="text-sm tracking-wide text-paper/60">TrackWise</div>

        <div className="max-w-md">
          <h1 className="font-display text-5xl leading-[1.05]">
            Every application, moving through one pipeline.
          </h1>
          <p className="mt-6 text-paper/70 leading-relaxed">
            Paste a job posting. TrackWise reads it, scores how well it fits your
            resume, and drafts a cover letter you can actually send. Then you drag
            it from saved to offer.
          </p>

          {/* A tiny, honest illustration of the five stages. */}
          <div className="mt-10 flex gap-2">
            {[
              ["Saved", "#8A93A3"],
              ["Applied", "#6C9BD1"],
              ["Interviewing", "#3E9B7F"],
              ["Offer", "#D8AE56"],
              ["Rejected", "#C08A70"],
            ].map(([label, color]) => (
              <div key={label} className="flex-1">
                <div
                  className="h-1.5 rounded-full"
                  style={{ background: color }}
                />
                <div className="mt-2 text-[11px] text-paper/50">{label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="text-xs text-paper/40">
          Fit scoring runs locally · Cover letters via Groq
        </div>
      </section>

      {/* Right: the form. */}
      <section className="flex items-center justify-center p-6 sm:p-12">
        <AuthForm />
      </section>
    </main>
  );
}
