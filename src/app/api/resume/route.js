import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { embed, cosine, toFitScore } from "@/lib/embeddings";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function GET() {
  const supabase = createClient();
  const { data } = await supabase
    .from("resumes")
    .select("raw_text, updated_at")
    .maybeSingle();
  return NextResponse.json(data ?? {});
}

export async function POST(request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const { rawText } = await request.json();
  if (!rawText || rawText.trim().length < 30) {
    return NextResponse.json({ error: "Resume text is too short" }, { status: 400 });
  }

  const resumeVec = await embed(rawText);

  const { error } = await supabase.from("resumes").upsert({
    user_id: user.id,
    raw_text: rawText,
    embedding: resumeVec,
    updated_at: new Date().toISOString(),
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Re-score every already-embedded application against the new resume so the
  // whole board reflects the latest resume immediately.
  const { data: apps } = await supabase
    .from("applications")
    .select("id, embedding")
    .not("embedding", "is", null);

  if (apps?.length) {
    await Promise.all(
      apps.map((a) => {
        const vec =
          typeof a.embedding === "string" ? JSON.parse(a.embedding) : a.embedding;
        const score = toFitScore(cosine(vec, resumeVec));
        return supabase
          .from("applications")
          .update({ match_score: score })
          .eq("id", a.id);
      })
    );
  }

  return NextResponse.json({ ok: true });
}
