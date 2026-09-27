import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

const ALLOWED = new Set(["status", "notes", "company", "role"]);
const STAGES = ["saved", "applied", "interviewing", "offer", "rejected"];

export async function PATCH(request, { params }) {
  const supabase = createClient();
  const body = await request.json();

  // Whitelist updatable fields; never trust the client with arbitrary columns.
  const patch = {};
  for (const key of Object.keys(body)) {
    if (ALLOWED.has(key)) patch[key] = body[key];
  }
  if (patch.status && !STAGES.includes(patch.status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }
  // Stamp the applied date the first time a job moves to "applied".
  if (patch.status === "applied") patch.applied_at = new Date().toISOString();

  const { data, error } = await supabase
    .from("applications")
    .update(patch)
    .eq("id", params.id) // RLS also scopes this to the owner
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ application: data });
}

export async function DELETE(_request, { params }) {
  const supabase = createClient();
  const { error } = await supabase
    .from("applications")
    .delete()
    .eq("id", params.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
