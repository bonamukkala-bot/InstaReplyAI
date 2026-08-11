import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { LogoutButton } from "@/components/dashboard/LogoutButton";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <div className="flex h-screen">
      <aside className="flex w-60 flex-col justify-between bg-sidebar text-sidebar-foreground">
        <div className="flex flex-col">
          <h1 className="px-4 py-6 text-lg font-semibold tracking-tight">
            InstaReply AI
          </h1>
          <nav className="flex flex-col gap-1 px-2">
            <NavLink href="/dashboard">Overview</NavLink>
            <NavLink href="/dashboard/leads">Leads</NavLink>
            <NavLink href="/dashboard/faqs">FAQs</NavLink>
            <NavLink href="/dashboard/settings">Settings</NavLink>
          </nav>
        </div>
        <div className="flex flex-col gap-2 px-4 py-4">
          <p className="text-xs text-sidebar-muted truncate">
            {(session.user as any).email}
          </p>
          <LogoutButton />
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto bg-background p-8">
        {children}
      </main>
    </div>
  );
}

function NavLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      className="rounded-md px-3 py-2 text-sm text-sidebar-muted transition hover:bg-sidebar-muted/20 hover:text-sidebar-foreground"
    >
      {children}
    </a>
  );
}
