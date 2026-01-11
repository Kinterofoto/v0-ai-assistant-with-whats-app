interface TerminalLineProps {
  prefix?: string
  command?: string
  output?: string
  isHighlighted?: boolean
}

export function TerminalLine({ prefix = "$", command, output, isHighlighted = false }: TerminalLineProps) {
  return (
    <div className="font-mono text-sm leading-relaxed">
      {command && (
        <div className="flex gap-2">
          <span className="text-terminal-green select-none">{prefix}</span>
          <span className={isHighlighted ? "text-primary" : "text-foreground"}>{command}</span>
        </div>
      )}
      {output && <div className="pl-4 text-muted-foreground">{output}</div>}
    </div>
  )
}
