import { activityIcons } from '../data/activities'
import { useQuests, type Quest } from '../lib/quest-context'
import { useProfile } from '../lib/profile-context'
import { useState } from 'react'
import { JoinConfirmationModal } from './JoinConfirmationModal'

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

export function QuestCard({ quest, featured = false, selected = false, onShowOnMap, showActions = true, compactActions = false }: { quest: Quest; featured?: boolean; selected?: boolean; onShowOnMap?: () => void; showActions?: boolean; compactActions?: boolean }) {
  const { join, cancel, joinedQuestIds } = useQuests()
  const { profile } = useProfile()
  const [bookingAction, setBookingAction] = useState<'join' | 'cancel' | null>(null)
  const joined = joinedQuestIds.includes(quest.id)
  const hosting = quest.createdBy === profile?.name && quest.createdBy !== 'WellQuest community'
  const full = quest.spots !== undefined && quest.participants >= quest.spots
  const when = formatDate(quest.date, quest.time)
  const cancelDeadline = new Date(`${quest.date}T${quest.time}`).getTime() - 60 * 60 * 1000
  const cancellationAllowed = Date.now() < cancelDeadline

  return (
    <article
      className={`quest-card${featured ? ' quest-card-featured' : ''}${selected ? ' quest-card-selected' : ''}${showActions ? '' : ' quest-card-compact'}`}
      role={showActions ? undefined : compactActions ? 'group' : 'button'}
      tabIndex={showActions ? undefined : 0}
      aria-label={showActions ? undefined : compactActions ? `${quest.name}, ${joined ? 'cancel booking' : 'join activity'}` : `Join ${quest.name}`}
      onClick={showActions ? undefined : () => setBookingAction(joined ? 'cancel' : 'join')}
      onKeyDown={showActions ? undefined : (event) => {
        if (event.target !== event.currentTarget) return
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          setBookingAction(joined ? 'cancel' : 'join')
        }
      }}
    >
      <div className="quest-card-icon" aria-hidden="true">
        {quest.activityId ? activityIcons[quest.activityId] : categoryIcons[quest.category]}
      </div>
      <div className="quest-card-content">
        <div className="quest-card-topline">
          <span className={`category-tag tag-${quest.category}`}>{categoryNames[quest.category]}</span>
          <span className="pace-tag">{intensityNames[quest.intensity]}</span>
          {quest.partnerPreview && <span className="preview-tag">Partner preview</span>}
        </div>
        <h3>{quest.name}</h3>
        {quest.venueName && <p className="quest-venue">{quest.venueName}{quest.trainer && <> · {quest.trainer}</>}</p>}
        <p className="quest-meta"><span aria-hidden="true">◷</span> {when.date} · {when.time}</p>
        <p className="quest-meta"><span aria-hidden="true">⌖</span> {quest.location}</p>
        <p className="quest-meta"><span aria-hidden="true">♧</span> {quest.spots === undefined ? `${quest.participants} people going` : `${quest.participants} of ${quest.spots} people going`}</p>
      </div>
      {showActions && <div className="quest-card-actions">
        {onShowOnMap ? <button className="map-link map-focus-button" type="button" onClick={onShowOnMap}>Show on map</button> : <a className="map-link" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(quest.location)}`} target="_blank" rel="noreferrer">View map</a>}
        <button
          className={joined || hosting ? 'join-button joined' : 'join-button'}
          type="button"
          disabled={joined || hosting || full}
          onClick={() => setBookingAction('join')}
        >
          {hosting ? 'You’re hosting' : joined ? 'Booked' : full ? 'Full' : quest.partnerPreview ? 'Reserve spot' : 'Join quest'}
          {!joined && !hosting && !full && <span aria-hidden="true"> →</span>}
        </button>
        {joined && (cancellationAllowed
          ? <button className="cancel-booking-link" type="button" onClick={() => setBookingAction('cancel')}>Cancel booking</button>
          : <span className="cancel-cutoff">Cancellation window closed</span>)}
      </div>}
      {compactActions && <div className="quest-card-compact-actions" onClick={(event) => event.stopPropagation()}>
        {joined ? <button className="compact-cancel-button" type="button" aria-label={`Cancel ${quest.name}`} onClick={() => setBookingAction('cancel')}>Cancel</button>
          : <button className="compact-join-button" type="button" disabled={hosting || full} onClick={() => setBookingAction('join')}>{hosting ? 'Hosting' : full ? 'Full' : 'Join'}</button>}
      </div>}
      {bookingAction && <JoinConfirmationModal quest={quest} mode={bookingAction} onClose={() => setBookingAction(null)} onConfirm={async () => { if (bookingAction === 'join') await join(quest.id); else await cancel(quest.id); setBookingAction(null) }} />}
    </article>
  )
}
