from pydantic_settings import BaseSettings
import os
from dotenv import load_dotenv

load_dotenv()

class Settings(BaseSettings):
    PROJECT_NAME: str = "SIYP Team API"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "YOUR_SUPER_SECRET_KEY_FOR_JWT")
    ALGORITHM: str = os.getenv("ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 60 * 24 * 7)) # 7 days
    
    # Use remote DB if provided, else fallback to local SQLite
    DATABASE_URL: str = os.getenv("DATABASE_URL", f"sqlite:///{os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'sql_app.db')}")
    
    # Cloudinary
    CLOUDINARY_CLOUD_NAME: str = os.getenv("CLOUDINARY_CLOUD_NAME", "")
    CLOUDINARY_API_KEY: str = os.getenv("CLOUDINARY_API_KEY", "")
    CLOUDINARY_API_SECRET: str = os.getenv("CLOUDINARY_API_SECRET", "")
    
    # Email
    RESEND_API_KEY: str = os.getenv("RESEND_API_KEY", "re_MRpeXf7m_FqKcTeJSBE5bX8fRhEPqAzQj")
    RESEND_FROM_EMAIL: str = os.getenv("RESEND_FROM_EMAIL", "SIYP Team <onboarding@resend.dev>")
    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "http://localhost:5173")
    
    class Config:
        env_file = ".env"

settings = Settings()
