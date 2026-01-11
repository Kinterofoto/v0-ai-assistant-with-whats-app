import httpx
from typing import Dict, Any, List
from app.config import get_settings
from app.core.logger import get_logger
from app.services.openai_service import OpenAIService
from app.scrapers.mercadolibre import get_scraper
from app.models.responses import ProductResult

logger = get_logger(__name__)
settings = get_settings()


class WhatsAppService:
    """Service for handling WhatsApp Business API integration."""

    def __init__(self):
        """Initialize WhatsApp service."""
        self.api_key = settings.WHATSAPP_API_KEY
        self.phone_number = settings.WHATSAPP_PHONE_NUMBER
        # Meta WhatsApp Cloud API base URL
        self.api_url = "https://graph.facebook.com/v18.0"

    async def send_message(self, to_number: str, message: str) -> bool:
        """
        Send a WhatsApp message.

        Args:
            to_number: Recipient phone number
            message: Message text to send

        Returns:
            True if message was sent successfully
        """
        if not self.api_key:
            logger.warning("WhatsApp API key not configured, skipping message send")
            return False

        url = f"{self.api_url}/{self.phone_number}/messages"
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        payload = {
            "messaging_product": "whatsapp",
            "to": to_number,
            "type": "text",
            "text": {"body": message}
        }

        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(url, headers=headers, json=payload, timeout=10.0)
                response.raise_for_status()

                logger.info(f"Message sent successfully to {to_number}")
                return True

        except httpx.HTTPError as e:
            logger.error(f"Failed to send WhatsApp message: {e}")
            return False

    async def send_product_links(
        self,
        to_number: str,
        products: List[ProductResult],
        max_links: int = 5
    ) -> bool:
        """
        Send product links to user.

        Args:
            to_number: Recipient phone number
            products: List of ProductResult objects
            max_links: Maximum number of links to send

        Returns:
            True if messages were sent successfully
        """
        if not products:
            return False

        # Format product links
        messages = []
        for i, product in enumerate(products[:max_links], 1):
            price_formatted = f"${product.price:,.0f}".replace(",", ".")
            message = (
                f"*{i}. {product.title[:80]}*\n"
                f"💰 Precio: {price_formatted} COP\n"
                f"📦 Estado: {product.condition}\n"
            )

            if product.free_shipping:
                message += "🚚 Envío gratis\n"

            message += f"🔗 {product.url}"
            messages.append(message)

        # Send each product as a separate message
        success = True
        for msg in messages:
            if not await self.send_message(to_number, msg):
                success = False

        return success

    async def process_and_respond(
        self,
        from_number: str,
        message: str,
        message_id: str
    ) -> None:
        """
        Process incoming WhatsApp message and respond with product search.

        This is the main handler for WhatsApp messages that orchestrates:
        1. Extract product request with OpenAI
        2. Scrape Mercado Libre
        3. Send response message and product links

        Args:
            from_number: Sender's phone number
            message: Message text
            message_id: WhatsApp message ID
        """
        logger.info(f"Processing WhatsApp message {message_id} from {from_number}")

        try:
            # Step 1: Extract structured request
            openai_service = OpenAIService()
            structured_request = await openai_service.extract_product_request(message)

            logger.info(f"Extracted request: {structured_request.model_dump()}")

            # Step 2: Scrape products
            scraper = await get_scraper()
            results = await scraper.scrape_products(structured_request)

            logger.info(f"Found {len(results)} products")

            # Step 3: Generate and send response
            if results:
                # Send summary message
                summary = await openai_service.generate_response_message(
                    results,
                    message,
                    structured_request.model_dump()
                )
                await self.send_message(from_number, summary)

                # Send product links
                await self.send_product_links(from_number, results, max_links=5)

            else:
                # No results found
                no_results_msg = (
                    f"❌ No encontré productos para '{structured_request.product_name}'. "
                    f"Intenta con una búsqueda diferente o ajusta los filtros."
                )
                await self.send_message(from_number, no_results_msg)

            logger.info(f"WhatsApp message {message_id} processed successfully")

        except Exception as e:
            logger.error(f"Error processing WhatsApp message: {e}", exc_info=True)

            # Send error message to user
            error_msg = (
                "❌ Lo siento, hubo un error procesando tu búsqueda. "
                "Por favor intenta de nuevo en unos momentos."
            )
            await self.send_message(from_number, error_msg)
