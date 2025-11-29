from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql://library_user:library_password@db:5432/library_db"
    SECRET_KEY: str = "your-secret-key-change-in-production-min-32-characters-long"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    BOOKS_DIRECTORY: str = "/app/books"
    
    class Config:
        env_file = ".env"

settings = Settings()
