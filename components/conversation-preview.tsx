"use client"

import { useEffect, useState } from "react"

interface Message {
  sender: "user" | "agent"
  text: string
  delay: number
}

const messages: Message[] = [
  { sender: "user", text: "Hola, busco el mejor iPhone 15 en MercadoLibre", delay: 0 },
  {
    sender: "agent",
    text: "Encontré 47 publicaciones en MercadoLibre. El mejor precio es $18,499 MXN con envío gratis.",
    delay: 1500,
  },
  { sender: "agent", text: "Vendedor con +5000 ventas y 98% de reputación positiva.", delay: 2500 },
  { sender: "user", text: "Avísame si baja de $17,000", delay: 4000 },
  { sender: "agent", text: "Alerta activada. Te escribo apenas baje de $17,000 en MercadoLibre.", delay: 5000 },
]

export function ConversationPreview() {
  const [visibleMessages, setVisibleMessages] = useState<number>(0)

  useEffect(() => {
    const timers: NodeJS.Timeout[] = []

    messages.forEach((message, index) => {
      const timer = setTimeout(() => {
        setVisibleMessages(index + 1)
      }, message.delay)
      timers.push(timer)
    })

    return () => timers.forEach(clearTimeout)
  }, [])

  return (
    <div className="relative border border-border/50 bg-card/30 p-4 md:p-6 font-mono text-sm max-w-md mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4 pb-4 border-b border-border/30">
        <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center">
          <span className="text-primary-foreground font-bold text-lg">H</span>
        </div>
        <div>
          <p className="text-foreground font-semibold">HALCÓN</p>
          <p className="text-xs text-terminal-green flex items-center gap-1">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-terminal-green animate-pulse" />
            conectado a MercadoLibre
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="space-y-3 min-h-[200px]">
        {messages.slice(0, visibleMessages).map((message, index) => (
          <div key={index} className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[85%] px-3 py-2 text-xs md:text-sm ${
                message.sender === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground border border-border/50"
              }`}
            >
              {message.text}
            </div>
          </div>
        ))}

        {visibleMessages < messages.length && (
          <div className="flex justify-start">
            <div className="bg-secondary border border-border/50 px-4 py-2">
              <span className="cursor-blink text-muted-foreground">...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
