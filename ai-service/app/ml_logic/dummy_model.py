class DummyAttentionModel:

    def get_attention_score(self, face_features: dict, body_features: dict) -> float:
        return 0.0