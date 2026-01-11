"use client"

import { useEffect, useState } from "react"

interface TypingTextProps {
  text: string
  speed?: number
  className?: string
  onComplete?: () => void
}

export function TypingText({ text, speed = 50, className = "", onComplete }: TypingTextProps) {
  const [displayedText, setDisplayedText] = useState("")
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText((prev) => prev + text[currentIndex])
        setCurrentIndex((prev) => prev + 1)
      }, speed)
      return () => clearTimeout(timeout)
    } else if (onComplete) {
      onComplete()
    }
  }, [currentIndex, text, speed, onComplete])

  return (
    <span className={className}>
      {displayedText}
      {currentIndex < text.length && <span className="cursor-blink text-primary">_</span>}
    </span>
  )
}
