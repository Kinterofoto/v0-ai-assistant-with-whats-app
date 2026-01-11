from fastapi import APIRouter, BackgroundTasks, HTTPException, Request, Query
from typing import Dict, Any
from app.models.responses import WhatsAppResponse
from app.services.whatsapp_service import WhatsAppService
from app.core.logger import get_logger
from app.config import get_settings

router = APIRouter(prefix="/webhooks", tags=["webhooks"])
logger = get_logger(__name__)
settings = get_settings()


@router.get("/whatsapp")
async def verify_webhook(
    hub_mode: str = Query(alias="hub.mode"),
    hub_verify_token: str = Query(alias="hub.verify_token"),
    hub_challenge: str = Query(alias="hub.challenge")
):
    """
    WhatsApp webhook verification endpoint.

    This endpoint is called by Meta/Twilio to verify the webhook URL.
    It must return the hub.challenge value if the verification token matches.

    Args:
        hub_mode: Should be "subscribe"
        hub_verify_token: Verification token configured in Meta/Twilio dashboard
        hub_challenge: Challenge string to return

    Returns:
        The challenge string if verification succeeds

    Raises:
        HTTPException: If verification fails (403)
    """
    logger.info(f"Webhook verification request: mode={hub_mode}, token={hub_verify_token[:10]}...")

    if hub_mode == "subscribe" and hub_verify_token == settings.WHATSAPP_VERIFY_TOKEN:
        logger.info("Webhook verification successful")
        return int(hub_challenge)

    logger.warning("Webhook verification failed: invalid token")
    raise HTTPException(status_code=403, detail="Verification failed")


@router.post("/whatsapp")
async def whatsapp_webhook(
    request: Request,
    background_tasks: BackgroundTasks
):
    """
    WhatsApp webhook receiver for incoming messages.

    This endpoint receives webhook notifications from Meta WhatsApp Cloud API
    and processes messages asynchronously in the background.

    Args:
        request: FastAPI request with webhook payload
        background_tasks: FastAPI background tasks manager

    Returns:
        WhatsAppResponse indicating message was accepted

    Raises:
        HTTPException: If payload processing fails
    """
    try:
        payload = await request.json()
        logger.info(f"Received WhatsApp webhook: {payload}")

        # Extract message data from Meta webhook format
        if "entry" not in payload or not payload["entry"]:
            logger.warning("Invalid webhook payload: missing 'entry'")
            return {"status": "ignored"}

        entry = payload["entry"][0]
        if "changes" not in entry or not entry["changes"]:
            logger.warning("Invalid webhook payload: missing 'changes'")
            return {"status": "ignored"}

        changes = entry["changes"][0]
        if "value" not in changes:
            logger.warning("Invalid webhook payload: missing 'value'")
            return {"status": "ignored"}

        value = changes["value"]

        # Check if it's a message event
        if "messages" not in value or not value["messages"]:
            logger.info("Webhook is not a message event, ignoring")
            return {"status": "ignored"}

        message_data = value["messages"][0]

        # Extract message details
        from_number = message_data.get("from", "")
        message_id = message_data.get("id", "")
        message_type = message_data.get("type", "")

        # Only process text messages
        if message_type != "text":
            logger.info(f"Ignoring non-text message type: {message_type}")
            return {"status": "ignored"}

        message_body = message_data.get("text", {}).get("body", "")

        if not message_body:
            logger.warning("Empty message body, ignoring")
            return {"status": "ignored"}

        logger.info(f"Processing message from {from_number}: {message_body[:50]}...")

        # Process message in background to respond quickly to webhook
        background_tasks.add_task(
            process_whatsapp_message,
            from_number,
            message_body,
            message_id
        )

        return {
            "status": "accepted",
            "message_id": message_id
        }

    except Exception as e:
        logger.error(f"Error processing webhook: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


async def process_whatsapp_message(from_number: str, message: str, msg_id: str):
    """
    Background task to process WhatsApp message.

    Args:
        from_number: Sender's phone number
        message: Message text
        msg_id: Message ID
    """
    service = WhatsAppService()
    await service.process_and_respond(from_number, message, msg_id)
