import threading
from typing import Dict, Optional, Tuple

class CalibrationStorageService:

    def __init__(self):
        self._calibrations: Dict[str, Tuple[float, float]] = {}
        self._lock = threading.RLock()
    
    def store_calibration(self, student_id: str, left_gaze: Optional[float], right_gaze: Optional[float]) -> bool:
        with self._lock:
            if student_id in self._calibrations:
                return False
            
            if left_gaze is not None or right_gaze is not None:
                self._calibrations[student_id] = (left_gaze, right_gaze)
                return True
            return False
    
    def get_calibration(self, student_id: str) -> Optional[Tuple[Optional[float], Optional[float]]]:
        with self._lock:
            return self._calibrations.get(student_id)
    
    def has_calibration(self, student_id: str) -> bool:
        with self._lock:
            return student_id in self._calibrations