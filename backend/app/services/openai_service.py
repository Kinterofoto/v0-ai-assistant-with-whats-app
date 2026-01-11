import json
from typing import Dict, Any
from openai import AsyncOpenAI
from app.config import get_settings
from app.models.requests import ExtractedProductRequest, ProductCondition
from app.core.logger import get_logger
from app.core.errors import OpenAIException

logger = get_logger(__name__)
settings = get_settings()


class OpenAIService:
    """Service for interacting with OpenAI API."""

    def __init__(self):
        """Initialize OpenAI service."""
        self.client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
        self.model = settings.OPENAI_MODEL

    async def extract_product_request(self, user_query: str) -> ExtractedProductRequest:
        """
        Extract structured product information from natural language query.

        Uses OpenAI Function Calling to ensure structured JSON output that matches
        our ExtractedProductRequest schema.

        Args:
            user_query: Natural language product search query

        Returns:
            ExtractedProductRequest with structured data

        Raises:
            OpenAIException: If extraction fails
        """
        function_schema = {
            "name": "extract_product_info",
            "description": "Extract product search parameters from user query in Spanish",
            "parameters": {
                "type": "object",
                "properties": {
                    "product_name": {
                        "type": "string",
                        "description": "Main product name or category to search for"
                    },
                    "max_price": {
                        "type": "number",
                        "description": (
                            "Maximum price in Colombian Pesos (COP). "
                            "Convert text like '2 millones' to 2000000, "
                            "'500 mil' to 500000, 'un millón' to 1000000"
                        )
                    },
                    "condition": {
                        "type": "string",
                        "enum": ["new", "used", "any"],
                        "description": (
                            "Product condition: 'new' for nuevo, "
                            "'used' for usado, 'any' for cualquiera or not specified"
                        )
                    },
                    "num_results": {
                        "type": "integer",
                        "description": (
                            "Number of results desired (1-50). "
                            "Default to 10 if not specified"
                        ),
                        "default": 10,
                        "minimum": 1,
                        "maximum": 50
                    }
                },
                "required": ["product_name"]
            }
        }

        system_prompt = """Eres un asistente experto en extraer información de búsquedas de productos para Mercado Libre Colombia.

Tu tarea es analizar el mensaje del usuario y extraer:
1. El nombre del producto o categoría principal
2. El precio máximo (si se menciona)
3. La condición del producto (nuevo/usado/cualquiera)
4. La cantidad de resultados deseada

Reglas de conversión de precios:
- "2 millones" o "2M" → 2000000
- "500 mil" o "500k" → 500000
- "un millón" → 1000000
- "1.5 millones" → 1500000
- Si dice "menos de X" o "máximo X" o "hasta X", usa ese valor como max_price
- Si no menciona precio, no incluyas max_price

Reglas de condición:
- "nuevo" o "nueva" → "new"
- "usado" o "usada" o "segunda mano" → "used"
- Si no especifica o dice "cualquiera" → "any"

Ejemplos:
- "Busco iPhone 15 menos de 2 millones" → {product_name: "iPhone 15", max_price: 2000000, condition: "any", num_results: 10}
- "Dame 5 laptops para programar nuevas" → {product_name: "laptops para programar", condition: "new", num_results: 5}
- "PlayStation 5 usada máximo 1.5 millones" → {product_name: "PlayStation 5", max_price: 1500000, condition: "used", num_results: 10}
"""

        try:
            logger.info(f"Extracting structured data from query: {user_query[:100]}")

            response = await self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_query}
                ],
                functions=[function_schema],
                function_call={"name": "extract_product_info"},
                temperature=0.1
            )

            # Extract function call arguments
            function_call = response.choices[0].message.function_call
            if not function_call:
                raise OpenAIException("No function call in OpenAI response")

            function_args = json.loads(function_call.arguments)
            logger.info(f"Extracted args: {function_args}")

            # Validate and create structured request
            extracted = ExtractedProductRequest(**function_args)
            logger.info(f"Successfully extracted: {extracted.model_dump()}")

            return extracted

        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse OpenAI function call arguments: {e}")
            raise OpenAIException(f"Invalid JSON from OpenAI: {e}")

        except Exception as e:
            logger.error(f"OpenAI extraction failed: {e}")

            # Fallback: create basic extraction from query
            logger.warning("Using fallback extraction")
            return ExtractedProductRequest(
                product_name=user_query[:100],
                condition=ProductCondition.ANY,
                num_results=10
            )

    async def generate_response_message(
        self,
        results: list,
        query: str,
        structured_request: Dict[str, Any]
    ) -> str:
        """
        Generate natural language response for WhatsApp.

        Creates a friendly, concise message summarizing the search results.

        Args:
            results: List of ProductResult objects
            query: Original user query
            structured_request: Structured request that was used

        Returns:
            Natural language message suitable for WhatsApp
        """
        if not results:
            return (
                f"❌ No encontré productos para '{structured_request.get('product_name', query)}'. "
                f"Intenta con una búsqueda diferente."
            )

        # Create summary of top 3 results
        top_results = results[:3]
        results_summary = []

        for i, result in enumerate(top_results, 1):
            price_formatted = f"${result.price:,.0f}".replace(",", ".")
            results_summary.append({
                "title": result.title[:60],
                "price": price_formatted,
                "condition": result.condition,
                "url": str(result.url)
            })

        prompt = f"""Genera un mensaje corto y amigable en español para WhatsApp resumiendo estos productos de Mercado Libre.

Query original: {query}
Productos encontrados: {len(results)} en total

Top 3 resultados:
{json.dumps(results_summary, indent=2, ensure_ascii=False)}

Requisitos:
- Máximo 250 caracteres
- Incluye emoji 🔍 al inicio
- Menciona cuántos productos encontraste
- No incluyas los enlaces (se enviarán por separado)
- Sé entusiasta pero conciso

Ejemplo:
"🔍 ¡Encontré 15 productos! Los más destacados son laptops desde $1.850.000. Te envío los enlaces..."
"""

        try:
            response = await self.client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.7,
                max_tokens=150
            )

            return response.choices[0].message.content.strip()

        except Exception as e:
            logger.error(f"Failed to generate response message: {e}")

            # Fallback message
            product_name = structured_request.get('product_name', 'productos')
            return (
                f"🔍 Encontré {len(results)} opciones de {product_name}. "
                f"El precio más bajo es ${results[0].price:,.0f}. "
                f"Te envío los mejores resultados."
            )
