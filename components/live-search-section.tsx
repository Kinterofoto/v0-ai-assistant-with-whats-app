'use client'

import { useState } from 'react'
import { ProductSearch } from '@/components/product-search'
import { SearchResults } from '@/components/search-results'
import { type SearchResponse } from '@/lib/api/search-client'

export function LiveSearchSection() {
  const [results, setResults] = useState<SearchResponse | null>(null)
  const [loading, setLoading] = useState(false)

  return (
    <section className="py-20 px-4 bg-card/10 border-y border-border/30">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-12 space-y-4">
          <div className="flex items-center justify-center gap-2 font-mono text-xs text-muted-foreground uppercase tracking-widest">
            <span className="h-2 w-2 rounded-full bg-[#FFD700] animate-pulse" />
            System Status: Ready to Hunt
          </div>
          <h2 className="text-3xl md:text-5xl font-mono font-bold tracking-tight text-[#FFD700] uppercase">
            [Start_Search]<span className="cursor-blink">_</span>
          </h2>
          <p className="text-muted-foreground font-mono text-xs max-w-2xl mx-auto pt-2 opacity-60">
            {">"} Execute query to find the best products in Mercado Libre
          </p>
        </div>

        {/* Search input */}
        <div className="mb-12">
          <ProductSearch onResults={setResults} onLoading={setLoading} />
        </div>

        {/* Results */}
        <SearchResults results={results} loading={loading} />
      </div>
    </section>
  )
}
