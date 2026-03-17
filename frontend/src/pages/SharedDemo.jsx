import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { fetchDemoById } from '../lib/api.js'
import BrowserChrome from '../components/BrowserChrome.jsx'
import VisionBrief from '../components/VisionBrief.jsx'

function SharedDemo() {
  const { id } = useParams()
  const [demo, setDemo] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const data = await fetchDemoById(id)
        setDemo(data)
      } catch (err) {
        setError(err.message ?? 'Failed to load demo')
      } finally {
        setLoading(false)
      }
    }
    void load()
  }, [id])

  if (loading) {
    return <div className="mt-20 text-center text-sm text-neutral-500">Opening shared demo...</div>
  }

  if (error || !demo) {
    return (
      <div className="flex min-h-[calc(100vh-5rem)] items-center justify-center">
        <p className="text-sm text-neutral-500">{error || 'Demo not found.'}</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <BrowserChrome>
        <iframe
          title="Shared demo"
          sandbox="allow-scripts allow-same-origin"
          srcDoc={demo.demo_html}
          className="h-[75vh] w-full border-0"
        />
      </BrowserChrome>
      <div className="mt-6">
        <VisionBrief brief={demo.brief} />
      </div>
      <div className="mt-6 rounded-2xl border border-[#171717] bg-[#0a0a0a] py-4 text-center text-sm text-neutral-500">
        Built with <span className="font-semibold text-white">DemoForge</span> &middot;{' '}
        <a href="/" className="text-amber-400 underline decoration-dotted underline-offset-4 hover:text-amber-300">Try it free</a>
      </div>
    </div>
  )
}

export default SharedDemo
