import mediapipe as mp
import numpy as np
import cv2
import threading
from typing import Optional, Tuple, Dict

from .landmark_constants import MODEL_POINTS, LANDMARK_INDICES, DEFAULT_FOCAL_LENGTH_MULTIPLIER
from utils.face_metrics import extract_euler_angles, extract_face_features
from utils.body_metrics import BodyMetrics

class FaceMeshError(Exception):
    pass

class FaceMeshPipeline:
    
    MIN_FRAME_DIMENSION = 100
    def __init__(self, camera_matrix: Optional[np.ndarray] = None, static_image_mode: bool = False):
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

        self.model_points = MODEL_POINTS
        self.landmark_indices = LANDMARK_INDICES
        self._camera_matrix = camera_matrix
        self.body_metrics = BodyMetrics()

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

    def _get_camera_matrix(self, w: int, h: int) -> np.ndarray:
        if self._camera_matrix is not None:
            return self._camera_matrix
        focal_length = DEFAULT_FOCAL_LENGTH_MULTIPLIER * w
        return np.array([
            [focal_length, 0, w / 2.0],
            [0, focal_length, h / 2.0],
            [0, 0, 1]
        ], dtype=np.float64)

    def _extract_pose_data(self, landmarks, w: int, h: int, cam_matrix: np.ndarray) -> Dict:
        try:
            image_points = np.array([[landmarks[i].x * w, landmarks[i].y * h] for i in self.landmark_indices], dtype=np.float64)
            if np.any(~np.isfinite(image_points)):
                raise FaceMeshError('Invalid landmark coordinates')
            success, rvec, _ = cv2.solvePnP(self.model_points, image_points, cam_matrix, None, flags=cv2.SOLVEPNP_ITERATIVE)
            if not success or rvec is None:
                raise FaceMeshError('Pose estimation failed')
            yaw, pitch, roll = extract_euler_angles(rvec)
            return {'yaw': float(yaw), 'pitch': float(pitch), 'roll': float(roll)}
        except Exception as e:
            raise FaceMeshError(f'Pose extraction failed: {e}')

    def process(self, frame_bgr: np.ndarray) -> Dict:
        with self._lock:
            if self._is_closed:
                raise FaceMeshError("Pipeline closed")

            h, w = self._validate_frame(frame_bgr)
            cam_matrix = self._get_camera_matrix(w, h)
            rgb_frame = cv2.cvtColor(frame_bgr, cv2.COLOR_BGR2RGB)

            body_features = self.body_metrics.extract_body_features(rgb_frame, w, h)

            try:
                res = self.face_mesh.process(rgb_frame)
            except Exception as e:
                raise FaceMeshError(f"MediaPipe processing failed: {e}")

            if not res.multi_face_landmarks:
                return {
                    'face_detected': False,
                    'face_features': {},
                    'body_features': body_features
                }

            landmarks = res.multi_face_landmarks[0].landmark

            try:
                pose_data = self._extract_pose_data(landmarks, w, h, cam_matrix)
                face_features = extract_face_features(landmarks, w, h)
                face_features.update(pose_data)
                
                result = {
                    'face_detected': True,
                    'face_features': face_features,
                    'body_features': body_features
                }
                return result
                
            except Exception:
                return {
                    'face_detected': False,
                    'face_features': {},
                    'body_features': body_features
                }
