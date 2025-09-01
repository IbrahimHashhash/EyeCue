from typing import Dict
from collections import deque
import threading

class BatchManager:

    def __init__(self, batch_size: int = 4):
        self.batch_size = batch_size
        self.buffers: Dict[str, deque] = {}
        self._lock = threading.RLock()

    def add_frame(self, student_id: str, frame_data: Dict) -> Dict:
        with self._lock:
            if student_id not in self.buffers:
                self.buffers[student_id] = deque(maxlen=self.batch_size)

            buffer = self.buffers[student_id]
            buffer.append(frame_data)

            if len(buffer) >= self.batch_size:
                complete_batch = list(buffer)
                self.buffers.pop(student_id, None)
                return {
                    "is_complete": True,
                    "frames": complete_batch,
                    "frames_processed": len(complete_batch)
                }
            else:
                return {
                    "is_complete": False,
                    "frames_waiting": len(buffer),
                    "frames_needed": self.batch_size - len(buffer)
                }

    def remove_student(self, student_id: str) -> None:
        with self._lock:
            self.buffers.pop(student_id, None)

    def get_stats(self) -> Dict:
        with self._lock:
            return {
                "active_incomplete_batches": len(self.buffers),
                "total_frames_in_incomplete_batches": sum(len(buf) for buf in self.buffers.values()),
                "incomplete_batches_breakdown": {
                    student_id: len(buffer) for student_id, buffer in self.buffers.items()
                }
            }

    def clear_all(self) -> Dict:
        with self._lock:
            cleared_count = len(self.buffers)
            cleared_students = list(self.buffers.keys())
            self.buffers.clear()
            return {
                "cleared_count": cleared_count,
                "cleared_students": cleared_students
            }