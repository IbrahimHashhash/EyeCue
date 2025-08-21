import mediapipe as mp
import numpy as np
import cv2
import threading
from typing import Optional, Tuple, Dict

from .landmark_constants import MODEL_POINTS, LANDMARK_INDICES
from .tracking_constants import DEFAULT_FOCAL_LENGTH_MULTIPLIER
from utils.face_metrics import extract_euler_angles, extract_gaze_metrics, extract_eye_openness_metrics

class FaceMeshError(Exception):
    pass

class FaceMeshPipeline:
    
    MIN_FRAME_DIMENSION = 100  # Minimum width/height in pixels
    
    def __init__(self, camera_matrix: Optional[np.ndarray] = None, static_image_mode: bool = False):
        self._lock = threading.RLock()
        self._rgb_buffer: Optional[np.ndarray] = None
        self._buffer_shape: Optional[Tuple[int, int, int]] = None
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

    def close(self) -> None:
        """Release resources and clean up buffers."""
        with self._lock:
            if not self._is_closed:
                try:
                    if hasattr(self, 'face_mesh'):
                        self.face_mesh.close()
                except Exception:
                    pass
                finally:
                    self._is_closed = True
                    self._cleanup_buffers()

    def _cleanup_buffers(self) -> None:
        """Free internal frame buffers."""
        if self._rgb_buffer is not None:
            del self._rgb_buffer
            self._rgb_buffer = None
        self._buffer_shape = None

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        self.close()

    def _validate_frame(self, frame_bgr: np.ndarray) -> Tuple[int, int]:
        """Check that frame is valid and meets minimum size requirements."""
        if frame_bgr is None or frame_bgr.size == 0:
            raise FaceMeshError("Empty or invalid frame")
        h, w = frame_bgr.shape[:2]
        if h < self.MIN_FRAME_DIMENSION or w < self.MIN_FRAME_DIMENSION:
            raise FaceMeshError(f"Frame too small: {w}x{h}")
        return h, w

    def _get_camera_matrix(self, w: int, h: int) -> np.ndarray:
        """Return camera intrinsic matrix; generate default if not provided."""
        if self._camera_matrix is not None:
            return self._camera_matrix
        focal_length = DEFAULT_FOCAL_LENGTH_MULTIPLIER * w
        return np.array([
            [focal_length, 0, w / 2.0],
            [0, focal_length, h / 2.0],
            [0, 0, 1]
        ], dtype=np.float64)

    def _prepare_rgb_frame(self, frame_bgr: np.ndarray, h: int, w: int) -> np.ndarray:
        """Convert BGR frame to RGB using internal buffer to avoid reallocations."""
        shape = (h, w, 3)
        if self._rgb_buffer is None or self._buffer_shape != shape:
            self._cleanup_buffers()
            self._rgb_buffer = np.empty(shape, dtype=np.uint8)
            self._buffer_shape = shape
        cv2.cvtColor(frame_bgr, cv2.COLOR_BGR2RGB, dst=self._rgb_buffer)
        return self._rgb_buffer

    def _extract_pose_data(self, landmarks, w: int, h: int, cam_matrix: np.ndarray) -> Dict:
        """Compute head pose (yaw, pitch, roll) from facial landmarks."""
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

    def _create_no_face_result(self) -> Dict:
        """Return default metrics when no face is detected."""
        return {
            'yaw': 0.0,
            'pitch': 0.0, 
            'roll': 0.0,
            'avg_gaze_ratio': None,
            'gaze_valid': False,
            'avg_eye_openness': None,
            'eyes_valid': False,
            'face_detected': False
        }

    def process(self, frame_bgr: np.ndarray) -> Dict:
        """Process frame and extract pose, gaze, and eye openness metrics."""
        with self._lock:
            if self._is_closed:
                raise FaceMeshError("Pipeline closed")

            h, w = self._validate_frame(frame_bgr)
            cam_matrix = self._get_camera_matrix(w, h)
            rgb_frame = self._prepare_rgb_frame(frame_bgr, h, w)

            try:
                res = self.face_mesh.process(rgb_frame)
            except Exception as e:
                raise FaceMeshError(f"MediaPipe processing failed: {e}")

            # Return default result if no face detected
            if not res.multi_face_landmarks:
                return self._create_no_face_result()

            landmarks = res.multi_face_landmarks[0].landmark

            try:
                pose_data = self._extract_pose_data(landmarks, w, h, cam_matrix)
                gaze_metrics = extract_gaze_metrics(landmarks, w, h)
                eye_metrics = extract_eye_openness_metrics(landmarks, w, h)

                result = {**pose_data, **gaze_metrics, **eye_metrics}
                result['face_detected'] = True
                return result
                
            except Exception:
                # Fallback to default if metric extraction fails
                return self._create_no_face_result()