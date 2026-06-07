import { Link, Outlet, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, PlusSquare, Sparkles, Activity } from "lucide-react";
import type { ReactNode } from "react";

const nav = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/submit", label: "Submit Observation", icon: PlusSquare, exact: false },
];

export function AppShell({ children }: { children?: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="min-h-screen flex">
      <aside className="hidden md:flex w-64 shrink-0 flex-col border-r border-border bg-surface/60 backdrop-blur-sm">
        <div className="px-5 py-5 flex items-center gap-2.5 border-b border-border">
          <div className="size-9 rounded-lg bg-gradient-to-br from-primary to-accent grid place-items-center shadow-lg shadow-primary/20">
            <Sparkles className="size-5 text-primary-foreground" />
          </div>
          <div>
            <div className="text-sm font-semibold tracking-tight">SynapseOS</div>
            <div className="text-[11px] text-muted-foreground">Enterprise Intelligence</div>
          </div>
        </div>
        <nav className="p-3 space-y-1 flex-1">
          {nav.map((item) => {
            const active = item.exact ? pathname === item.to : pathname.startsWith(item.to);
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                  active
                    ? "bg-primary/15 text-foreground border border-primary/30"
                    : "text-muted-foreground hover:bg-surface-2 hover:text-foreground"
                }`}
              >
                <Icon className="size-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 m-3 rounded-lg border border-border bg-surface-2/60">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Activity className="size-3.5 text-success" />
            <span className="inline-flex size-2 rounded-full bg-success animate-pulse" />
            All agents online
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 border-b border-border bg-surface/40 backdrop-blur flex items-center justify-between px-4 md:px-6">
          <div className="md:hidden flex items-center gap-2">
            <div className="size-7 rounded-md bg-gradient-to-br from-primary to-accent" />
            <span className="font-semibold text-sm">SynapseOS</span>
          </div>
          <div className="hidden md:block text-xs text-muted-foreground">
            Microsoft AI Stack · Azure AI Foundry · Semantic Kernel
          </div>
          <Link
            to="/submit"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition"
          >
            <PlusSquare className="size-3.5" /> New Observation
          </Link>
        </header>
        <main className="flex-1 overflow-y-auto">{children ?? <Outlet />}</main>
      </div>
    </div>
  );
}
