import { useNavigate } from 'react-router-dom'

const EXAMPLES = [
  { label: 'Mental Health', color: 'emerald', desc: 'Calm journaling for burnt-out engineers in Lagos', gradient: 'from-emerald-500/20 via-emerald-400/5 to-teal-500/10', border: 'border-emerald-500/30' },
  { label: 'Farmers Market', color: 'amber', desc: 'Earthy marketplace connecting northern Ghana farmers', gradient: 'from-amber-500/15 via-amber-400/5 to-orange-500/10', border: 'border-amber-500/30' },
  { label: 'Fintech', color: 'blue', desc: 'Savings app with deep navy and gold accents', gradient: 'from-blue-600/20 via-slate-800/10 to-indigo-500/10', border: 'border-blue-500/30' },
  { label: 'Creative Portfolio', color: 'fuchsia', desc: 'Expressive showcase for African designers', gradient: 'from-fuchsia-500/20 via-purple-500/5 to-pink-500/10', border: 'border-fuchsia-500/30' },
]

const FEATURES = [
  { title: 'Any idea, any domain', desc: 'Health, fintech, social, agriculture, education, logistics — describe it and watch it materialize.', icon: '◆' },
  { title: 'Emotionally designed', desc: 'AI picks colors, fonts, and layout to match the feeling your product should evoke.', icon: '♡' },
  { title: 'Validate before you build', desc: 'Every demo includes a Vision Brief: who it\'s for, what to test, and what signals to watch.', icon: '✓' },
  { title: 'Share in one click', desc: 'Each demo has a unique shareable link. Investors and teammates can open it instantly.', icon: '↗' },
]

