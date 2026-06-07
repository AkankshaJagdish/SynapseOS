import { AlertTriangle, RefreshCw } from "lucide-react";

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-5 flex items-start gap-3">
      <AlertTriangle className="size-5 text-destructive shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium">Something went wrong</div>
        <div className="text-xs text-muted-foreground mt-1 break-words">{message}</div>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-surface-2 border border-border text-xs hover:bg-surface transition"
        >
          <RefreshCw className="size-3.5" /> Retry
        </button>
      )}
    </div>
  );
}

export function EmptyState({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="rounded-xl border border-dashed border-border p-8 text-center">
      <div className="text-sm font-medium">{title}</div>
      {hint && <div className="text-xs text-muted-foreground mt-1">{hint}</div>}
    </div>
  );
}
