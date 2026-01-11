from pydantic_settings import BaseSettings
from functools import lru_cache
from typing import List


class Settings(BaseSettings):
    """Application configuration settings."""

    # API Configuration
    APP_NAME: str = "HALCÓN Product Search API"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False

    # OpenAI Configuration
    OPENAI_API_KEY: str
    OPENAI_MODEL: str = "gpt-4"

    # WhatsApp Configuration (Meta Business API or Twilio)
    WHATSAPP_VERIFY_TOKEN: str = "default-verify-token"
    WHATSAPP_API_KEY: str = ""
    WHATSAPP_PHONE_NUMBER: str = ""

    # CORS Configuration
    ALLOWED_ORIGINS: str = "http://localhost:3000"

    # Supabase Configuration (Optional)
    SUPABASE_URL: str = ""
    SUPABASE_KEY: str = ""

    # Rate Limiting
    RATE_LIMIT_PER_MINUTE: int = 20

    @property
    def allowed_origins_list(self) -> List[str]:
        """Convert comma-separated origins string to list."""
        return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",")]

    class Config:
        env_file = ".env"
        case_sensitive = True


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()
