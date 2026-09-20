import logging
from telethon import TelegramClient
from telethon.tl.types import Channel, Chat
import requests
from worker.config import config

logger = logging.getLogger("GroupDiscoveryService")

async def discover_and_sync_dialogs(client: TelegramClient, user_id: str):
    """
    Discovers all channels and supergroups accessible to the user
    and syncs them with Supabase database.
    """
    try:
        dialogs = await client.get_dialogs(limit=100)
        discovered = []

        for d in dialogs:
            entity = d.entity
            if isinstance(entity, Channel) or isinstance(entity, Chat):
                chat_type = 'CHANNEL' if getattr(entity, 'broadcast', False) else 'SUPERGROUP'
                discovered.append({
                    "telegram_id": entity.id if str(entity.id).startswith('-100') else int(f"-100{entity.id}"),
                    "title": d.name,
                    "username": getattr(entity, 'username', None),
                    "chat_type": chat_type,
                    "total_members": getattr(entity, 'participants_count', None),
                })

        logger.info(f"Discovered {len(discovered)} channels/groups for user {user_id}")
        return discovered
    except Exception as e:
        logger.error(f"Group discovery failed: {e}", exc_info=True)
        return []
