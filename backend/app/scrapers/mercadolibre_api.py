"""Mercado Libre API client using official API instead of scraping."""
from typing import List, Optional
import httpx
from app.models.responses import ProductResult
from app.models.requests import ExtractedProductRequest, ProductCondition
from app.core.logger import get_logger
from app.core.errors import ScraperException
import asyncio

logger = get_logger(__name__)


class MercadoLibreAPI:
    """Client for Mercado Libre official API."""

    BASE_URL = "https://api.mercadolibre.com"
    SITE_ID = "MCO"  # Colombia

    def __init__(self):
        """Initialize API client."""
        headers = {
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Accept": "application/json",
            "Accept-Language": "es-CO,es;q=0.9,en;q=0.8"
        }
        self.client = httpx.AsyncClient(timeout=30.0, headers=headers, follow_redirects=True)

    async def close(self):
        """Close HTTP client."""
        await self.client.aclose()
        logger.info("HTTP client closed")

    async def search_products(
        self,
        request: ExtractedProductRequest
    ) -> List[ProductResult]:
        """
        Search products using Mercado Libre API.

        Args:
            request: Structured product request with search parameters

        Returns:
            List of ProductResult objects

        Raises:
            ScraperException: If API request fails
        """
        try:
            # Build search query
            query = request.product_name

            # Build parameters
            params = {
                "q": query,
                "limit": min(request.num_results, 50),  # API max is 50
            }

            # Add price filter
            if request.max_price:
                params["price"] = f"0-{int(request.max_price)}"

            # Add condition filter
            if request.condition != ProductCondition.ANY:
                condition_map = {
                    ProductCondition.NEW: "new",
                    ProductCondition.USED: "used"
                }
                params["condition"] = condition_map[request.condition]

            # Make API request
            url = f"{self.BASE_URL}/sites/{self.SITE_ID}/search"
            logger.info(f"Searching Mercado Libre API: {url} with params: {params}")

            response = await self.client.get(url, params=params)
            response.raise_for_status()

            data = response.json()

            # Parse results
            results = []
            for item in data.get("results", []):
                try:
                    result = self._parse_product(item)
                    if result:
                        results.append(result)
                except Exception as e:
                    logger.warning(f"Failed to parse product: {e}")
                    continue

            logger.info(f"Successfully fetched {len(results)} products from API")
            return results

        except httpx.HTTPError as e:
            logger.error(f"API request failed: {e}")
            raise ScraperException(f"Failed to fetch from Mercado Libre API: {e}")
        except Exception as e:
            logger.error(f"Unexpected error: {e}")
            raise ScraperException(f"Unexpected error: {e}")

    def _parse_product(self, item: dict) -> Optional[ProductResult]:
        """
        Parse product data from API response.

        Args:
            item: Product item from API response

        Returns:
            ProductResult or None if parsing fails
        """
        try:
            # Extract data
            title = item.get("title")
            price = item.get("price")
            currency = item.get("currency_id", "COP")

            if not title or not price:
                return None

            # Get condition
            condition = item.get("condition", "new")
            condition_map = {
                "new": "Nuevo",
                "used": "Usado",
                "not_specified": "No especificado"
            }
            condition_text = condition_map.get(condition, "No especificado")

            # Get thumbnail
            thumbnail = item.get("thumbnail")
            if thumbnail:
                # Get higher quality image
                thumbnail = thumbnail.replace("-I.jpg", "-O.jpg")

            # Get URL
            url = item.get("permalink")

            # Get shipping info
            shipping = item.get("shipping", {})
            free_shipping = shipping.get("free_shipping", False)

            # Get location
            location = None
            if "address" in item:
                state = item["address"].get("state_name")
                city = item["address"].get("city_name")
                if city and state:
                    location = f"{city}, {state}"
                elif state:
                    location = state

            return ProductResult(
                title=title,
                price=float(price),
                currency=currency,
                condition=condition_text,
                thumbnail=thumbnail,
                url=url,
                free_shipping=free_shipping,
                location=location
            )

        except Exception as e:
            logger.debug(f"Failed to parse product: {e}")
            return None


# Singleton instance for reuse across requests
_api_instance: Optional[MercadoLibreAPI] = None


async def get_api_client() -> MercadoLibreAPI:
    """
    Get singleton API client instance.

    Returns:
        MercadoLibreAPI instance
    """
    global _api_instance
    if _api_instance is None:
        _api_instance = MercadoLibreAPI()
    return _api_instance
