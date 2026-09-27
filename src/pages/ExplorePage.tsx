import { useEffect, useMemo, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { Layout } from '../components/Layout'
import { QuestCard } from '../components/QuestCard'
import { JoinConfirmationModal } from '../components/JoinConfirmationModal'
import { useQuests, type Quest } from '../lib/quest-context'

type CategoryFilter = 'all' | 'fitness' | 'sport' | 'social'
type SocialFilter = 'all' | 'one' | 'small' | 'large'
type TimeFilter = 'all' | 'morning' | 'afternoon' | 'evening'
type FilterOption = { value: string; label: string }

function FilterAccordion({
  id,
  title,
  value,
  options,
  expanded,
  onToggle,
  onChange,
}: {
  id: string
  title: string
  value: string
  options: FilterOption[]
  expanded: boolean
  onToggle: () => void
  onChange: (value: string) => void
}) {
  const selected = options.find((option) => option.value === value)?.label ?? options[0].label
  return (
    <section className={`filter-accordion${expanded ? ' expanded' : ''}`}>
      <button className="filter-accordion-trigger" type="button" aria-expanded={expanded} aria-controls={`filter-options-${id}`} onClick={onToggle}>
        <span className="filter-accordion-title">{title}</span>
        <span className="filter-accordion-value">{selected}</span>
      </button>
      <div className="filter-accordion-options" id={`filter-options-${id}`} role="group" aria-label={title} hidden={!expanded}>
        {options.map((option) => <button key={option.value} type="button" className={value === option.value ? 'filter-option selected' : 'filter-option'} aria-pressed={value === option.value} onClick={() => onChange(option.value)}>{option.label}</button>)}
      </div>
    </section>
  )
}

const intensityOptions: FilterOption[] = [
  { value: 'all', label: 'Any intensity' },
  { value: 'gentle', label: 'Gentle' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'active', label: 'Active' },
]
const socialOptions: FilterOption[] = [
  { value: 'all', label: 'Any group size' },
  { value: 'one', label: '1–1' },
  { value: 'small', label: 'Small group (2–5)' },
  { value: 'large', label: 'Large group (5+)' },
]
const timeOptions: FilterOption[] = [
  { value: 'all', label: 'Any time' },
  { value: 'morning', label: 'Morning · 5 AM–12 PM' },
  { value: 'afternoon', label: 'Afternoon · 12–4 PM' },
  { value: 'evening', label: 'Evening · 5–10 PM' },
]

const categories: Array<{ id: CategoryFilter; label: string; icon: string }> = [
  { id: 'all', label: 'All', icon: '✦' },
  { id: 'fitness', label: 'Fitness', icon: '✚' },
  { id: 'sport', label: 'Sports', icon: '◉' },
  { id: 'social', label: 'Social', icon: '♧' },
]

function categoryMatches(quest: Quest, category: CategoryFilter) {
  if (category === 'all') return true
  if (category === 'social') return quest.category === 'outdoor' || quest.category === 'other'
  return quest.category === category
}

function groupMatches(quest: Quest, social: SocialFilter) {
  const size = quest.spots ?? quest.participants
  if (social === 'all') return true
  if (social === 'one') return size <= 2
  if (social === 'small') return size >= 2 && size <= 5
  return size >= 5
}

function timeMatches(quest: Quest, time: TimeFilter) {
  if (time === 'all') return true
  const hour = Number(quest.time.split(':')[0])
  if (time === 'morning') return hour >= 5 && hour < 12
  if (time === 'afternoon') return hour >= 12 && hour <= 16
  return hour >= 17 && hour <= 22
}

function markerColor(quest: Quest) {
  if (quest.category === 'fitness') return '#4784ca'
  if (quest.category === 'sport') return '#dd8739'
  if (quest.category === 'outdoor') return '#267357'
  return '#8068cb'
}

export function ExplorePage() {
  const { quests, join, cancel, joinedQuestIds } = useQuests()
  const [category, setCategory] = useState<CategoryFilter>('all')
  const [intensity, setIntensity] = useState('all')
  const [social, setSocial] = useState<SocialFilter>('all')
  const [time, setTime] = useState<TimeFilter>('all')
  const [openFilter, setOpenFilter] = useState<string | null>(null)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [selectedQuestId, setSelectedQuestId] = useState<string | null>(null)
  const [bookingQuestId, setBookingQuestId] = useState<string | null>(null)
  const [searchAreaBounds, setSearchAreaBounds] = useState<L.LatLngBounds | null>(null)
  const [areaChanged, setAreaChanged] = useState(false)
  const mapEl = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)
  const markersRef = useRef<L.LayerGroup | null>(null)

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return [...quests]
      .filter((quest) => categoryMatches(quest, category))
      .filter((quest) => intensity === 'all' || quest.intensity === intensity)
      .filter((quest) => groupMatches(quest, social) && timeMatches(quest, time))
      .filter((quest) => needle.length === 0 || [quest.name, quest.location, quest.venueName ?? '', quest.trainer ?? ''].some((value) => value.toLowerCase().includes(needle)))
      .sort((a, b) => `${a.date}T${a.time}`.localeCompare(`${b.date}T${b.time}`))
  }, [category, intensity, query, quests, social, time])

  const visibleQuests = useMemo(() => searchAreaBounds
    ? filtered.filter((quest) => quest.lat !== undefined && quest.lng !== undefined && searchAreaBounds.contains([quest.lat, quest.lng]))
    : filtered, [filtered, searchAreaBounds])

  useEffect(() => {
    if (!mapEl.current || mapRef.current) return
    const map = L.map(mapEl.current, { zoomControl: false }).setView([49.279, -123.119], 11.5)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '&copy; OpenStreetMap contributors' }).addTo(map)
    L.control.zoom({ position: 'topright' }).addTo(map)
    markersRef.current = L.layerGroup().addTo(map)
    map.on('moveend', () => setAreaChanged(true))
    mapRef.current = map
    return () => {
      map.remove()
      mapRef.current = null
    }
  }, [])

  useEffect(() => {
    const map = mapRef.current
    const markers = markersRef.current
    if (!map || !markers) return
    markers.clearLayers()
    visibleQuests.forEach((quest) => {
      if (quest.lat === undefined || quest.lng === undefined) return
      const selected = quest.id === selectedQuestId
      const marker = L.circleMarker([quest.lat, quest.lng], {
        radius: selected ? 13 : 9,
        color: '#fffefa',
        fillColor: markerColor(quest),
        fillOpacity: 1,
        weight: selected ? 4 : 3,
      }).bindTooltip(quest.name, { direction: 'top', offset: [0, -8] })
      marker.on('click', () => {
        setSelectedQuestId(quest.id)
        setBookingQuestId(quest.id)
      })
      markers.addLayer(marker)
    })
    const selected = visibleQuests.find((quest) => quest.id === selectedQuestId)
    if (selected?.lat !== undefined && selected.lng !== undefined) {
      map.flyTo([selected.lat, selected.lng], 13, { duration: 0.35 })
    }
  }, [visibleQuests, selectedQuestId])

  useEffect(() => {
    if (selectedQuestId && !visibleQuests.some((quest) => quest.id === selectedQuestId)) setSelectedQuestId(null)
    if (bookingQuestId && !visibleQuests.some((quest) => quest.id === bookingQuestId)) setBookingQuestId(null)
  }, [visibleQuests, selectedQuestId, bookingQuestId])

  const bookingQuest = bookingQuestId ? visibleQuests.find((quest) => quest.id === bookingQuestId) : undefined

  const isFitness = category === 'fitness'

  return (
    <Layout>
      <section className="discover-page" aria-label="Discover nearby activities">
        <div className="discover-sticky-controls">
        <div className="discover-toolbar">
          <label className="search-field"><span aria-hidden="true">⌕</span><span className="sr-only">Search activities, locations, or keywords</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search activities, location, or keywords..." /></label>
        </div>
        <div className="discover-categories" role="group" aria-label="Activity category">
          {categories.map((item) => <button key={item.id} type="button" className={`discover-category ${item.id}${category === item.id ? ' active' : ''}`} aria-pressed={category === item.id} onClick={() => setCategory(item.id)}><span aria-hidden="true">{item.icon}</span>{item.label}</button>)}
          <button className="filter-toggle" type="button" aria-expanded={filtersOpen} aria-controls="discover-filters" onClick={() => setFiltersOpen((open) => !open)} aria-label={filtersOpen ? 'Hide filters' : 'Show filters'}><span aria-hidden="true">☷</span></button>
        </div>

        <div className="discover-filter-bar" id="discover-filters" hidden={!filtersOpen}>
          <FilterAccordion id="intensity" title="Intensity" value={intensity} options={intensityOptions} expanded={openFilter === 'intensity'} onToggle={() => setOpenFilter(openFilter === 'intensity' ? null : 'intensity')} onChange={(value) => setIntensity(value)} />
          <FilterAccordion id="social" title="Social preference" value={social} options={socialOptions} expanded={openFilter === 'social'} onToggle={() => setOpenFilter(openFilter === 'social' ? null : 'social')} onChange={(value) => setSocial(value as SocialFilter)} />
          <FilterAccordion id="time" title="Time of day" value={time} options={timeOptions} expanded={openFilter === 'time'} onToggle={() => setOpenFilter(openFilter === 'time' ? null : 'time')} onChange={(value) => setTime(value as TimeFilter)} />
        </div>
        </div>

        {isFitness && <div className="partner-notice"><span aria-hidden="true">✦</span><p><strong>Fitness partner preview.</strong> Venue addresses are based on official listings. Class schedules, coaches, and spaces left are sample data until gym partners connect.</p></div>}

        <div className="discover-map-wrap">
          <div ref={mapEl} className="discover-map" role="application" aria-label="Map of upcoming Vancouver activities" />
          {areaChanged && <button className="search-area-button" type="button" onClick={() => { const map = mapRef.current; if (!map) return; setSearchAreaBounds(map.getBounds()); setAreaChanged(false); setSelectedQuestId(null) }}>Search this area</button>}
          <div className="map-area-label"><span className="map-area-dot" /> Vancouver &amp; nearby</div>
        </div>

        <section className="discover-upcoming">
          <div className="discover-upcoming-heading"><div><h1>{isFitness ? 'Fitness classes' : 'Activities'}</h1><p>{visibleQuests.length} {visibleQuests.length === 1 ? 'activity' : 'activities'} · Select a map pin to see its card</p></div><span className="upcoming-arrow" aria-hidden="true">→</span></div>
          {visibleQuests.length ? <div className="discover-quest-list">{visibleQuests.map((quest) => <QuestCard key={quest.id} quest={quest} selected={quest.id === selectedQuestId} showActions={false} compactActions />)}</div> : <div className="discover-no-results"><span aria-hidden="true">☀</span><p>No activities match this area and your filters.</p></div>}
        </section>
        {bookingQuest && <JoinConfirmationModal
          quest={bookingQuest}
          mode={joinedQuestIds.includes(bookingQuest.id) ? 'cancel' : 'join'}
          onClose={() => setBookingQuestId(null)}
          onConfirm={() => {
            if (joinedQuestIds.includes(bookingQuest.id)) cancel(bookingQuest.id)
            else join(bookingQuest.id)
            setBookingQuestId(null)
          }}
        />}
      </section>
    </Layout>
  )
}
