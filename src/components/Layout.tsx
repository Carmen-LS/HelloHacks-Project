import { useEffect, useState, type ReactNode } from 'react'
import { NavLink, Link } from 'react-router-dom'
import { CreateQuestModal } from './CreateQuestModal'
import { useProfile } from '../lib/profile-context'

export function Layout({ children }: { children: ReactNode }) {
  const { profile } = useProfile()
  const [compact, setCompact] = useState(false)
  const [showCreate, setShowCreate] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [toast, setToast] = useState('')

  useEffect(() => {
    const onScroll = () => setCompact(window.scrollY > 16)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (!toast) return
    const timeout = window.setTimeout(() => setToast(''), 3200)
    return () => window.clearTimeout(timeout)
  }, [toast])

  const initials = profile?.name.split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase() || 'W'

  return (
    <div className="app-shell">
      <header className={`topbar${compact ? ' compact' : ''}`}>
        <Link className="app-brand" to="/home" aria-label="WellQuest home">
          <svg viewBox="0 0 56 42" aria-hidden="true"><path d="M2 37 20 14l9 11 8-11 17 23H2Z" fill="currentColor" opacity=".82"/><path d="m14 37 14-17 19 17H14Z" fill="currentColor"/></svg>
          <span className="brand-copy"><strong>wellquest</strong><small>Stay active. Stay connected. Keep exploring.</small></span>
        </Link>
        <nav className="nav" aria-label="Main navigation">
          <NavLink to="/home">Home</NavLink>
          <NavLink to="/explore">Discover</NavLink>
          <NavLink to="/connections">Connections</NavLink>
        </nav>
        <div className="header-actions">
          <button className="header-create" type="button" onClick={() => setShowCreate(true)}><span aria-hidden="true">+</span> Create a quest</button>
          <div className="notification-wrap">
            <button className="icon-button notification-button" type="button" aria-label="Notifications" aria-expanded={showNotifications} onClick={() => setShowNotifications((show) => !show)}>
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" /></svg><span className="notification-dot" />
            </button>
            {showNotifications && <div className="notification-popover" role="status"><strong>You’re all caught up</strong><p>Quest updates and reminders will show up here.</p><button type="button" onClick={() => setShowNotifications(false)}>Got it</button></div>}
          </div>
          <Link className="profile-shortcut" to="/profile" aria-label={`Open ${profile?.name ?? 'your'} profile`}>
            {profile?.avatarDataUrl ? <img src={profile.avatarDataUrl} alt="" /> : <span>{initials}</span>}
          </Link>
        </div>
      </header>
      <main className="main">{children}</main>
      <nav className="mobile-tabs" aria-label="Mobile navigation">
        <NavLink to="/home"><span aria-hidden="true">⌂</span><small>Home</small></NavLink>
        <NavLink to="/explore"><span aria-hidden="true">⌕</span><small>Discover</small></NavLink>
        <button type="button" className="mobile-create" onClick={() => setShowCreate(true)} aria-label="Create a quest">+</button>
        <NavLink to="/connections"><span aria-hidden="true">♧</span><small>Connections</small></NavLink>
        <NavLink to="/profile"><span aria-hidden="true">◉</span><small>Profile</small></NavLink>
      </nav>
      {showCreate && <CreateQuestModal onClose={() => setShowCreate(false)} onCreated={() => setToast('Your quest is live. Invite someone along!')} />}
      {toast && <div className="toast-message" role="status">{toast}</div>}
    </div>
  )
}
