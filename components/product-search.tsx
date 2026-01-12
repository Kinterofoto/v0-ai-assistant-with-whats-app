'use client'

import { useState, useEffect } from 'react'
import { Send, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { experimental_useObject as useObject } from '@ai-sdk/react'
import { z } from 'zod'

// Schema for the product extraction
const productSchema = z.object({
  products: z.array(
    z.object({
      name: z.string(),
      url: z.string()
    })
  )
})

interface ProductSearchProps {
  onResults: (results: any) => void
  onLoading: (loading: boolean) => void
}

export function ProductSearch({ onResults, onLoading }: ProductSearchProps) {
  const [query, setQuery] = useState('')
  const [error, setError] = useState<string | null>(null)

  const { submit, isLoading, object } = useObject({
    api: '/api/scrape-stream',
    schema: productSchema,
    onFinish: ({ object }: { object: any }) => {
      if (object?.products) {
        onResults({
          success: true,
          query: query,
          structured_request: { product_name: query, condition: 'any', num_results: object.products.length },
          results: object.products.map((p: any) => ({
            title: p.name,
            price: 0,
            currency: 'COP',
            condition: 'Nuevo',
            url: p.url,
            free_shipping: false
          })),
          total_found: object.products.length,
          execution_time_ms: 0,
          timestamp: new Date().toISOString()
        })
      }
      onLoading(false)
    },
    onError: (err: Error) => {
      setError(err.message)
      onLoading(false)
    }
  })

  useEffect(() => {
    if (object?.products && object.products.length > 0) {
      onLoading(false) // Stop showing the full-page loader once data arrives
      onResults({
        success: true,
        query: query,
        structured_request: { product_name: query, condition: 'any', num_results: 10 },
        results: object.products.map((p: any) => ({
          title: p?.name || '...',
          price: 0,
          currency: 'COP',
          condition: 'Nuevo',
          url: p?.url || '#',
          free_shipping: false
        })),
        total_found: object.products.length,
        execution_time_ms: 0,
        timestamp: new Date().toISOString()
      })
    }
  }, [object, query, onResults])

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return

    setError(null)
    onLoading(true)
    submit({ query })
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
      <form onSubmit={handleSearch} className="relative">
        <div className="relative group">
          <div className="absolute -inset-[1px] bg-[#FFD700] opacity-0 group-focus-within:opacity-100 transition-opacity duration-200" />

          <div className="relative bg-black border border-white/10 rounded-none overflow-hidden">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Dime qué producto buscas..."
              disabled={isLoading}
              className="w-full px-4 py-4 pr-12 bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none font-mono text-sm"
            />

            <Button
              type="submit"
              size="icon"
              disabled={isLoading || !query.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {error && (
          <div className="mt-2 p-3 bg-destructive/10 border border-destructive/20 rounded-none">
            <p className="text-sm text-destructive font-mono">{error}</p>
          </div>
        )}
      </form>

      <div className="flex flex-wrap gap-2 justify-center">
        <span className="text-xs text-muted-foreground font-mono">Búsquedas rápidas:</span>
        {quickSearches.map((search) => (
          <button
            key={search}
            onClick={() => handleQuickSearch(search)}
            disabled={isLoading}
            className="px-3 py-1 text-xs font-mono bg-transparent border border-white/10 rounded-none hover:border-[#FFD700] hover:text-[#FFD700] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {search}
          </button>
        ))}
      </div>
    </div>
  )
}
