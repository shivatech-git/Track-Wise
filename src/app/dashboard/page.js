import { createClient } from "@/lib/supabase/server";
import DashboardClient from "./DashboardClient";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: applications }, { data: resume }] = await Promise.all([
    supabase
      .from("applications")
      .select("*")
      .order("created_at", { ascending: false }),
    supabase.from("resumes").select("raw_text, updated_at").maybeSingle(),
  ]);

  return (
    <DashboardClient
      initialApplications={applications ?? []}
      hasResume={Boolean(resume?.raw_text)}
      userEmail={user?.email ?? ""}
    />
  );
}
