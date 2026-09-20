import logging
import requests
from worker.config import config

logger = logging.getLogger("SupabaseSyncer")

class SupabaseSyncer:
    def __init__(self):
        self.base_url = config.SUPABASE_URL
        self.api_key = config.SUPABASE_SERVICE_ROLE_KEY

    def get_monitored_channels(self) -> list[int]:
        """Fetches distinct telegram_id integers of groups marked is_monitored=true."""
        if not self.base_url or not self.api_key:
            return []

        url = f"{self.base_url}/rest/v1/telegram_groups?select=telegram_id"
        headers = {
            "apikey": self.api_key,
            "Authorization": f"Bearer {self.api_key}"
        }
        try:
            resp = requests.get(url, headers=headers, timeout=10)
            if resp.status_code == 200:
                data = resp.json()
                return [item["telegram_id"] for item in data if "telegram_id" in item]
        except Exception as e:
            logger.error(f"Failed to fetch monitored channels from Supabase: {e}")
        return []

supabase_syncer = SupabaseSyncer()
