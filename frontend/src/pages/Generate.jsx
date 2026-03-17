import { useEffect, useState, useCallback } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { generateDemo, fetchCredits, initializePayment, verifyPayment } from '../lib/api.js'
import VibeSelector from '../components/VibeSelector.jsx'
import LoadingOrb from '../components/LoadingOrb.jsx'
import BrowserChrome from '../components/BrowserChrome.jsx'
import VisionBrief from '../components/VisionBrief.jsx'

const PAYSTACK_PUBLIC_KEY = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY ?? ''

const PLACEHOLDERS = [
  'A meditation app for burnt-out tech workers in Lagos...',
  'A peer-to-peer crop trading platform for Ghanaian farmers...',
  'A gamified savings app that turns money goals into quests...',
  'A telemedicine platform for rural communities in East Africa...',
  'A social portfolio platform for African designers and artists...',
  'A loyalty rewards app for local barbershops...',
]

function useRotatingPlaceholder() {
  const [index, setIndex] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setIndex(i => (i + 1) % PLACEHOLDERS.length), 4000)
    return () => clearInterval(id)
  }, [])
  return PLACEHOLDERS[index]
}

function Generate({ session, sessionLoading }) {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [idea, setIdea] = useState('')
  const [vibe, setVibe] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)
  const [copied, setCopied] = useState(false)
  const [credits, setCredits] = useState(null)
  const [creditsLoading, setCreditsLoading] = useState(true)
  const [paying, setPaying] = useState(false)
  const placeholder = useRotatingPlaceholder()

  const token = session?.access_token ?? null
  const userEmail = session?.user?.email ?? ''

  const loadCredits = useCallback(async () => {
    if (!token) return
    setCreditsLoading(true)
    try {
      const data = await fetchCredits(token)
      setCredits(data.credits)
    } catch {
      setCredits(0)
    } finally {
      setCreditsLoading(false)
    }
  }, [token])

  useEffect(() => { loadCredits() }, [loadCredits])

  // Handle Paystack callback redirect
  useEffect(() => {
    const ref = searchParams.get('reference') || searchParams.get('trxref')
    if (ref && token) {
      verifyPayment(ref, token).then(data => {
        if (data.credited) setCredits(data.credits)
      }).catch(() => {})
      // Clean URL
      window.history.replaceState({}, '', '/generate')
    }
  }, [searchParams, token])

  if (!sessionLoading && !session) {
    return (
      <div className="flex min-h-[calc(100vh-5rem)] items-center justify-center px-4">
        <div className="max-w-md text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400/20 to-orange-600/20 ring-1 ring-amber-500/30">
            <svg className="h-8 w-8 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
            </svg>
          </div>
          <h2 className="font-display text-2xl font-bold tracking-tight">Sign in to create demos</h2>
          <p className="mt-3 text-sm text-neutral-400 leading-relaxed">
            Enter your email to get started — no password, no friction. Just your vision, materialized.
          </p>
          <button
            onClick={() => navigate('/auth')}
            className="mt-6 inline-flex rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-8 py-3 text-sm font-semibold text-black transition-all hover:from-amber-400 hover:to-orange-400"
          >
            Continue with email
          </button>
        </div>
      </div>
    )
  }

  const handleGenerate = async () => {
    if (!idea.trim()) return
    if (credits !== null && credits < 1) return
    setLoading(true)
    setError('')
    try {
      const data = await generateDemo({ idea, vibe, token })
      setResult(data)
      setCredits(prev => (prev !== null ? prev - 1 : prev))
    } catch (err) {
      if (err.status === 402) {
        setCredits(0)
        setError('No credits remaining. Buy more to continue.')
      } else {
        setError(err.message ?? 'Failed to generate demo')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleBuyCredits = async () => {
    if (!token || !userEmail) return
    setPaying(true)
    setError('')
    try {
      const data = await initializePayment({
        email: userEmail,
        callbackUrl: `${window.location.origin}/generate`,
        token,
      })
      window.location.href = data.authorization_url
    } catch (err) {
      setError(err.message ?? 'Failed to start payment')
      setPaying(false)
    }
  }

  const shareUrl = result?.id ? `${window.location.origin}/demo/${result.id}` : ''

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {}
  }

  const handleDownload = () => {
    if (!result?.demo_html) return
    const blob = new Blob([result.demo_html], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `demoforge-${result.id || 'demo'}.html`
    a.click()
    URL.revokeObjectURL(url)
  }

  const hasCredits = credits !== null && credits > 0
  const noCredits = credits !== null && credits < 1

  return (
    <>
      {loading && <LoadingOrb idea={idea} />}
      <div className="mx-auto max-w-4xl px-4 py-10">
        {/* Credit indicator */}
        {!creditsLoading && credits !== null && (
          <div className="mb-6 flex items-center justify-between rounded-xl border border-[#171717] bg-[#0a0a0a] px-4 py-3">
            <div className="flex items-center gap-3">
              <div className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold ${hasCredits ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'}`}>
                {credits}
              </div>
              <span className="text-sm text-neutral-400">
                {credits === 1 ? '1 demo credit' : `${credits} demo credits`} remaining
              </span>
            </div>
            <button
              onClick={handleBuyCredits}
              disabled={paying}
              className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500/10 px-3.5 py-2 text-xs font-semibold text-amber-400 transition-colors hover:bg-amber-500/20 disabled:opacity-50"
            >
              {paying ? 'Redirecting...' : '+ Buy 3 credits — GHS 50'}
            </button>
          </div>
        )}

        {/* Paywall overlay */}
        {noCredits && !result ? (
          <section className="rounded-2xl border border-[#171717] bg-gradient-to-b from-[#0a0a0a] to-[#050505] p-10 text-center md:p-16">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10 ring-1 ring-amber-500/30">
              <svg className="h-8 w-8 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
              </svg>
            </div>
            <h2 className="font-display text-2xl font-bold tracking-tight">You've used your free demo</h2>
            <p className="mx-auto mt-3 max-w-md text-sm text-neutral-400 leading-relaxed">
              Get <span className="font-semibold text-amber-400">3 demos for GHS 50</span>. Pay easily with Mobile Money (MTN MoMo, Vodafone Cash, AirtelTigo) or card.
            </p>
            <button
              onClick={handleBuyCredits}
              disabled={paying}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-8 py-3.5 text-sm font-semibold text-black transition-all hover:from-amber-400 hover:to-orange-400 disabled:opacity-50"
            >
              {paying ? 'Redirecting to payment...' : 'Buy 3 demo credits — GHS 50'}
            </button>
            <p className="mt-4 text-xs text-neutral-600">Powered by Paystack. Secure payment.</p>
            {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
          </section>
        ) : (
          <>
            {/* Input studio */}
            <section className="rounded-2xl border border-[#171717] bg-gradient-to-b from-[#0a0a0a] to-[#050505] p-6 md:p-8">
              <div className="mb-5">
                <p className="text-xs font-medium tracking-widest text-neutral-500 uppercase">Studio</p>
                <h1 className="mt-1 font-display text-xl font-bold tracking-tight md:text-2xl">
                  Describe your idea. DemoForge does the rest.
                </h1>
              </div>
              <textarea
                value={idea}
                onChange={(e) => setIdea(e.target.value)}
                placeholder={placeholder}
                rows={4}
                className="w-full resize-none rounded-xl border border-[#262626] bg-[#050505] px-5 py-4 text-sm leading-relaxed text-white outline-none transition-all placeholder:text-neutral-600 focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20"
              />
              <VibeSelector value={vibe} onChange={setVibe} />
              <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <button
                  type="button"
                  onClick={handleGenerate}
                  disabled={loading || !idea.trim() || noCredits}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-3 text-sm font-semibold text-black transition-all hover:from-amber-400 hover:to-orange-400 disabled:opacity-50"
                >
                  <span className="text-base">&#10022;</span> Bring it to life
                  {hasCredits && <span className="rounded-md bg-black/20 px-1.5 py-0.5 text-[10px]">{credits} left</span>}
                </button>
                <p className="text-xs text-neutral-500">1 credit per demo</p>
              </div>
              {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
            </section>

            {/* Preview: full width below */}
            {result?.demo_html ? (
              <section className="mt-8 space-y-6">
                <BrowserChrome>
                  <iframe
                    title="Generated demo"
                    sandbox="allow-scripts"
                    srcDoc={result.demo_html}
                    className="h-[75vh] w-full border-0"
                  />
                </BrowserChrome>

                {session && (
                  <div className="flex flex-wrap items-center gap-3">
                    <button type="button" onClick={handleGenerate} disabled={noCredits}
                      className="inline-flex items-center gap-2 rounded-xl border border-[#262626] bg-[#0a0a0a] px-4 py-2.5 text-xs font-medium text-neutral-300 transition-colors hover:border-amber-500/50 hover:text-white disabled:opacity-50">
                      <span>&#8634;</span> Regenerate {noCredits && '(no credits)'}
                    </button>
                    {shareUrl && (
                      <button type="button" onClick={handleCopyLink}
                        className="inline-flex items-center gap-2 rounded-xl border border-[#262626] bg-[#0a0a0a] px-4 py-2.5 text-xs font-medium text-neutral-300 transition-colors hover:border-amber-500/50 hover:text-white">
                        {copied ? '✓ Copied!' : '🔗 Share link'}
                      </button>
                    )}
                    <button type="button" onClick={handleDownload}
                      className="inline-flex items-center gap-2 rounded-xl border border-[#262626] bg-[#0a0a0a] px-4 py-2.5 text-xs font-medium text-neutral-300 transition-colors hover:border-amber-500/50 hover:text-white">
                      ↓ Download HTML
                    </button>
                  </div>
                )}

                <VisionBrief brief={result.brief} />
              </section>
            ) : !loading ? (
              <section className="mt-8 flex min-h-[400px] flex-col items-center justify-center rounded-2xl border border-dashed border-[#262626] bg-[#050505]/50 text-center">
                <div className="max-w-sm space-y-3">
                  <p className="text-xs font-medium tracking-widest text-neutral-600 uppercase">Preview</p>
                  <p className="text-sm text-neutral-500 leading-relaxed">
                    Click <span className="text-amber-400 font-medium">&ldquo;Bring it to life&rdquo;</span> to
                    generate a complete, interactive demo that feels like a real product.
                  </p>
                </div>
              </section>
            ) : null}
          </>
        )}
      </div>
    </>
  )
}

export default Generate
