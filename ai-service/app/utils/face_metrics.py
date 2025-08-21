import math
import numpy as np
import cv2
from utils.gaze import get_landmark_coords, get_iris_center, calculate_gaze_ratio, calculate_eye_openness_ratio
from ml_logic.landmark_constants import (
    LEFT_IRIS, RIGHT_IRIS,
    LEFT_EYE_CORNERS, RIGHT_EYE_CORNERS,
    LEFT_EYE_VERTICAL, RIGHT_EYE_VERTICAL,
    LEFT_EYE_HORIZONTAL, RIGHT_EYE_HORIZONTAL
)

def extract_euler_angles(rvec):
    """Convert rotation vector to yaw, pitch, and roll in degrees."""
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

    angles = [math.degrees(a) for a in [yaw, pitch, roll]]
    yaw, pitch, roll = [((a + 180) % 360) - 180 for a in angles]
    if roll < -90:
        roll += 180
    elif roll > 90:
        roll -= 180
    return yaw, pitch, roll

def extract_gaze_metrics(landmarks, w, h):
    """Compute average gaze ratio and validity for both eyes."""
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

def extract_eye_openness_metrics(landmarks, w, h):
    """Compute average eye openness ratio and validity for both eyes."""
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