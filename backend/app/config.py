import os

class Settings:
    PROJECT_NAME: str = "Viraam"
    TAGLINE: str = "Pause the panic. Protect the payment."
    API_V1_STR: str = "/api"
    DATABASE_URL: str = "sqlite:///./viraam.db"
    CORS_ORIGINS: list[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "*"
    ]
    DEFAULT_HOLD_DURATION_MINUTES: int = 15
    SAFE_PHRASE_EXPIRY_SECONDS: int = 300

settings = Settings()
