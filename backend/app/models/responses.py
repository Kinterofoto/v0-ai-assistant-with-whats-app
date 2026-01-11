from pydantic import BaseModel, HttpUrl, Field
from typing import List, Optional, Dict, Any
from datetime import datetime


class ProductResult(BaseModel):
    """Single product result from Mercado Libre."""

    title: str = Field(..., description="Product title")
    price: float = Field(..., description="Product price in COP")
    currency: str = Field(default="COP", description="Currency code")
    condition: str = Field(..., description="Product condition (Nuevo/Usado)")
    thumbnail: Optional[str] = Field(None, description="Product thumbnail URL")
    url: HttpUrl = Field(..., description="Product page URL")
    seller_reputation: Optional[str] = Field(None, description="Seller reputation level")
    free_shipping: bool = Field(default=False, description="Whether product has free shipping")
    location: Optional[str] = Field(None, description="Seller location")

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "title": "Portátil Lenovo IdeaPad Gaming 3",
                    "price": 1850000,
                    "currency": "COP",
                    "condition": "Nuevo",
                    "thumbnail": "https://http2.mlstatic.com/...",
                    "url": "https://articulo.mercadolibre.com.co/...",
                    "free_shipping": True,
                    "location": "Bogotá"
                }
            ]
        }
    }


class SearchResponse(BaseModel):
    """Response for product search endpoint."""

    success: bool = Field(default=True, description="Whether the search was successful")
    query: str = Field(..., description="Original user query")
    structured_request: Dict[str, Any] = Field(..., description="Structured request extracted by AI")
    results: List[ProductResult] = Field(..., description="List of product results")
    total_found: int = Field(..., description="Total number of products found")
    execution_time_ms: float = Field(..., description="Execution time in milliseconds")
    timestamp: datetime = Field(default_factory=datetime.now, description="Response timestamp")

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "success": True,
                    "query": "Busco laptop para programar menos de 2 millones",
                    "structured_request": {
                        "product_name": "laptop para programar",
                        "max_price": 2000000,
                        "condition": "any",
                        "num_results": 10
                    },
                    "results": [],
                    "total_found": 10,
                    "execution_time_ms": 3542.12,
                    "timestamp": "2024-01-11T10:30:00"
                }
            ]
        }
    }


class ErrorResponse(BaseModel):
    """Standard error response."""

    success: bool = Field(default=False, description="Always false for errors")
    error: str = Field(..., description="Error message")
    error_code: str = Field(..., description="Error code identifier")
    detail: Optional[str] = Field(None, description="Detailed error information")
    timestamp: datetime = Field(default_factory=datetime.now, description="Error timestamp")

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "success": False,
                    "error": "Search failed",
                    "error_code": "SEARCH_ERROR",
                    "detail": "Unable to connect to Mercado Libre",
                    "timestamp": "2024-01-11T10:30:00"
                }
            ]
        }
    }


class WhatsAppResponse(BaseModel):
    """Response for WhatsApp webhook."""

    status: str = Field(..., description="Processing status")
    message_id: str = Field(..., description="WhatsApp message ID")
    processing: bool = Field(default=True, description="Whether message is being processed")

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "status": "accepted",
                    "message_id": "wamid.123456789",
                    "processing": True
                }
            ]
        }
    }


class HealthResponse(BaseModel):
    """Health check response."""

    status: str = Field(default="healthy", description="Service health status")
    version: str = Field(..., description="API version")
    timestamp: datetime = Field(default_factory=datetime.now, description="Health check timestamp")

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "status": "healthy",
                    "version": "1.0.0",
                    "timestamp": "2024-01-11T10:30:00"
                }
            ]
        }
    }
