'use client'

import { ProductCard } from '@/components/product-card'
import { type SearchResponse } from '@/lib/api/search-client'
import { Package, Clock, TrendingUp } from 'lucide-react'

interface SearchResultsProps {
  results: SearchResponse | null
  loading: boolean
}

export function SearchResults({ results, loading }: SearchResultsProps) {
  if (loading) {
    return (
      <div className="w-full py-20 flex flex-col items-center justify-center space-y-4">
        <div className="relative">
          {/* Animated spinner */}
          <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        </div>
        <div className="text-center space-y-2">
          <p className="text-foreground font-mono">Buscando en Mercado Libre...</p>
          <p className="text-sm text-muted-foreground font-mono">Analizando productos</p>
        </div>
      </div>
    )
  }

  if (!results) {
    return (
      <div className="w-full py-20 flex flex-col items-center justify-center space-y-4">
        <Package className="h-16 w-16 text-muted-foreground/30" />
        <div className="text-center space-y-2">
          <p className="text-foreground font-mono">Escribe qué producto buscas</p>
          <p className="text-sm text-muted-foreground font-mono max-w-md">
            Ejemplo: "Laptop para programar menos de 2 millones"
          </p>
        </div>
      </div>
    )
  }

  if (results.results.length === 0) {
    return (
      <div className="w-full py-20 flex flex-col items-center justify-center space-y-4">
        <Package className="h-16 w-16 text-muted-foreground/30" />
        <div className="text-center space-y-2">
          <p className="text-foreground font-mono">No se encontraron productos</p>
          <p className="text-sm text-muted-foreground font-mono max-w-md">
            Intenta con otra búsqueda o ajusta los filtros
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full space-y-8 animate-fade-in">
      {/* Results header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div className="space-y-1">
          <h3 className="text-xl font-bold text-foreground">
            Encontramos {results.total_found} {results.total_found === 1 ? 'producto' : 'productos'}
          </h3>
          <p className="text-sm text-muted-foreground font-mono">
            Búsqueda: "{results.query}"
          </p>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 text-xs font-mono text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {results.execution_time_ms.toFixed(0)}ms
          </div>
          {results.structured_request.max_price && (
            <div className="flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              Hasta ${results.structured_request.max_price.toLocaleString('es-CO')}
            </div>
          )}
        </div>
      </div>

      {/* AI extraction info (optional debug) */}
      {results.structured_request && (
        <div className="p-4 bg-card/50 border border-border/50 rounded-lg">
          <p className="text-xs text-muted-foreground font-mono mb-2">
            <span className="text-primary">$</span> Extracción de IA:
          </p>
          <div className="flex flex-wrap gap-2">
            <span className="px-2 py-1 bg-primary/10 text-primary text-xs font-mono rounded">
              {results.structured_request.product_name}
            </span>
            {results.structured_request.max_price && (
              <span className="px-2 py-1 bg-card text-foreground text-xs font-mono rounded border border-border">
                Max: ${results.structured_request.max_price.toLocaleString('es-CO')}
              </span>
            )}
            <span className="px-2 py-1 bg-card text-foreground text-xs font-mono rounded border border-border">
              {results.structured_request.condition}
            </span>
          </div>
        </div>
      )}

      {/* Products grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {results.results.map((product, index) => (
          <ProductCard key={product.url} product={product} index={index} />
        ))}
      </div>
    </div>
  )
}
