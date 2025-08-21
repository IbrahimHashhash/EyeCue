import base64
import threading
from typing import Dict
from ml_logic.face_mesh_pipeline import FaceMeshPipeline, FaceMeshError
from utils.image_decoder import ImageDecoder

class FrameProcessingService:

    def __init__(self):
        self.pipeline = FaceMeshPipeline(static_image_mode=False)
        self.decoder = ImageDecoder()
        self._lock = threading.RLock()
        self._is_closed = False

    def close(self) -> None:
        with self._lock:
            if self._is_closed:
                return
            self._is_closed = True
            try:
                self.pipeline.close()
            except Exception:
                pass

    def process_base64_frame(self, frame_base64: str, timestamp: str) -> Dict:
        """Decode base64 frame and process with face mesh."""
        if self._is_closed:
            raise RuntimeError("Frame processing service is closed")

        try:
            if "," in frame_base64:
                frame_base64 = frame_base64.split(",", 1)[1]
            frame_bytes = base64.b64decode(frame_base64)
        except Exception as e:
            raise ValueError(f"Invalid base64 data: {e}")

        frame = self.decoder.decode_image_bytes(frame_bytes)
        frame_result = self.pipeline.process(frame)
        frame_result['timestamp'] = timestamp
        return frame_result

    def process_frame_bytes(self, image_bytes: bytes, timestamp: str) -> Dict:
        """Process raw image bytes and return face metrics."""
        if self._is_closed:
            raise RuntimeError("Frame processing service is closed")

        frame = self.decoder.decode_image_bytes(image_bytes)
        frame_result = self.pipeline.process(frame)
        frame_result['timestamp'] = timestamp
        return frame_result