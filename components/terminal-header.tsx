"use client"

import { useEffect, useState } from "react"

export function TerminalHeader() {
  const [time, setTime] = useState("")

  useEffect(() => {
    const updateTime = () => {
      setTime(new Date().toLocaleTimeString("es-MX", { hour12: false }))
    }
    updateTime()
    const interval = setInterval(updateTime, 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-primary/30 bg-background/95 backdrop-blur-sm">
      <div className="flex items-center justify-between px-4 py-2 font-mono text-xs">
        <div className="flex items-center gap-4">
          <span className="text-muted-foreground">
            meli-hunter<span className="text-primary">@</span>mercadolibre:~
          </span>
        </div>
        <div className="flex items-center gap-6 text-muted-foreground">
          <span className="hidden sm:inline text-primary/70">MELI_HUNTER</span>
          <span>v2.0</span>
          <span className="text-primary">{time}</span>
        </div>
      </div>
    </header>
  )
}
