import logging
import asyncio
from telethon import events, TelegramClient
import requests
from worker.config import config

logger = logging.getLogger("MessageListenerService")

def register_channel_listener(client: TelegramClient, monitored_channel_ids: list[int]):
    """
    Attaches real-time event listener for incoming messages on union of monitored channels.
    When a notice is received, dispatches a secure webhook to Next.js server.
    """
    @client.on(events.NewMessage(chats=monitored_channel_ids))
    async def handle_new_notice(event):
        try:
            msg = event.message
            if not msg.text:
                return

            chat = await event.get_chat()
            chat_id = chat.id if str(chat.id).startswith('-100') else int(f"-100{chat.id}")

            logger.info(f"Received new message #{msg.id} in channel '{getattr(chat, 'title', chat_id)}'")

            payload = {
                "group_telegram_id": chat_id,
                "telegram_message_id": msg.id,
                "sender_name": getattr(chat, 'title', 'TPO Broadcast'),
                "message_text": msg.text,
                "message_timestamp": msg.date.isoformat(),
            }

            # Dispatch webhook to Next.js App
            webhook_url = f"{config.WEB_API_URL}/api/worker-webhook/message-ingested"
            headers = {
                "Content-Type": "application/json",
                "x-worker-secret": config.TELEGRAM_WORKER_SECRET
            }

            response = requests.post(webhook_url, json=payload, headers=headers, timeout=10)
            if response.status_code == 200:
                logger.info(f"Successfully forwarded notice #{msg.id} to AI analysis webhook")
            else:
                logger.warning(f"Webhook response status {response.status_code}: {response.text}")

        except Exception as e:
            logger.error(f"Error handling new incoming message: {e}", exc_info=True)

    logger.info(f"Registered NewMessage listener on {len(monitored_channel_ids)} monitored channels.")
