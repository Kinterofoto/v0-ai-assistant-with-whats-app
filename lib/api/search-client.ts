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
 * Search for products on Mercado Libre Colombia.
 *
 * @param query - Natural language product search query
 * @param userId - Optional user identifier
 * @returns Search response with product results
 * @throws Error if search fails
 *
 * @example
 * ```typescript
 * const results = await searchProducts("Busco laptop para programar menos de 2 millones");
 * console.log(`Found ${results.total_found} products`);
 * ```
 */
export async function searchProducts(
  query: string,
  userId?: string
): Promise<SearchResponse> {
  const response = await fetch(`${API_BASE_URL}/api/v1/search`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query,
      user_id: userId,
    }),
  });

  if (!response.ok) {
    const error: ErrorResponse = await response.json();
    throw new Error(error.detail || error.error || 'Search failed');
  }

  return response.json();
}

/**
 * Check API health status.
 *
 * @returns Health status object
 * @throws Error if health check fails
 */
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
