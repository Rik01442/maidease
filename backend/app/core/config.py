from pydantic_settings import BaseSettings
from typing import List
import os


class Settings(BaseSettings):
    APP_NAME: str = "MaidEase"
    DEBUG: bool = os.getenv("DEBUG", "False") == "True"
    API_V1_PREFIX: str = "/api/v1"
    
    # Database - from Supabase
    DATABASE_URL: str
    
    # Security
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # CORS - allow both localhost and production URLs
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
    ]
    
    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()

# Load CORS origins from environment if set
cors_env = os.getenv("CORS_ORIGINS", "")
if cors_env:
    settings.BACKEND_CORS_ORIGINS = [url.strip() for url in cors_env.split(",")]
