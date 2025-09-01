import time
import threading
from typing import Dict

from services.frame_processor import FrameProcessingService
from services.batch_manager import BatchManager
from ml_logic.face_mesh_pipeline import FaceMeshError
from ml_logic.dummy_model import DummyAttentionModel

class AttentionAnalysisService:
    def __init__(
        self,
        frame_service=None,
        batch_manager=None,
        dummy_model=None
    ):
        self.frame_service = frame_service or FrameProcessingService()
        self.batch_manager = batch_manager or BatchManager(4)
        self.dummy_model = dummy_model or DummyAttentionModel()
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

    def analyze_frame_from_base64(self, student_id: str, frame_base64: str, frame_timestamp: str) -> Dict:
        if self._is_closed:
            raise RuntimeError("Service is closed")

        start_time = time.time()

        try:
            frame_result = self.frame_service.process_base64_frame(
                frame_base64.strip(),
                frame_timestamp.strip()
            )

            batch_result = self.batch_manager.add_frame(student_id.strip(), frame_result)

            if batch_result["is_complete"]:
                end_time = time.time()
                faces_detected = sum(1 for frame in batch_result["frames"] if frame.get('face_detected', False))
                
                return {
                    "status": "success", 
                    "student_id": student_id.strip(),
                    "frames_processed": len(batch_result["frames"]),
                    "faces_detected": faces_detected,
                    "frames": batch_result["frames"],
                    "is_batch_complete": True,
                    "processing_timestamp": {
                        "start": start_time,
                        "end": end_time, 
                        "duration": end_time - start_time
                    }
                }
            else:
                return {
                    "status": "waiting_for_more_frames",
                    "received_frames": batch_result["frames_waiting"],
                    "frames_needed": batch_result["frames_needed"],
                    "is_batch_complete": False
                }

        except Exception as e:
            self.batch_manager.remove_student(student_id)
            raise FaceMeshError(f"Error during analysis: {e}")

    def analyze_frame(self, student_id: str, image_data: bytes, frame_timestamp: str) -> Dict:
        import base64
        frame_base64 = base64.b64encode(image_data).decode('utf-8')
        return self.analyze_frame_from_base64(student_id, frame_base64, frame_timestamp)

    def get_stats(self) -> Dict:
        stats = self.batch_manager.get_stats()
        stats["is_closed"] = self._is_closed
        return stats

    def clear_incomplete_batches(self) -> Dict:
        if self._is_closed:
            return {"message": "Service is closed", "cleared": 0}

        result = self.batch_manager.clear_all()
        result["message"] = f"Cleared {result['cleared_count']} incomplete batches"
        return result

    def get_student_batch_status(self, student_id: str) -> Dict:
        return self.batch_manager.get_student_status(student_id)