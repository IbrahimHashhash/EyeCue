import logging
import os
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from dotenv import load_dotenv

from core.initialization import init_app, shutdown_app
from endpoints.attention import create_attention_router

# Logging configuration
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()
PORT = int(os.getenv("PORT", 8000))

@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        init_app(app)
        logger.info("Services initialized and attached to app.state")
        yield
    except Exception as e:
        logger.exception("Startup failed: %s", e)
        raise
    finally:
        await shutdown_app(app)
        logger.info("Shutdown complete")

def create_application() -> FastAPI:
    app = FastAPI(
        title="AI Service API",
        description="Attention analysis service",
        version="1.0.0",
        lifespan=lifespan
    )

    # Include routers
    app.include_router(create_attention_router(), prefix="/attention", tags=["attention"])

    # Health endpoint
    @app.get("/health")
    def health(request: Request):
        svc = getattr(request.app.state, "attention_service", None)
        return {"ready": svc is not None}

    return app

app = create_application()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=PORT)