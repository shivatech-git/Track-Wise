import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { chatJSON } from "@/lib/groq";
import { extractionMessages } from "@/lib/prompts";
import { embed, cosine, toFitScore } from "@/lib/embeddings";

// Embeddings need the full Node runtime (not Edge).
export const runtime = "nodejs";
export const maxDuration = 60;

export async function GET() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("applications")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ applications: data });
}

export async function POST(request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const body = await request.json();
  const jobDescription = (body.jobDescription || "").trim();

  let company = (body.company || "").trim();
  let role = (body.role || "").trim();
  let parsed = null;
  let embedding = null;
  let matchScore = null;

  // If a description was pasted, run the AI pipeline: extract -> embed -> score.
  if (jobDescription) {
    try {
      parsed = await chatJSON(extractionMessages(jobDescription));
      if (!company && parsed.company && parsed.company !== "unknown")
        company = parsed.company;
      if (!role && parsed.role && parsed.role !== "unknown") role = parsed.role;
    } catch (e) {
      // Extraction is best-effort; a failure here shouldn't block saving.
      console.error("Extraction failed:", e.message);
    }

    try {
      const jobText = [role, ...(parsed?.required_skills ?? []), jobDescription]
        .filter(Boolean)
        .join(" ");
      const jobVec = await embed(jobText);
      embedding = jobVec;

      const { data: resume } = await supabase
        .from("resumes")
        .select("embedding")
        .maybeSingle();

      if (resume?.embedding) {
        const resumeVec =
          typeof resume.embedding === "string"
            ? JSON.parse(resume.embedding)
            : resume.embedding;
        matchScore = toFitScore(cosine(jobVec, resumeVec));
      }
    } catch (e) {
      console.error("Embedding failed:", e.message);
    }
  }

  if (!company) company = "Untitled company";
  if (!role) role = "Untitled role";

  const { data, error } = await supabase
    .from("applications")
    .insert({
      user_id: user.id,
      company,
      role,
      status: "saved",
      job_description: jobDescription || null,
      parsed,
      match_score: matchScore,
      embedding,
      source_url: (body.sourceUrl || "").trim() || null,
    })
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ application: data });
}
