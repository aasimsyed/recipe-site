import { create } from 'zustand'
import type { Session } from 'next-auth'

interface NavigationState {
  session: Session | null
  initialized: boolean
  setSession: (session: Session | null) => void
  setInitialized: (initialized: boolean) => void
}

export const useNavigationStore = create<NavigationState>((set) => ({
  session: null,
  initialized: false,
  setSession: (session) => set({ session }),
  setInitialized: (initialized) => set({ initialized })
})) 