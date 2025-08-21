import time
import threading
from typing import Dict

from services.frame_processor import FrameProcessingService
from services.batch_manager import BatchManager
from services.attention_aggregator import AttentionAggregator
from ml_logic.face_mesh_pipeline import FaceMeshError

class AttentionAnalysisService:
    
    def __init__(self, batch_size: int = 4):
        self.frame_service = FrameProcessingService()
        self.batch_manager = BatchManager(batch_size)
        self.attention_aggregator = AttentionAggregator()
        self._lock = threading.RLock()
        self._is_closed = False

    def close(self) -> None:
        """Release resources safely."""
        with self._lock:
            if self._is_closed:
                return
            self._is_closed = True
            try:
                self.frame_service.close()
            except Exception:
                pass

    def analyze_frame_from_base64(self, student_id: str, frame_base64: str, frame_timestamp: str) -> Dict:
        """Perform full attention analysis on a base64-encoded frame."""
        if self._is_closed:
            raise RuntimeError("Service is closed")

        start_time = time.time()

        try:
            # Step 1: Process frame
            frame_result = self.frame_service.process_base64_frame(
                frame_base64.strip(),
                frame_timestamp.strip()
            )

            # Step 2: Add to batch
            batch_result = self.batch_manager.add_frame(student_id.strip(), frame_result)

            # Step 3: Compute attention if batch complete
            if batch_result["is_complete"]:
                end_time = time.time()
                return self.attention_aggregator.compute_attention_from_frames(
                    student_id.strip(),
                    batch_result["frames"],
                    start_time,
                    end_time
                )
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
        """Legacy method: convert bytes to base64 and delegate to main method."""
        import base64
        frame_base64 = base64.b64encode(image_data).decode('utf-8')
        return self.analyze_frame_from_base64(student_id, frame_base64, frame_timestamp)

    def get_stats(self) -> Dict:
        """Return batch and service statistics."""
        stats = self.batch_manager.get_stats()
        stats["is_closed"] = self._is_closed
        return stats

    def clear_incomplete_batches(self) -> Dict:
        """Clear all incomplete batches in the batch manager."""
        if self._is_closed:
            return {"message": "Service is closed", "cleared": 0}

        result = self.batch_manager.clear_all()
        result["message"] = f"Cleared {result['cleared_count']} incomplete batches"
        return result

    def get_student_batch_status(self, student_id: str) -> Dict:
        """Get the current batch status for a specific student."""
        return self.batch_manager.get_student_status(student_id)