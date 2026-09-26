import { activityIcons } from '../data/activities'
import { useQuests, type Quest } from '../lib/quest-context'
import { useProfile } from '../lib/profile-context'

const categoryNames = {
  fitness: 'Fitness',
  sport: 'Sports',
  outdoor: 'Outdoors',
  other: 'Something else',
}

const categoryIcons = {
  fitness: '🌿',
  sport: '🎾',
  outdoor: '🚶',
  other: '✨',
}

const intensityNames = { gentle: 'Gentle pace', moderate: 'Moderate pace', active: 'Active pace' }

function formatDate(date: string, time: string) {
  const value = new Date(`${date}T${time}`)
  return {
    date: value.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' }),
    time: value.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' }),
  }
}

export function QuestCard({ quest, featured = false }: { quest: Quest; featured?: boolean }) {
  const { join, joinedQuestIds } = useQuests()
  const { profile } = useProfile()
  const joined = joinedQuestIds.includes(quest.id)
  const hosting = quest.createdBy === profile?.name && quest.createdBy !== 'WellQuest community'
  const full = quest.participants >= quest.spots
  const when = formatDate(quest.date, quest.time)

  return (
    <article className={featured ? 'quest-card quest-card-featured' : 'quest-card'}>
      <div className="quest-card-icon" aria-hidden="true">
        {quest.activityId ? activityIcons[quest.activityId] : categoryIcons[quest.category]}
      </div>
      <div className="quest-card-content">
        <div className="quest-card-topline">
          <span className={`category-tag tag-${quest.category}`}>{categoryNames[quest.category]}</span>
          <span className="pace-tag">{intensityNames[quest.intensity]}</span>
        </div>
        <h3>{quest.name}</h3>
        <p className="quest-meta"><span aria-hidden="true">◷</span> {when.date} · {when.time}</p>
        <p className="quest-meta"><span aria-hidden="true">⌖</span> {quest.location}</p>
        <p className="quest-meta"><span aria-hidden="true">♧</span> {quest.participants} of {quest.spots} people going</p>
      </div>
      <div className="quest-card-actions">
        <a className="map-link" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(quest.location)}`} target="_blank" rel="noreferrer">View map</a>
        <button
          className={joined ? 'join-button joined' : 'join-button'}
          type="button"
          disabled={joined || hosting || full}
          onClick={() => join(quest.id)}
        >
          {hosting ? 'You’re hosting' : joined ? 'You’re going' : full ? 'Full' : 'Join quest'}
          {!joined && !hosting && !full && <span aria-hidden="true"> →</span>}
        </button>
      </div>
    </article>
  )
}
