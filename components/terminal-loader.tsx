'use client'

import { useEffect, useState } from 'react'

const LOADING_STEPS = [
    'INITIALIZING MELI_HUNTER ENGINE...',
    'ESTABLISHING SECURE CONNECTION TO MERCADOLIBRE...',
    'INJECTING FIRE_CRAWL EXTRACTION SCRIPT...',
    'BYPASSING BOT DETECTION...',
    'PARSING HTML CONTENT...',
    'AI ANALYZING PRODUCT RELEVANCE...',
    'FILTERING TOP DEALS...',
    'GENERATING STRUCTURED DATA...',
    'FINALIZING REPORT...'
]

export function TerminalLoader() {
    const [currentStep, setCurrentStep] = useState(0)
    const [logs, setLogs] = useState<string[]>([])

    useEffect(() => {
        if (currentStep < LOADING_STEPS.length) {
            const timer = setTimeout(() => {
                setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${LOADING_STEPS[currentStep]}`])
                setCurrentStep(prev => prev + 1)
            }, 1500 + Math.random() * 1000)
            return () => clearTimeout(timer)
        }
    }, [currentStep])

    return (
        <div className="w-full max-w-2xl mx-auto font-mono text-xs md:text-sm space-y-2 py-10 bg-black/50 p-6 border border-white/5">
            <div className="flex items-center gap-2 mb-4 border-b border-white/10 pb-2">
                <span className="text-white/30 uppercase tracking-widest text-[10px]">Processing Extraction</span>
            </div>

            {logs.map((log, i) => (
                <div key={i} className="flex gap-3 animate-in fade-in slide-in-from-left-2 duration-300">
                    <span className="text-[#FFD700] shrink-0">{">"}</span>
                    <span className={i === logs.length - 1 ? "text-white" : "text-white/50"}>
                        {log}
                        {i === logs.length - 1 && <span className="inline-block w-2 h-4 ml-1 bg-[#FFD700] animate-pulse align-middle" />}
                    </span>
                </div>
            ))}

            {currentStep < LOADING_STEPS.length && (
                <div className="mt-4 flex items-center gap-2 text-white/20 italic animate-pulse">
                    <div className="w-3 h-3 border-2 border-white/10 border-t-white/30 rounded-full animate-spin" />
                    Agent performing deep search...
                </div>
            )}
        </div>
    )
}
