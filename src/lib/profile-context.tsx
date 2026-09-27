import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import {
  clearProfile as clearStoredProfile,
  loadProfile,
  saveProfile as persistProfile,
  type Profile,
} from '../lib/profile'
import { isSupabaseConfigured, supabase } from './supabase'
import type { Session } from '@supabase/supabase-js'

type ProfileContextValue = {
  profile: Profile | null
  userId: string | null
  isDemo: boolean
  ready: boolean
  backendConfigured: boolean
  save: (next: Profile) => void
  startDemo: (next: Profile) => void
  signIn: (email: string, password: string) => Promise<void>
  signUp: (profile: Profile, password: string) => Promise<{ needsEmailConfirmation: boolean }>
  signOut: () => Promise<void>
  reset: () => void
}

const ProfileContext = createContext<ProfileContextValue | null>(null)

function profileFromRow(row: Record<string, unknown>, email?: string): Profile {
  return {
    name: String(row.name ?? ''),
    firstName: String(row.first_name ?? ''),
    lastName: String(row.last_name ?? ''),
    birthDate: row.birth_date ? String(row.birth_date).slice(0, 10) : undefined,
    ageRange: (row.age_range as Profile['ageRange']) ?? '65-74',
    goals: (row.goals as Profile['goals']) ?? [],
    categories: (row.categories as Profile['categories']) ?? [],
    difficulty: (row.difficulty as Profile['difficulty']) ?? 'gentle',
    interests: (row.interests as string[]) ?? [],
    email,
    avatarDataUrl: row.avatar_url ? String(row.avatar_url) : undefined,
  }
}

async function loadRemoteProfile(userId: string, email?: string) {
  if (!supabase) return null
  const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle()
  if (error) throw error
  return data ? profileFromRow(data, email) : null
}

async function saveRemoteProfile(userId: string, profile: Profile): Promise<Profile> {
  if (!supabase) return profile
  let avatarUrl = profile.avatarDataUrl ?? null
  if (avatarUrl?.startsWith('data:image/')) {
    const response = await fetch(avatarUrl)
    const image = await response.blob()
    const { error: uploadError } = await supabase.storage.from('avatars').upload(`${userId}/avatar.jpg`, image, { upsert: true, contentType: image.type || 'image/jpeg' })
    if (uploadError) throw uploadError
    avatarUrl = supabase.storage.from('avatars').getPublicUrl(`${userId}/avatar.jpg`).data.publicUrl
  }
  const { error } = await supabase.from('profiles').upsert({
    id: userId,
    name: profile.name,
    first_name: profile.firstName ?? '',
    last_name: profile.lastName ?? '',
    birth_date: profile.birthDate || null,
    age_range: profile.ageRange,
    goals: profile.goals,
    categories: profile.categories,
    interests: profile.interests ?? [],
    difficulty: profile.difficulty,
    avatar_url: avatarUrl,
    updated_at: new Date().toISOString(),
  })
  if (error) throw error
  return { ...profile, avatarDataUrl: avatarUrl ?? undefined }
}

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<Profile | null>(() => isSupabaseConfigured ? null : loadProfile())
  const [userId, setUserId] = useState<string | null>(null)
  const [isDemo, setIsDemo] = useState(!isSupabaseConfigured)
  const [ready, setReady] = useState(!isSupabaseConfigured)

  useEffect(() => {
    const client = supabase
    if (!client) return
    let active = true
    const loadSession = async (session: Session | null) => {
      if (!active) return
      if (!session?.user) {
        setUserId(null)
        setProfile(null)
        setIsDemo(false)
        setReady(true)
        return
      }
      setUserId(session.user.id)
      setIsDemo(false)
      try {
        const remoteProfile = await loadRemoteProfile(session.user.id, session.user.email)
        if (active) setProfile(remoteProfile)
      } catch (error) {
        console.error('Could not load your WellQuest profile.', error)
        if (active) setProfile(null)
      } finally {
        if (active) setReady(true)
      }
    }
    void client.auth.getSession().then(({ data }) => loadSession(data.session))
    const { data: listener } = client.auth.onAuthStateChange((_event, session) => {
      window.setTimeout(() => { void loadSession(session) }, 0)
    })
    return () => {
      active = false
      listener.subscription.unsubscribe()
    }
  }, [])

  const value = useMemo<ProfileContextValue>(() => ({
    profile,
    userId,
    isDemo,
    ready,
    backendConfigured: isSupabaseConfigured,
    save: (next) => {
      setProfile(next)
      if (isDemo || !supabase || !userId) persistProfile(next)
      else void saveRemoteProfile(userId, next).then(setProfile).catch((error) => console.error('Could not save profile.', error))
    },
    startDemo: (next) => {
      setUserId(null)
      setIsDemo(true)
      setProfile(next)
      persistProfile(next)
    },
    signIn: async (email, password) => {
      if (!supabase) throw new Error('Set the Supabase project URL and publishable key first.')
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      if (data.user) {
        const remoteProfile = await loadRemoteProfile(data.user.id, data.user.email)
        setUserId(data.user.id)
        setProfile(remoteProfile)
        setIsDemo(false)
        setReady(true)
      }
    },
    signUp: async (next, password) => {
      if (!supabase) throw new Error('Set the Supabase project URL and publishable key first.')
      const { data, error } = await supabase.auth.signUp({
        email: next.email ?? '',
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/home`,
          data: {
            name: next.name,
            first_name: next.firstName,
            last_name: next.lastName,
            birth_date: next.birthDate,
            age_range: next.ageRange,
            goals: next.goals,
            categories: next.categories,
            interests: next.interests,
            difficulty: next.difficulty,
          },
        },
      })
      if (error) throw error
      if (data.session && data.user) {
        setUserId(data.user.id)
        setIsDemo(false)
        setProfile(next)
        const persisted = await saveRemoteProfile(data.user.id, next)
        setProfile(persisted)
        setReady(true)
      }
      return { needsEmailConfirmation: !data.session }
    },
    signOut: async () => {
      if (supabase) {
        const { error } = await supabase.auth.signOut()
        if (error) throw error
      }
      setUserId(null)
      setProfile(null)
      setIsDemo(false)
      clearStoredProfile()
    },
    reset: () => {
      clearStoredProfile()
      setProfile(null)
      if (supabase && userId && !isDemo) void supabase.auth.signOut()
      setUserId(null)
      setIsDemo(false)
    },
  }), [profile, userId, isDemo, ready])

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>
}

export function useProfile() {
  const ctx = useContext(ProfileContext)
  if (!ctx) throw new Error('useProfile must be used inside ProfileProvider')
  return ctx
}
