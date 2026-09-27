import { useState, type ChangeEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { activities, activityIcons } from '../data/activities'
import { Layout } from '../components/Layout'
import { useProfile } from '../lib/profile-context'
import { useQuests } from '../lib/quest-context'

function imageToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(new Error('Could not read that image.'))
    reader.onload = () => {
      const image = new Image()
      image.onerror = () => reject(new Error('That file could not be opened as an image.'))
      image.onload = () => {
        const scale = Math.min(1, 560 / Math.max(image.width, image.height))
        const canvas = document.createElement('canvas')
        canvas.width = Math.round(image.width * scale)
        canvas.height = Math.round(image.height * scale)
        const context = canvas.getContext('2d')
        if (!context) return reject(new Error('Image processing is not available in this browser.'))
        context.drawImage(image, 0, 0, canvas.width, canvas.height)
        resolve(canvas.toDataURL('image/jpeg', 0.84))
      }
      image.src = String(reader.result)
    }
    reader.readAsDataURL(file)
  })
}

export function ProfilePage() {
  const { profile, save, signOut } = useProfile()
  const navigate = useNavigate()
  const { quests, joinedQuestIds } = useQuests()
  const [message, setMessage] = useState('')
  const [editingInterests, setEditingInterests] = useState(false)
  const [interestDraft, setInterestDraft] = useState<string[]>([])
  if (!profile) return null
  const currentProfile = profile

  const initials = profile.name.split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase()
  const interests = (profile.interests ?? []).map((id) => activities.find((activity) => activity.id === id)).filter((activity) => activity !== undefined)
  const hosted = quests.filter((quest) => quest.createdBy === profile.name).length

  function toggleInterest(id: string) {
    setInterestDraft((current) => current.includes(id) ? current.filter((item) => item !== id) : current.length < 5 ? [...current, id] : current)
  }

  function saveInterests() {
    const chosen = activities.filter((activity) => interestDraft.includes(activity.id))
    save({ ...currentProfile, interests: interestDraft, categories: Array.from(new Set(chosen.map((activity) => activity.category))), goals: Array.from(new Set(chosen.flatMap((activity) => activity.goals))) })
    setEditingInterests(false)
    setMessage('Your interests have been updated.')
  }

  async function onPhotoChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setMessage('Choose an image file to use as your profile photo.')
      return
    }
    try {
      const avatarDataUrl = await imageToDataUrl(file)
      save({ ...currentProfile, avatarDataUrl })
      setMessage('Your profile photo has been updated.')
    } catch {
      setMessage('That photo could not be loaded. Try another image.')
    }
  }

  async function logout() {
    try {
      await signOut()
      navigate('/')
    } catch {
      setMessage('Could not sign out. Please try again.')
    }
  }

  return (
    <Layout>
      <section className="profile-panel">
        <div className="profile-cover" />
        <div className="profile-main">
          <div className="profile-person">
            <div className="profile-avatar-large">{profile.avatarDataUrl ? <img src={profile.avatarDataUrl} alt={`${profile.name} profile`} /> : <span>{initials}</span>}</div>
            <div className="profile-person-info"><h1>{profile.name}</h1><p>⌖ Vancouver · Here for good company and new adventures</p></div>
            <label className="photo-upload-button">{profile.avatarDataUrl ? 'Change photo' : 'Add a photo'}<input type="file" accept="image/*" onChange={onPhotoChange} aria-label="Upload a profile photo" /></label>
          </div>
          {message && <p className="profile-message" role="status">{message}</p>}
          <div className="profile-stats">
            <article><strong>{joinedQuestIds.length}</strong><span>Activities joined</span><small>Your journey so far</small></article>
            <article><strong>{hosted}</strong><span>Quests created</span><small>Good plans shared</small></article>
            <article><strong>Level {Math.floor(joinedQuestIds.length / 5) + 1}</strong><span>Explorer</span><small>Keep discovering</small></article>
          </div>
          <div className="profile-lower-grid">
            <section className="profile-section"><div className="section-heading"><div><p className="eyebrow">Your journey</p><h2>Things you enjoy</h2></div><button className="interest-edit-button" type="button" onClick={() => { setInterestDraft(profile.interests ?? []); setEditingInterests((value) => !value) }}>{editingInterests ? 'Close' : 'Edit'}</button></div>
              {editingInterests ? <><p className="interest-edit-note">Choose up to 5 activities ({interestDraft.length}/5).</p><div className="profile-interest-picker">{activities.map((activity) => <label key={activity.id} className={interestDraft.includes(activity.id) ? 'selected' : ''}><input type="checkbox" checked={interestDraft.includes(activity.id)} disabled={!interestDraft.includes(activity.id) && interestDraft.length >= 5} onChange={() => toggleInterest(activity.id)} /><span aria-hidden="true">{activityIcons[activity.id]}</span>{activity.name}</label>)}</div><div className="interest-edit-actions"><button type="button" className="back-link" onClick={() => setEditingInterests(false)}>Cancel</button><button type="button" className="primary" onClick={saveInterests}>Save interests</button></div></> : interests.length ? <div className="profile-interest-list">{interests.map((activity) => <div key={activity.id}><span aria-hidden="true">{activityIcons[activity.id]}</span><strong>{activity.name}</strong></div>)}</div> : <p className="muted-copy">Choose a few activities that sound good to you.</p>}
            </section>
            <aside className="profile-reward"><div className="reward-mark" aria-hidden="true">☕</div><p className="eyebrow">A small reward for showing up</p><h2>{joinedQuestIds.length} activities so far</h2><p>Keep exploring. Your next milestone is closer than you think.</p><div className="reward-progress"><span style={{ width: `${Math.min(100, (joinedQuestIds.length % 10) * 10)}%` }} /></div><small>{joinedQuestIds.length % 10} of 10 activities to your next milestone</small></aside>
          </div>
          <p className="profile-email">Account email <strong>{profile.email || 'Demo account'}</strong></p>
          <button className="profile-signout" type="button" onClick={() => void logout()}>Sign out</button>
        </div>
      </section>
    </Layout>
  )
}
