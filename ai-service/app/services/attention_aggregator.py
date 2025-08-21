import numpy as np
from typing import Dict, List
from utils.attention_calculator import compute_attention_score

class AttentionAggregator:

    def compute_attention_from_frames(self, student_id: str, frames: List[Dict], 
                                      start_time: float, end_time: float) -> Dict:
        """Aggregate frame metrics and compute overall attention score."""
        
        aggregated_data = self._aggregate_frame_data(frames)
        
        # Handle case when no faces are detected
        if aggregated_data["faces_detected_count"] == 0:
            attention_metrics = compute_attention_score(
                0.0, 0.0, 0.0, face_detected=False
            )
            return self._create_result(
                student_id, attention_metrics, frames, 
                aggregated_data, start_time, end_time
            )
        
        # Compute attention with aggregated data
        attention_metrics = compute_attention_score(
            float(aggregated_data["avg_yaw"]), 
            float(aggregated_data["avg_pitch"]), 
            float(aggregated_data["avg_roll"]),
            avg_gaze_ratio=aggregated_data["avg_gaze_ratio"],
            gaze_valid=aggregated_data["gaze_valid"],
            avg_eye_openness=aggregated_data["avg_eye_openness"],
            eyes_valid=aggregated_data["eyes_valid"],
            face_detected=True
        )

        return self._create_result(
            student_id, attention_metrics, frames,
            aggregated_data, start_time, end_time
        )

    def _aggregate_frame_data(self, frames: List[Dict]) -> Dict:
        """Extract and average metrics from all valid frames."""
        valid_poses = []
        valid_gaze_ratios = []
        valid_eye_openness = []
        faces_detected_count = 0
        
        for frame in frames:
            if frame.get('face_detected', True):
                faces_detected_count += 1
                valid_poses.append((frame['yaw'], frame['pitch'], frame['roll']))
                
                if frame.get('gaze_valid') and frame['avg_gaze_ratio'] is not None:
                    valid_gaze_ratios.append(frame['avg_gaze_ratio'])
                
                if frame.get('eyes_valid') and frame['avg_eye_openness'] is not None:
                    valid_eye_openness.append(frame['avg_eye_openness'])
        
        # Compute averages
        if valid_poses:
            avg_yaw, avg_pitch, avg_roll = np.mean(valid_poses, axis=0)
        else:
            avg_yaw = avg_pitch = avg_roll = 0.0
        
        return {
            "faces_detected_count": faces_detected_count,
            "valid_poses_count": len(valid_poses),
            "valid_gaze_count": len(valid_gaze_ratios),
            "valid_eyes_count": len(valid_eye_openness),
            "avg_yaw": avg_yaw,
            "avg_pitch": avg_pitch,
            "avg_roll": avg_roll,
            "avg_gaze_ratio": float(np.mean(valid_gaze_ratios)) if valid_gaze_ratios else None,
            "avg_eye_openness": float(np.mean(valid_eye_openness)) if valid_eye_openness else None,
            "gaze_valid": bool(valid_gaze_ratios),
            "eyes_valid": bool(valid_eye_openness)
        }

    def _create_result(self, student_id: str, attention_metrics: Dict, frames: List[Dict],
                       aggregated_data: Dict, start_time: float, end_time: float) -> Dict:
        """Build standardized attention result dictionary."""
        return {
            "status": "success",
            "student_id": student_id,
            "attention_percentage": attention_metrics["attention_percentage"],
            "frames_processed": len(frames),
            "valid_poses": aggregated_data["valid_poses_count"],
            "valid_gaze": aggregated_data["valid_gaze_count"],
            "valid_eyes": aggregated_data["valid_eyes_count"],
            "faces_detected": aggregated_data["faces_detected_count"],
            "is_batch_complete": True,
            "processing_timestamp": {
                "start": start_time,
                "end": end_time,
                "duration": end_time - start_time
            }
        }