function Landing() {
  const navigate = useNavigate()

  return (
    <div className="relative overflow-hidden">
      {/* Background grid pattern */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(245,158,11,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(245,158,11,0.03)_1px,transparent_1px)] bg-[size:64px_64px]" />
        <div className="absolute left-1/2 top-0 h-[600px] w-[800px] -translate-x-1/2 bg-gradient-to-b from-amber-500/[0.07] via-orange-500/[0.03] to-transparent blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 lg:px-8">
        {/* Hero */}
        <section className="pb-20 pt-20 md:pt-28 lg:pt-36">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/5 px-4 py-1.5 text-xs font-medium text-amber-400">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
              AI-powered product demo studio
            </div>

            <h1 className="font-display text-5xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl">
              Your vision.
              <br />
              <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 bg-clip-text text-transparent">
                Alive in seconds.
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-neutral-400 md:text-lg">
              Describe any startup idea. DemoForge builds you a live, interactive 
              demo — no templates, no designers, no waiting.
            </p>

            <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <button
                onClick={() => navigate('/generate')}
                className="group relative inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-8 py-3.5 text-sm font-semibold text-black transition-all hover:from-amber-400 hover:to-orange-400 df-glow-strong"
              >
                Start creating
                <svg className="h-4 w-4 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </button>
              <button
                onClick={() => document.getElementById('examples')?.scrollIntoView({ behavior: 'smooth' })}
                className="inline-flex items-center gap-2 text-sm text-neutral-400 transition-colors hover:text-white"
              >
                See examples
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </button>
            </div>
          </div>

          {/* Hero demo preview card */}
          <div className="mx-auto mt-16 max-w-4xl">
            <div className="rounded-2xl border border-[#171717] bg-[#0a0a0a] p-1 shadow-2xl shadow-amber-500/[0.03]">
              <div className="flex items-center gap-2 rounded-t-xl border-b border-[#171717] bg-[#0a0a0a] px-4 py-2.5">
                <div className="flex gap-1.5">
                  <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
                  <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
                  <span className="h-3 w-3 rounded-full bg-[#28c840]" />
                </div>
                <div className="ml-4 flex-1 rounded-lg bg-[#050505] px-4 py-1.5 text-xs text-neutral-600 font-mono">
                  your-vision.demoforge.app
                </div>
              </div>
              <div className="grid gap-4 rounded-b-xl bg-gradient-to-br from-[#0a0a0a] to-[#050505] p-6 md:grid-cols-2">
                <div className="space-y-4">
                  <div className="rounded-xl bg-gradient-to-br from-emerald-500/10 to-teal-500/5 p-5 ring-1 ring-emerald-500/20">
                    <p className="text-[11px] font-medium tracking-wider text-emerald-400 uppercase">Mental health demo</p>
                    <p className="mt-2 text-sm text-neutral-300">A calm journaling app for burnt-out engineers in Lagos.</p>
                  </div>
                  <div className="rounded-xl bg-[#050505] p-5 ring-1 ring-white/5">
                    <p className="text-[11px] font-medium tracking-wider text-neutral-500 uppercase">What this communicates</p>
                    <p className="mt-2 text-sm text-neutral-300 italic">&ldquo;You can finally exhale. This space belongs to your mind, not your manager.&rdquo;</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-xl bg-[#050505] p-4 ring-1 ring-white/5">
                      <p className="text-[11px] font-medium tracking-wider text-neutral-500 uppercase">Who it&apos;s for</p>
                      <p className="mt-2 text-xs text-neutral-400">Early-career devs in Lagos who are quietly burning out</p>
                    </div>
                    <div className="rounded-xl bg-[#050505] p-4 ring-1 ring-white/5">
                      <p className="text-[11px] font-medium tracking-wider text-neutral-500 uppercase">Signals</p>
                      <p className="mt-2 text-xs text-neutral-400">Shoulders drop when they open the app</p>
                    </div>
                  </div>
                  <div className="rounded-xl border border-dashed border-[#262626] bg-[#050505]/50 p-5">
                    <p className="text-xs text-neutral-500 italic">&ldquo;The emotional design layer is our moat. DemoForge makes your vision <em className="text-amber-400">felt</em>.&rdquo;</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="pb-20">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map(f => (
              <div key={f.title} className="group rounded-2xl border border-[#171717] bg-[#0a0a0a] p-6 transition-colors hover:border-[#262626]">
                <span className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-lg text-amber-400">{f.icon}</span>
                <h3 className="font-display text-sm font-semibold text-white">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-neutral-500">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Examples */}
        <section id="examples" className="pb-20">
          <div className="mb-8 text-center">
            <p className="text-xs font-medium tracking-widest text-neutral-500 uppercase">Built with DemoForge</p>
            <h2 className="mt-2 font-display text-2xl font-bold tracking-tight md:text-3xl">Every idea gets a custom demo</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {EXAMPLES.map(ex => (
              <div key={ex.label} className={`rounded-2xl border ${ex.border} bg-gradient-to-br ${ex.gradient} p-6 transition-all hover:scale-[1.02]`}>
                <p className="text-xs font-semibold tracking-wider text-neutral-300 uppercase">{ex.label}</p>
                <p className="mt-3 text-sm leading-relaxed text-neutral-400">{ex.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="pb-24">
          <div className="rounded-2xl border border-[#171717] bg-gradient-to-br from-amber-500/[0.05] via-[#0a0a0a] to-orange-500/[0.05] p-10 text-center md:p-16">
            <h2 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
              Ready to see your idea come alive?
            </h2>
            <p className="mx-auto mt-4 max-w-md text-sm text-neutral-400 leading-relaxed">
              No credit card. No setup. Just describe your startup idea and watch it materialize into a real, interactive demo.
            </p>
            <button
              onClick={() => navigate('/generate')}
              className="mt-8 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-8 py-3.5 text-sm font-semibold text-black transition-all hover:from-amber-400 hover:to-orange-400 df-glow-strong"
            >
              Start creating — it&apos;s free
            </button>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-[#171717] py-8 text-center text-xs text-neutral-600">
          DemoForge &middot; Your vision, alive in seconds.
        </footer>
      </div>
    </div>
  )
}

export default Landing
