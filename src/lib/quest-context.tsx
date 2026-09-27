import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { Category } from '../data/activities'

export type QuestCategory = 'fitness' | 'sport' | 'outdoor' | 'other'
export type QuestIntensity = 'gentle' | 'moderate' | 'active'

export type Quest = {
  id: string
  name: string
  activityId?: string
  category: QuestCategory
  intensity: QuestIntensity
  date: string
  time: string
  location: string
  participants: number
  spots?: number
  createdBy: string
  description?: string
  venueName?: string
  venueLink?: string
  trainer?: string
  partnerPreview?: boolean
  lat?: number
  lng?: number
  imageUrl?: string
  imageCredit?: string
  imageCreditUrl?: string
}

type QuestContextValue = {
  quests: Quest[]
  joinedQuestIds: string[]
  join: (id: string) => void
  cancel: (id: string) => void
  create: (quest: Omit<Quest, 'id' | 'participants'> & { participants?: number }) => void
}

const STORAGE_KEY = 'wellquest-quests'
const QuestContext = createContext<QuestContextValue | null>(null)

function dateAfter(days: number) {
  const date = new Date()
  date.setDate(date.getDate() + days)
  return [date.getFullYear(), `${date.getMonth() + 1}`.padStart(2, '0'), `${date.getDate()}`.padStart(2, '0')].join('-')
}

function starterQuests(): Quest[] {
  return [
    { id: 'starter-walk', name: 'Morning seawall walk', activityId: 'seawall-walk', category: 'outdoor', intensity: 'gentle', date: dateAfter(1), time: '09:00', location: 'Jericho Beach Park, Vancouver', participants: 5, spots: 8, createdBy: 'WellQuest community', description: 'A relaxed, flat waterfront stroll with time to pause, chat, and enjoy the view.', imageUrl: 'https://images.unsplash.com/photo-1752560090014-01b60274fd02?auto=format&fit=crop&w=1800&q=82', imageCredit: 'Valerie', imageCreditUrl: 'https://unsplash.com/photos/city-skyline-overlooks-water-and-a-beach-lGRHKVAHodE', lat: 49.2722, lng: -123.1978 },
    { id: 'starter-tennis', name: 'Friendly doubles tennis', activityId: 'tennis', category: 'sport', intensity: 'moderate', date: dateAfter(2), time: '10:00', location: 'Jericho Beach Tennis Courts, Vancouver', participants: 3, spots: 6, createdBy: 'WellQuest community', description: 'A friendly doubles game with warm-up time and a social pace.', lat: 49.2722, lng: -123.1978 },
    { id: 'starter-pickleball', name: 'Pickleball for all levels', activityId: 'pickleball', category: 'sport', intensity: 'gentle', date: dateAfter(3), time: '11:00', location: 'West Point Grey Community Centre, Vancouver', participants: 4, spots: 8, createdBy: 'WellQuest community', description: 'Meet a few neighbours for easygoing games. Equipment can be shared.', lat: 49.2719, lng: -123.2034 },
    { id: 'starter-stretch', name: 'Easy stretch in the garden', activityId: 'mobility-studio', category: 'outdoor', intensity: 'gentle', date: dateAfter(4), time: '09:30', location: 'Vanier Park, Vancouver', participants: 2, spots: 6, createdBy: 'WellQuest community', description: 'A gentle outdoor mobility session. Bring a mat or use a park bench.', lat: 49.2767, lng: -123.1324 },
    { id: 'preview-k-strength', name: 'K-Strength foundations', category: 'fitness', intensity: 'moderate', date: dateAfter(1), time: '10:00', location: '1296 Homer St, Vancouver, BC', venueName: 'Kommunity Fitness · Yaletown', venueLink: 'https://kommunityfitness.com/', trainer: 'Partner coach (demo listing)', participants: 4, spots: 8, createdBy: 'WellQuest partner preview', partnerPreview: true, description: 'A coach-led strength session with room to work at your own pace. Class details and instructor are demo placeholders.', lat: 49.274, lng: -123.123 },
    { id: 'preview-k-mobility', name: 'Balance & mobility', category: 'fitness', intensity: 'gentle', date: dateAfter(2), time: '09:30', location: '2020 Arbutus St, Vancouver, BC', venueName: 'Kommunity Fitness · Kitsilano', venueLink: 'https://kommunityfitness.com/', trainer: 'Partner coach (demo listing)', participants: 3, spots: 7, createdBy: 'WellQuest partner preview', partnerPreview: true, description: 'A gentle movement class with balance and mobility practice. Class details and instructor are demo placeholders.', lat: 49.268, lng: -123.152 },
    { id: 'preview-af-coordination', name: 'Coordination & strength', category: 'fitness', intensity: 'moderate', date: dateAfter(3), time: '17:30', location: '103-2180 Dollarton Hwy, North Vancouver, BC', venueName: 'Anytime Fitness · North Vancouver', venueLink: 'https://www.anytimefitness.ca/', trainer: 'Partner coach (demo listing)', participants: 5, spots: 9, createdBy: 'WellQuest partner preview', partnerPreview: true, description: 'A small-group coordination and strength session. Class details and instructor are demo placeholders.', lat: 49.326, lng: -123.073 },
    { id: 'preview-af-mindbody', name: 'Mind-body reset', category: 'fitness', intensity: 'gentle', date: dateAfter(4), time: '11:00', location: '503 15th St, West Vancouver, BC', venueName: 'Anytime Fitness · West Vancouver', venueLink: 'https://www.anytimefitness.ca/', trainer: 'Partner coach (demo listing)', participants: 2, spots: 6, createdBy: 'WellQuest partner preview', partnerPreview: true, description: 'A slower-paced class focused on breathing, balance, and mindful movement. Class details and instructor are demo placeholders.', lat: 49.328, lng: -123.14 },
  ]
}

