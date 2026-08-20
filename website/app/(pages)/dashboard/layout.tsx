import { redirect } from "next/navigation";
import { auth } from "@auth";
import { AutenticacionProvider } from "@services";
import { Header, Sidebar, SidebarMobile, SidebarMobileNav, SidebarStateProvider } from "@components";

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
      <SidebarStateProvider>
        <div className="dashboard-background flex h-dvh w-full flex-col overflow-hidden md:flex-row">
          <Sidebar usuario={session.user} />
          <SidebarMobile usuario={session.user} />
          <main className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
            <Header usuario={session.user} />
            {children}
            <SidebarMobileNav usuario={session.user} />
          </main>
        </div>
      </SidebarStateProvider>
    </AutenticacionProvider>
  );
}
