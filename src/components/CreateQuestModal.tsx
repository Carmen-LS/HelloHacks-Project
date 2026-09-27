import { useState, type FormEvent } from 'react'
import { useProfile } from '../lib/profile-context'
import { useQuests, type QuestCategory, type QuestIntensity } from '../lib/quest-context'

const categories: Array<{ id: QuestCategory; label: string; icon: string }> = [
  { id: 'sport', label: 'Fun sport', icon: '🎾' },
  { id: 'fitness', label: 'Fitness', icon: '💪' },
  { id: 'outdoor', label: 'Walk / outdoors', icon: '🌿' },
  { id: 'other', label: 'Other', icon: '✨' },
]
const intensities: Array<{ id: QuestIntensity; label: string }> = [
  { id: 'gentle', label: 'Gentle' },
  { id: 'moderate', label: 'Moderate' },
  { id: 'active', label: 'Active' },
]

function today() {
  const date = new Date()
  return [date.getFullYear(), `${date.getMonth() + 1}`.padStart(2, '0'), `${date.getDate()}`.padStart(2, '0')].join('-')
}

export function CreateQuestModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const { create } = useQuests()
  const { profile } = useProfile()
  const [name, setName] = useState('')
  const [category, setCategory] = useState<QuestCategory | ''>('')
  const [intensity, setIntensity] = useState<QuestIntensity | ''>('')
  const [spots, setSpots] = useState(1)
  const [limitParticipants, setLimitParticipants] = useState(false)
  const [participantLimit, setParticipantLimit] = useState(8)
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [location, setLocation] = useState('')
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function submit(event: FormEvent) {
    event.preventDefault()
    if (!category || !intensity) return
    const startsAt = new Date(`${date}T${time}`)
    if (!name.trim() || !location.trim()) {
      setFormError('Add an event name and location before posting.')
      return
    }
    if (Number.isNaN(startsAt.getTime()) || startsAt <= new Date()) {
      setFormError('Choose a date and time in the future.')
      return
    }
    setSubmitting(true)
    try {
      await create({ name: name.trim(), category, intensity, participants: spots, spots: limitParticipants ? Math.max(participantLimit, spots) : undefined, date, time, location: location.trim(), createdBy: profile?.name ?? 'You' })
      onCreated()
      onClose()
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Could not post this quest. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const mapSearch = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`

  return (
    <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}>
      <section className="quest-modal" role="dialog" aria-modal="true" aria-labelledby="quest-modal-title">
        <button className="modal-close" type="button" onClick={onClose} aria-label="Close create quest">×</button>
        <p className="eyebrow">Bring good company together</p>
        <h2 id="quest-modal-title">Create a quest</h2>
        <p className="modal-intro">A simple plan is all it takes to get outside and meet.</p>

        <form className="quest-form" onSubmit={submit}>
          <label className="field-label" htmlFor="quest-name">Event name <span>*</span></label>
          <input id="quest-name" value={name} onChange={(event) => { setName(event.target.value); setFormError('') }} placeholder="e.g. Morning tennis" required maxLength={64} />

          <fieldset>
            <legend>Category <span>*</span></legend>
            <div className="selectable-grid category-options">
              {categories.map((item) => (
                <label key={item.id} className={category === item.id ? 'selectable-option selected' : 'selectable-option'}>
                  <input type="radio" name="quest-category" value={item.id} checked={category === item.id} onChange={() => setCategory(item.id)} required />
                  <span aria-hidden="true">{item.icon}</span>{item.label}
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend>Level of intensity <span>*</span></legend>
            <div className="selectable-row">
              {intensities.map((item) => (
                <label key={item.id} className={intensity === item.id ? 'selectable-option selected' : 'selectable-option'}>
                  <input type="radio" name="quest-intensity" value={item.id} checked={intensity === item.id} onChange={() => setIntensity(item.id)} required />
                  {item.label}
                </label>
              ))}
            </div>
          </fieldset>

          <div className="field-label">People going <small>(including you)</small></div>
          <div className="stepper" aria-label="Number of people going">
            <button type="button" aria-label="Fewer people" onClick={() => setSpots((value) => Math.max(1, value - 1))}>−</button>
            <output aria-live="polite">{spots}</output>
            <button type="button" aria-label="More people" onClick={() => setSpots((value) => Math.min(20, value + 1))}>+</button>
          </div>

          <fieldset className="participant-limit-fieldset">
            <label className="participant-limit-toggle"><input type="checkbox" checked={limitParticipants} onChange={(event) => setLimitParticipants(event.target.checked)} /> Add a participant limit</label>
            {limitParticipants ? <label className="field-label" htmlFor="quest-participant-limit">Maximum participants
              <input id="quest-participant-limit" type="number" min={spots} max="100" value={participantLimit} onChange={(event) => setParticipantLimit(Math.max(spots, Number(event.target.value) || spots))} />
            </label> : <p className="form-note">No participant limit. Anyone can join.</p>}
          </fieldset>

          <div className="form-two-columns">
            <label className="field-label" htmlFor="quest-date">Date <span>*</span>
              <input id="quest-date" type="date" value={date} min={today()} onChange={(event) => { setDate(event.target.value); setFormError('') }} required />
            </label>
            <label className="field-label" htmlFor="quest-time">Time <span>*</span>
              <input id="quest-time" type="time" value={time} onChange={(event) => { setTime(event.target.value); setFormError('') }} required />
            </label>
          </div>

          <label className="field-label" htmlFor="quest-location">Location <span>*</span>
            <input id="quest-location" value={location} onChange={(event) => { setLocation(event.target.value); setFormError('') }} placeholder="Enter a park, centre, or address" required maxLength={120} />
          </label>
          {formError && <p className="form-error" role="alert">{formError}</p>}
          <div className="map-adjust-row">
            <span>Type a place, then adjust it on a map.</span>
            {location.trim() && <a href={mapSearch} target="_blank" rel="noreferrer">Open in Google Maps ↗</a>}
          </div>
          <button className="primary post-quest" type="submit" disabled={submitting}>{submitting ? 'Posting…' : <>Post quest <span aria-hidden="true">→</span></>}</button>
        </form>
      </section>
    </div>
  )
}
