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
          <div className="inline-block font-mono text-xs text-muted-foreground mb-2">
            <span className="text-primary">$</span> halcon --search --live
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">
            Pruébalo ahora mismo
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Escribe lo que buscas y ve cómo HALCÓN encuentra los mejores productos en Mercado Libre
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
