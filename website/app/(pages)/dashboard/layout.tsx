import { redirect } from "next/navigation";
import { auth } from "@auth";
import { AutenticacionProvider } from "@services";
import { Sidebar } from "@components";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <AutenticacionProvider session={session}>
      <div className="flex h-dvh w-full overflow-hidden bg-background">
        <Sidebar usuario={session.user} />
        <main className="flex flex-1 flex-col overflow-y-auto">{children}</main>
      </div>
    </AutenticacionProvider>
  );
}
