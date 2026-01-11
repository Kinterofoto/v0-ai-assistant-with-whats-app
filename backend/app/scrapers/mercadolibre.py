from typing import List, Optional
from playwright.async_api import async_playwright, Page, Browser, Playwright
from app.models.responses import ProductResult
from app.models.requests import ExtractedProductRequest, ProductCondition
from app.core.logger import get_logger
from app.core.errors import ScraperException
import urllib.parse
import asyncio
import re

logger = get_logger(__name__)


class MercadoLibreScraper:
    """Scraper for Mercado Libre Colombia using Playwright."""

    BASE_URL = "https://listado.mercadolibre.com.co"

    def __init__(self):
        """Initialize scraper."""
        self.playwright: Optional[Playwright] = None
        self.browser: Optional[Browser] = None

    async def initialize(self):
        """Initialize Playwright browser instance."""
        if not self.browser:
            try:
                logger.info("Initializing Playwright browser")
                self.playwright = await async_playwright().start()
                self.browser = await self.playwright.chromium.launch(
                    headless=True,
                    args=[
                        '--no-sandbox',
                        '--disable-setuid-sandbox',
                        '--disable-dev-shm-usage',
                        '--disable-blink-features=AutomationControlled'
                    ]
                )
                logger.info("Browser initialized successfully")
            except Exception as e:
                logger.error(f"Failed to initialize browser: {e}")
                raise ScraperException(f"Browser initialization failed: {e}")

    async def close(self):
        """Close browser and Playwright instance."""
        if self.browser:
            await self.browser.close()
            self.browser = None
        if self.playwright:
            await self.playwright.stop()
            self.playwright = None
        logger.info("Browser closed")

    def build_search_url(self, request: ExtractedProductRequest) -> str:
        """
        Build Mercado Libre search URL with filters.

        Args:
            request: Structured product request with filters

        Returns:
            Complete search URL with query parameters
        """
        query = urllib.parse.quote(request.product_name)
        url = f"{self.BASE_URL}/{query}"

        params = []

        # Price filter
        if request.max_price:
            params.append(f"price=0-{int(request.max_price)}")

        # Condition filter
        if request.condition != ProductCondition.ANY:
            condition_map = {
                ProductCondition.NEW: "new",
                ProductCondition.USED: "used"
            }
            params.append(f"condition={condition_map[request.condition]}")

        if params:
            url += "?" + "&".join(params)

        logger.info(f"Built search URL: {url}")
        return url

    async def scrape_products(
        self,
        request: ExtractedProductRequest
    ) -> List[ProductResult]:
        """
        Scrape products from Mercado Libre based on structured request.

        Args:
            request: Structured product request with search parameters

        Returns:
            List of ProductResult objects

        Raises:
            ScraperException: If scraping fails
        """
        await self.initialize()

        search_url = self.build_search_url(request)
        page = await self.browser.new_page()

        try:
            # Set user agent to avoid detection
            await page.set_extra_http_headers({
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
            })

            # Navigate to search results
            logger.info(f"Navigating to: {search_url}")
            await page.goto(search_url, wait_until="networkidle", timeout=30000)

            # Wait a bit for JavaScript to render
            await page.wait_for_timeout(2000)

            # Try multiple selector strategies
            products = []
            selectors_to_try = [
                'li.ui-search-layout__item',
                '.ui-search-result__wrapper',
                '.ui-search-layout__item',
                'li[class*="ui-search"]',
                'div[class*="ui-search-result"]'
            ]

            for selector in selectors_to_try:
                try:
                    await page.wait_for_selector(selector, timeout=5000)
                    products = await page.query_selector_all(selector)
                    if len(products) > 0:
                        logger.info(f"Found {len(products)} products with selector: {selector}")
                        break
                except Exception as e:
                    logger.debug(f"Selector {selector} failed: {e}")
                    continue

            if len(products) == 0:
                # Try to see if there are no results
                no_results = await page.query_selector('.ui-search-rescue__title')
                if no_results:
                    logger.info("No products found for this search")
                    return []

                # Take screenshot for debugging
                logger.warning("No products found with any selector")
                return []

            logger.info(f"Found {len(products)} product cards on page")

            results = []
            for product in products[:request.num_results]:
                try:
                    result = await self._extract_product_data(product)
                    if result:
                        results.append(result)
                        logger.debug(f"Extracted: {result.title[:50]}... - ${result.price}")
                except Exception as e:
                    logger.warning(f"Failed to extract product: {e}")
                    continue

            logger.info(f"Successfully scraped {len(results)} products")
            return results

        except Exception as e:
            logger.error(f"Scraping failed: {e}")
            raise ScraperException(f"Failed to scrape Mercado Libre: {e}")

        finally:
            await page.close()

    async def _extract_product_data(self, element) -> Optional[ProductResult]:
        """
        Extract data from a single product card.

        Args:
            element: Playwright element locator for product card

        Returns:
            ProductResult or None if extraction fails
        """
        try:
            # Title
            title_elem = await element.query_selector(
                '.ui-search-item__title, .ui-search-item__title-label'
            )
            title = await title_elem.inner_text() if title_elem else None

            if not title:
                return None

            # Price
            price_elem = await element.query_selector(
                '.andes-money-amount__fraction, .price-tag-fraction'
            )
            price_text = await price_elem.inner_text() if price_elem else None
            price = self._parse_price(price_text) if price_text else None

            if not price:
                return None

            # URL
            link_elem = await element.query_selector('a.ui-search-link, a.ui-search-result__content')
            url = await link_elem.get_attribute('href') if link_elem else None

            if not url:
                return None

            # Ensure URL is absolute
            if url.startswith('/'):
                url = f"https://articulo.mercadolibre.com.co{url}"

            # Thumbnail
            img_elem = await element.query_selector(
                'img.ui-search-result-image__element, img.ui-search-result__image'
            )
            thumbnail = await img_elem.get_attribute('src') if img_elem else None

            # Condition
            condition_elem = await element.query_selector('.ui-search-item__group__element--condition')
            if condition_elem:
                condition = await condition_elem.inner_text()
            else:
                condition = "Nuevo"  # Default to new

            # Free shipping
            shipping_elem = await element.query_selector(
                '.ui-search-item__shipping, .ui-pb-highlight'
            )
            free_shipping = False
            if shipping_elem:
                shipping_text = await shipping_elem.inner_text()
                free_shipping = 'gratis' in shipping_text.lower()

            # Location
            location_elem = await element.query_selector('.ui-search-item__location-label')
            location = await location_elem.inner_text() if location_elem else None

            return ProductResult(
                title=title.strip(),
                price=price,
                currency="COP",
                condition=condition.strip(),
                thumbnail=thumbnail,
                url=url,
                free_shipping=free_shipping,
                location=location.strip() if location else None
            )

        except Exception as e:
            logger.debug(f"Element extraction error: {e}")
            return None

    def _parse_price(self, price_text: str) -> float:
        """
        Parse price string to float.

        Args:
            price_text: Price text from page (e.g., "1.850.000")

        Returns:
            Price as float
        """
        # Remove currency symbols, dots, commas, and spaces
        clean = re.sub(r'[^\d]', '', price_text)
        try:
            return float(clean)
        except ValueError:
            logger.warning(f"Failed to parse price: {price_text}")
            return 0.0


# Singleton instance for reuse across requests
_scraper_instance: Optional[MercadoLibreScraper] = None


async def get_scraper() -> MercadoLibreScraper:
    """
    Get singleton scraper instance.

    Returns:
        MercadoLibreScraper instance
    """
    global _scraper_instance
    if _scraper_instance is None:
        _scraper_instance = MercadoLibreScraper()
    return _scraper_instance
