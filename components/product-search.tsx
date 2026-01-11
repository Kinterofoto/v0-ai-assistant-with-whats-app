'use client'

import { useState } from 'react'
import { Send, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { searchProducts, type SearchResponse } from '@/lib/api/search-client'

interface ProductSearchProps {
  onResults: (results: SearchResponse) => void
  onLoading: (loading: boolean) => void
}

export function ProductSearch({ onResults, onLoading }: ProductSearchProps) {
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!query.trim()) return

    setLoading(true)
    onLoading(true)
    setError(null)

    try {
      const results = await searchProducts(query)
      onResults(results)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al buscar productos')
    } finally {
      setLoading(false)
      onLoading(false)
    }
  }

  const quickSearches = [
    'iPhone 15',
    'Laptop para programar',
    'PlayStation 5',
    'Audífonos inalámbricos',
  ]

  const handleQuickSearch = (searchQuery: string) => {
    setQuery(searchQuery)
  }

  return (
    <div className="w-full max-w-3xl mx-auto space-y-4">
      {/* Chat input */}
      <form onSubmit={handleSearch} className="relative">
        <div className="relative group">
          {/* Glow effect */}
          <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/50 to-primary/30 rounded-lg blur opacity-30 group-hover:opacity-50 transition duration-300" />

          {/* Input container */}
          <div className="relative bg-card border border-border rounded-lg overflow-hidden">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Dime qué producto buscas..."
              disabled={loading}
              className="w-full px-4 py-4 pr-12 bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none font-mono text-sm"
            />

            <Button
              type="submit"
              size="icon"
              disabled={loading || !query.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="mt-2 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
            <p className="text-sm text-destructive font-mono">{error}</p>
          </div>
        )}
      </form>

      {/* Quick search suggestions */}
      <div className="flex flex-wrap gap-2 justify-center">
        <span className="text-xs text-muted-foreground font-mono">Búsquedas rápidas:</span>
        {quickSearches.map((search) => (
          <button
            key={search}
            onClick={() => handleQuickSearch(search)}
            disabled={loading}
            className="px-3 py-1 text-xs font-mono bg-card border border-border rounded-md hover:border-primary/50 hover:bg-card/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {search}
          </button>
        ))}
      </div>
    </div>
  )
}
