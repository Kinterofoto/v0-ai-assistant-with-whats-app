"use client"

import { MessageCircle, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

interface WhatsAppCTAProps {
  phoneNumber?: string
  message?: string
}

export function WhatsAppCTA({
  phoneNumber = "5215512345678",
  message = "Hola HALCÓN, quiero buscar un producto en MercadoLibre",
}: WhatsAppCTAProps) {
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`

  return (
    <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="group inline-block">
      <Button
        size="lg"
        className="relative overflow-hidden bg-primary text-primary-foreground hover:bg-primary/90 font-mono text-lg px-8 py-6 gap-3 transition-all duration-300 group-hover:gap-4"
      >
        <MessageCircle className="h-6 w-6" />
        <span>Hablar con HALCÓN</span>
        <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />

        {/* Glow effect */}
        <div className="absolute inset-0 -z-10 bg-primary/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
      </Button>
    </a>
  )
}
