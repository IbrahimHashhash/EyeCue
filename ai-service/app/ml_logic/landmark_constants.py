import numpy as np

# 3D model points for facial landmarks (used for head pose estimation)
MODEL_POINTS = np.array([
    (0.0, 0.0, 0.0),        # Nose tip
    (0.0, -330.0, -65.0),   # Chin
    (-225.0, 170.0, -135.0),# Left eye corner
    (225.0, 170.0, -135.0), # Right eye corner
    (-150.0, -150.0, -125.0), # Left mouth corner
    (150.0, -150.0, -125.0)   # Right mouth corner
], dtype=np.float64)

# Key facial landmark indices
LANDMARK_INDICES = [1, 152, 33, 263, 61, 291]

# Iris landmark indices
LEFT_IRIS = [468, 469, 470, 471, 472]
RIGHT_IRIS = [473, 474, 475, 476, 477]

# Eye corner indices
LEFT_EYE_CORNERS = [33, 133]
RIGHT_EYE_CORNERS = [362, 263]

# Eye vertical landmarks
LEFT_EYE_VERTICAL = [159, 145]
RIGHT_EYE_VERTICAL = [386, 374]

# Eye horizontal landmarks
LEFT_EYE_HORIZONTAL = [33, 133]
RIGHT_EYE_HORIZONTAL = [362, 263]

# Combined set of all relevant landmarks
ALL_LANDMARK_INDICES = sorted(set(
    LANDMARK_INDICES + LEFT_IRIS + RIGHT_IRIS + LEFT_EYE_CORNERS + RIGHT_EYE_CORNERS +
    LEFT_EYE_VERTICAL + RIGHT_EYE_VERTICAL + LEFT_EYE_HORIZONTAL + RIGHT_EYE_HORIZONTAL
))
