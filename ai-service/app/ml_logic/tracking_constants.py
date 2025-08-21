# Head pose thresholds in degrees
HEAD_YAW_THRESHOLD = 30.0
HEAD_PITCH_THRESHOLD = 35.0
HEAD_ROLL_THRESHOLD = 30.0

# Eye openness thresholds
EYES_OPEN_THRESHOLD = 0.18            # Minimum for considering eyes open
EYES_OPEN_MIN_FOR_GAZE = 0.22         # Minimum for valid gaze estimation

# Gaze thresholds
GAZE_CENTER_RATIO = 0.5               # Center gaze ratio
GAZE_TOLERANCE = 0.12                 # Allowable deviation from center

# Soft pose limits for gaze
GAZE_SOFT_PITCH_LIMIT = 15.0
GAZE_SOFT_YAW_LIMIT = 20.0
GAZE_SOFT_ROLL_LIMIT = 15.0

# Hard pose blocks for extreme gaze angles
GAZE_HARD_DOWN_PITCH_BLOCK = 22.0
GAZE_HARD_UP_PITCH_BLOCK = 25.0

# Additional tolerance when gaze is off-center
GAZE_TOLERANCE_WHEN_OFFCENTER = 0.07

# Component weights for attention scoring
HEAD_WEIGHT = 0.25
EYE_WEIGHT = 0.25
GAZE_WEIGHT = 0.50

# Camera configuration
DEFAULT_FOCAL_LENGTH_MULTIPLIER = 1.2
