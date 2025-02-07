import { create } from 'zustand'
import { Session } from 'next-auth'

interface NavigationStore {
  session: Session | null
  setSession: (session: Session | null) => void
  isInitialized: boolean
  setInitialized: (value: boolean) => void
  fontsLoaded: boolean
  setFontsLoaded: (value: boolean) => void
}

export const useNavigationStore = create<NavigationStore>((set) => ({
  session: null,
  setSession: (session) => set({ session }),
  isInitialized: false,
  setInitialized: (value) => set({ isInitialized: value }),
  fontsLoaded: false,
  setFontsLoaded: (value) => set({ fontsLoaded: value }),
})) 