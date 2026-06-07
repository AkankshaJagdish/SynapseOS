import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { TrendingDown, Clock, DollarSign, ArrowUpRight, ArrowRight, Minus, CheckCircle2 } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { MicrosoftStackPanel } from "@/components/dashboard/MicrosoftStackPanel";
import { SkeletonCard, SkeletonTable } from "@/components/common/Skeleton";
import { ErrorState, EmptyState } from "@/components/common/States";
import { api } from "@/lib/api";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SynapseOS — Enterprise Intelligence Dashboard" },
      { name: "description", content: "Executive operations dashboard for organizational intelligence." },
    ],
  }),
  component: Dashboard,
});

function fmt(n: number) {
  return n.toLocaleString("en-US");
}
function fmtMoney(n: number) {
  return `$${n.toLocaleString("en-US")}`;
}

function Dashboard() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["dashboard"],
    queryFn: api.getDashboard,
    refetchOnWindowFocus: false,
  });

  const sav = data?.savings_opportunities;
  const cost = sav?.total_cost_saved_usd ?? 51000;

  return (
    <AppShell>
      <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto">
        <div className="flex items-end justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">Operations Intelligence</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Real-time signal across your organization. Powered by Azure AI Foundry & Semantic Kernel.
            </p>
          </div>
          <Link
            to="/submit"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition"
          >
            Submit Observation <ArrowRight className="size-4" />
          </Link>
        </div>

        {/* KPIs */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {isLoading ? (
            <>
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </>
          ) : (
            <>
              <KpiCard
                label="Issues Deflected"
                value={fmt(sav?.total_issues_deflected ?? 0)}
                sublabel="Resolved before escalation"
                icon={TrendingDown}
                accent="success"
              />
              <KpiCard
                label="Hours Saved"
                value={fmt(sav?.total_hours_saved ?? 0)}
                sublabel="Across all departments"
                icon={Clock}
                accent="primary"
              />
              <KpiCard
                label="Cost Avoided"
                value={fmtMoney(cost)}
                sublabel="Estimated annualized impact"
                icon={DollarSign}
                accent="warning"
              />
            </>
          )}
        </section>

        {error && <ErrorState message={(error as Error).message} onRetry={() => refetch()} />}

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {/* Emerging Issues */}
          <section className="rounded-xl border border-border bg-surface/60 backdrop-blur p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-semibold tracking-tight">Emerging Issues</h2>
                <p className="text-xs text-muted-foreground">Signals trending up across departments</p>
              </div>
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground px-2 py-1 rounded bg-surface-2 border border-border">
                {data?.emerging_issues.length ?? 0} active
              </span>
            </div>
            {isLoading ? (
              <SkeletonTable />
            ) : (data?.emerging_issues.length ?? 0) === 0 ? (
              <EmptyState title="No emerging issues" hint="Signals will appear as observations are submitted." />
            ) : (
              <div className="overflow-x-auto -mx-2">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                      <th className="px-2 py-2 font-medium">Issue</th>
                      <th className="px-2 py-2 font-medium">Departments</th>
                      <th className="px-2 py-2 font-medium text-right">Reports</th>
                      <th className="px-2 py-2 font-medium">Trend</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data?.emerging_issues.map((row) => (
                      <tr key={row.id} className="border-t border-border hover:bg-surface-2/50">
                        <td className="px-2 py-3 font-medium">{row.title}</td>
                        <td className="px-2 py-3">
                          <div className="flex flex-wrap gap-1">
                            {row.departments.map((d) => (
                              <span
                                key={d}
                                className="text-[10px] px-1.5 py-0.5 rounded bg-surface-2 border border-border text-muted-foreground"
                              >
                                {d}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-2 py-3 text-right tabular-nums">{row.report_count}</td>
                        <td className="px-2 py-3">
                          <TrendBadge trend={row.trend} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* Duplicate Work */}
          <section className="rounded-xl border border-border bg-surface/60 backdrop-blur p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-semibold tracking-tight">Duplicate Work</h2>
                <p className="text-xs text-muted-foreground">Parallel projects with reuse potential</p>
              </div>
            </div>
            {isLoading ? (
              <SkeletonTable />
            ) : (data?.duplicate_projects.length ?? 0) === 0 ? (
              <EmptyState title="No duplicates detected" hint="Memory Agent is actively scanning." />
            ) : (
              <div className="overflow-x-auto -mx-2">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                      <th className="px-2 py-2 font-medium">Project</th>
                      <th className="px-2 py-2 font-medium text-right">Duplicates</th>
                      <th className="px-2 py-2 font-medium text-right">Hours Saved</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data?.duplicate_projects.map((row) => (
                      <tr key={row.id} className="border-t border-border hover:bg-surface-2/50">
                        <td className="px-2 py-3 font-medium">{row.title}</td>
                        <td className="px-2 py-3 text-right tabular-nums">{row.duplicate_count}</td>
                        <td className="px-2 py-3 text-right tabular-nums text-success">
                          {row.estimated_savings_hours.toLocaleString()}h
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>

        <MicrosoftStackPanel />
      </div>
    </AppShell>
  );
}

function TrendBadge({ trend }: { trend: "rising" | "stable" | "resolved" }) {
  if (trend === "rising") {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-warning/15 text-warning border border-warning/30">
        <ArrowUpRight className="size-3" /> Rising
      </span>
    );
  }
  if (trend === "resolved") {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-success/15 text-success border border-success/30">
        <CheckCircle2 className="size-3" /> Resolved
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-surface-2 text-muted-foreground border border-border">
      <Minus className="size-3" /> Stable
    </span>
  );
}
