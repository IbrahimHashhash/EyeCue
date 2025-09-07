import mediapipe as mp
import numpy as np
import cv2
import threading
from typing import Optional, Tuple, Dict

from utils.face_metrics import extract_face_features

class FaceMeshError(Exception):
    pass

class FaceMeshPipeline:
    
    MIN_FRAME_DIMENSION = 100
    
    def __init__(self, static_image_mode: bool = False):
        self._lock = threading.RLock()
        self._is_closed = False
        
        try:
            self.face_mesh = mp.solutions.face_mesh.FaceMesh(
                static_image_mode=static_image_mode,
                max_num_faces=1,
                refine_landmarks=True, 
                min_detection_confidence=0.5,
                min_tracking_confidence=0.5
            )
        except Exception as e:
            raise FaceMeshError(f"Failed to initialize MediaPipe FaceMesh: {e}")

    def close(self) -> None:
        with self._lock:
            if not self._is_closed:
                try:
                    if hasattr(self, 'face_mesh'):
                        self.face_mesh.close()
                except Exception:
                    pass
                finally:
                    self._is_closed = True

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        self.close()

    def _validate_frame(self, frame_bgr: np.ndarray) -> Tuple[int, int]:
        if frame_bgr is None or frame_bgr.size == 0:
            raise FaceMeshError("Empty or invalid frame")
        h, w = frame_bgr.shape[:2]
        if h < self.MIN_FRAME_DIMENSION or w < self.MIN_FRAME_DIMENSION:
            raise FaceMeshError(f"Frame too small: {w}x{h}")
        return h, w

    def process(self, frame_bgr: np.ndarray) -> Dict:
        with self._lock:
            if self._is_closed:
                raise FaceMeshError("Pipeline closed")

            h, w = self._validate_frame(frame_bgr)
            rgb_frame = cv2.cvtColor(frame_bgr, cv2.COLOR_BGR2RGB)

            try:
                res = self.face_mesh.process(rgb_frame)
            except Exception as e:
                raise FaceMeshError(f"MediaPipe processing failed: {e}")

            if not res.multi_face_landmarks:
                return {
                    'face_detected': False,
                    'face_features': {},
                }

            landmarks = res.multi_face_landmarks[0].landmark

            try:
                face_features = extract_face_features(landmarks, w, h)
                
                return {
                    'face_detected': True,
                    'face_features': face_features,
                }
                
            except Exception:
                return {
                    'face_detected': False,
                    'face_features': {},
                }