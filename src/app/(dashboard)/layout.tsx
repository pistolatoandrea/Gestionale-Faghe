import { createClient } from "@/lib/supabase/server";
import { DashboardHeader } from "@/components/dashboard-header";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader userEmail={user?.email ?? null} />
      <main className="flex-1 p-4 md:p-6">{children}</main>
    </div>
  );
}
