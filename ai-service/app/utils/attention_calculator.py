from typing import Optional, Dict
from config import tracking_constants as C

def _within(val: float, limit: float) -> bool:
    return abs(val) <= limit

def compute_attention_score(
    yaw: float,
    pitch: float,
    roll: float,
    avg_gaze_ratio: Optional[float] = None,
    gaze_valid: bool = False,
    avg_eye_openness: Optional[float] = None,
    eyes_valid: bool = False
) -> Dict:
    # 1) Head centered
    is_head_centered = (
        _within(yaw, C.HEAD_YAW_THRESHOLD) and
        _within(pitch, C.HEAD_PITCH_THRESHOLD) and
        _within(roll, C.HEAD_ROLL_THRESHOLD)
    )

    # 2) Eyes open
    eyes_open = (
        eyes_valid and
        (avg_eye_openness is not None) and
        (avg_eye_openness >= C.EYES_OPEN_THRESHOLD)
    )

    # 3) Gaze logic with hard/soft limits
    looking_at_screen = False
    if gaze_valid and (avg_gaze_ratio is not None) and eyes_open and (avg_eye_openness >= C.EYES_OPEN_MIN_FOR_GAZE):
        # Hard blocks for extreme pitch
        if not (pitch > C.GAZE_HARD_DOWN_PITCH_BLOCK or pitch < -C.GAZE_HARD_UP_PITCH_BLOCK):
            # Dynamic tolerance based on head pose
            within_soft_pose = (
                _within(pitch, C.GAZE_SOFT_PITCH_LIMIT) and
                _within(yaw, C.GAZE_SOFT_YAW_LIMIT) and
                _within(roll, C.GAZE_SOFT_ROLL_LIMIT)
            )
            tolerance = C.GAZE_TOLERANCE if within_soft_pose else C.GAZE_TOLERANCE_WHEN_OFFCENTER
            looking_at_screen = abs(avg_gaze_ratio - C.GAZE_CENTER_RATIO) <= tolerance

    # Weighted score
    total_score = (
        (C.HEAD_WEIGHT if is_head_centered else 0.0) +
        (C.EYE_WEIGHT if eyes_open else 0.0) +
        (C.GAZE_WEIGHT if looking_at_screen else 0.0)
    )

    return {
        "attention_score": float(total_score),
        "attention_percentage": float(total_score * 100.0)
    }