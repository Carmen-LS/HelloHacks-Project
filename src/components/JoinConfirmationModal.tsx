import { useState } from 'react'
import { createPortal } from 'react-dom'
import type { Quest } from '../lib/quest-context'

function whenLabel(date: string, time: string) {
  const value = new Date(`${date}T${time}`)
  return `${value.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })} at ${value.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}`
}

function cancellationDeadline(date: string, time: string) {
  const startsAt = new Date(`${date}T${time}`)
  startsAt.setHours(startsAt.getHours() - 1)
  return startsAt.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
}

export function JoinConfirmationModal({
  quest,
  mode,
  onClose,
  onConfirm,
}: {
  quest: Quest
  mode: 'join' | 'cancel'
  onClose: () => void
  onConfirm: () => void
}) {
  const [confirmed, setConfirmed] = useState(false)
  const starts = whenLabel(quest.date, quest.time)
  const available = quest.spots === undefined ? null : Math.max(0, quest.spots - quest.participants)

  return createPortal((
    <div className="modal-backdrop booking-backdrop" onClick={(event) => event.stopPropagation()} onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}>
      <section className="booking-modal" role="dialog" aria-modal="true" aria-labelledby="booking-title">
        <button className="modal-close" type="button" onClick={onClose} aria-label="Close">×</button>
        <p className="eyebrow">{mode === 'join' ? (quest.partnerPreview ? 'Partner class preview' : 'Your next plan') : 'Change your plans'}</p>
        <h2 id="booking-title">{mode === 'join' ? 'Review your spot' : 'Cancel this booking?'}</h2>
        <div className="booking-event-info">
          {quest.venueName && <span className="booking-venue">{quest.venueName}</span>}
          <h3>{quest.name}</h3>
          <p>{quest.description || `A ${quest.intensity}-pace ${quest.category} meetup. Come as you are and enjoy the activity together.`}</p>
          <dl>
            <div><dt>When</dt><dd>{starts}</dd></div>
            <div><dt>Where</dt><dd>{quest.location}</dd></div>
          {quest.trainer && <div><dt>Instructor</dt><dd>{quest.trainer}</dd></div>}
          <div><dt>Participants</dt><dd>{quest.participants} going{available === null ? ' · no limit' : ` · ${available} spots left`}</dd></div>
        </dl>
        {quest.venueLink && <a className="booking-venue-link" href={quest.venueLink} target="_blank" rel="noreferrer">Visit venue website ↗</a>}
      </div>

        {mode === 'join' ? (
          <>
            <div className="booking-policy"><strong>Plans change.</strong> You can cancel up to one hour before the start{quest.partnerPreview ? '. This preview booking is saved in this browser only.' : '.'}</div>
            {quest.partnerPreview && <p className="demo-data-note">Class schedule, instructor, and availability are sample placeholders. Booking is not sent to the gym.</p>}
            <label className="booking-confirm-check"><input type="checkbox" checked={confirmed} onChange={(event) => setConfirmed(event.target.checked)} /><span>I’ve reviewed the details and want to reserve a spot.</span></label>
            <div className="booking-actions"><button className="back-link" type="button" onClick={onClose}>Not now</button><button className="primary" type="button" disabled={!confirmed || (available !== null && available < 1)} onClick={onConfirm}>Confirm spot <span aria-hidden="true">→</span></button></div>
          </>
        ) : (
          <>
            <div className="booking-policy">Cancel before {cancellationDeadline(quest.date, quest.time)} to return your spot to the group.</div>
            <div className="booking-actions"><button className="back-link" type="button" onClick={onClose}>Keep my spot</button><button className="cancel-confirm-button" type="button" onClick={onConfirm}>Cancel booking</button></div>
          </>
        )}
      </section>
    </div>
  ), document.body)
}
