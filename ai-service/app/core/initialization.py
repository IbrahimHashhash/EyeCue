import logging
import asyncio
import inspect
from typing import Optional
from fastapi import FastAPI
from services.attention_analysis import AttentionAnalysisService
from services.frame_processor import FrameProcessingService
from services.batch_manager import BatchManager
from ml_logic.dummy_model import DummyAttentionModel
from utils.body_metrics import BodyMetrics

logger = logging.getLogger(__name__)
class ServiceInitializer:
    @staticmethod
    def create_attention_service() -> AttentionAnalysisService:
        frame_service = FrameProcessingService()
        batch_manager = BatchManager(batch_size=4)
        dummy_model = DummyAttentionModel()
        return AttentionAnalysisService(
            frame_service=frame_service,
            batch_manager=batch_manager,
            dummy_model=dummy_model
        )

    @staticmethod
    def create_body_metrics() -> BodyMetrics:
        return BodyMetrics()

def init_app(app: FastAPI) -> None:
    logger.info("Initializing services...")
    app.state.attention_service = ServiceInitializer.create_attention_service()
    app.state.body_metrics = ServiceInitializer.create_body_metrics()
    logger.info("Services attached to app.state")

async def shutdown_app(app: FastAPI) -> None:
    logger.info("Shutting down services...")

    body_metrics: Optional[BodyMetrics] = getattr(app.state, "body_metrics", None)
    if body_metrics:
        try:
            body_metrics.close()
            logger.info("Body metrics service closed")
        except Exception as e:
            logger.exception("Error while closing body metrics service: %s", e)

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