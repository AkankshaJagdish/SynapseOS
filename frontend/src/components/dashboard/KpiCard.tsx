import type { LucideIcon } from "lucide-react";

interface KpiCardProps {
  label: string;
  value: string;
  sublabel?: string;
  icon: LucideIcon;
  accent?: "primary" | "success" | "warning";
}

const accentMap = {
  primary: "from-primary/30 to-primary/5 text-primary",
  success: "from-success/30 to-success/5 text-success",
  warning: "from-warning/30 to-warning/5 text-warning",
};

export function KpiCard({ label, value, sublabel, icon: Icon, accent = "primary" }: KpiCardProps) {
  return (
    <div className="relative rounded-xl border border-border bg-surface/70 backdrop-blur p-5 overflow-hidden">
      <div className={`absolute -top-12 -right-12 size-40 rounded-full bg-gradient-to-br ${accentMap[accent]} blur-2xl opacity-60`} />
      <div className="relative flex items-start justify-between">
        <div>
          <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
          <div className="mt-2 text-3xl font-semibold tracking-tight">{value}</div>
          {sublabel && <div className="mt-1 text-xs text-muted-foreground">{sublabel}</div>}
        </div>
        <div className={`size-10 rounded-lg bg-surface-2 border border-border grid place-items-center ${accentMap[accent].split(" ").pop()}`}>
          <Icon className="size-5" />
        </div>
      </div>
    </div>
  );
}
