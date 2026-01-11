# HALCÓN Backend API

Backend con FastAPI para el asistente de búsqueda de productos en Mercado Libre Colombia.

## Características

- 🤖 **Extracción con IA**: Usa OpenAI GPT-4 para convertir lenguaje natural a búsquedas estructuradas
- 🔍 **Scraping inteligente**: Playwright para scraping de Mercado Libre Colombia
- 💬 **WhatsApp Integration**: Soporte para webhooks de WhatsApp Business API
- 🚀 **API REST**: Endpoints REST para integración directa desde frontend
- 📊 **Validación robusta**: Pydantic para validación de datos
- ⚡ **Async/Await**: Arquitectura completamente asíncrona

## Arquitectura

```
backend/
├── app/
│   ├── api/v1/          # Endpoints de API
│   │   ├── search.py    # Búsqueda de productos
│   │   ├── webhooks.py  # Webhooks de WhatsApp
│   │   └── health.py    # Health checks
│   ├── models/          # Modelos Pydantic
│   ├── services/        # Lógica de negocio
│   │   ├── openai_service.py
│   │   └── whatsapp_service.py
│   ├── scrapers/        # Scrapers
│   │   └── mercadolibre.py
│   ├── core/           # Utilidades core
│   └── main.py         # Aplicación FastAPI
├── requirements.txt
├── Dockerfile
└── .env
```

## Instalación

### Requisitos

- Python 3.11+
- Playwright
- OpenAI API Key

### Setup Local

1. **Crear entorno virtual**:
```bash
cd backend
python -m venv venv
source venv/bin/activate  # En Windows: venv\Scripts\activate
```

2. **Instalar dependencias**:
```bash
pip install -r requirements.txt
```

3. **Instalar Playwright**:
```bash
playwright install chromium
playwright install-deps chromium  # Dependencias del sistema
```

4. **Configurar variables de entorno**:
```bash
cp .env.example .env
# Editar .env con tus API keys
```

Variables requeridas en `.env`:
```env
OPENAI_API_KEY=sk-tu-api-key
OPENAI_MODEL=gpt-4
WHATSAPP_VERIFY_TOKEN=tu-token-de-verificacion
WHATSAPP_API_KEY=tu-whatsapp-api-key
WHATSAPP_PHONE_NUMBER=+57XXXXXXXXXX
ALLOWED_ORIGINS=http://localhost:3000
```

5. **Ejecutar el servidor**:
```bash
uvicorn app.main:app --reload --port 8000
```

La API estará disponible en `http://localhost:8000`

## Uso

### API REST

#### Buscar Productos

```bash
curl -X POST http://localhost:8000/api/v1/search \
  -H "Content-Type: application/json" \
  -d '{
    "query": "Busco laptop para programar menos de 2 millones"
  }'
```

Respuesta:
```json
{
  "success": true,
  "query": "Busco laptop para programar menos de 2 millones",
  "structured_request": {
    "product_name": "laptop para programar",
    "max_price": 2000000,
    "condition": "any",
    "num_results": 10
  },
  "results": [
    {
      "title": "Portátil Lenovo IdeaPad Gaming 3",
      "price": 1850000,
      "currency": "COP",
      "condition": "Nuevo",
      "thumbnail": "https://...",
      "url": "https://articulo.mercadolibre.com.co/...",
      "free_shipping": true
    }
  ],
  "total_found": 10,
  "execution_time_ms": 3542.12
}
```

#### Health Check

```bash
curl http://localhost:8000/api/health
```

### WhatsApp Webhooks

#### Verificación de Webhook

1. Configurar webhook URL en Meta Developer Console o Twilio:
   - URL: `https://tu-dominio.com/api/v1/webhooks/whatsapp`
   - Verify Token: El valor de `WHATSAPP_VERIFY_TOKEN`

2. Meta enviará GET request para verificar:
```
GET /api/v1/webhooks/whatsapp?hub.mode=subscribe&hub.verify_token=tu-token&hub.challenge=123456
```

