import { useMemo, useState } from 'react'
import { ActivityCard } from '../components/ActivityCard'
import { Layout } from '../components/Layout'
import {
  activities,
  categoryLabels,
  difficultyLabels,
  type Category,
  type Difficulty,
} from '../data/activities'

const categories: Array<Category | 'all'> = ['all', 'gym', 'sport', 'outdoor']
const difficulties: Array<Difficulty | 'all'> = ['all', 'gentle', 'steady', 'challenging']

export function ExplorePage() {
  const [category, setCategory] = useState<Category | 'all'>('all')
  const [difficulty, setDifficulty] = useState<Difficulty | 'all'>('all')
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return activities.filter((activity) => {
      const categoryOk = category === 'all' || activity.category === category
      const difficultyOk = difficulty === 'all' || activity.difficulty === difficulty
      const textOk =
        needle.length === 0 ||
        activity.name.toLowerCase().includes(needle) ||
        activity.description.toLowerCase().includes(needle)
      return categoryOk && difficultyOk && textOk
    })
  }, [category, difficulty, query])

  return (
    <Layout>
      <section className="hero">
        <h2>Find activities</h2>
        <p>Filter gym work, sports, and outdoor options. Search if you already know the activity.</p>
      </section>

      <div className="filters">
        <label>
          Search
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="pickleball, stairs, swimming…"
          />
        </label>
        <label>
          Type
          <select value={category} onChange={(event) => setCategory(event.target.value as Category | 'all')}>
            {categories.map((value) => (
              <option key={value} value={value}>
                {value === 'all' ? 'All types' : categoryLabels[value]}
              </option>
            ))}
          </select>
        </label>
        <label>
          Pace
          <select
            value={difficulty}
            onChange={(event) => setDifficulty(event.target.value as Difficulty | 'all')}
          >
            {difficulties.map((value) => (
              <option key={value} value={value}>
                {value === 'all' ? 'Any pace' : difficultyLabels[value]}
              </option>
            ))}
          </select>
        </label>
      </div>

      <p className="count">{filtered.length} activities</p>
      <div className="grid">
        {filtered.map((activity) => (
          <ActivityCard key={activity.id} activity={activity} />
        ))}
      </div>
    </Layout>
  )
}
