'use client'

import { useAnnouncement } from '@/lib/announcement-context'

function pad(n: number) {
  return String(n).padStart(2, '0')
}

export function CountdownBoxes() {
  const { timeLeft } = useAnnouncement()
  const units = [
    { label: 'DAYS', value: timeLeft.days },
    { label: 'HOURS', value: timeLeft.hours },
    { label: 'MINUTES', value: timeLeft.minutes },
    { label: 'SECONDS', value: timeLeft.seconds },
  ]
  return (
    <div className="flex items-center justify-center gap-3 sm:gap-4">
      {units.map((u) => (
        <div
          key={u.label}
          className="flex h-24 w-20 flex-col items-center justify-center rounded-lg bg-primary text-primary-foreground sm:h-28 sm:w-24"
        >
          <span className="text-4xl font-semibold tabular-nums sm:text-5xl">{pad(u.value)}</span>
          <span className="mt-1 text-[10px] tracking-[0.2em] text-primary-foreground/70">{u.label}</span>
        </div>
      ))}
    </div>
  )
}

export function CountdownInline() {
  const { timeLeft } = useAnnouncement()
  return (
    <span className="tabular-nums font-semibold">
      {pad(timeLeft.hours + timeLeft.days * 24)}:{pad(timeLeft.minutes)}:{pad(timeLeft.seconds)}
    </span>
  )
}
