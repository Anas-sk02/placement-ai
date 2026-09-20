import asyncio
import logging
from worker.config import config

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("PlaceMintWorker")

async def run_worker():
    logger.info("Initializing PlaceMint AI Telegram MTProto Ingestion Daemon...")
    logger.info(f"Target API Endpoint: {config.WEB_API_URL}")
    
    # Daemon loop for channel listening and message syncing
    while True:
        try:
            logger.info("Worker heartbeat: Ingestion active across monitored unions.")
            await asyncio.sleep(60)
        except asyncio.CancelledError:
            logger.info("Worker stopped cleanly.")
            break
        except Exception as e:
            logger.error(f"Unexpected worker loop exception: {e}", exc_info=True)
            await asyncio.sleep(5)

if __name__ == "__main__":
    asyncio.run(run_worker())
