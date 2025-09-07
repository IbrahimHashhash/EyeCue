from typing import Dict, Literal, Optional, Tuple
import math

class AttentionClassifier:
    
    MAX_GAZE_DEVIATION = 0.4  
    CALIBRATION_TOLERANCE = 0.25
    
    def classify_attention(
        self, 
        face_features: Dict, 
        face_detected: bool = True,
        calibration_data: Optional[Tuple[Optional[float], Optional[float]]] = None
    ) -> Literal["attentive", "inattentive"]:
        if not face_detected or not face_features:
            return "inattentive"
        
        if calibration_data:
            return self._classify_with_calibration(face_features, calibration_data)
        else:
            return "attentive" if self._is_looking_at_screen(face_features) else "inattentive"
    
    def _classify_with_calibration(
        self, 
        features: Dict, 
        calibration_data: Tuple[Optional[float], Optional[float]]
    ) -> Literal["attentive", "inattentive"]:
        calibrated_left, calibrated_right = calibration_data
        
        current_left = self._get_gaze_deviation(
            features.get('left_iris_x_normalized'),
            features.get('left_iris_y_normalized')
        )
        
        current_right = self._get_gaze_deviation(
            features.get('right_iris_x_normalized'),
            features.get('right_iris_y_normalized')
        )
        
        left_attentive = self._is_gaze_similar_to_calibration(current_left, calibrated_left)
        right_attentive = self._is_gaze_similar_to_calibration(current_right, calibrated_right)
        
        if left_attentive is not None and right_attentive is not None:
            return "attentive" if (left_attentive and right_attentive) else "inattentive"
        elif left_attentive is not None:
            return "attentive" if left_attentive else "inattentive"
        elif right_attentive is not None:
            return "attentive" if right_attentive else "inattentive"
        else:
            return "inattentive"
    
    def _is_gaze_similar_to_calibration(
        self, 
        current_deviation: Optional[float], 
        calibrated_deviation: Optional[float]
    ) -> Optional[bool]:
        if current_deviation is None or calibrated_deviation is None:
            return None
        
        difference = abs(current_deviation - calibrated_deviation)
        return difference <= self.CALIBRATION_TOLERANCE
    
    def _get_gaze_deviation(self, iris_x: Optional[float], iris_y: Optional[float]) -> Optional[float]:
        if iris_x is None or iris_y is None:
            return None
        
        try:
            return math.sqrt(iris_x ** 2 + iris_y ** 2)
        except (TypeError, ValueError):
            return None
    
    def _is_looking_at_screen(self, features: Dict) -> bool:
        if not features:
            return False
            
        left_gaze_centered = self._is_eye_gaze_centered(
            features.get('left_iris_x_normalized'),
            features.get('left_iris_y_normalized')
        )
        
        right_gaze_centered = self._is_eye_gaze_centered(
            features.get('right_iris_x_normalized'),
            features.get('right_iris_y_normalized')
        )
        
        if left_gaze_centered is not None and right_gaze_centered is not None:
            return left_gaze_centered and right_gaze_centered
        elif left_gaze_centered is not None:
            return left_gaze_centered
        elif right_gaze_centered is not None:
            return right_gaze_centered
        else:
            return False
    
    def _is_eye_gaze_centered(self, iris_x: Optional[float] = None, iris_y: Optional[float] = None) -> Optional[bool]:
        if iris_x is None or iris_y is None:
            return None
        
        try:
            gaze_deviation = max(abs(iris_x), abs(iris_y))
            return gaze_deviation <= self.MAX_GAZE_DEVIATION
        except (TypeError, ValueError):
            return None
    
    def extract_calibration_values(self, face_features: Dict) -> Tuple[Optional[float], Optional[float]]:

        left_deviation = self._get_gaze_deviation(
            face_features.get('left_iris_x_normalized'),
            face_features.get('left_iris_y_normalized')
        )
        
        right_deviation = self._get_gaze_deviation(
            face_features.get('right_iris_x_normalized'),
            face_features.get('right_iris_y_normalized')
        )
        
        return (left_deviation, right_deviation)
