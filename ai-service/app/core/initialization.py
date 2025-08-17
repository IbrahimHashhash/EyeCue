# ai-service/app/core/initialization.py
from services.attention_analysis import AttentionAnalysisService

class ServiceInitializer:
    """Handles initialization of all application services."""
    
    @staticmethod
    def create_attention_service() -> AttentionAnalysisService:
        """Create and return attention analysis service."""
        return AttentionAnalysisService()