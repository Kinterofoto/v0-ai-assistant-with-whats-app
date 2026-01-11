"use client"

import { useEffect, useState } from "react"

interface Stat {
  value: number
  label: string
  suffix?: string
}

const stats: Stat[] = [
  { value: 50000, label: "Productos consultados", suffix: "+" },
  { value: 12000, label: "Usuarios activos", suffix: "+" },
  { value: 98, label: "Satisfacción", suffix: "%" },
  { value: 24, label: "Disponibilidad", suffix: "/7" },
]

function AnimatedNumber({ value, suffix = "" }: { value: number; suffix?: string }) {
  const [displayed, setDisplayed] = useState(0)

  useEffect(() => {
    const duration = 2000
    const steps = 60
    const increment = value / steps
    let current = 0

    const timer = setInterval(() => {
      current += increment
      if (current >= value) {
        setDisplayed(value)
        clearInterval(timer)
      } else {
        setDisplayed(Math.floor(current))
      }
    }, duration / steps)

    return () => clearInterval(timer)
  }, [value])

  return (
    <span className="text-3xl md:text-4xl font-bold text-primary font-mono">
      {displayed.toLocaleString()}
      {suffix}
    </span>
  )
}

export function StatsDisplay() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
      {stats.map((stat) => (
        <div key={stat.label} className="text-center">
          <AnimatedNumber value={stat.value} suffix={stat.suffix} />
          <p className="text-sm text-muted-foreground mt-2">{stat.label}</p>
        </div>
      ))}
    </div>
  )
}
