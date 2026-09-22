'use client'

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'

const DAY_MS = 24 * 60 * 60 * 1000
const STORAGE_KEY = 'velvaroma_deal_deadline'

export type TimeLeft = { days: number; hours: number; minutes: number; seconds: number }

function nextDeadline(): number {
  return Date.now() + DAY_MS
}

function readDeadline(): number {
  if (typeof window === 'undefined') return nextDeadline()
  const stored = window.localStorage.getItem(STORAGE_KEY)
  const parsed = stored ? Number(stored) : NaN
  // Auto-restart: if missing or already expired, start a fresh 24h window.
  if (!parsed || Number.isNaN(parsed) || parsed <= Date.now()) {
    const fresh = nextDeadline()
    window.localStorage.setItem(STORAGE_KEY, String(fresh))
    return fresh
  }
  return parsed
}

function toParts(ms: number): TimeLeft {
  const clamped = Math.max(0, ms)
  return {
    days: Math.floor(clamped / DAY_MS),
    hours: Math.floor((clamped / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((clamped / (1000 * 60)) % 60),
    seconds: Math.floor((clamped / 1000) % 60),
  }
}

type AnnouncementValue = {
  timeLeft: TimeLeft
  barVisible: boolean
  hideBar: () => void
}

const AnnouncementContext = createContext<AnnouncementValue | null>(null)

export function AnnouncementProvider({ children }: { children: ReactNode }) {
  const [deadline, setDeadline] = useState<number>(() => Date.now() + DAY_MS)
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(() => toParts(DAY_MS))
  const [barVisible, setBarVisible] = useState(true)

  useEffect(() => {
    setDeadline(readDeadline())
  }, [])

  useEffect(() => {
    const tick = () => {
      const remaining = deadline - Date.now()
      if (remaining <= 0) {
        // 24h elapsed — restart the window automatically.
        const fresh = nextDeadline()
        window.localStorage.setItem(STORAGE_KEY, String(fresh))
        setDeadline(fresh)
        setTimeLeft(toParts(DAY_MS))
        return
      }
      setTimeLeft(toParts(remaining))
    }
    tick()
    const id = window.setInterval(tick, 1000)
    return () => window.clearInterval(id)
  }, [deadline])

  return (
    <AnnouncementContext.Provider
      value={{ timeLeft, barVisible, hideBar: () => setBarVisible(false) }}
    >
      {children}
    </AnnouncementContext.Provider>
  )
}

export function useAnnouncement() {
  const ctx = useContext(AnnouncementContext)
  if (!ctx) throw new Error('useAnnouncement must be used within AnnouncementProvider')
  return ctx
}
