from fastapi import HTTPException
from typing import Optional, Dict, Any


class ScraperException(Exception):
    """Base exception for scraper errors."""
    pass


class OpenAIException(Exception):
    """Base exception for OpenAI API errors."""
    pass


class WhatsAppException(Exception):
    """Base exception for WhatsApp API errors."""
    pass


class RateLimitException(HTTPException):
    """Rate limit exceeded exception."""

    def __init__(self):
        super().__init__(
            status_code=429,
            detail="Rate limit exceeded. Please try again later."
        )


def create_error_response(
    status_code: int,
    error: str,
    error_code: str,
    detail: Optional[str] = None
) -> HTTPException:
    """
    Create a standardized error response.

    Args:
        status_code: HTTP status code
        error: Error message
        error_code: Error code identifier
        detail: Optional detailed error information

    Returns:
        HTTPException instance
    """
    return HTTPException(
        status_code=status_code,
        detail={
            "success": False,
            "error": error,
            "error_code": error_code,
            "detail": detail
        }
    )


def handle_scraper_error(e: Exception) -> HTTPException:
    """
    Handle scraper errors and convert to HTTP exceptions.

    Args:
        e: Exception that occurred

    Returns:
        HTTPException with appropriate status code and message
    """
    return create_error_response(
        status_code=503,
        error="Scraping service unavailable",
        error_code="SCRAPER_ERROR",
        detail=str(e)
    )


def handle_openai_error(e: Exception) -> HTTPException:
    """
    Handle OpenAI API errors and convert to HTTP exceptions.

    Args:
        e: Exception that occurred

    Returns:
        HTTPException with appropriate status code and message
    """
    return create_error_response(
        status_code=500,
        error="AI service error",
        error_code="OPENAI_ERROR",
        detail=str(e)
    )
