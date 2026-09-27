import { useMemo, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  activities,
  activityIcons,
  categoryLabels,
  type Category,
  type Goal,
} from '../data/activities'
import type { AgeRange, Profile } from '../lib/profile'
import { useProfile } from '../lib/profile-context'

const categories = Object.keys(categoryLabels) as Category[]

function toggle<T>(list: T[], value: T) {
  return list.includes(value) ? list.filter((item) => item !== value) : [...list, value]
}

function ageRangeFor(birthDate: string): AgeRange {
  const date = new Date(`${birthDate}T00:00:00`)
  const now = new Date()
  let age = now.getFullYear() - date.getFullYear()
  const beforeBirthday = now.getMonth() < date.getMonth() || (now.getMonth() === date.getMonth() && now.getDate() < date.getDate())
  if (beforeBirthday) age -= 1
  if (age >= 75) return '75+'
  if (age >= 65) return '65-74'
  if (age >= 55) return '55-64'
  return '45-54'
}

function dateString(date: Date) {
  return [date.getFullYear(), `${date.getMonth() + 1}`.padStart(2, '0'), `${date.getDate()}`.padStart(2, '0')].join('-')
}

export function SignupPage() {
  const navigate = useNavigate()
  const { save, signUp, backendConfigured } = useProfile()
  const [step, setStep] = useState<1 | 2>(1)
  const [selectedCategories, setSelectedCategories] = useState<Category[]>([])
  const [selectedActivities, setSelectedActivities] = useState<string[]>([])
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const availableActivities = useMemo(
    () => activities.filter((activity) => selectedCategories.includes(activity.category)),
    [selectedCategories],
  )
  const canContinue = selectedActivities.length === 3

  function toggleCategory(category: Category) {
    const next = toggle(selectedCategories, category)
    setSelectedCategories(next)
    if (!next.includes(category)) {
      setSelectedActivities((current) => current.filter((id) => activities.find((activity) => activity.id === id)?.category !== category))
    }
  }

  function submitPreferences(event: FormEvent) {
    event.preventDefault()
    if (canContinue) setStep(2)
  }

  async function submitAccount(event: FormEvent) {
    event.preventDefault()
    if (password !== confirmPassword) {
      setPasswordError('Those passwords do not match yet.')
      return
    }
    const chosen = activities.filter((activity) => selectedActivities.includes(activity.id))
    const goals = Array.from(new Set(chosen.flatMap((activity) => activity.goals))) as Goal[]
    const nextProfile: Profile = {
      name: `${firstName.trim()} ${lastName.trim()}`,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      birthDate,
      ageRange: ageRangeFor(birthDate),
      email: email.trim(),
      goals,
      categories: selectedCategories,
      difficulty: 'gentle',
      interests: selectedActivities,
    }
    setSubmitting(true)
    try {
      if (backendConfigured) {
        const result = await signUp(nextProfile, password)
        if (result.needsEmailConfirmation) {
          setPasswordError('Account created. Check your email to confirm, then log in.')
          return
        }
      } else {
        save(nextProfile)
      }
      navigate('/home')
    } catch (error) {
      setPasswordError(error instanceof Error ? error.message : 'Could not create your account. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="signup-page">
      <header className="signup-header">
        <Link className="brand-lockup dark-brand" to="/" aria-label="WellQuest welcome">
          <svg viewBox="0 0 56 42" aria-hidden="true"><path d="M2 37 20 14l9 11 8-11 17 23H2Z" fill="currentColor" opacity=".82"/><path d="m14 37 14-17 19 17H14Z" fill="currentColor"/></svg>
          <span>wellquest</span>
        </Link>
        <span className="step-label">Step {step + 1} of 3</span>
      </header>
      <div className="signup-progress" aria-label={`Step ${step + 1} of 3`}><span style={{ width: step === 1 ? '66.6%' : '100%' }} /></div>

      {step === 1 ? (
        <section className="signup-content signup-interests">
          <p className="eyebrow">A few good things to start with</p>
          <h1>What do you enjoy?</h1>
          <p className="lede">Choose categories first, then pick three activities. We’ll use them to shape your recommendations.</p>
          <form onSubmit={submitPreferences}>
            <fieldset className="signup-fieldset">
              <legend>What sounds good to you?</legend>
              <div className="category-pills">
                {categories.map((category) => (
                  <label key={category} className={selectedCategories.includes(category) ? 'category-choice selected' : 'category-choice'}>
                    <input type="checkbox" checked={selectedCategories.includes(category)} onChange={() => toggleCategory(category)} />
                    <span>{category === 'gym' ? '💪' : category === 'sport' ? '🎾' : '🌲'}</span>{categoryLabels[category]}
                  </label>
                ))}
              </div>
            </fieldset>

            {availableActivities.length > 0 ? (
              <fieldset className="signup-fieldset activity-interest-fieldset">
                <legend>Pick 3 activities <span className="selection-count">{selectedActivities.length} of 3 selected</span></legend>
                <div className="interest-grid">
                  {availableActivities.map((activity) => {
                    const selected = selectedActivities.includes(activity.id)
                    const disabled = !selected && selectedActivities.length >= 3
                    return (
                      <label key={activity.id} className={`interest-tile${selected ? ' selected' : ''}${disabled ? ' disabled' : ''}`}>
                        <input type="checkbox" checked={selected} disabled={disabled} onChange={() => setSelectedActivities((current) => toggle(current, activity.id))} />
                        <span className="interest-icon" aria-hidden="true">{activityIcons[activity.id]}</span>
                        <span className="interest-name">{activity.name}</span>
                        {selected && <span className="selected-check" aria-label="Selected">✓</span>}
                      </label>
                    )
                  })}
                </div>
              </fieldset>
            ) : (
              <div className="interest-prompt"><span aria-hidden="true">✦</span> Choose one or more categories to see activities you can pick.</div>
            )}

            <div className="signup-actions">
              <Link className="back-link" to="/">Back</Link>
              <button className="primary signup-next" type="submit" disabled={!canContinue}>Next <span aria-hidden="true">→</span></button>
            </div>
          </form>
        </section>
      ) : (
        <section className="signup-content account-content">
          <button className="back-link account-back" type="button" onClick={() => setStep(1)}>← Back to interests</button>
          <p className="eyebrow">A little about you</p>
          <h1>Let’s make it personal.</h1>
          <p className="lede">This helps us find activities and people that feel right for you.</p>
          <form className="form account-form" onSubmit={submitAccount}>
            <div className="form-two-columns">
              <label>First name <span>*</span>
                <input value={firstName} onChange={(event) => setFirstName(event.target.value)} autoComplete="given-name" placeholder="e.g. Sarah" required maxLength={40} />
              </label>
              <label>Last name <span>*</span>
                <input value={lastName} onChange={(event) => setLastName(event.target.value)} autoComplete="family-name" placeholder="e.g. Chen" required maxLength={50} />
              </label>
            </div>
            <label>Date of birth <span>*</span>
              <input type="date" value={birthDate} max={dateString(new Date())} onChange={(event) => setBirthDate(event.target.value)} autoComplete="bday" required />
            </label>
            <label>Email <span>*</span>
              <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" placeholder="you@example.com" required />
            </label>
            <div className="form-two-columns">
              <label>Password <span>*</span>
                <input type="password" value={password} onChange={(event) => { setPassword(event.target.value); setPasswordError('') }} autoComplete="new-password" placeholder="Create a password" required minLength={8} />
              </label>
              <label>Confirm password <span>*</span>
                <input type="password" value={confirmPassword} onChange={(event) => { setConfirmPassword(event.target.value); setPasswordError('') }} autoComplete="new-password" placeholder="Type it again" required minLength={8} />
              </label>
            </div>
            {passwordError && <p className="form-error" role="alert">{passwordError}</p>}
            <p className="form-note">{backendConfigured ? 'Your account is securely managed by Supabase.' : 'Demo mode is active. Connect Supabase to create a shared account.'}</p>
            <button className="primary signup-next" type="submit" disabled={submitting}>{submitting ? 'Creating account…' : <>Create my account <span aria-hidden="true">→</span></>}</button>
          </form>
        </section>
      )}
      <p className="signup-login">Already have an account? <Link to="/">Log in</Link></p>
    </main>
  )
}
