import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import {
  clearProfile as clearStoredProfile,
  loadProfile,
  saveProfile as persistProfile,
  type Profile,
} from '../lib/profile'

type ProfileContextValue = {
  profile: Profile | null
  save: (next: Profile) => void
  reset: () => void
}

const ProfileContext = createContext<ProfileContextValue | null>(null)

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<Profile | null>(() => loadProfile())

  const value = useMemo<ProfileContextValue>(
    () => ({
      profile,
      save: (next) => {
        persistProfile(next)
        setProfile(next)
      },
      reset: () => {
        clearStoredProfile()
        setProfile(null)
      },
    }),
    [profile],
  )

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>
}

export function useProfile() {
  const ctx = useContext(ProfileContext)
  if (!ctx) throw new Error('useProfile must be used inside ProfileProvider')
  return ctx
}
