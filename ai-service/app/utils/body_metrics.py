import mediapipe as mp
from typing import Dict

class BodyMetrics:
    def __init__(self):
        self.hands = mp.solutions.hands.Hands(
            static_image_mode=False,
            max_num_hands=2,
            min_detection_confidence=0.5,
            min_tracking_confidence=0.5
        )

    def close(self):
        if hasattr(self, 'hands'):
            self.hands.close()

    def extract_body_features(self, frame_rgb, w, h) -> Dict:
        features = {}
        try:
            results = self.hands.process(frame_rgb)
            features['hand_detected'] = 1 if results.multi_hand_landmarks else 0
        except Exception:
            features['hand_detected'] = 0
        return features