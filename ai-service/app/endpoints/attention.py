from fastapi import APIRouter, HTTPException, status, Depends, Request
from pydantic import BaseModel
from typing import Dict, Optional
import asyncio
from concurrent.futures import ThreadPoolExecutor

from ml_logic.face_mesh_pipeline import FaceMeshError
from services.attention_analysis import AttentionAnalysisService

_executor = ThreadPoolExecutor(max_workers=4)

class FrameRequest(BaseModel):
    studentId: str
    frameBase64: str
    timestamp: str

class AttentionResponse(BaseModel):
    studentId: str
    attentionScore: Optional[float] = None
    status: str
    processingTimestamp: Dict = {}

def get_attention_service(request: Request) -> AttentionAnalysisService:
    svc = getattr(request.app.state, "attention_service", None)
    if svc is None:
        raise RuntimeError("Attention service not initialized")
    return svc

async def analyze_frame(
    request: FrameRequest,
    attention_service: AttentionAnalysisService
) -> AttentionResponse:

    loop = asyncio.get_running_loop()
    try:
        result = await loop.run_in_executor(
            _executor,
            attention_service.analyze_frame_from_base64,
            request.studentId,
            request.frameBase64,
            request.timestamp
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except FaceMeshError as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(e)
        )
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )

    return AttentionResponse(
        studentId=request.studentId,
        attentionScore=result.get("attention_percentage") if result.get("is_batch_complete", False) else None,
        status=result.get("status", "unknown"),
        processingTimestamp=result.get("processing_timestamp", {})
    )

def create_attention_router() -> APIRouter:
    router = APIRouter()

    @router.post("/analyze", response_model=AttentionResponse)
    async def analyze_frame_endpoint(
        frame_request: FrameRequest,
        attention_service: AttentionAnalysisService = Depends(get_attention_service)
    ) -> AttentionResponse:
        return await analyze_frame(frame_request, attention_service)

    return router