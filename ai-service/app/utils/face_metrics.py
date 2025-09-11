from typing import Optional, Tuple
import numpy as np
from ml_logic.landmark_constants import (
    LEFT_IRIS,
    RIGHT_IRIS,
    LEFT_EYE_LANDMARKS,
    RIGHT_EYE_LANDMARKS,
)
from . import gaze
from collections import deque

class EyeMetrics:
    def __init__(self, smoothing_window: int = 5):
        self.left_ear_history = deque(maxlen=smoothing_window)
        self.right_ear_history = deque(maxlen=smoothing_window)

    def calculate_eye_aspect_ratio(self, eye_coords: np.ndarray) -> float:
        if eye_coords is None or eye_coords.shape[0] < 6:
            return 0.0
        vertical1 = np.linalg.norm(eye_coords[1] - eye_coords[5])
        vertical2 = np.linalg.norm(eye_coords[2] - eye_coords[4])
        horizontal = np.linalg.norm(eye_coords[0] - eye_coords[3])
        if horizontal == 0.0:
            return 0.0
        return (vertical1 + vertical2) / (2.0 * horizontal)

    def smooth_ear(self, left_ear: float, right_ear: float) -> Tuple[float, float]:
        self.left_ear_history.append(left_ear)
        self.right_ear_history.append(right_ear)
        left_mean = float(np.mean(self.left_ear_history))
        right_mean = float(np.mean(self.right_ear_history))
        return left_mean, right_mean

    def are_eyes_open(self, left_ear: float, right_ear: float, threshold: float = 0.25) -> bool:
        return (left_ear > threshold) or (right_ear > threshold)

def extract_face_features(landmarks, w: int, h: int, eye_metrics: Optional[EyeMetrics] = None) -> dict:
    if eye_metrics is None:
        eye_metrics = EyeMetrics()
    features = {}
    left_eye_coords = gaze.get_landmark_coords(landmarks, LEFT_EYE_LANDMARKS, w, h)
    right_eye_coords = gaze.get_landmark_coords(landmarks, RIGHT_EYE_LANDMARKS, w, h)
    left_ear = eye_metrics.calculate_eye_aspect_ratio(left_eye_coords) if left_eye_coords is not None else 0.0
    right_ear = eye_metrics.calculate_eye_aspect_ratio(right_eye_coords) if right_eye_coords is not None else 0.0
    left_ear, right_ear = eye_metrics.smooth_ear(left_ear, right_ear)
    features['left_eye_aspect_ratio'] = left_ear
    features['right_eye_aspect_ratio'] = right_ear
    features['eyes_open'] = eye_metrics.are_eyes_open(left_ear, right_ear)
    left_iris = gaze.get_iris_center(landmarks, LEFT_IRIS, w, h)
    right_iris = gaze.get_iris_center(landmarks, RIGHT_IRIS, w, h)

    def _normalized_iris(eye_coords: Optional[np.ndarray], iris_center: Optional[np.ndarray]):
        if eye_coords is None or iris_center is None:
            return None, None
        eye_center = np.mean(eye_coords, axis=0)
        min_xy = np.min(eye_coords, axis=0)
        max_xy = np.max(eye_coords, axis=0)
        bbox_size = np.maximum(max_xy - min_xy, 1.0)
        denom = max(bbox_size[0], bbox_size[1], 1.0)
        norm = (iris_center - eye_center) / denom
        return float(norm[0]), float(norm[1])

    lx, ly = _normalized_iris(left_eye_coords, left_iris)
    rx, ry = _normalized_iris(right_eye_coords, right_iris)
    features['left_iris_x_normalized'] = lx
    features['left_iris_y_normalized'] = ly
    features['right_iris_x_normalized'] = rx
    features['right_iris_y_normalized'] = ry
    return features
