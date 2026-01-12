"""Debug script to find current Mercado Libre selectors."""
import asyncio
from playwright.async_api import async_playwright
from playwright_stealth import Stealth

# Initialize stealth configuration
stealth_config = Stealth(
    navigator_languages_override=('es-CO', 'es', 'en'),
    navigator_user_agent_override='Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
)


async def debug_selectors():
    """Test selectors on Mercado Libre to find working ones."""
    async with async_playwright() as p:
        browser = await p.chromium.launch(
            headless=True,
            args=['--no-sandbox', '--disable-setuid-sandbox', '--disable-blink-features=AutomationControlled']
        )
        page = await browser.new_page()

        # Apply stealth mode
        await stealth_config.apply_stealth_async(page)

        # Set realistic viewport
        await page.set_viewport_size({"width": 1920, "height": 1080})

        # Navigate to Mercado Libre Colombia
        url = "https://listado.mercadolibre.com.co/iPhone%2015"
        print(f"Navigating to: {url}")
        await page.goto(url, wait_until="networkidle", timeout=30000)

        # Wait for content to load
        await page.wait_for_timeout(5000)

        # Save screenshot
        await page.screenshot(path="mercadolibre_screenshot.png", full_page=True)
        print("Screenshot saved as mercadolibre_screenshot.png")

        # Get page HTML to analyze
        content = await page.content()

        # Save HTML for inspection
        with open("mercadolibre_page.html", "w", encoding="utf-8") as f:
            f.write(content)
        print("HTML saved as mercadolibre_page.html")

        # Check page title
        title = await page.title()
        print(f"Page title: {title}")

        # Get all class names on the page
        all_classes = await page.evaluate('''() => {
            const elements = document.querySelectorAll('*');
            const classes = new Set();
            elements.forEach(el => {
                if (el.className && typeof el.className === 'string') {
                    el.className.split(' ').forEach(cls => {
                        if (cls.includes('search') || cls.includes('item') || cls.includes('product') || cls.includes('card')) {
                            classes.add(cls);
                        }
                    });
                }
            });
            return Array.from(classes);
        }''')
        print(f"\nRelevant classes found: {all_classes[:20]}")

        # Try to find product containers
        print("\n=== Testing selectors ===")
        selectors_to_test = [
            'li.ui-search-layout__item',
            '.ui-search-result__wrapper',
            '.ui-search-layout__item',
            'li[class*="ui-search"]',
            'div[class*="ui-search-result"]',
            '.poly-card',
            '.ui-search-result',
            '[class*="item__"]',
            'article',
            '.andes-card',
        ]

        for selector in selectors_to_test:
            try:
                elements = await page.query_selector_all(selector)
                print(f"✓ {selector}: {len(elements)} elements found")
                if len(elements) > 0:
                    # Try to get first element info
                    first = elements[0]
                    html = await first.inner_html()
                    print(f"  First element HTML (first 200 chars): {html[:200]}...")
            except Exception as e:
                print(f"✗ {selector}: Error - {e}")

        print("\n=== Inspecting first visible element ===")
        # Get all possible product containers
        all_articles = await page.query_selector_all('li, article, div[class*="search"]')
        print(f"Found {len(all_articles)} potential containers")

        if all_articles:
            first = all_articles[0]
            classes = await first.get_attribute('class')
            print(f"First element classes: {classes}")

        await browser.close()


if __name__ == "__main__":
    asyncio.run(debug_selectors())
