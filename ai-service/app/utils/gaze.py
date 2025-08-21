from typing import Optional, List
import numpy as np

def get_landmark_coords(landmarks, indices: List[int], w: int, h: int) -> Optional[np.ndarray]:
    """Extract landmark coordinates and scale to image dimensions."""
    coords = [[landmarks[idx].x * w, landmarks[idx].y * h] for idx in indices]
    return np.array(coords, dtype=np.float32)

def get_iris_center(landmarks, iris_indices: List[int], w: int, h: int) -> Optional[np.ndarray]:
    """Compute center point of the iris from landmark coordinates."""
    iris_coords = get_landmark_coords(landmarks, iris_indices, w, h)
    return np.mean(iris_coords, axis=0)

def calculate_gaze_ratio(eye_corners: np.ndarray, iris_center: np.ndarray) -> float:
    """Calculate horizontal gaze ratio within [0.0, 1.0]."""
    left_x = float(eye_corners[:, 0].min())
    right_x = float(eye_corners[:, 0].max())
    eye_width = right_x - left_x
    iris_x = float(iris_center[0])
    ratio = (iris_x - left_x) / eye_width
    return float(np.clip(ratio, 0.0, 1.0))

def calculate_eye_openness_ratio(vertical_points: np.ndarray, horizontal_points: np.ndarray) -> float:
    """Calculate eye openness ratio (height / width) and clip to [0.0, 0.8]."""
    eye_height = float(np.linalg.norm(vertical_points[1] - vertical_points[0]))
    eye_width = float(np.linalg.norm(horizontal_points[1] - horizontal_points[0]))
    ear = eye_height / eye_width
    return float(np.clip(ear, 0.0, 0.8))