import { CommandMenu } from "@/components/shell/command-menu";
import { SidebarContent } from "@/components/shell/sidebar";
import { Topbar } from "@/components/shell/topbar";

export default function AppLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="flex min-h-screen" style={{ ["--sidebar-w" as string]: "248px" }}>
      <aside className="sticky top-0 hidden h-screen w-[var(--sidebar-w)] shrink-0 border-r border-line bg-canvas lg:block">
        <SidebarContent />
      </aside>
      <div className="flex min-w-0 flex-1 flex-col bg-[linear-gradient(180deg,var(--color-canvas),#fff_480px)]">
        <Topbar />
        <main className="flex-1">{children}</main>
      </div>
      <CommandMenu />
    </div>
  );
}
