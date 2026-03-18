import { useNavigate } from 'react-router-dom'

const VIBE_GRADIENTS = {
  Calm: 'from-emerald-500/30 to-teal-500/10',
  Bold: 'from-fuchsia-500/30 to-amber-500/10',
  Playful: 'from-pink-500/30 to-sky-400/10',
  Professional: 'from-slate-600/30 to-slate-800/10',
  Futuristic: 'from-cyan-500/30 to-violet-600/10',
  Warm: 'from-amber-500/30 to-orange-500/10',
  Minimal: 'from-neutral-600/30 to-neutral-800/10',
}

function DemoCard({ demo }) {
  const navigate = useNavigate()
  const vibe = demo.vibe || 'Custom'
  const gradient = VIBE_GRADIENTS[vibe] || 'from-neutral-700/30 to-neutral-900/10'

  return (
    <button
      type="button"
      onClick={() => navigate(`/demo/${demo.id}`)}
      className="group flex flex-col overflow-hidden rounded-2xl border border-[#171717] bg-[#0a0a0a] text-left transition-all hover:border-[#262626] hover:shadow-lg"
    >
      {/* Live preview thumbnail */}
      <div className={`relative h-48 w-full overflow-hidden bg-gradient-to-br ${gradient}`}>
        {demo.demo_html && (
          <iframe
            title={demo.idea}
            srcDoc={demo.demo_html}
            sandbox="allow-scripts"
            className="pointer-events-none absolute left-0 top-0 h-[900px] w-[1440px] origin-top-left"
            style={{ transform: 'scale(0.24)', transformOrigin: 'top left' }}
            tabIndex={-1}
            loading="lazy"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent opacity-60" />
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <p className="line-clamp-2 text-sm text-neutral-300 group-hover:text-white">{demo.idea}</p>
        <div className="mt-auto flex items-center justify-between pt-2 text-xs text-neutral-600">
          <span className="rounded-md bg-[#050505] px-2 py-0.5 font-medium">{vibe}</span>
          {demo.created_at && <span>{new Date(demo.created_at).toLocaleDateString()}</span>}
        </div>
      </div>
    </button>
  )
}

export default DemoCard