function readQuests(): { quests: Quest[]; joinedQuestIds: string[] } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { quests: starterQuests(), joinedQuestIds: [] }
    const parsed = JSON.parse(raw) as { quests?: Quest[]; joinedQuestIds?: string[] }
    const savedQuests = Array.isArray(parsed.quests) ? parsed.quests : []
    const starters = starterQuests()
    const savedById = new Map(savedQuests.map((quest) => [quest.id, quest]))
    const starterIds = new Set(starters.map((quest) => quest.id))
    const quests = [
      ...starters.map((quest) => {
        const saved = savedById.get(quest.id)
        return saved ? { ...quest, participants: saved.participants } : quest
      }),
      ...savedQuests.filter((quest) => !starterIds.has(quest.id)),
    ]
    return {
      quests,
      joinedQuestIds: Array.isArray(parsed.joinedQuestIds) ? parsed.joinedQuestIds.filter((id) => quests.some((quest) => quest.id === id)) : [],
    }
  } catch {
    return { quests: starterQuests(), joinedQuestIds: [] }
  }
}

function newId() {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `quest-${Date.now()}`
}

export function QuestProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState(readQuests)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    } catch {
      // Keep the current session usable if browser storage is unavailable.
    }
  }, [data])

  const value = useMemo<QuestContextValue>(() => ({
    quests: data.quests,
    joinedQuestIds: data.joinedQuestIds,
    join: (id) => setData((current) => {
      if (current.joinedQuestIds.includes(id)) return current
      const quest = current.quests.find((item) => item.id === id)
      if (!quest || (quest.spots !== undefined && quest.participants >= quest.spots)) return current
      return {
        quests: current.quests.map((item) => item.id === id ? { ...item, participants: item.participants + 1 } : item),
        joinedQuestIds: [...current.joinedQuestIds, id],
      }
    }),
    cancel: (id) => setData((current) => {
      if (!current.joinedQuestIds.includes(id)) return current
      const quest = current.quests.find((item) => item.id === id)
      if (!quest) return current
      const startsAt = new Date(`${quest.date}T${quest.time}`).getTime()
      if (Number.isNaN(startsAt) || startsAt - Date.now() < 60 * 60 * 1000) return current
      return {
        quests: current.quests.map((item) => item.id === id ? { ...item, participants: Math.max(0, item.participants - 1) } : item),
        joinedQuestIds: current.joinedQuestIds.filter((joinedId) => joinedId !== id),
      }
    }),
    create: (quest) => {
      const created = { ...quest, id: newId(), participants: quest.participants ?? 1 }
      setData((current) => ({
        quests: [created, ...current.quests],
        joinedQuestIds: current.joinedQuestIds,
      }))
    },
  }), [data])

  return <QuestContext.Provider value={value}>{children}</QuestContext.Provider>
}

export function useQuests() {
  const value = useContext(QuestContext)
  if (!value) throw new Error('useQuests must be used inside QuestProvider')
  return value
}

export function questCategoryFor(category: Category): QuestCategory {
  if (category === 'gym') return 'fitness'
  return category
}
