import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { Layout } from '../components/Layout'
import { QuestCard } from '../components/QuestCard'
import { HomeWorkoutModal } from '../components/HomeWorkoutModal'
import { useProfile } from '../lib/profile-context'
import { useQuests } from '../lib/quest-context'

export function HomePage() {
  const { profile } = useProfile()
  const { quests, joinedQuestIds } = useQuests()
  const [showHomeWorkout, setShowHomeWorkout] = useState(false)
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 60_000)
    return () => window.clearInterval(timer)
  }, [])
  if (!profile) return null

  const firstName = profile.firstName || profile.name.split(' ')[0]
  const hour = now.getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  const upcoming = quests
    .filter((quest) => new Date(`${quest.date}T${quest.time}`).getTime() >= now.getTime())
    .sort((a, b) => `${a.date}T${a.time}`.localeCompare(`${b.date}T${b.time}`))
  const featured = upcoming[0]

  return (
    <Layout>
      <section className="greeting-row">
        <div>
          <p className="eyebrow">{now.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</p>
          <h1>{greeting}, {firstName}</h1>
        </div>
        <div className="journey-mini"><span aria-hidden="true">🌱</span><span><strong>{joinedQuestIds.length}</strong><small>quests joined</small></span></div>
      </section>

      {featured && (
        <section className="featured-section">
          <div className="section-heading"><div><p className="eyebrow">Next up</p><h2>Your next quest</h2></div><Link to="/explore">See all <span aria-hidden="true">→</span></Link></div>
          <div className={`home-featured-photo${featured.imageUrl ? '' : ' home-featured-photo-fallback'}`} style={featured.imageUrl ? { backgroundImage: `linear-gradient(0deg, rgba(20, 54, 41, .18), transparent 55%), url("${featured.imageUrl}")` } : undefined}>
            {featured.imageCreditUrl && <a className="image-credit" href={featured.imageCreditUrl} target="_blank" rel="noreferrer">Photo by {featured.imageCredit} · View source</a>}
          </div>
          <QuestCard quest={featured} featured />
        </section>
      )}


      <section className="home-workout-entry" aria-label="At-home workouts">
        <div><p className="eyebrow">Your pace, your place</p><h2>Wanna stay home today?</h2><p>Choose a focus and follow a gentle no-equipment tutorial.</p></div>
        <button type="button" className="home-workout-entry-button" onClick={() => setShowHomeWorkout(true)} aria-haspopup="dialog">Explore home workouts <span aria-hidden="true">→</span></button>
      </section>
      {showHomeWorkout && <HomeWorkoutModal onClose={() => setShowHomeWorkout(false)} />}

    </Layout>
  )
}
