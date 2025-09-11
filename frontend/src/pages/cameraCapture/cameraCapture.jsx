import { useRef, useState } from "react";
import { useCameraStream } from "../../hooks/useCameraStream";
import { useFrameCapture } from "../../hooks/useFrameCapture";
import { useFrameUpload } from "../../hooks/useFrameUpload";
import { useStudentCalibration } from "../../hooks/useStudentCalibration";
import { FRAME_SETTINGS } from "../../config/constants";
import StudentCalibrationModal from "../../components/studentCalibration/studentCalibration";
import Sidebar from "../../components/sidebar/sidebar";
import "./cameraCapture.css";
import ENDPOINTS from "../../api/endpoints"

const CameraCapture = () => {
  const videoRef = useRef(null);
  const [cameraError, setCameraError] = useState(null);
  const [currentView, setCurrentView] = useState("camera");
  
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

  const navItems = [
    {
      id: "camera",
      label: "Camera View",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
          <circle cx="12" cy="13" r="4"></circle>
        </svg>
      )
    }
  ];

  return (
    <div className="camera-capture-container">
      <StudentCalibrationModal
        isOpen={isCalibrating}
        countdown={countdown}
      />
      
      <Sidebar 
        currentView={currentView}
        setCurrentView={setCurrentView}
        navItems={navItems}
        logoProps={{ title: "EyeCue", subtitle: "Student" }}
        userProfileProps={{ 
          avatar: "S", 
          name: "Student", 
          role: "Participant" 
        }}
      />
      
      <div className="camera-main-content">        
        <div className="camera-content">
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
    </div>
  );
};

export default CameraCapture;