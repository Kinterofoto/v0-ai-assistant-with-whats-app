/**
 * API client for HALCÓN backend search service
 */

// API base URL from environment variable or default to localhost
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

/**
 * Product condition types
 */
export type ProductCondition = 'new' | 'used' | 'any';

/**
 * Request payload for product search
 */
export interface SearchRequest {
  query: string;
  user_id?: string;
}

/**
 * Extracted product request structure
 */
export interface ExtractedProductRequest {
  product_name: string;
  max_price?: number;
  condition: ProductCondition;
  num_results: number;
  additional_filters?: Record<string, any>;
}

/**
 * Single product result from Mercado Libre
 */
export interface ProductResult {
  title: string;
  price: number;
  currency: string;
  condition: string;
  thumbnail?: string;
  url: string;
  seller_reputation?: string;
  free_shipping: boolean;
  location?: string;
}

/**
 * Search response from API
 */
export interface SearchResponse {
  success: boolean;
  query: string;
  structured_request: ExtractedProductRequest;
  results: ProductResult[];
  total_found: number;
  execution_time_ms: number;
  timestamp: string;
}

/**
 * Error response from API
 */
export interface ErrorResponse {
  success: false;
  error: string;
  error_code: string;
  detail?: string;
  timestamp: string;
}

/**
 * Search for products on Mercado Libre Colombia using the new Firecrawl endpoint.
 *
 * @param query - Natural language product search query
 * @param userId - Optional user identifier (not used in new endpoint)
 * @returns Search response with product results
 * @throws Error if search fails
 *
 * @example
 * ```typescript
 * const results = await searchProducts("iPhone 15");
 * console.log(`Found ${results.total_found} products`);
 * ```
 */
export async function searchProducts(
  query: string,
  userId?: string
): Promise<SearchResponse> {
  const startTime = Date.now();

  // Convert query to URL-friendly format (replace spaces with hyphens)
  const urlQuery = query.toLowerCase().trim().replace(/\s+/g, '-');

  // Use the new Next.js API endpoint with Firecrawl
  const response = await fetch(`/api/scrape?output_busqueda=${encodeURIComponent(urlQuery)}`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.details || error.error || 'Search failed');
  }

  const data = await response.json();

  // Transform the new API response to match the old SearchResponse format
  const transformedResponse: SearchResponse = {
    success: data.success,
    query: query,
    structured_request: {
      product_name: query,
      condition: 'any' as ProductCondition,
      num_results: data.count || 10,
    },
    results: data.products.map((product: any) => ({
      title: product.name,
      price: 0, // Price not available in new endpoint
      currency: 'COP',
      condition: 'Nuevo',
      thumbnail: undefined,
      url: product.url,
      free_shipping: false,
      location: undefined,
    })),
    total_found: data.count,
    execution_time_ms: Date.now() - startTime,
    timestamp: new Date().toISOString(),
  };

  return transformedResponse;
}

/**
 * Stream search for products on Mercado Libre Colombia.
 * Calls the streaming extraction endpoint.
 */
export async function streamSearch(query: string) {
  const urlQuery = query.toLowerCase().trim().replace(/\s+/g, '-');
  const response = await fetch('/api/scrape-stream', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: urlQuery }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.details || error.error || 'Search failed');
  }

  return response;
}
export async function checkHealth(): Promise<{
  status: string;
  version: string;
  timestamp: string;
}> {
  const response = await fetch(`${API_BASE_URL}/api/health`);

  if (!response.ok) {
    throw new Error('Health check failed');
  }

  return response.json();
}

/**
 * Format price in Colombian Pesos.
 *
 * @param price - Price in COP
 * @returns Formatted price string
 *
 * @example
 * ```typescript
 * formatPrice(1850000) // "$1.850.000"
 * ```
 */
export function formatPrice(price: number): string {
  return `$${price.toLocaleString('es-CO')}`;
}

/**
 * Hook for using search API in React components.
 *
 * @example
 * ```typescript
 * function SearchComponent() {
 *   const { search, loading, error, results } = useSearch();
 *
 *   const handleSearch = async () => {
 *     await search("iPhone 15");
 *   };
 *
 *   return (
 *     <div>
 *       {loading && <p>Searching...</p>}
 *       {error && <p>Error: {error}</p>}
 *       {results && <ProductList products={results.results} />}
 *     </div>
 *   );
 * }
 * ```
 */
export function useSearch() {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [results, setResults] = React.useState<SearchResponse | null>(null);

  const search = async (query: string, userId?: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await searchProducts(query, userId);
      setResults(response);
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    search,
    loading,
    error,
    results,
  };
}

// React import for hook
import React from 'react';
