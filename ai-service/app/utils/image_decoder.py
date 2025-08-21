import cv2
import numpy as np
from ml_logic.face_mesh_pipeline import FaceMeshError

class ImageDecoder:
    
    MIN_FRAME_DIMENSION = 100  # Minimum width/height in pixels

    @staticmethod
    def decode_image_bytes(image_data: bytes) -> np.ndarray:
        """Decode bytes into a valid OpenCV BGR frame."""
        try:
            nparr = np.frombuffer(image_data, np.uint8)
            if nparr.size == 0:
                raise ValueError("Empty image data buffer")
                
            frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            if frame is None or frame.size == 0:
                raise ValueError("Failed to decode image or frame is empty")
            
            h, w = frame.shape[:2]
            if h < ImageDecoder.MIN_FRAME_DIMENSION or w < ImageDecoder.MIN_FRAME_DIMENSION:
                raise ValueError(f"Frame too small: {w}x{h}")
                
            return frame
            
        except Exception as e:
            raise FaceMeshError(f"Failed to decode image: {e}")