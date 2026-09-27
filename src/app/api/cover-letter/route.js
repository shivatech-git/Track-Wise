import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { chat } from "@/lib/groq";
import { coverLetterMessages } from "@/lib/prompts";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function GET(request) {
  const supabase = createClient();
  const applicationId = request.nextUrl.searchParams.get("applicationId");

  const { data } = await supabase
    .from("cover_letters")
    .select("content, created_at")
    .eq("application_id", applicationId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return NextResponse.json(data ?? {});
}

export async function POST(request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const { applicationId } = await request.json();

  const [{ data: app }, { data: resume }] = await Promise.all([
    supabase
      .from("applications")
      .select("company, role, parsed")
      .eq("id", applicationId)
      .single(),
    supabase.from("resumes").select("raw_text").maybeSingle(),
  ]);

  if (!app) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (!resume?.raw_text) {
    return NextResponse.json({ error: "No resume on file" }, { status: 400 });
  }

  let content;
  try {
    content = await chat(
      coverLetterMessages(resume.raw_text, app.parsed, app.company, app.role),
      { temperature: 0.6 }
    );
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 502 });
  }

  // Store it so it persists and shows on the next open.
  await supabase.from("cover_letters").insert({
    application_id: applicationId,
    user_id: user.id,
    content,
  });

  return NextResponse.json({ content });
}
