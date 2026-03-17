const VIBES = ['Calm', 'Bold', 'Playful', 'Professional', 'Futuristic', 'Warm', 'Minimal']

function VibeSelector({ value, onChange }) {
  return (
    <div className="mt-4 flex flex-wrap gap-2">
      {VIBES.map(v => {
        const active = value === v
        return (
          <button
            key={v}
            type="button"
            onClick={() => onChange(active ? null : v)}
            className={`rounded-lg px-3.5 py-2 text-xs font-medium transition-all ${
              active
                ? 'bg-amber-500/15 text-amber-400 ring-1 ring-amber-500/40'
                : 'bg-[#0a0a0a] text-neutral-500 ring-1 ring-[#262626] hover:ring-[#404040] hover:text-neutral-300'
            }`}
          >
            {v}
          </button>
        )
      })}
    </div>
  )
}

export default VibeSelector
