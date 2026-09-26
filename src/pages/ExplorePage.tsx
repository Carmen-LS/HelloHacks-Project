import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Layout } from '../components/Layout'
import { QuestCard } from '../components/QuestCard'
import { useQuests, type QuestCategory, type QuestIntensity } from '../lib/quest-context'

const categoryFilters: Array<{ value: QuestCategory | 'all'; label: string }> = [
  { value: 'all', label: 'All quests' },
  { value: 'fitness', label: 'Fitness' },
  { value: 'sport', label: 'Sports' },
  { value: 'outdoor', label: 'Outdoors' },
  { value: 'other', label: 'Other' },
]
const intensityFilters: Array<{ value: QuestIntensity | 'all'; label: string }> = [
  { value: 'all', label: 'Any pace' },
  { value: 'gentle', label: 'Gentle' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'active', label: 'Active' },
]

export function ExplorePage() {
  const { quests } = useQuests()
  const [category, setCategory] = useState<QuestCategory | 'all'>('all')
  const [intensity, setIntensity] = useState<QuestIntensity | 'all'>('all')
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return [...quests]
      .filter((quest) => (category === 'all' || quest.category === category) && (intensity === 'all' || quest.intensity === intensity))
      .filter((quest) => needle.length === 0 || quest.name.toLowerCase().includes(needle) || quest.location.toLowerCase().includes(needle))
      .sort((a, b) => `${a.date}T${a.time}`.localeCompare(`${b.date}T${b.time}`))
  }, [category, intensity, query, quests])

  return (
    <Layout>
      <section className="page-intro explore-intro">
        <div><p className="eyebrow">Find your people, find your pace</p><h1>Discover quests</h1><p>Friendly activities and easy ways to get moving, all around your neighbourhood.</p></div>
        <Link className="subtle-link" to="/map">Explore places on the map <span aria-hidden="true">↗</span></Link>
      </section>

      <section className="discover-controls" aria-label="Filter quests">
        <label className="search-field"><span aria-hidden="true">⌕</span><span className="sr-only">Search activities, locations, or keywords</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search activities, places, or keywords" /></label>
        <div className="category-filter" aria-label="Activity category">
          {categoryFilters.map((item) => <button key={item.value} type="button" className={category === item.value ? 'filter-chip active' : 'filter-chip'} aria-pressed={category === item.value} onClick={() => setCategory(item.value)}>{item.label}</button>)}
        </div>
        <label className="select-filter">Pace <select value={intensity} onChange={(event) => setIntensity(event.target.value as QuestIntensity | 'all')}>{intensityFilters.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label>
      </section>

      <section className="discover-results">
        <div className="section-heading results-heading"><div><p className="eyebrow">Make a plan together</p><h2>Upcoming activities near you</h2></div><span className="results-count">{filtered.length} {filtered.length === 1 ? 'quest' : 'quests'}</span></div>
        {filtered.length > 0 ? <div className="quest-list">{filtered.map((quest) => <QuestCard key={quest.id} quest={quest} />)}</div> : <div className="empty-card"><span aria-hidden="true">🌤️</span><h3>No quests found just yet</h3><p>Try another search or make the first plan for your neighbourhood.</p><Link className="primary inline-primary" to="/home">Back home</Link></div>}
      </section>
    </Layout>
  )
}
