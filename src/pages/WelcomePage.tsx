import { useNavigate } from 'react-router-dom'
import { useProfile } from '../lib/profile-context'
import type { Profile } from '../lib/profile'

const demoProfile: Profile = {
  name: 'Alex Morgan',
  firstName: 'Alex',
  lastName: 'Morgan',
  ageRange: '65-74',
  goals: ['cardio', 'mobility', 'balance'],
  categories: ['outdoor', 'sport'],
  difficulty: 'gentle',
  interests: ['seawall-walk', 'pickleball', 'park-mobility'],
}

export function WelcomePage() {
  const navigate = useNavigate()
  const { profile, save } = useProfile()

  function login() {
    if (!profile) save(demoProfile)
    navigate('/home')
  }

  return (
    <main className="welcome-page">
      <div className="welcome-image" role="img" aria-label="Sunrise over a calm mountain lake" />
      <div className="welcome-wash" />
      <header className="welcome-header">
        <a className="brand-lockup" href="/" aria-label="WellQuest home">
          <svg viewBox="0 0 56 42" aria-hidden="true"><path d="M2 37 20 14l9 11 8-11 17 23H2Z" fill="currentColor" opacity=".82"/><path d="m14 37 14-17 19 17H14Z" fill="currentColor"/></svg>
          <span>wellquest</span>
        </a>
        <p>Good days are better shared.</p>
      </header>
      <section className="welcome-copy">
        <p className="welcome-kicker">Your next chapter, outdoors</p>
        <h1>Stay active.<br />Stay connected.<br /><em>Keep exploring.</em></h1>
        <p className="welcome-lede">Find a comfortable pace, meet good people, and make more room for the things you love.</p>
        <div className="welcome-actions">
          <button className="welcome-primary" type="button" onClick={() => navigate('/signup')}>Get started <span aria-hidden="true">→</span></button>
          <button className="welcome-secondary" type="button" onClick={login}>Log in</button>
        </div>
        <p className="welcome-reassurance">A welcoming place to move at your own pace.</p>
      </section>
      <footer className="photo-credit">Photo by <a href="https://unsplash.com/photos/calm-lake-reflecting-mountains-and-trees-at-sunrise-0v6hKTAWaGk" target="_blank" rel="noreferrer">Deep Doshi on Unsplash</a></footer>
    </main>
  )
}
