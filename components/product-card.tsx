'use client'

import { ExternalLink, Truck, MapPin } from 'lucide-react'
import { type ProductResult } from '@/lib/api/search-client'
import Image from 'next/image'

interface ProductCardProps {
  product: ProductResult
  index: number
}

export function ProductCard({ product, index }: ProductCardProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price)
  }

  return (
    <a
      href={product.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group block"
      style={{
        animationDelay: `${index * 100}ms`,
      }}
    >
      <div className="relative h-full bg-card border border-border rounded-lg overflow-hidden hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10">
        {/* Product image */}
        <div className="relative aspect-square bg-muted overflow-hidden">
          {product.thumbnail ? (
            <Image
              src={product.thumbnail}
              alt={product.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              unoptimized
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-muted">
              <span className="text-muted-foreground text-sm font-mono">Sin imagen</span>
            </div>
          )}

          {/* Free shipping badge */}
          {product.free_shipping && (
            <div className="absolute top-2 right-2 px-2 py-1 bg-primary/90 text-primary-foreground text-xs font-mono rounded flex items-center gap-1">
              <Truck className="h-3 w-3" />
              Envío gratis
            </div>
          )}

          {/* Condition badge */}
          <div className="absolute top-2 left-2 px-2 py-1 bg-card/90 backdrop-blur-sm text-foreground text-xs font-mono rounded border border-border">
            {product.condition}
          </div>
        </div>

        {/* Product info */}
        <div className="p-4 space-y-3">
          {/* Title */}
          <h3 className="text-sm font-medium text-foreground line-clamp-2 min-h-[2.5rem] group-hover:text-primary transition-colors">
            {product.title}
          </h3>

          {/* Price */}
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-primary font-mono">
              {formatPrice(product.price)}
            </span>
            <span className="text-xs text-muted-foreground font-mono">
              {product.currency}
            </span>
          </div>

          {/* Location */}
          {product.location && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground font-mono">
              <MapPin className="h-3 w-3" />
              {product.location}
            </div>
          )}

          {/* View link */}
          <div className="pt-2 flex items-center gap-2 text-xs text-primary font-mono group-hover:gap-3 transition-all">
            <span>Ver producto</span>
            <ExternalLink className="h-3 w-3" />
          </div>
        </div>
      </div>
    </a>
  )
}
