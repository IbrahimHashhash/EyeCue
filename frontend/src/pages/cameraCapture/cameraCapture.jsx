import { useRef, useState } from "react";
import { useCameraStream } from "../../hooks/useCameraStream";
import { useFrameCapture } from "../../hooks/useFrameCapture";
import { useFrameUpload } from "../../hooks/useFrameUpload";
import { FRAME_SETTINGS } from "../../config/constants";
import "./cameraCapture.css";
import ENDPOINTS from "../../api/endpoints"

const CameraCapture = () => {
  const videoRef = useRef(null);
  const [cameraError, setCameraError] = useState(null);
  useCameraStream(videoRef, setCameraError);
  const { uploadFrame } = useFrameUpload(ENDPOINTS.STUDENT.FRAME);
  const handleFrameCaptured = async (blob) => {
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
    ...FRAME_SETTINGS,
  });

  return (
    <div className="container">
      <h2>Live Camera Feed</h2>

      {cameraError && (
        <p className="error">Camera access denied: {cameraError}</p>
      )}
      <div className="video-wrapper">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          width={FRAME_SETTINGS.width}
          height={FRAME_SETTINGS.height}
        />
      </div>
    </div>
  );
};

export default CameraCapture;
