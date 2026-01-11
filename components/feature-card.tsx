import type { LucideIcon } from "lucide-react"

interface FeatureCardProps {
  icon: LucideIcon
  title: string
  description: string
  command: string
}

export function FeatureCard({ icon: Icon, title, description, command }: FeatureCardProps) {
  return (
    <div className="group relative border border-border/50 bg-card/50 p-6 transition-all duration-300 hover:border-primary/50 hover:bg-card">
      {/* Terminal-style header */}
      <div className="mb-4 flex items-center gap-2 text-xs text-muted-foreground font-mono">
        <span className="text-terminal-green">$</span>
        <span className="text-primary">{command}</span>
      </div>

      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center border border-primary/30 bg-primary/10">
          <Icon className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
        </div>
      </div>

      {/* Corner accent */}
      <div className="absolute top-0 right-0 h-8 w-8 border-t border-r border-primary/30 opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="absolute bottom-0 left-0 h-8 w-8 border-b border-l border-primary/30 opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  )
}
