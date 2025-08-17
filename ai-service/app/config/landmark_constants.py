import numpy as np

MODEL_POINTS = np.array([
    (0.0, 0.0, 0.0),        # Nose tip
    (0.0, -330.0, -65.0),   # Chin
    (-225.0, 170.0, -135.0),# Left eye corner
    (225.0, 170.0, -135.0), # Right eye corner
    (-150.0, -150.0, -125.0), # Left mouth corner
    (150.0, -150.0, -125.0)   # Right mouth corner
], dtype=np.float64)

LANDMARK_INDICES = [1, 152, 33, 263, 61, 291]

LEFT_IRIS = [468, 469, 470, 471, 472]
RIGHT_IRIS = [473, 474, 475, 476, 477]

LEFT_EYE_CORNERS = [33, 133]
RIGHT_EYE_CORNERS = [362, 263]

LEFT_EYE_VERTICAL = [159, 145]
RIGHT_EYE_VERTICAL = [386, 374]

LEFT_EYE_HORIZONTAL = [33, 133]
RIGHT_EYE_HORIZONTAL = [362, 263]

ALL_LANDMARK_INDICES = sorted(set(
    LANDMARK_INDICES + LEFT_IRIS + RIGHT_IRIS + LEFT_EYE_CORNERS + RIGHT_EYE_CORNERS +
    LEFT_EYE_VERTICAL + RIGHT_EYE_VERTICAL + LEFT_EYE_HORIZONTAL + RIGHT_EYE_HORIZONTAL
))