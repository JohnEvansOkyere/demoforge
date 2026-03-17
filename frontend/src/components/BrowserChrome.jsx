function BrowserChrome({ children }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-[#171717] bg-[#0a0a0a] shadow-2xl">
      <div className="flex items-center gap-2 border-b border-[#171717] px-4 py-2.5">
        <div className="flex gap-1.5">
          <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
          <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
          <span className="h-3 w-3 rounded-full bg-[#28c840]" />
        </div>
        <div className="ml-4 flex-1 rounded-lg bg-[#050505] px-4 py-1.5 text-xs text-neutral-600 font-mono">
          your-vision.demoforge.app
        </div>
      </div>
      <div>{children}</div>
    </div>
  )
}

export default BrowserChrome
