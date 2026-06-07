import type { ReactNode } from 'react'

export function PageHeader({ eyebrow, title, description, action }: { eyebrow: string; title: string; description: string; action?: ReactNode }) {
  return <div className="page-header"><div><p className="eyebrow">{eyebrow}</p><h1>{title}</h1><p>{description}</p></div>{action}</div>
}
export function ErrorBanner({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return <div className="error-banner" role="alert"><span>!</span><div><strong>We couldn't complete that request</strong><p>{message}</p></div>{onRetry && <button onClick={onRetry}>Try again</button>}</div>
}
export function Skeleton({ className = '' }: { className?: string }) { return <div className={`skeleton ${className}`} aria-hidden="true" /> }
export function EmptyState({ title, description }: { title: string; description: string }) { return <div className="empty-state"><span>✓</span><h3>{title}</h3><p>{description}</p></div> }
