function VisionBrief({ brief }) {
  if (!brief) return null
  const { communicates, whoItsFor, validate, emotionalSignals, redFlags } = brief

  return (
    <div className="rounded-2xl border border-[#171717] bg-[#0a0a0a] p-6">
      <h3 className="mb-4 font-display text-sm font-semibold tracking-wider text-neutral-500 uppercase">Vision Brief</h3>
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <div>
            <p className="text-xs font-medium text-neutral-500 uppercase tracking-wider">What this communicates</p>
            <p className="mt-1.5 text-sm leading-relaxed text-neutral-300">{communicates}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Who this is for</p>
            <p className="mt-1.5 text-sm leading-relaxed text-neutral-300">{whoItsFor}</p>
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <p className="text-xs font-medium text-neutral-500 uppercase tracking-wider">What to validate</p>
            <ul className="mt-1.5 space-y-1 text-sm text-neutral-300">
              {validate?.map(item => <li key={item} className="flex gap-2"><span className="text-amber-400">•</span>{item}</li>)}
            </ul>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Emotional signals</p>
              <ul className="mt-1.5 space-y-1 text-sm text-neutral-300">
                {emotionalSignals?.map(item => <li key={item} className="flex gap-2"><span className="text-emerald-400">•</span>{item}</li>)}
              </ul>
            </div>
            <div>
              <p className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Red flags</p>
              <ul className="mt-1.5 space-y-1 text-sm text-red-300/80">
                {redFlags?.map(item => <li key={item} className="flex gap-2"><span className="text-red-400">•</span>{item}</li>)}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default VisionBrief
