import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    TELEGRAM_API_ID = int(os.getenv("TELEGRAM_API_ID", "0"))
    TELEGRAM_API_HASH = os.getenv("TELEGRAM_API_HASH", "")
    SUPABASE_URL = os.getenv("SUPABASE_URL", "")
    SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
    TELEGRAM_WORKER_SECRET = os.getenv("TELEGRAM_WORKER_SECRET", "placemint_super_secret_worker_token_2026")
    SESSION_ENCRYPTION_KEY = os.getenv("SESSION_ENCRYPTION_KEY", "placemint_32_character_aes_secret_key!")
    WEB_API_URL = os.getenv("WEB_API_URL", "http://localhost:3000")

config = Config()
