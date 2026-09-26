import { Link } from 'react-router-dom'
import { Layout } from '../components/Layout'
import { QuestCard } from '../components/QuestCard'
import { activities, activityIcons } from '../data/activities'
import { useProfile } from '../lib/profile-context'
import { useQuests } from '../lib/quest-context'

export function HomePage() {
  const { profile } = useProfile()
  const { quests, joinedQuestIds } = useQuests()
  if (!profile) return null

  const firstName = profile.firstName || profile.name.split(' ')[0]
  const chosenActivities = (profile.interests ?? []).map((id) => activities.find((activity) => activity.id === id)).filter((activity) => activity !== undefined)
  const upcoming = [...quests].sort((a, b) => `${a.date}T${a.time}`.localeCompare(`${b.date}T${b.time}`))
  const featured = upcoming[0]
  const moreQuests = upcoming.filter((quest) => quest.id !== featured?.id).slice(0, 3)

  return (
    <Layout>
      <section className="greeting-row">
        <div>
          <p className="eyebrow">A fresh day to get out there</p>
          <h1>Good morning, {firstName} <span aria-hidden="true">☀️</span></h1>
          <p>Ready for your next WellQuest?</p>
        </div>
        <div className="journey-mini"><span aria-hidden="true">🌱</span><span><strong>{joinedQuestIds.length}</strong><small>quests joined</small></span></div>
      </section>

      {featured && (
        <section className="featured-section">
          <div className="section-heading"><div><p className="eyebrow">A little fresh air, good company</p><h2>Your next quest</h2></div><Link to="/explore">See all quests <span aria-hidden="true">→</span></Link></div>
          <div className="home-featured-photo">
            <div className="photo-caption"><span className="photo-caption-icon" aria-hidden="true">✦</span><div><strong>Make room for a good day.</strong><span>Find something simple, outside, and shared.</span></div></div>
          </div>
          <QuestCard quest={featured} featured />
        </section>
      )}

      <section className="pathways-section">
        <div className="section-heading"><div><p className="eyebrow">Move, connect, explore</p><h2>Make it your kind of day</h2></div></div>
        <div className="pathway-grid">
          <Link to="/explore" className="pathway-card pathway-move"><span className="pathway-icon" aria-hidden="true">🚶</span><span className="pathway-title">Move</span><span>Stay active and build healthy habits.</span><strong>Explore activities <b aria-hidden="true">→</b></strong></Link>
          <Link to="/connections" className="pathway-card pathway-connect"><span className="pathway-icon" aria-hidden="true">🤝</span><span className="pathway-title">Connect</span><span>Meet people and build community.</span><strong>Meet people <b aria-hidden="true">→</b></strong></Link>
          <Link to="/map" className="pathway-card pathway-explore"><span className="pathway-icon" aria-hidden="true">🧭</span><span className="pathway-title">Explore</span><span>Find welcoming places close to home.</span><strong>Open the map <b aria-hidden="true">→</b></strong></Link>
        </div>
      </section>

      {moreQuests.length > 0 && <section className="nearby-section"><div className="section-heading"><div><p className="eyebrow">Good things are happening nearby</p><h2>More quests near you</h2></div><Link to="/explore">Browse all <span aria-hidden="true">→</span></Link></div><div className="quest-list">{moreQuests.map((quest) => <QuestCard key={quest.id} quest={quest} />)}</div></section>}

      {chosenActivities.length > 0 && <section className="interests-section"><div className="section-heading"><div><p className="eyebrow">Picked for you</p><h2>Your activity interests</h2></div></div><div className="interest-summary">{chosenActivities.map((activity) => <div className="interest-summary-card" key={activity.id}><span aria-hidden="true">{activityIcons[activity.id]}</span><div><strong>{activity.name}</strong><small>{activity.description}</small></div></div>)}</div></section>}
    </Layout>
  )
}
