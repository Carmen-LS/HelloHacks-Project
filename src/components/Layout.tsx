import type { ReactNode } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useProfile } from '../lib/profile-context'

export function Layout({ children }: { children: ReactNode }) {
  const navigate = useNavigate()
  const { reset } = useProfile()

  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">Healthy aging · UBC / West Point Grey</p>
          <h1 className="brand">wellquest</h1>
        </div>
        <nav className="nav" aria-label="Main">
          <NavLink to="/" end>
            For you
          </NavLink>
          <NavLink to="/explore">Find activities</NavLink>
          <NavLink to="/map">Map</NavLink>
        </nav>
        <button
          className="text-btn"
          type="button"
          onClick={() => {
            reset()
            navigate('/signup')
          }}
        >
          Redo signup
        </button>
      </header>
      <main className="main">{children}</main>
    </div>
  )
}
