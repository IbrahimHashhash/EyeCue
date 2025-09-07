import time
import threading
from typing import Dict

from services.frame_processor import FrameProcessingService
from ml_logic.face_mesh_pipeline import FaceMeshError
from ml_logic.attention_classifier import AttentionClassifier

class AttentionAnalysisService:
    def __init__(self, frame_service=None, attention_classifier=None):
        self.frame_service = frame_service or FrameProcessingService()
        self.attention_classifier = attention_classifier or AttentionClassifier()
        self._lock = threading.RLock()
        self._is_closed = False

    def close(self) -> None:
        with self._lock:
            if self._is_closed:
                return
            self._is_closed = True
            try:
                self.frame_service.close()
            except Exception:
                pass

    def analyze_frame_from_base64(self, student_id: str, frame_id: str, frame_base64: str, frame_timestamp: str) -> Dict:
        if self._is_closed:
            raise RuntimeError("Service is closed")

        start_time = time.time()

        try:
            frame_result = self.frame_service.process_base64_frame(
                frame_base64.strip(),
                frame_timestamp.strip()
            )

            end_time = time.time()
            
            attention_label = self.attention_classifier.classify_attention(
                frame_result.get('face_features', {}),
                frame_result.get('face_detected', False)
            )
            
            return {
                "status": "success", 
                "student_id": student_id.strip(),
                "frame_id": frame_id.strip(),
                "face_detected": frame_result.get('face_detected', False),
                "attention_label": attention_label,
                "processing_timestamp": {
                    "start": start_time,
                    "end": end_time, 
                    "duration": end_time - start_time
                }
            }

        except Exception as e:
            raise FaceMeshError(f"Error during analysis: {e}")

    def analyze_frame(self, student_id: str, frame_id: str, image_data: bytes, frame_timestamp: str) -> Dict:
        import base64
        frame_base64 = base64.b64encode(image_data).decode('utf-8')
        return self.analyze_frame_from_base64(student_id, frame_id, frame_base64, frame_timestamp)