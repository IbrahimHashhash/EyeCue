import math
import numpy as np
import cv2
from typing import Dict
from utils.gaze import get_landmark_coords, get_iris_center
from ml_logic.landmark_constants import (
    LEFT_IRIS, RIGHT_IRIS,
    LEFT_EYE_CORNERS, RIGHT_EYE_CORNERS,
    LEFT_EYE_VERTICAL, RIGHT_EYE_VERTICAL,
    LEFT_EYEBROW, RIGHT_EYEBROW,
    MOUTH_OUTER
)

def extract_euler_angles(rvec):
    """Extract Euler angles from rotation vector"""
    R, _ = cv2.Rodrigues(rvec)
    sy = math.sqrt(R[0, 0] * R[0, 0] + R[1, 0] * R[1, 0])
    
    singular = sy < 1e-6
    
    if not singular:
        roll = math.atan2(R[2, 1], R[2, 2])   
        pitch = math.atan2(-R[2, 0], sy)
        yaw = math.atan2(R[1, 0], R[0, 0])    
    else:
        roll = math.atan2(-R[1, 2], R[1, 1]) 
        pitch = math.atan2(-R[2, 0], sy)     
        yaw = 0
    
    yaw_deg = math.degrees(yaw)
    pitch_deg = math.degrees(pitch) 
    roll_deg = math.degrees(roll)
    

    if roll_deg > 90:
        roll_deg -= 180
    elif roll_deg < -90:
        roll_deg += 180
        
    return float(yaw_deg), float(pitch_deg), float(roll_deg)

def extract_face_features(landmarks, w: int, h: int) -> Dict:
    features = {}
    left_vertical = get_landmark_coords(landmarks, LEFT_EYE_VERTICAL, w, h)
    right_vertical = get_landmark_coords(landmarks, RIGHT_EYE_VERTICAL, w, h)
    left_horizontal = get_landmark_coords(landmarks, LEFT_EYE_CORNERS, w, h)
    right_horizontal = get_landmark_coords(landmarks, RIGHT_EYE_CORNERS, w, h)
    
    if left_vertical is not None and len(left_vertical) == 2 and left_horizontal is not None and len(left_horizontal) == 2:
        left_eye_height = float(np.linalg.norm(left_vertical[1] - left_vertical[0]))
        left_eye_width = float(np.linalg.norm(left_horizontal[1] - left_horizontal[0]))
        features['left_eye_openness'] = left_eye_height / left_eye_width if left_eye_width > 0 else 0.0
    
    if right_vertical is not None and len(right_vertical) == 2 and right_horizontal is not None and len(right_horizontal) == 2:
        right_eye_height = float(np.linalg.norm(right_vertical[1] - right_vertical[0]))
        right_eye_width = float(np.linalg.norm(right_horizontal[1] - right_horizontal[0]))
        features['right_eye_openness'] = right_eye_height / right_eye_width if right_eye_width > 0 else 0.0
    
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
    
    left_eyebrow = get_landmark_coords(landmarks, LEFT_EYEBROW, w, h)
    right_eyebrow = get_landmark_coords(landmarks, RIGHT_EYEBROW, w, h)
    
    if left_eyebrow is not None and left_vertical is not None and len(left_vertical) == 2:
        left_eye_height = float(np.linalg.norm(left_vertical[1] - left_vertical[0]))
        left_eye_top = min(left_vertical[0][1], left_vertical[1][1])
        left_eyebrow_avg_y = float(np.mean(left_eyebrow[:, 1]))
        if left_eye_height > 0:
            features['left_eyebrow_position_normalized'] = (left_eye_top - left_eyebrow_avg_y) / left_eye_height
    
    if right_eyebrow is not None and right_vertical is not None and len(right_vertical) == 2:
        right_eye_height = float(np.linalg.norm(right_vertical[1] - right_vertical[0]))
        right_eye_top = min(right_vertical[0][1], right_vertical[1][1])
        right_eyebrow_avg_y = float(np.mean(right_eyebrow[:, 1]))
        if right_eye_height > 0:
            features['right_eyebrow_position_normalized'] = (right_eye_top - right_eyebrow_avg_y) / right_eye_height
    
    mouth_outer = get_landmark_coords(landmarks, MOUTH_OUTER, w, h)
    if mouth_outer is not None:
        mouth_width = float(np.max(mouth_outer[:, 0]) - np.min(mouth_outer[:, 0]))
        mouth_height = float(np.max(mouth_outer[:, 1]) - np.min(mouth_outer[:, 1]))
        features['mouth_openness'] = mouth_height / mouth_width if mouth_width > 0 else 0.0
    
    return features