import logging
import asyncio
import inspect
from typing import Optional
from fastapi import FastAPI
from services.attention_analysis import AttentionAnalysisService
from services.frame_processor import FrameProcessingService
from ml_logic.attention_classifier import AttentionClassifier

logger = logging.getLogger(__name__)

class ServiceInitializer:
    @staticmethod
    def create_attention_service() -> AttentionAnalysisService:
        frame_service = FrameProcessingService()
        attention_classifier = AttentionClassifier()
        return AttentionAnalysisService(
            frame_service=frame_service,
            attention_classifier=attention_classifier
        )

def init_app(app: FastAPI) -> None:
    logger.info("Initializing services...")
    app.state.attention_service = ServiceInitializer.create_attention_service()
    logger.info("Services attached to app.state")

async def shutdown_app(app: FastAPI) -> None:
    logger.info("Shutting down services...")
    svc: Optional[AttentionAnalysisService] = getattr(app.state, "attention_service", None)
    if not svc:
        logger.info("No attention service found")
        return

    try:
        if hasattr(svc, "aclose") and inspect.iscoroutinefunction(getattr(svc, "aclose")):
            await svc.aclose()
            logger.info("Attention service aclose() awaited")
        elif hasattr(svc, "close"):
            maybe = svc.close()
            if inspect.isawaitable(maybe):
                await maybe
                logger.info("Attention service.close() awaited (returned awaitable)")
            else:
                logger.info("Attention service.close() called (sync)")
        else:
            logger.info("Attention service has no close/aclose method")
    except Exception as e:
        logger.exception("Error while closing attention service: %s", e)