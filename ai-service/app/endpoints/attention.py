from fastapi import APIRouter, HTTPException, status, Depends
from pydantic import BaseModel, field_validator
import base64
from typing import Callable
import binascii

from ml_logic.face_mesh_pipeline import FaceMeshError
from services.attention_analysis import AttentionAnalysisService

class FrameRequest(BaseModel):
    studentId: str
    frameBase64: str
    timestamp: str
    
    @field_validator('studentId')
    @classmethod
    def validate_student_id(cls, v):
        if not v or not v.strip():
            raise ValueError('Invalid studentId')
        return v.strip()
    
    @field_validator('frameBase64')
    @classmethod
    def validate_frame_base64(cls, v):
        if not v or not v.strip():
            raise ValueError('Invalid frameBase64')
        return v.strip()
    
    @field_validator('timestamp')
    @classmethod
    def validate_timestamp(cls, v):
        if not v or not v.strip():
            raise ValueError('Invalid timestamp')
        return v.strip()

class AttentionResponse(BaseModel):
    studentId: str
    attentionScore: float | None
    status: str
    processingTimestamp: dict

async def analyze_frame(
    request: FrameRequest,
    attention_service: AttentionAnalysisService = Depends()  # Will be properly injected via router
) -> AttentionResponse:
    """Analyze a frame from base64 encoded data and return result."""
    try:
        base64_data = request.frameBase64
        if ',' in base64_data:
            base64_data = base64_data.split(',', 1)[1]
        
        base64_data = base64_data.strip()
        
        try:
            frame_bytes = base64.b64decode(base64_data, validate=True)
        except binascii.Error as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid base64 encoding: {str(e)}"
            )
        except ValueError as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Base64 decoding error: {str(e)}"
            )
        
        if not frame_bytes:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Empty frame data after decoding"
            )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unexpected error during base64 decoding: {str(e)}"
        )

    try:
        result = attention_service.analyze_frame(
            request.studentId, 
            frame_bytes,
            request.timestamp
        )
        
        return AttentionResponse(
            studentId=request.studentId,
            attentionScore=result.get("attention_percentage") if result.get("is_batch_complete", False) else None,
            status=result.get("status", "unknown"),
            processingTimestamp=result.get("processing_timestamp", {})
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
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error during analysis"
        )

def create_attention_router(get_service: Callable[[], AttentionAnalysisService]) -> APIRouter:
    """Create attention router with service dependency."""
    router = APIRouter()
    
    def service_dependency() -> AttentionAnalysisService:
        return get_service()
    
    @router.post("/analyze", response_model=AttentionResponse)
    async def analyze_frame_endpoint(
        request: FrameRequest,
        attention_service: AttentionAnalysisService = Depends(service_dependency)
    ) -> AttentionResponse:
        return await analyze_frame(request, attention_service)
    
    return router