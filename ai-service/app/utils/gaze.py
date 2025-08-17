from typing import Optional, List
import numpy as np

def get_landmark_coords(landmarks, indices: List[int], w: int, h: int) -> Optional[np.ndarray]:
    """Extract landmark coordinates for given indices."""
    try:
        if not landmarks or not indices:
            return None
            
        coords = []
        for idx in indices:
            if idx >= len(landmarks) or idx < 0:
                return None
            lm = landmarks[idx]
            # Validate landmark coordinates
            if not hasattr(lm, 'x') or not hasattr(lm, 'y'):
                return None
            coords.append([lm.x * w, lm.y * h])
        return np.array(coords, dtype=np.float32) if coords else None
    except Exception:
        return None

def get_iris_center(landmarks, iris_indices: List[int], w: int, h: int) -> Optional[np.ndarray]:
    """Calculate center point of iris landmarks."""
    iris_coords = get_landmark_coords(landmarks, iris_indices, w, h)
    if iris_coords is not None and len(iris_coords) > 0:
        return np.mean(iris_coords, axis=0)
    return None

def calculate_gaze_ratio(eye_corners: Optional[np.ndarray], iris_center: Optional[np.ndarray]) -> Optional[float]:
    """Calculate horizontal gaze ratio (0.0=left, 0.5=center, 1.0=right)."""
    if eye_corners is None or iris_center is None or len(eye_corners) < 2:
        return None

    try:
        left_x = float(eye_corners[:, 0].min())
        right_x = float(eye_corners[:, 0].max())
        eye_width = right_x - left_x
        
        if eye_width < 5.0:  # Minimum 5 pixels for eye width
            return None
            
        iris_x = float(iris_center[0])
        
        # Check if iris is within reasonable bounds
        if iris_x < left_x - eye_width * 0.1 or iris_x > right_x + eye_width * 0.1:
            return None
            
        ratio = (iris_x - left_x) / eye_width
        return float(np.clip(ratio, 0.0, 1.0))
    except Exception:
        return None

def calculate_eye_openness_ratio(vertical_points: Optional[np.ndarray], horizontal_points: Optional[np.ndarray]) -> Optional[float]:
    """Calculate eye openness ratio (Eye Aspect Ratio)."""
    if (vertical_points is None or horizontal_points is None or 
        len(vertical_points) < 2 or len(horizontal_points) < 2):
        return None
        
    try:
        # Calculate vertical distance (eye height)
        eye_height = float(np.linalg.norm(vertical_points[1] - vertical_points[0]))
        
        # Calculate horizontal distance (eye width) for normalization
        eye_width = float(np.linalg.norm(horizontal_points[1] - horizontal_points[0]))
        
        if eye_width < 5.0 or eye_height < 0.1:  # Minimum realistic eye dimensions
            return None
            
        # Eye Aspect Ratio - normalized eye height
        ear = eye_height / eye_width
        
        # Clip to reasonable range for human eyes
        return float(np.clip(ear, 0.0, 0.8))  # Max 0.8 for wide open eyes
        
    except Exception:
        return None
