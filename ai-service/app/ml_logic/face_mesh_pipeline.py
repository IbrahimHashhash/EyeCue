import mediapipe as mp
import numpy as np
import cv2
import math
import threading
from typing import Dict, Optional, Tuple

from config.landmark_constants import (
    MODEL_POINTS, LANDMARK_INDICES, ALL_LANDMARK_INDICES, 
    LEFT_IRIS, RIGHT_IRIS, LEFT_EYE_CORNERS, RIGHT_EYE_CORNERS,
    LEFT_EYE_VERTICAL, RIGHT_EYE_VERTICAL, LEFT_EYE_HORIZONTAL, RIGHT_EYE_HORIZONTAL
)
from config.tracking_constants import DEFAULT_FOCAL_LENGTH_MULTIPLIER
from utils.gaze import get_landmark_coords, get_iris_center, calculate_gaze_ratio, calculate_eye_openness_ratio

class FaceMeshError(Exception):
    pass

class FaceMeshPipeline:
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
            raise FaceMeshError(f"Failed to init MediaPipe FaceMesh: {e}")

        self.model_points = MODEL_POINTS
        self.landmark_indices = LANDMARK_INDICES
        self._camera_matrix = camera_matrix
        self._max_landmarks_needed = max(ALL_LANDMARK_INDICES)

    def close(self) -> None:
        """Clean up resources."""
        with self._lock:
            if not self._is_closed:
                try:
                    if hasattr(self, 'face_mesh'):
                        self.face_mesh.close()
                except Exception:
                    pass
                finally:
                    self._is_closed = True
                    if self._rgb_buffer is not None:
                        del self._rgb_buffer
                        self._rgb_buffer = None
                    self._buffer_shape = None

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        self.close()

    def _extract_euler_angles(self, rvec) -> Tuple[float, float, float]:
        """Extract Euler angles (yaw, pitch, roll) with normalization."""
        try:
            R, _ = cv2.Rodrigues(rvec)

            sy = math.sqrt(R[0, 0] ** 2 + R[1, 0] ** 2)

            if sy > 1e-6:
                yaw = math.atan2(R[1, 0], R[0, 0])
                pitch = math.atan2(-R[2, 0], sy)
                roll = math.atan2(R[2, 1], R[2, 2])
            else:
                yaw = math.atan2(-R[0, 1], R[1, 1])
                pitch = math.atan2(-R[2, 0], sy)
                roll = 0

            # Convert to degrees and normalize
            angles = [math.degrees(angle) for angle in [yaw, pitch, roll]]
            yaw, pitch, roll = [((a + 180) % 360) - 180 for a in angles]

            if roll < -90:
                roll += 180
            elif roll > 90:
                roll -= 180

            return yaw, pitch, roll

        except Exception as e:
            raise FaceMeshError(f'Angle calculation failed: {e}')

    def _extract_gaze_metrics(self, landmarks, w: int, h: int) -> Dict:
        """Extract gaze-related metrics with null checks."""
        left_iris = get_iris_center(landmarks, LEFT_IRIS, w, h)
        right_iris = get_iris_center(landmarks, RIGHT_IRIS, w, h)
        left_corners = get_landmark_coords(landmarks, LEFT_EYE_CORNERS, w, h)
        right_corners = get_landmark_coords(landmarks, RIGHT_EYE_CORNERS, w, h)

        ratios = []
        for corners, iris in [(left_corners, left_iris), (right_corners, right_iris)]:
            if corners is not None and iris is not None:
                ratio = calculate_gaze_ratio(corners, iris)
                if ratio is not None:
                    ratios.append(ratio)

        return {
            'avg_gaze_ratio': float(np.mean(ratios)) if ratios else None,
            'gaze_valid': bool(ratios)
        }

    def _extract_eye_openness_metrics(self, landmarks, w: int, h: int) -> Dict:
        """Extract eye openness metrics."""
        openness_values = []
        
        for v_indices, h_indices in [(LEFT_EYE_VERTICAL, LEFT_EYE_HORIZONTAL), 
                                   (RIGHT_EYE_VERTICAL, RIGHT_EYE_HORIZONTAL)]:
            vertical = get_landmark_coords(landmarks, v_indices, w, h)
            horizontal = get_landmark_coords(landmarks, h_indices, w, h)
            openness = calculate_eye_openness_ratio(vertical, horizontal)
            if openness is not None:
                openness_values.append(openness)

        return {
            'avg_eye_openness': float(np.mean(openness_values)) if openness_values else None,
            'eyes_valid': bool(openness_values)
        }

    def _allocate_rgb_buffer(self, h: int, w: int) -> None:
        """Efficiently allocate RGB buffer."""
        shape = (h, w, 3)
        if self._rgb_buffer is None or self._buffer_shape != shape:
            # Clean up old buffer first to prevent memory buildup
            if self._rgb_buffer is not None:
                del self._rgb_buffer
            self._rgb_buffer = np.empty(shape, dtype=np.uint8)
            self._buffer_shape = shape

    def process(self, frame_bgr: np.ndarray) -> Dict:
        """Process frame and extract face metrics."""
        with self._lock:
            if self._is_closed:
                raise FaceMeshError("Pipeline closed")
            if frame_bgr is None or frame_bgr.size == 0:
                raise FaceMeshError("Empty/invalid frame")

            h, w = frame_bgr.shape[:2]
            if h < 100 or w < 100:
                raise FaceMeshError("Frame too small")

            cam_matrix = self._camera_matrix
            if cam_matrix is None:
                focal_length = DEFAULT_FOCAL_LENGTH_MULTIPLIER * w
                cam_matrix = np.array([
                    [focal_length, 0, w / 2.0],
                    [0, focal_length, h / 2.0],
                    [0, 0, 1]
                ], dtype=np.float64)

            self._allocate_rgb_buffer(h, w)
            cv2.cvtColor(frame_bgr, cv2.COLOR_BGR2RGB, dst=self._rgb_buffer)

            try:
                res = self.face_mesh.process(self._rgb_buffer)
            except Exception as e:
                raise FaceMeshError(f"MediaPipe processing failed: {e}")

            if not res.multi_face_landmarks:
                raise FaceMeshError('No face detected')

            landmarks = res.multi_face_landmarks[0].landmark

            if len(landmarks) <= self._max_landmarks_needed:
                raise FaceMeshError(f'Insufficient landmarks: got {len(landmarks)}, need > {self._max_landmarks_needed}')

            try:
                image_points = np.array([
                    [landmarks[i].x * w, landmarks[i].y * h] for i in self.landmark_indices
                ], dtype=np.float64)
            except (IndexError, AttributeError) as e:
                raise FaceMeshError(f'Invalid landmark data for pose: {e}')

            if np.any(~np.isfinite(image_points)):
                raise FaceMeshError('Invalid landmark coordinates detected')

            try:
                success, rvec, _ = cv2.solvePnP(
                    self.model_points, image_points, cam_matrix, None,
                    flags=cv2.SOLVEPNP_ITERATIVE
                )
            except Exception as e:
                raise FaceMeshError(f"solvePnP error: {e}")

            if not success or rvec is None:
                raise FaceMeshError('Pose estimation failed')

            yaw, pitch, roll = self._extract_euler_angles(rvec)
            gaze_metrics = self._extract_gaze_metrics(landmarks, w, h)
            eye_metrics = self._extract_eye_openness_metrics(landmarks, w, h)

            return {
                'yaw': float(yaw),
                'pitch': float(pitch),
                'roll': float(roll),
                **gaze_metrics,
                **eye_metrics
            }