import { TerminalHeader } from "@/components/terminal-header"
import { Footer } from "@/components/footer"
import { LiveSearchSection } from "@/components/live-search-section"

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

      <main className="relative pt-20 flex flex-col min-h-screen">
        <div className="flex-grow flex flex-col justify-center">
          <LiveSearchSection />
        </div>
        <Footer />
      </main>
    </div>
  )
}
