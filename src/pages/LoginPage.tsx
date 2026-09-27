import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useProfile } from '../lib/profile-context'

export function LoginPage() {
  const navigate = useNavigate()
  const { signIn, backendConfigured } = useProfile()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function submit(event: FormEvent) {
    event.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      await signIn(email.trim(), password)
      navigate('/home')
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Could not sign in. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="signup-page">
      <header className="signup-header">
        <Link className="brand-lockup dark-brand" to="/" aria-label="WellQuest welcome">
          <svg viewBox="0 0 56 42" aria-hidden="true"><path d="M2 37 20 14l9 11 8-11 17 23H2Z" fill="currentColor" opacity=".82"/><path d="m14 37 14-17 19 17H14Z" fill="currentColor"/></svg><span>wellquest</span>
        </Link>
      </header>
      <section className="signup-content account-content login-content">
        <p className="eyebrow">Welcome back</p>
        <h1>Log in to WellQuest</h1>
        <p className="lede">Sign in to see your bookings and activities.</p>
        <form className="form account-form" onSubmit={submit}>
          <label>Email <span>*</span><input type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" required /></label>
          <label>Password <span>*</span><input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" required /></label>
          {error && <p className="form-error" role="alert">{error}</p>}
          {!backendConfigured && <p className="form-note">Supabase is not configured yet. Use the demo login from the welcome page.</p>}
          <button className="primary signup-next" type="submit" disabled={submitting || !backendConfigured}>{submitting ? 'Logging in…' : 'Log in'}</button>
        </form>
        <p className="signup-login">New to WellQuest? <Link to="/signup">Create an account</Link></p>
      </section>
    </main>
  )
}
