from pydantic import BaseModel, Field
from typing import Optional


class WhatsAppMessage(BaseModel):
    """WhatsApp webhook message structure."""

    from_number: str = Field(..., alias="from", description="Sender's phone number")
    message_body: str = Field(..., alias="body", description="Message text content")
    message_id: str = Field(..., alias="id", description="Unique message identifier")
    timestamp: int = Field(..., description="Message timestamp (Unix timestamp)")
    name: Optional[str] = Field(None, description="Sender's name")

    model_config = {
        "populate_by_name": True,
        "json_schema_extra": {
            "examples": [
                {
                    "from": "+573001234567",
                    "body": "Busco iPhone 15 menos de 2 millones",
                    "id": "wamid.123456789",
                    "timestamp": 1704985800,
                    "name": "Juan Pérez"
                }
            ]
        }
    }


class WhatsAppWebhookEntry(BaseModel):
    """WhatsApp webhook entry structure (Meta API format)."""

    id: str = Field(..., description="WhatsApp Business Account ID")
    changes: list = Field(..., description="List of changes")

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "id": "123456789",
                    "changes": []
                }
            ]
        }
    }


class WhatsAppWebhook(BaseModel):
    """Complete WhatsApp webhook payload (Meta API format)."""

    object: str = Field(..., description="Webhook object type")
    entry: list[WhatsAppWebhookEntry] = Field(..., description="List of webhook entries")

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "object": "whatsapp_business_account",
                    "entry": []
                }
            ]
        }
    }
