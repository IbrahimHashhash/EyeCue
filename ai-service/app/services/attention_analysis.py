import time
import threading
from typing import Dict, List, Optional
from collections import deque
import numpy as np
import cv2

from ml_logic.face_mesh_pipeline import FaceMeshPipeline, FaceMeshError
from utils.attention_calculator import compute_attention_score

class AttentionAnalysisService:
    BATCH_SIZE = 4

    def __init__(self):
        self.pipeline = FaceMeshPipeline(static_image_mode=False)
        # Only store exactly what we need for batching
        self.buffers: Dict[str, deque] = {}
        self._lock = threading.RLock()
        self._is_closed = False

    def close(self) -> None:
        """Release resources."""
        with self._lock:
            if self._is_closed:
                return
            
            self._is_closed = True
            try:
                self.pipeline.close()
            except Exception:
                pass
            finally:
                self.buffers.clear()

    def analyze_frame(self, student_id: str, image_data: bytes, frame_timestamp: str) -> Dict:
        """Process image bytes and return analysis result."""
        if self._is_closed:
            raise RuntimeError("Service is closed")
            
        start_time = time.time()
        
        # Input validation
        if not student_id or not student_id.strip():
            raise ValueError("Invalid student_id")
        if not image_data:
            raise ValueError("Empty image data")
        if not frame_timestamp or not frame_timestamp.strip():
            raise ValueError("Invalid frame_timestamp")

        student_id = student_id.strip()

        with self._lock:
            try:
                frame = self._decode_frame(image_data)
                result = self.pipeline.process(frame)

                # Initialize buffer if needed - only store exactly what we need
                if student_id not in self.buffers:
                    self.buffers[student_id] = deque(maxlen=self.BATCH_SIZE)

                buffer = self.buffers[student_id]
                
                # Add new frame
                buffer.append({**result, 'timestamp': frame_timestamp})

                # Check if we have enough frames for processing
                if len(buffer) >= self.BATCH_SIZE:
                    # Get all frames for processing
                    frames_to_process = list(buffer)
                    
                    # IMMEDIATELY remove this student's buffer - we're done with it
                    self.buffers.pop(student_id, None)
                    
                    end_time = time.time()
                    return self._compute_result(student_id, frames_to_process, start_time, end_time)

                return {
                    "status": "waiting_for_more_frames",
                    "received_frames": len(buffer),
                    "frames_needed": self.BATCH_SIZE - len(buffer),
                    "is_batch_complete": False
                }

            except (ValueError, FaceMeshError):
                # Clean up failed student's buffer immediately
                self.buffers.pop(student_id, None)
                raise
            except Exception as e:
                self.buffers.pop(student_id, None)
                raise FaceMeshError(f"Unexpected error during analysis: {e}")

    def _decode_frame(self, image_data: bytes) -> np.ndarray:
        """Decode image bytes to frame with better error handling."""
        try:
            # Convert bytes to numpy array
            nparr = np.frombuffer(image_data, np.uint8)
            if nparr.size == 0:
                raise ValueError("Empty image data buffer")
                
            frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            if frame is None:
                raise ValueError("Failed to decode image - invalid format or corrupted data")
                
            # Basic validation
            if frame.size == 0:
                raise ValueError("Decoded frame is empty")
                
            return frame
        except Exception as e:
            raise FaceMeshError(f"Failed to decode image: {e}")

    def _compute_result(self, student_id: str, frames: List[Dict], start_time: float, end_time: float) -> Dict:
        """Compute attention score from frames with better validation."""
        if not frames:
            raise ValueError("No frames to process")

        # More robust data extraction
        valid_poses = []
        valid_gaze_ratios = []
        valid_eye_openness = []

        for frame in frames:
            # Validate pose data
            if all(k in frame and isinstance(frame[k], (int, float)) and 
                   not np.isnan(frame[k]) for k in ['yaw', 'pitch', 'roll']):
                valid_poses.append((frame['yaw'], frame['pitch'], frame['roll']))
            
            # Validate gaze data
            if (frame.get('gaze_valid') and 
                'avg_gaze_ratio' in frame and 
                isinstance(frame['avg_gaze_ratio'], (int, float)) and
                not np.isnan(frame['avg_gaze_ratio'])):
                valid_gaze_ratios.append(frame['avg_gaze_ratio'])
            
            # Validate eye openness data
            if (frame.get('eyes_valid') and 
                'avg_eye_openness' in frame and 
                isinstance(frame['avg_eye_openness'], (int, float)) and
                not np.isnan(frame['avg_eye_openness'])):
                valid_eye_openness.append(frame['avg_eye_openness'])

        if not valid_poses:
            raise FaceMeshError("No valid pose data found in frames")

        # Compute averages
        avg_yaw, avg_pitch, avg_roll = np.mean(valid_poses, axis=0)
        avg_gaze_ratio = np.mean(valid_gaze_ratios) if valid_gaze_ratios else None
        avg_eye_openness = np.mean(valid_eye_openness) if valid_eye_openness else None

        attention_metrics = compute_attention_score(
            float(avg_yaw), float(avg_pitch), float(avg_roll),
            avg_gaze_ratio=float(avg_gaze_ratio) if avg_gaze_ratio is not None else None,
            gaze_valid=bool(valid_gaze_ratios),
            avg_eye_openness=float(avg_eye_openness) if avg_eye_openness is not None else None,
            eyes_valid=bool(valid_eye_openness)
        )

        return {
            "status": "success",
            "student_id": student_id,
            "attention_percentage": attention_metrics["attention_percentage"],
            "frames_processed": len(frames),
            "valid_poses": len(valid_poses),
            "valid_gaze": len(valid_gaze_ratios),
            "valid_eyes": len(valid_eye_openness),
            "is_batch_complete": True,
            "processing_timestamp": {
                "start": start_time,
                "end": end_time,
                "duration": end_time - start_time
            }
        }

    def get_stats(self) -> Dict:
        """Get service statistics for monitoring."""
        with self._lock:
            return {
                "active_incomplete_batches": len(self.buffers),
                "total_frames_in_incomplete_batches": sum(len(buf) for buf in self.buffers.values()),
                "incomplete_batches_breakdown": {
                    student_id: len(buffer) for student_id, buffer in self.buffers.items()
                },
                "is_closed": self._is_closed
            }

    def clear_incomplete_batches(self) -> Dict:
        """Clear all incomplete batches - useful for testing or maintenance."""
        with self._lock:
            if self._is_closed:
                return {"message": "Service is closed", "cleared": 0}
            
            cleared_count = len(self.buffers)
            cleared_students = list(self.buffers.keys())
            
            self.buffers.clear()
            
            return {
                "message": f"Cleared {cleared_count} incomplete batches",
                "cleared_students": cleared_students,
                "cleared_count": cleared_count
            }

    def get_student_batch_status(self, student_id: str) -> Dict:
        """Get status of a specific student's incomplete batch - useful for debugging."""
        with self._lock:
            if student_id not in self.buffers:
                return {
                    "student_id": student_id,
                    "status": "no_incomplete_batch",
                    "frames_waiting": 0
                }
            
            buffer = self.buffers[student_id]
            return {
                "student_id": student_id,
                "status": "incomplete_batch",
                "frames_waiting": len(buffer),
                "frames_needed": self.BATCH_SIZE - len(buffer)
            }