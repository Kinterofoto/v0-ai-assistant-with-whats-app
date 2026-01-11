import { Search, MessageCircle, Bell, TrendingDown } from "lucide-react"

const steps = [
  {
    icon: MessageCircle,
    step: "01",
    title: "Inicia la conversación",
    description: "Escríbele a BUSCADOR por WhatsApp con el producto que buscas.",
  },
  {
    icon: Search,
    step: "02",
    title: "Obtén resultados",
    description: "Recibe las mejores opciones con precios, links y comparativas.",
  },
  {
    icon: Bell,
    step: "03",
    title: "Configura alertas",
    description: "Pide que te avise cuando baje el precio o haya ofertas.",
  },
  {
    icon: TrendingDown,
    step: "04",
    title: "Ahorra dinero",
    description: "Compra en el momento perfecto con el mejor precio.",
  },
]

export function HowItWorks() {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
      {steps.map((step, index) => (
        <div key={step.step} className="relative group">
          {/* Connector line */}
          {index < steps.length - 1 && (
            <div className="hidden lg:block absolute top-8 left-[calc(50%+30px)] w-[calc(100%-60px)] h-px bg-border/50" />
          )}

          <div className="text-center">
            <div className="relative inline-flex items-center justify-center mb-4">
              <div className="h-16 w-16 border border-primary/50 bg-card flex items-center justify-center group-hover:border-primary transition-colors">
                <step.icon className="h-7 w-7 text-primary" />
              </div>
              <span className="absolute -top-2 -right-2 text-xs font-mono text-primary bg-background px-1">
                {step.step}
              </span>
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">{step.title}</h3>
            <p className="text-sm text-muted-foreground">{step.description}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
