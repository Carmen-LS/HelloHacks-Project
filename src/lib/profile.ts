import type { Category, Difficulty, Goal } from '../data/activities'

export const PROFILE_KEY = 'wellquest-profile'

export type AgeRange = '45-54' | '55-64' | '65-74' | '75+'

export type Profile = {
  name: string
  ageRange: AgeRange
  goals: Goal[]
  categories: Category[]
  difficulty: Difficulty
}

export const emptyProfile: Profile = {
  name: '',
  ageRange: '65-74',
  goals: [],
  categories: [],
  difficulty: 'gentle',
}

export function loadProfile(): Profile | null {
  try {
    const raw = localStorage.getItem(PROFILE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as Profile
  } catch {
    return null
  }
}

export function saveProfile(profile: Profile) {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile))
}

export function clearProfile() {
  localStorage.removeItem(PROFILE_KEY)
}
