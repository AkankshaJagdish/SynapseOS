export function ConfidenceBar({ value }: { value: number }) {
  const pct = Math.max(0, Math.min(1, value)) * 100;
  const tone = pct > 75 ? "bg-success" : pct > 50 ? "bg-primary" : "bg-warning";
  return (
    <div className="flex items-center gap-2 min-w-[120px]">
      <div className="flex-1 h-1.5 rounded-full bg-surface-2 overflow-hidden">
        <div className={`h-full ${tone} transition-all`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-[11px] tabular-nums text-muted-foreground w-9 text-right">
        {pct.toFixed(0)}%
      </span>
    </div>
  );
}
