import time
import threading
from typing import Dict, Optional
from services.frame_processor import FrameProcessingService
from services.calibration_storage import CalibrationStorageService
from ml_logic.face_mesh_pipeline import FaceMeshError
from ml_logic.attention_classifier import AttentionClassifier

class AttentionAnalysisService:
    def __init__(
        self,
        frame_service=None,
        attention_classifier=None,
        calibration_storage=None
    ):
        self.frame_service = frame_service or FrameProcessingService()
        self.attention_classifier = attention_classifier or AttentionClassifier()
        self.calibration_storage = calibration_storage or CalibrationStorageService()
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

    def analyze_frame_from_base64(
        self,
        student_id: str,
        frame_id: str,
        frame_base64: str,
        frame_timestamp: str
    ) -> Dict:
        if self._is_closed:
            raise RuntimeError("Service is closed")

        start_time = time.time()
        try:
            frame_result = self.frame_service.process_base64_frame(
                frame_base64.strip(),
                frame_timestamp.strip()
            )
            end_time = time.time()
            face_detected = frame_result.get('face_detected', False)
            face_features = frame_result.get('face_features', {}) or {}

            if not face_detected:
                return {
                    "status": "success",
                    "student_id": student_id.strip(),
                    "frame_id": frame_id.strip(),
                    "face_detected": False,
                    "attention_label": "inattentive",
                    "processing_timestamp": {
                        "start": start_time,
                        "end": end_time,
                        "duration": end_time - start_time,
                    },
                }

            if face_features.get('eyes_open') is False:
                return {
                    "status": "success",
                    "student_id": student_id.strip(),
                    "frame_id": frame_id.strip(),
                    "face_detected": True,
                    "attention_label": "inattentive",
                    "processing_timestamp": {
                        "start": start_time,
                        "end": end_time,
                        "duration": end_time - start_time,
                    },
                }

            has_calibration = self.calibration_storage.has_calibration(student_id)
            calibration_data = None
            calibration_stored = False

            if not has_calibration and face_features and face_features.get('eyes_open'):
                calibration_values = self.attention_classifier.extract_calibration_values(face_features)
                if calibration_values[0] is not None or calibration_values[1] is not None:
                    calibration_stored = self.calibration_storage.store_calibration(
                        student_id,
                        calibration_values[0],
                        calibration_values[1]
                    )
                    if calibration_stored:
                        calibration_data = calibration_values
            elif has_calibration:
                calibration_data = self.calibration_storage.get_calibration(student_id)

            attention_label = self.attention_classifier.classify_attention(
                face_features,
                face_detected,
                calibration_data
            )

            if calibration_stored:
                attention_label = "attentive"

            response = {
                "status": "success",
                "student_id": student_id.strip(),
                "frame_id": frame_id.strip(),
                "face_detected": face_detected,
                "attention_label": attention_label,
                "processing_timestamp": {
                    "start": start_time,
                    "end": end_time,
                    "duration": end_time - start_time
                }
            }
            if calibration_stored:
                response["calibration_stored"] = True
            if calibration_data:
                response["using_calibration"] = True
            return response

        except Exception as e:
            raise FaceMeshError(f"Error during analysis: {e}")

    def analyze_frame(
        self,
        student_id: str,
        frame_id: str,
        image_data: bytes,
        frame_timestamp: str
    ) -> Dict:
        import base64
        frame_base64 = base64.b64encode(image_data).decode('utf-8')
        return self.analyze_frame_from_base64(student_id, frame_id, frame_base64, frame_timestamp)

    def get_calibration_status(self, student_id: str) -> Dict:
        calibration = self.calibration_storage.get_calibration(student_id)
        if calibration:
            return {
                "has_calibration": True,
                "left_gaze_deviation": calibration[0],
                "right_gaze_deviation": calibration[1]
            }
        return {"has_calibration": False}
