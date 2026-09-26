import { useMemo, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  categoryLabels,
  difficultyLabels,
  goalLabels,
  type Category,
  type Difficulty,
  type Goal,
} from '../data/activities'
import { emptyProfile, type AgeRange, type Profile } from '../lib/profile'
import { useProfile } from '../lib/profile-context'

const ageRanges: AgeRange[] = ['45-54', '55-64', '65-74', '75+']
const goals = Object.keys(goalLabels) as Goal[]
const categories = Object.keys(categoryLabels) as Category[]
const difficulties = Object.keys(difficultyLabels) as Difficulty[]

function toggle<T>(list: T[], value: T) {
  return list.includes(value) ? list.filter((item) => item !== value) : [...list, value]
}

export function SignupPage() {
  const navigate = useNavigate()
  const { save } = useProfile()
  const [profile, setProfile] = useState<Profile>(emptyProfile)
  const canContinue = useMemo(
    () => profile.name.trim().length > 0 && profile.goals.length > 0 && profile.categories.length > 0,
    [profile],
  )

  function submit(event: FormEvent) {
    event.preventDefault()
    if (!canContinue) return
    save({ ...profile, name: profile.name.trim() })
    navigate('/')
  }

  return (
    <div className="signup">
      <p className="eyebrow">Working name — easy to change later</p>
      <h1>wellquest</h1>
      <p className="lede">
        Stay active around UBC and West Point Grey. Tell us a little about you and we’ll suggest
        gym work, sports, and outdoor activities that fit.
      </p>

      <form className="form" onSubmit={submit}>
        <label>
          What should we call you?
          <input
            value={profile.name}
            onChange={(event) => setProfile({ ...profile, name: event.target.value })}
            autoComplete="given-name"
            required
          />
        </label>

        <fieldset>
          <legend>Age range</legend>
          <div className="choice-row">
            {ageRanges.map((ageRange) => (
              <label key={ageRange} className="chip">
                <input
                  type="radio"
                  name="ageRange"
                  checked={profile.ageRange === ageRange}
                  onChange={() => setProfile({ ...profile, ageRange })}
                />
                {ageRange}
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend>What would you like help with?</legend>
          <div className="choice-grid">
            {goals.map((goal) => (
              <label key={goal} className="chip">
                <input
                  type="checkbox"
                  checked={profile.goals.includes(goal)}
                  onChange={() => setProfile({ ...profile, goals: toggle(profile.goals, goal) })}
                />
                {goalLabels[goal]}
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend>Where do you want to be active?</legend>
          <div className="choice-row">
            {categories.map((category) => (
              <label key={category} className="chip">
                <input
                  type="checkbox"
                  checked={profile.categories.includes(category)}
                  onChange={() =>
                    setProfile({ ...profile, categories: toggle(profile.categories, category) })
                  }
                />
                {categoryLabels[category]}
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend>Starting pace</legend>
          <div className="choice-row">
            {difficulties.map((difficulty) => (
              <label key={difficulty} className="chip">
                <input
                  type="radio"
                  name="difficulty"
                  checked={profile.difficulty === difficulty}
                  onChange={() => setProfile({ ...profile, difficulty })}
                />
                {difficultyLabels[difficulty]}
              </label>
            ))}
          </div>
        </fieldset>

        <button className="primary" type="submit" disabled={!canContinue}>
          See recommendations
        </button>
      </form>
    </div>
  )
}
