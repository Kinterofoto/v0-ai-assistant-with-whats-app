export function Footer() {
  return (
    <footer className="border-t border-border/30 py-8 mt-20">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 font-mono text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <span className="text-primary font-bold">MELI HUNTER</span>
            <span>|</span>
            <span>Tu cazador de ofertas en MercadoLibre</span>
          </div>
          <div className="flex items-center gap-4">
            <span>Potenciado por IA</span>
            <span className="text-terminal-green">{"●"} Conectado a MELI</span>
          </div>
        </div>
        <div className="text-center mt-4 font-mono text-xs text-muted-foreground">
          made in ship or sink
        </div>
      </div>
    </footer>
  )
}
