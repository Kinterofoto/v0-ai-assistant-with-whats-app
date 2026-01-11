import { TerminalHeader } from "@/components/terminal-header"
import { TerminalLine } from "@/components/terminal-line"
import { WhatsAppCTA } from "@/components/whatsapp-cta"
import { FeatureCard } from "@/components/feature-card"
import { StatsDisplay } from "@/components/stats-display"
import { ConversationPreview } from "@/components/conversation-preview"
import { HowItWorks } from "@/components/how-it-works"
import { Footer } from "@/components/footer"
import { LiveSearchSection } from "@/components/live-search-section"
import { Search, Bell, TrendingDown, Zap, Shield, Clock } from "lucide-react"

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden">
      {/* Scanline effect overlay */}
      <div className="pointer-events-none fixed inset-0 z-50 opacity-[0.015]">
        <div className="scanline absolute inset-x-0 h-px bg-primary" />
      </div>

      {/* Grid background */}
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `
            linear-gradient(to right, var(--primary) 1px, transparent 1px),
            linear-gradient(to bottom, var(--primary) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }}
      />

      <TerminalHeader />

      <main className="relative pt-20">
        {/* Hero Section */}
        <section className="min-h-[90vh] flex items-center justify-center px-4 py-20">
          <div className="container mx-auto max-w-6xl">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left: Terminal content */}
              <div className="space-y-8">
                {/* Terminal intro - Referencias a HALCÓN y MercadoLibre */}
                <div className="space-y-2 font-mono text-sm">
                  <TerminalLine command="whoami" output="HALCÓN - Tu cazador de ofertas en MercadoLibre" />
                  <TerminalLine command="./connect --api=mercadolibre" output="Conexión establecida..." />
                </div>

                {/* Main heading - Copy enfocado en MercadoLibre */}
                <div className="space-y-4">
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-balance">
                    <span className="text-primary">Caza ofertas</span>
                    <span className="text-foreground"> en MercadoLibre</span>
                    <span className="text-primary">.</span>
                  </h1>
                  <p className="text-lg md:text-xl text-muted-foreground max-w-lg leading-relaxed">
                    HALCÓN es tu agente de IA que escanea MercadoLibre, encuentra los mejores precios y te avisa cuando
                    es momento de comprar.
                  </p>
                </div>

                {/* CTA */}
                <div className="space-y-4">
                  <WhatsAppCTA />
                  <p className="text-xs text-muted-foreground font-mono">
                    {">"} Sin registro. Sin apps. Solo WhatsApp.
                  </p>
                </div>
              </div>

              {/* Right: Conversation preview */}
              <div className="relative">
                {/* Glow effect behind */}
                <div className="absolute inset-0 bg-primary/5 blur-3xl" />
                <ConversationPreview />
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 border-y border-border/30 bg-card/20">
          <div className="container mx-auto px-4 max-w-4xl">
            <StatsDisplay />
          </div>
        </section>

        {/* Live Search Section */}
        <LiveSearchSection />

        {/* Features Section */}
        <section className="py-20 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-12 space-y-4">
              <div className="inline-block font-mono text-xs text-muted-foreground mb-2">
                <span className="text-terminal-green">$</span> cat features.md
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">Todo lo que necesitas</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Un asistente inteligente que escanea MercadoLibre y te consigue el mejor precio.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <FeatureCard
                icon={Search}
                title="Búsqueda inteligente"
                description="Describe lo que buscas y HALCÓN escanea todo MercadoLibre para encontrar exactamente lo que necesitas."
                command="halcon --search"
              />
              <FeatureCard
                icon={Bell}
                title="Alertas de precio"
                description="Configura tu precio objetivo y recibe un WhatsApp cuando el producto lo alcance en MercadoLibre."
                command="halcon --alert"
              />
              <FeatureCard
                icon={TrendingDown}
                title="Historial de precios"
                description="Conoce la tendencia de precios en MercadoLibre para saber si es buen momento de comprar."
                command="halcon --history"
              />
              <FeatureCard
                icon={Zap}
                title="Respuesta instantánea"
                description="Resultados en segundos. HALCÓN procesa miles de publicaciones de MercadoLibre al instante."
                command="halcon --fast"
              />
              <FeatureCard
                icon={Shield}
                title="Vendedores verificados"
                description="Solo mostramos vendedores con buena reputación y envío garantizado en MercadoLibre."
                command="halcon --trusted"
              />
              <FeatureCard
                icon={Clock}
                title="Disponible 24/7"
                description="HALCÓN nunca duerme. Monitorea precios y te avisa a cualquier hora."
                command="halcon --always"
              />
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="py-20 px-4 bg-card/20 border-y border-border/30">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-12 space-y-4">
              <div className="inline-block font-mono text-xs text-muted-foreground mb-2">
                <span className="text-terminal-green">$</span> ./how-it-works.sh
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">Así de simple funciona</h2>
            </div>

            <HowItWorks />
          </div>
        </section>

        {/* Final CTA Section - Copy actualizado */}
        <section className="py-24 px-4">
          <div className="container mx-auto max-w-3xl text-center">
            <div className="space-y-8">
              <div className="space-y-2 font-mono text-sm text-muted-foreground">
                <p>{">"} mercadolibre_api.connected = true</p>
                <p>{">"} halcon.ready()</p>
              </div>

              <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                Tu próxima compra en <span className="text-primary">MercadoLibre</span>
              </h2>

              <p className="text-lg text-muted-foreground max-w-xl mx-auto">
                Un mensaje es todo lo que necesitas. HALCÓN está listo para cazar el mejor precio para ti.
              </p>

              <WhatsAppCTA message="Hola HALCÓN, quiero encontrar algo en MercadoLibre" />

              <div className="pt-8 font-mono text-xs text-muted-foreground space-y-1">
                <p>{"// Ejemplos de consultas:"}</p>
                <p className="text-foreground/70">{'"El mejor celular gama media en MercadoLibre"'}</p>
                <p className="text-foreground/70">{'"Laptop para programar menos de $20,000"'}</p>
                <p className="text-foreground/70">{'"Avísame cuando baje el precio de PS5"'}</p>
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </main>
    </div>
  )
}
