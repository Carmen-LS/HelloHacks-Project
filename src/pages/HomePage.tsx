import { Link } from 'react-router-dom'
import { ActivityCard } from '../components/ActivityCard'
import { Layout } from '../components/Layout'
import { useProfile } from '../lib/profile-context'
import { recommend } from '../lib/recommend'

export function HomePage() {
  const { profile } = useProfile()
  if (!profile) return null

  const ranked = recommend(profile)

  return (
    <Layout>
      <section className="hero">
        <h2>For you, {profile.name}</h2>
        <p>
          Based on your signup, here are activities around UBC and West Point Grey that match your
          goals and pace. This is a starting list — not a medical plan.
        </p>
      </section>
      {ranked.length === 0 ? (
        <p>No close matches. Try the filter page and widen your choices.</p>
      ) : (
        <div className="grid">
          {ranked.map((activity) => (
            <ActivityCard key={activity.id} activity={activity} reasons={activity.reasons} />
          ))}
        </div>
      )}
      <p className="footer-links">
        <Link to="/explore">Browse everything</Link>
        <Link to="/map">Open the map</Link>
      </p>
    </Layout>
  )
}
