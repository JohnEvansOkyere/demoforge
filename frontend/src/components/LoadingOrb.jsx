import { useEffect, useState } from 'react'

const messages = [
  'Understanding your vision...',
  'Choosing the right emotional palette...',
  'Designing the layout...',
  'Bringing your users to life...',
  'Adding the details that matter...',
  'Making it feel real...',
]

function LoadingOrb({ idea }) {
  const [index, setIndex] = useState(0)
  const [displayedText, setDisplayedText] = useState('')

  useEffect(() => {
    const id = setInterval(() => setIndex(i => (i + 1) % messages.length), 2500)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    const msg = messages[index]
    let charIdx = 0
    setDisplayedText('')
    const id = setInterval(() => {
      charIdx++
      setDisplayedText(msg.slice(0, charIdx))
      if (charIdx >= msg.length) clearInterval(id)
    }, 25)
    return () => clearInterval(id)
  }, [index])

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-8 bg-[#050505]/95 backdrop-blur-md">
      <div className="relative h-40 w-40">
        <div className="absolute inset-0 animate-pulse rounded-full bg-gradient-to-br from-amber-400 via-orange-600 to-amber-700 opacity-30 blur-3xl" />
        <div className="absolute inset-4 animate-[spin_10s_linear_infinite] rounded-full border border-amber-500/20" />
        <div className="absolute inset-8 animate-[spin_6s_linear_infinite_reverse] rounded-full border border-orange-500/15" />
        <div className="relative flex h-full w-full items-center justify-center rounded-full border border-amber-500/30 bg-[#050505]/90 df-glow-strong">
          <div className="h-16 w-16 animate-pulse rounded-full bg-gradient-to-br from-amber-400/50 to-orange-500/50 blur-sm" />
        </div>
      </div>
      <div className="space-y-3 text-center">
        <p className="h-5 font-mono text-sm font-medium text-amber-400">{displayedText}</p>
        {idea && (
          <p className="max-w-md text-sm italic text-neutral-600">&ldquo;{idea}&rdquo;</p>
        )}
      </div>
    </div>
  )
}

export default LoadingOrb
