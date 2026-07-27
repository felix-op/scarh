import { redirect } from "next/navigation";
import { auth } from "@auth";
import { AutenticacionProvider } from "@services";
import { Sidebar, SidebarMobile, SidebarMobileNav } from "@components";

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
      <div className="flex h-dvh w-full flex-col overflow-hidden bg-background md:flex-row">
        <Sidebar usuario={session.user} />
        <SidebarMobile usuario={session.user} />
        <main className="relative flex flex-1 flex-col overflow-y-auto p-2 md:p-4 2xl:p-6">
          {children}
          <SidebarMobileNav usuario={session.user} />
        </main>
      </div>
    </AutenticacionProvider>
  );
}
