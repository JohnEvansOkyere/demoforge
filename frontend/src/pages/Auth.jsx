import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'

const OTP_LENGTH = 8

function Auth({ session }) {
  const navigate = useNavigate()
  const [step, setStep] = useState('email')
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(''))
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const inputRefs = useRef([])

  useEffect(() => {
    if (session) navigate('/generate', { replace: true })
  }, [session, navigate])

  const handleSendOtp = async (e) => {
    if (e) e.preventDefault()
    if (!email.trim()) return
    setLoading(true)
    setError('')
    try {
      const { error: otpError } = await supabase.auth.signInWithOtp({ email })
      if (otpError) throw otpError
      setSuccess(`Code sent to ${email}`)
      setStep('verify')
      setTimeout(() => inputRefs.current[0]?.focus(), 100)
    } catch (err) {
      setError(err.message ?? 'Failed to send code')
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    if (!email.trim()) return
    setLoading(true)
    setError('')
    setOtp(Array(OTP_LENGTH).fill(''))
    try {
      const { error: otpError } = await supabase.auth.signInWithOtp({ email })
      if (otpError) throw otpError
      setSuccess(`New code sent to ${email}`)
    } catch (err) {
      setError(err.message ?? 'Failed to resend code')
    } finally {
      setLoading(false)
    }
  }

  const handleOtpChange = (index, value) => {
    if (value.length > 1) value = value.slice(-1)
    if (value && !/^\d$/.test(value)) return
    const next = [...otp]
    next[index] = value
    setOtp(next)
    if (value && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus()
    }
    if (next.every(d => d !== '')) {
      verifyOtp(next.join(''))
    }
  }

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handleOtpPaste = (e) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH)
    if (pasted.length === OTP_LENGTH) {
      const digits = pasted.split('')
      setOtp(digits)
      verifyOtp(pasted)
    }
  }

  const verifyOtp = async (token) => {
    setLoading(true)
    setError('')
    try {
      const { error: verifyError } = await supabase.auth.verifyOtp({
        email,
        token,
        type: 'email',
      })
      if (verifyError) throw verifyError
    } catch (err) {
      setError(err.message ?? 'Invalid or expired code')
      setOtp(Array(OTP_LENGTH).fill(''))
      inputRefs.current[0]?.focus()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-5rem)] items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-[#171717] bg-gradient-to-b from-[#0a0a0a] to-[#050505] p-8 shadow-2xl">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-600 df-glow-strong">
              <svg className="h-6 w-6 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
              </svg>
            </div>
            <h1 className="font-display text-2xl font-bold tracking-tight">
              {step === 'email' ? 'Welcome to DemoForge' : 'Check your email'}
            </h1>
            <p className="mt-2 text-sm text-neutral-400">
              {step === 'email'
                ? 'Enter your email to get started. No password needed.'
                : <>We sent an {OTP_LENGTH}-digit code to <span className="text-amber-400 font-medium">{email}</span></>
              }
            </p>
          </div>

          {step === 'email' ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-neutral-400">
                  Email address
                </label>
                <input
                  type="email"
                  required
                  autoFocus
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-[#262626] bg-[#0a0a0a] px-4 py-3 text-sm text-white outline-none transition-all placeholder:text-neutral-600 focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/20"
                  placeholder="you@example.com"
                />
              </div>
              {error && <p className="text-sm text-red-400">{error}</p>}
              <button
                type="submit"
                disabled={loading || !email.trim()}
                className="w-full rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 py-3 text-sm font-semibold text-black transition-all hover:from-amber-400 hover:to-orange-400 disabled:opacity-50"
              >
                {loading ? 'Sending code...' : 'Continue with email'}
              </button>
            </form>
          ) : (
            <div className="space-y-5">
              <div className="flex justify-center gap-2" onPaste={handleOtpPaste}>
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={el => inputRefs.current[i] = el}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(i, e)}
                    className="h-14 w-10 rounded-xl border border-[#262626] bg-[#0a0a0a] text-center font-mono text-xl font-semibold text-white outline-none transition-all focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/20"
                  />
                ))}
              </div>
              {error && <p className="text-center text-sm text-red-400">{error}</p>}
              {success && !error && <p className="text-center text-sm text-emerald-400">{success}</p>}
              {loading && <p className="text-center text-sm text-neutral-400">Verifying...</p>}
              <button
                type="button"
                onClick={handleResend}
                disabled={loading}
                className="mx-auto mt-1 block text-sm text-amber-400 underline decoration-dotted underline-offset-4 hover:text-amber-300 disabled:opacity-50"
              >
                Resend code
              </button>
              <button
                type="button"
                onClick={() => { setStep('email'); setOtp(Array(OTP_LENGTH).fill('')); setError(''); setSuccess('') }}
                className="mx-auto mt-2 block text-sm text-neutral-500 underline decoration-dotted underline-offset-4 hover:text-neutral-300"
              >
                Use a different email
              </button>
            </div>
          )}

          <p className="mt-6 text-center text-xs text-neutral-600">
            By continuing, you agree to DemoForge&apos;s terms of service.
          </p>
        </div>
      </div>
    </div>
  )
}

export default Auth
