# main.py
from fastapi import FastAPI
from contextlib import asynccontextmanager
import logging
from typing import Optional

from core.initialization import ServiceInitializer
from endpoints.attention import create_attention_router
from services.attention_analysis import AttentionAnalysisService

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class AppState:
    def __init__(self):
        self.attention_service: Optional[AttentionAnalysisService] = None

app_state = AppState()

@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        logger.info("Initializing services...")
        app_state.attention_service = ServiceInitializer.create_attention_service()
        logger.info("Services initialized")
        yield
        
    except Exception as e:
        logger.error(f"Startup failed: {e}")
        raise
    finally:
        logger.info("Shutting down services...")
        if app_state.attention_service:
            try:
                app_state.attention_service.close()
                logger.info("Services closed successfully")
            except Exception as e:
                logger.error(f"Error during service cleanup: {e}")

def get_attention_service() -> AttentionAnalysisService:
    """Dependency injection for attention service."""
    if app_state.attention_service is None:
        raise RuntimeError("Attention service not initialized")
    return app_state.attention_service

def create_application() -> FastAPI:
    app = FastAPI(
        title="AI Service API",
        description="Attention analysis service",
        version="1.0.0",
        lifespan=lifespan
    )
    
    app.include_router(
        create_attention_router(get_attention_service),
        prefix="/attention",
        tags=["attention"]
    )
    
    return app

app = create_application()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)