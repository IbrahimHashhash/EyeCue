from typing import Dict, Literal, Optional

class AttentionClassifier:
    
    MAX_GAZE_DEVIATION = 0.4 
    
    def classify_attention(self, face_features: Dict, face_detected: bool = True) -> Literal["attentive", "inattentive"]:
        if not face_detected or not face_features:
            return "inattentive"
        
        return "attentive" if self._is_looking_at_screen(face_features) else "inattentive"
    
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