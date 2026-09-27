import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { chatJSON } from "@/lib/groq";
import { gapMessages } from "@/lib/prompts";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request) {
  const supabase = createClient();
  const { applicationId } = await request.json();

  const [{ data: app }, { data: resume }] = await Promise.all([
    supabase
      .from("applications")
      .select("parsed")
      .eq("id", applicationId)
      .single(),
    supabase.from("resumes").select("raw_text").maybeSingle(),
  ]);

  if (!app) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (!resume?.raw_text) {
    return NextResponse.json({ error: "No resume on file" }, { status: 400 });
  }

  try {
    const gap = await chatJSON(gapMessages(resume.raw_text, app.parsed));
    return NextResponse.json(gap);
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 502 });
  }
}
