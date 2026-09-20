import logging
from telethon import TelegramClient
from telethon.sessions import StringSession
from worker.config import config
from worker.utils.security import decrypt_session_string

logger = logging.getLogger("TelegramClientManager")

class TelegramClientManager:
    def __init__(self):
        self.api_id = config.TELEGRAM_API_ID
        self.api_hash = config.TELEGRAM_API_HASH

    def create_client_from_session(self, encrypted_session_string: str) -> TelegramClient:
        """Decrypts session string and initializes a Telethon Client instance."""
        plain_session = decrypt_session_string(encrypted_session_string)
        client = TelegramClient(
            StringSession(plain_session),
            self.api_id,
            self.api_hash
        )
        return client

    def create_temporary_auth_client(self) -> TelegramClient:
        """Creates a blank in-memory client for OTP login flow."""
        return TelegramClient(
            StringSession(),
            self.api_id,
            self.api_hash
        )

telegram_manager = TelegramClientManager()