#### Recibir Mensajes

Los mensajes de WhatsApp se procesan automáticamente:

1. Usuario envía: "Busco iPhone 15 menos de 2 millones"
2. Backend extrae datos estructurados con OpenAI
3. Hace scraping en Mercado Libre
4. Envía respuesta con los mejores productos

## Testing

### Test Manual con curl

```bash
# Test de búsqueda
curl -X POST http://localhost:8000/api/v1/search \
  -H "Content-Type: application/json" \
  -d '{"query": "iPhone 15"}'

# Health check
curl http://localhost:8000/api/health
```

### Test con Playwright

Para verificar que el scraper funciona:

```python
from app.scrapers.mercadolibre import MercadoLibreScraper
from app.models.requests import ExtractedProductRequest

async def test_scraper():
    scraper = MercadoLibreScraper()
    await scraper.initialize()

    request = ExtractedProductRequest(
        product_name="laptop",
        max_price=2000000,
        condition="any",
        num_results=5
    )

    results = await scraper.scrape_products(request)
    print(f"Found {len(results)} products")

    await scraper.close()
```

## Deployment

### Docker

```bash
# Build imagen
docker build -t halcon-backend .

# Run contenedor
docker run -p 8000:8000 --env-file .env halcon-backend
```

### Railway / Render

1. Conectar repositorio
2. Configurar variables de entorno
3. Railway/Render detectará el `Dockerfile` automáticamente
4. Deploy!

### Configurar Webhook de WhatsApp

Para desarrollo local con webhook:

1. Instalar ngrok:
```bash
brew install ngrok  # macOS
# o descargar de https://ngrok.com
```

2. Exponer puerto local:
```bash
ngrok http 8000
```

3. Usar URL de ngrok en Meta Developer Console:
```
https://abc123.ngrok.io/api/v1/webhooks/whatsapp
```

## Documentación de API

Una vez iniciado el servidor, accede a:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## Estructura de Datos

### Request Schema

```python
{
  "query": str,        # Query en lenguaje natural
  "user_id": str       # Opcional: ID del usuario
}
```

### Extracted Request Schema

```python
{
  "product_name": str,        # Nombre del producto
  "max_price": float,         # Precio máximo en COP
  "condition": "new|used|any", # Condición del producto
  "num_results": int          # Cantidad de resultados (1-50)
}
```

### Response Schema

```python
{
  "success": bool,
  "query": str,
  "structured_request": dict,
  "results": [ProductResult],
  "total_found": int,
  "execution_time_ms": float
}
```

### ProductResult Schema

```python
{
  "title": str,
  "price": float,
  "currency": str,
  "condition": str,
  "thumbnail": str,
  "url": str,
  "free_shipping": bool,
  "location": str
}
```

## Troubleshooting

### Error: "Browser not found"

```bash
playwright install chromium
playwright install-deps chromium
```

### Error: "OpenAI API key not found"

Verifica que `.env` tiene `OPENAI_API_KEY` configurado correctamente.

### Scraper no encuentra productos

1. Verifica que los selectores CSS no hayan cambiado en Mercado Libre
2. Revisa logs: `logger.info()` en `mercadolibre.py`
3. Prueba la URL manualmente en el navegador

### WhatsApp webhook no funciona

1. Verifica que `WHATSAPP_VERIFY_TOKEN` coincide con Meta/Twilio
2. Confirma que la URL es pública (usa ngrok para desarrollo local)
3. Revisa logs del servidor para ver requests entrantes

## Contribuir

1. Fork el repositorio
2. Crear branch: `git checkout -b feature/nueva-funcionalidad`
3. Commit cambios: `git commit -am 'Agregar nueva funcionalidad'`
4. Push: `git push origin feature/nueva-funcionalidad`
5. Crear Pull Request

## Licencia

MIT

## Soporte

Para reportar bugs o solicitar features, abre un issue en GitHub.
