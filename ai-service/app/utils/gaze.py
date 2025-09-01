from typing import Optional, List
import numpy as np

def get_landmark_coords(landmarks, indices: List[int], w: int, h: int) -> Optional[np.ndarray]:
    coords = [[landmarks[idx].x * w, landmarks[idx].y * h] for idx in indices]
    return np.array(coords, dtype=np.float32)

def get_iris_center(landmarks, iris_indices: List[int], w: int, h: int) -> Optional[np.ndarray]:
    iris_coords = get_landmark_coords(landmarks, iris_indices, w, h)
    return np.mean(iris_coords, axis=0)
