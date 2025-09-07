import numpy as np
from typing import Dict
from utils.gaze import get_landmark_coords, get_iris_center
from ml_logic.landmark_constants import (
    LEFT_IRIS, RIGHT_IRIS,
    LEFT_EYE_CORNERS, RIGHT_EYE_CORNERS
)

def extract_face_features(landmarks, w: int, h: int) -> Dict:
    features = {}
    
    left_horizontal = get_landmark_coords(landmarks, LEFT_EYE_CORNERS, w, h)
    right_horizontal = get_landmark_coords(landmarks, RIGHT_EYE_CORNERS, w, h)
    
    left_iris = get_iris_center(landmarks, LEFT_IRIS, w, h)
    right_iris = get_iris_center(landmarks, RIGHT_IRIS, w, h)
    
    if left_iris is not None and left_horizontal is not None and len(left_horizontal) == 2:
        left_eye_center = (left_horizontal[0] + left_horizontal[1]) / 2
        left_eye_width = np.linalg.norm(left_horizontal[1] - left_horizontal[0])
        if left_eye_width > 0:
            features['left_iris_x_normalized'] = float((left_iris[0] - left_eye_center[0]) / (left_eye_width / 2))
            features['left_iris_y_normalized'] = float((left_iris[1] - left_eye_center[1]) / (left_eye_width / 2))
    
    if right_iris is not None and right_horizontal is not None and len(right_horizontal) == 2:
        right_eye_center = (right_horizontal[0] + right_horizontal[1]) / 2
        right_eye_width = np.linalg.norm(right_horizontal[1] - right_horizontal[0])
        if right_eye_width > 0:
            features['right_iris_x_normalized'] = float((right_iris[0] - right_eye_center[0]) / (right_eye_width / 2))
            features['right_iris_y_normalized'] = float((right_iris[1] - right_eye_center[1]) / (right_eye_width / 2))
    
    return features