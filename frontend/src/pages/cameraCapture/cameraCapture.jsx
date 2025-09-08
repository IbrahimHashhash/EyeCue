import { useRef, useState } from "react";
import { useCameraStream } from "../../hooks/useCameraStream";
import { useFrameCapture } from "../../hooks/useFrameCapture";
import { useFrameUpload } from "../../hooks/useFrameUpload";
import { useStudentCalibration } from "../../hooks/useStudentCalibration";
import { FRAME_SETTINGS } from "../../config/constants";
import StudentCalibrationModal from "../../components/StudentCalibrationModal/studentCalibration";
import "./cameraCapture.css";
import ENDPOINTS from "../../api/endpoints"

const CameraCapture = () => {
  const videoRef = useRef(null);
  const [cameraError, setCameraError] = useState(null);
  
  useCameraStream(videoRef, setCameraError);
  
  const { uploadFrame } = useFrameUpload(ENDPOINTS.STUDENT.FRAME);
  
  const { 
    isCalibrating, 
    countdown, 
    isCalibrationComplete 
  } = useStudentCalibration(uploadFrame);

  const handleFrameCaptured = async (blob) => {
    if (isCalibrating) return;
    
    try {
      const result = await uploadFrame(blob);
      console.log("Frame processed successfully:", result);
    } catch (error) {
      console.error("Error processing frame:", error);
    }
  };

  useFrameCapture({
    videoRef,
    onFrameCaptured: handleFrameCaptured,
    enabled: !isCalibrating,
    ...FRAME_SETTINGS,
  });

  return (
    <div className="container">
      <StudentCalibrationModal
        isOpen={isCalibrating}
        countdown={countdown}
      />
      
      <div className="main-content">
        {cameraError && (
          <div className="error-message">
            <p>Camera access denied: {cameraError}</p>
          </div>
        )}
        
        <div className="content-layout">
          <div className="video-container">
            <div className="video-wrapper">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                width={FRAME_SETTINGS.width}
                height={FRAME_SETTINGS.height}
              />
              
              {!isCalibrating && (
                <div className="capture-indicator">
                  Active
                </div>
              )}
            </div>
          </div>
          
          <div className="sidebar-right">
            <div className="info-card">
              <h3>Detection Status</h3>
              <p>Your attention is being monitored</p>
            </div>
            
            <div className="info-card">
              <h3>Privacy</h3>
              <p>All processing is done locally. No video data is stored or transmitted</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CameraCapture;