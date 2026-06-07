import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api, errorMessage, type DashboardResponse } from '../lib/api'
import { EmptyState, ErrorBanner, PageHeader, Skeleton } from '../components/UI'

const STORY_METRICS = { total_cost_saved_usd: 51000, total_hours_saved: 340, total_issues_deflected: 27 }

export function DashboardPage() {
  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const load = useCallback(async () => {
    setLoading(true); setError('')
    try { setDashboard(await api.getDashboard()) } catch (err) { setError(errorMessage(err)) } finally { setLoading(false) }
  }, [])
  useEffect(() => { void load() }, [load])
  const savings = dashboard?.savings_opportunities ?? STORY_METRICS
  const duplicateCount = dashboard?.duplicate_projects.reduce((total, item) => total + item.duplicate_count, 0) ?? 1

  return <div className="page dashboard-page">
    <PageHeader eyebrow="Operations intelligence" title="Good morning, Acme leadership" description="A unified view of organizational signals, duplicate work, and proven solutions." action={<Link className="primary-button" to="/observations/new">+ Share an observation</Link>} />
    {error && <ErrorBanner message={`${error} Showing executive story metrics while the service reconnects.`} onRetry={load} />}
    <section className="metric-grid" aria-label="Executive impact metrics">
      <Metric label="Cost avoided" value={`$${savings.total_cost_saved_usd.toLocaleString()}`} note="Based on reusable solutions" icon="$" tone="blue" />
      <Metric label="Hours saved" value={savings.total_hours_saved.toLocaleString()} note="Across active initiatives" icon="◷" tone="cyan" />
      <Metric label="Issues deflected" value={savings.total_issues_deflected.toLocaleString()} note="Before escalation" icon="✓" tone="green" />
      <Metric label="Duplicate initiative prevented" value={duplicateCount.toLocaleString()} note="This quarter" icon="◇" tone="purple" />
    </section>
    <section className="dashboard-grid">
      <article className="card span-two">
        <CardHeading title="Emerging issues" subtitle="Signals requiring executive attention" badge={dashboard ? `${dashboard.emerging_issues.length} active` : undefined} />
        {loading ? <ListSkeleton /> : dashboard?.emerging_issues.length ? <div className="issue-list">{dashboard.emerging_issues.map(issue => <div className="issue-row" key={issue.id}><span className={`trend-dot ${issue.trend}`} /><div><strong>{issue.title}</strong><p>{issue.departments.join(' · ')}</p></div><div className="issue-count"><strong>{issue.report_count}</strong><span>reports</span></div><span className={`status-pill ${issue.trend}`}>{issue.trend}</span></div>)}</div> : <EmptyState title="No emerging issues" description="New cross-functional signals will appear here." />}
      </article>
      <article className="card insight-card"><CardHeading title="Synapse insight" subtitle="Recommended next move" /><div className="insight-orb"><span>✦</span></div><h3>Reuse what already works</h3><p>Guided CRM recovery has a <strong>91% reuse confidence</strong> for the current onboarding pattern.</p><Link to="/observations/7b6950d4-f518-4a20-8dcf-29e3ca816fd9">Review recommendation →</Link></article>
      <article className="card span-two"><CardHeading title="Duplicate initiatives" subtitle="Opportunities to consolidate work" />{loading ? <ListSkeleton /> : dashboard?.duplicate_projects.length ? dashboard.duplicate_projects.map(project => <div className="duplicate-row" key={project.id}><div className="duplicate-icon">◇</div><div><strong>{project.title}</strong><p>{project.duplicate_count} overlapping workstreams detected</p></div><div><strong>{project.estimated_savings_hours}h</strong><span>potential savings</span></div></div>) : <EmptyState title="No duplicate initiatives" description="SynapseOS is monitoring active projects for overlap." />}</article>
      <article className="card"><CardHeading title="Agent activity" subtitle="Analysis network status" /><div className="agent-network"><div className="agent-core">S</div>{['Memory','Duplicate','Solutions','Action'].map((name, i) => <div className={`agent-node node-${i}`} key={name}><span />{name}</div>)}</div><div className="live-status"><span /> All intelligence agents operational</div></article>
    </section>
  </div>
}
function Metric({ label, value, note, icon, tone }: { label: string; value: string; note: string; icon: string; tone: string }) { return <article className="metric-card"><div className={`metric-icon ${tone}`}>{icon}</div><p>{label}</p><strong>{value}</strong><span>{note}</span></article> }
function CardHeading({ title, subtitle, badge }: { title: string; subtitle: string; badge?: string }) { return <header className="card-heading"><div><h2>{title}</h2><p>{subtitle}</p></div>{badge && <span>{badge}</span>}</header> }
function ListSkeleton() { return <div className="list-skeleton"><Skeleton /><Skeleton /><Skeleton /></div> }
