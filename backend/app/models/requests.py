from pydantic import BaseModel, Field, field_validator
from typing import Optional, Dict, Any
from enum import Enum


class ProductCondition(str, Enum):
    """Product condition types."""
    NEW = "new"
    USED = "used"
    ANY = "any"


class SearchRequest(BaseModel):
    """Direct REST API search request."""

    query: str = Field(
        ...,
        min_length=3,
        max_length=500,
        description="User's product search query in natural language"
    )
    user_id: Optional[str] = Field(
        None,
        description="Optional user identifier for tracking"
    )

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "query": "Busco un laptop para programar menos de 2 millones",
                    "user_id": "user_123"
                }
            ]
        }
    }


class ExtractedProductRequest(BaseModel):
    """Structured product request extracted by OpenAI."""

    product_name: str = Field(
        ...,
        description="Main product name or category to search"
    )
    max_price: Optional[float] = Field(
        None,
        gt=0,
        description="Maximum price in Colombian Pesos (COP)"
    )
    condition: ProductCondition = Field(
        ProductCondition.ANY,
        description="Product condition: new, used, or any"
    )
    num_results: int = Field(
        10,
        ge=1,
        le=50,
        description="Number of results to return (1-50)"
    )
    additional_filters: Optional[Dict[str, Any]] = Field(
        default_factory=dict,
        description="Extra filters extracted from query"
    )

    @field_validator('product_name')
    @classmethod
    def validate_product_name(cls, v: str) -> str:
        """Validate and clean product name."""
        cleaned = v.strip()
        if len(cleaned) < 2:
            raise ValueError('Product name must be at least 2 characters')
        return cleaned

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "product_name": "laptop para programar",
                    "max_price": 2000000,
                    "condition": "any",
                    "num_results": 10
                }
            ]
        }
    }
