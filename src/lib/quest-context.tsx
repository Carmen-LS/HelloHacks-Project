import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { Category } from '../data/activities'
import { supabase } from './supabase'
import { useProfile } from './profile-context'

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
  join: (id: string) => Promise<void>
  cancel: (id: string) => Promise<void>
  create: (quest: Omit<Quest, 'id' | 'participants'> & { participants?: number }) => Promise<void>
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
  const { userId, isDemo, backendConfigured, profile } = useProfile()
  const remoteMode = Boolean(backendConfigured && userId && !isDemo)
  const [data, setData] = useState(readQuests)

  const refreshRemote = async () => {
    if (!supabase || !userId) return
    const [{ data: questRows, error: questError }, { data: bookingRows, error: bookingError }] = await Promise.all([
      supabase.from('quests').select('*').order('event_date').order('event_time'),
      supabase.from('bookings').select('quest_id').eq('user_id', userId),
    ])
    if (questError) throw questError
    if (bookingError) throw bookingError
    const quests = (questRows ?? []).map((row) => ({
      id: row.id,
      name: row.name,
      activityId: row.activity_id ?? undefined,
      category: row.category as QuestCategory,
      intensity: row.intensity as QuestIntensity,
      date: row.event_date,
      time: String(row.event_time).slice(0, 5),
      location: row.location,
      participants: row.baseline_participants + row.booked_count,
      spots: row.capacity ?? undefined,
      createdBy: row.created_by_name,
      description: row.description ?? undefined,
      venueName: row.venue_name ?? undefined,
      venueLink: row.venue_link ?? undefined,
      trainer: row.trainer ?? undefined,
      partnerPreview: row.partner_preview,
      lat: row.lat ?? undefined,
      lng: row.lng ?? undefined,
      imageUrl: row.image_url ?? undefined,
      imageCredit: row.image_credit ?? undefined,
      imageCreditUrl: row.image_credit_url ?? undefined,
    })) as Quest[]
    setData({ quests, joinedQuestIds: (bookingRows ?? []).map((row) => row.quest_id) })
  }

  useEffect(() => {
    const client = supabase
    if (!remoteMode || !client || !userId) return
    let active = true
    const refresh = async () => {
      try { await refreshRemote() }
      catch (error) {
        console.error('Could not load shared quests.', error)
        if (active) setData({ quests: starterQuests(), joinedQuestIds: [] })
      }
    }
    void refresh()
    const channel = client.channel(`wellquest-${userId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'quests' }, () => { void refresh() })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, () => { void refresh() })
      .subscribe()
    return () => { active = false; void client.removeChannel(channel) }
  }, [remoteMode, userId])

  useEffect(() => {
    if (remoteMode) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    } catch {
      // Keep the current session usable if browser storage is unavailable.
    }
  }, [data, remoteMode])

  const value = useMemo<QuestContextValue>(() => ({
    quests: data.quests,
    joinedQuestIds: data.joinedQuestIds,
    join: async (id) => {
      if (remoteMode && supabase) {
        const { error } = await supabase.rpc('join_quest', { p_quest_id: id })
        if (error) throw error
        await refreshRemote()
        return
      }
      setData((current) => {
        if (current.joinedQuestIds.includes(id)) return current
        const quest = current.quests.find((item) => item.id === id)
        if (!quest || (quest.spots !== undefined && quest.participants >= quest.spots)) return current
        return { quests: current.quests.map((item) => item.id === id ? { ...item, participants: item.participants + 1 } : item), joinedQuestIds: [...current.joinedQuestIds, id] }
      })
    },
    cancel: async (id) => {
      if (remoteMode && supabase) {
        const { error } = await supabase.rpc('cancel_quest', { p_quest_id: id })
        if (error) throw error
        await refreshRemote()
        return
      }
      setData((current) => {
        if (!current.joinedQuestIds.includes(id)) return current
        const quest = current.quests.find((item) => item.id === id)
        if (!quest) return current
        const startsAt = new Date(`${quest.date}T${quest.time}`).getTime()
        if (Number.isNaN(startsAt) || startsAt - Date.now() < 60 * 60 * 1000) return current
        return { quests: current.quests.map((item) => item.id === id ? { ...item, participants: Math.max(0, item.participants - 1) } : item), joinedQuestIds: current.joinedQuestIds.filter((joinedId) => joinedId !== id) }
      })
    },
    create: async (quest) => {
      const id = newId()
      if (remoteMode && supabase && userId) {
        const { error } = await supabase.from('quests').insert({
          id, name: quest.name, activity_id: quest.activityId ?? null, category: quest.category, intensity: quest.intensity,
          event_date: quest.date, event_time: quest.time, location: quest.location, baseline_participants: quest.participants ?? 1,
          capacity: quest.spots ?? null, created_by: userId, created_by_name: profile?.name ?? 'WellQuest member',
          description: quest.description ?? null, venue_name: quest.venueName ?? null, venue_link: quest.venueLink ?? null,
          trainer: quest.trainer ?? null, partner_preview: quest.partnerPreview ?? false, lat: quest.lat ?? null, lng: quest.lng ?? null,
          image_url: quest.imageUrl ?? null, image_credit: quest.imageCredit ?? null, image_credit_url: quest.imageCreditUrl ?? null,
        })
        if (error) throw error
        await refreshRemote()
        return
      }
      const created = { ...quest, id, participants: quest.participants ?? 1 }
      setData((current) => ({ quests: [created, ...current.quests], joinedQuestIds: current.joinedQuestIds }))
    },
  }), [data, remoteMode, userId, profile])

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
