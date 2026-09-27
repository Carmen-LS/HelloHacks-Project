import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { Layout } from '../components/Layout'
import { QuestCard } from '../components/QuestCard'
import { useProfile } from '../lib/profile-context'
import { useQuests } from '../lib/quest-context'

export function HomePage() {
  const { profile } = useProfile()
  const { quests, joinedQuestIds } = useQuests()
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 60_000)
    return () => window.clearInterval(timer)
  }, [])
  if (!profile) return null

  const firstName = profile.firstName || profile.name.split(' ')[0]
  const hour = now.getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  const upcoming = [...quests].sort((a, b) => `${a.date}T${a.time}`.localeCompare(`${b.date}T${b.time}`))
  const featured = upcoming[0]
  const moreQuests = upcoming.filter((quest) => quest.id !== featured?.id).slice(0, 3)

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
          <div className="home-featured-photo">
            <div className="photo-caption"><span className="photo-caption-icon" aria-hidden="true">✦</span><div><strong>Make room for a good day.</strong></div></div>
          </div>
          <QuestCard quest={featured} featured />
        </section>
      )}


      {moreQuests.length > 0 && <section className="nearby-section"><div className="section-heading"><div><p className="eyebrow">Nearby</p><h2>More activities</h2></div><Link to="/explore">See all <span aria-hidden="true">→</span></Link></div><div className="quest-list">{moreQuests.map((quest) => <QuestCard key={quest.id} quest={quest} />)}</div></section>}

    </Layout>
  )
}
