import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
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
  spots: number
  createdBy: string
}

type QuestContextValue = {
  quests: Quest[]
  joinedQuestIds: string[]
  join: (id: string) => void
  create: (quest: Omit<Quest, 'id' | 'participants'>) => void
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
    { id: 'starter-walk', name: 'Morning seawall walk', activityId: 'seawall-walk', category: 'outdoor', intensity: 'gentle', date: dateAfter(1), time: '09:00', location: 'Jericho Beach Park, Vancouver', participants: 5, spots: 8, createdBy: 'WellQuest community' },
    { id: 'starter-tennis', name: 'Friendly doubles tennis', activityId: 'tennis', category: 'sport', intensity: 'moderate', date: dateAfter(2), time: '10:00', location: 'Jericho Beach Tennis Courts, Vancouver', participants: 3, spots: 6, createdBy: 'WellQuest community' },
    { id: 'starter-pickleball', name: 'Pickleball for all levels', activityId: 'pickleball', category: 'sport', intensity: 'gentle', date: dateAfter(3), time: '11:00', location: 'West Point Grey Community Centre, Vancouver', participants: 4, spots: 8, createdBy: 'WellQuest community' },
    { id: 'starter-stretch', name: 'Easy stretch in the garden', activityId: 'mobility-studio', category: 'fitness', intensity: 'gentle', date: dateAfter(4), time: '09:30', location: 'Vanier Park, Vancouver', participants: 2, spots: 6, createdBy: 'WellQuest community' },
  ]
}

function readQuests(): { quests: Quest[]; joinedQuestIds: string[] } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { quests: starterQuests(), joinedQuestIds: [] }
    const parsed = JSON.parse(raw) as { quests?: Quest[]; joinedQuestIds?: string[] }
    return {
      quests: Array.isArray(parsed.quests) ? parsed.quests : starterQuests(),
      joinedQuestIds: Array.isArray(parsed.joinedQuestIds) ? parsed.joinedQuestIds : [],
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

  function update(next: typeof data) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    } catch {
      // Keep the current session usable if browser storage is unavailable.
    }
    setData(next)
  }

  const value = useMemo<QuestContextValue>(() => ({
    quests: data.quests,
    joinedQuestIds: data.joinedQuestIds,
    join: (id) => {
      if (data.joinedQuestIds.includes(id)) return
      const quest = data.quests.find((item) => item.id === id)
      if (!quest || quest.participants >= quest.spots) return
      update({
        quests: data.quests.map((item) => item.id === id ? { ...item, participants: item.participants + 1 } : item),
        joinedQuestIds: [...data.joinedQuestIds, id],
      })
    },
    create: (quest) => update({
      quests: [{ ...quest, id: newId(), participants: 1 }, ...data.quests],
      joinedQuestIds: data.joinedQuestIds,
    }),
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
