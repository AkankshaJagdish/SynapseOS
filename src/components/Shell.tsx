import type { ReactNode } from 'react'
import { NavLink } from 'react-router-dom'

export function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="app-shell">
      <header className="topbar">
        <NavLink className="brand" to="/" aria-label="SynapseOS home">
          <span className="brand-mark"><i /><i /><i /><i /></span>
          <span>Synapse<span className="brand-os">OS</span></span>
        </NavLink>
        <nav>
          <NavLink to="/" end>Operations overview</NavLink>
          <NavLink to="/observations/new">New observation</NavLink>
        </nav>
        <div className="topbar-actions"><button aria-label="Help">?</button><span className="avatar">AC</span></div>
      </header>
      <main>{children}</main>
    </div>
  )
}
