import { useState, useEffect, useCallback } from "react";

export const useStudentCalibration = (uploadFrame) => {
  const [isCalibrating, setIsCalibrating] = useState(true);
  const [countdown, setCountdown] = useState(5);
  const [isCalibrationComplete, setIsCalibrationComplete] = useState(false);

  useEffect(() => {
    if (!isCalibrating || countdown <= 0) return;

    const timer = setTimeout(() => {
      setCountdown(prev => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [isCalibrating, countdown]);

  useEffect(() => {
    if (isCalibrating && countdown <= 0 && !isCalibrationComplete) {
      performCalibrationCapture();
    }
  }, [countdown, isCalibrating, isCalibrationComplete]);

  const performCalibrationCapture = useCallback(async () => {
    try {
      console.log("Performing calibration capture...");
      
      const video = document.querySelector('video');
      if (!video || !video.videoWidth || !video.videoHeight) {
        throw new Error("Video not ready for calibration capture");
      }

      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      canvas.width = 640;
      canvas.height = 480;

      context.drawImage(video, 0, 0, 640, 480);
      
      canvas.toBlob(async (blob) => {
        if (!blob) {
          throw new Error("Failed to create calibration blob");
        }

        try {
          console.log("Uploading calibration frame...");
          await uploadFrame(blob);
          console.log("Calibration frame uploaded successfully");
          
          setIsCalibrationComplete(true);
          
          setTimeout(() => {
            setIsCalibrating(false);
          }, 1000);
          
        } catch (error) {
          console.error("Failed to upload calibration frame:", error);
          setIsCalibrating(false);
        }
      }, 'image/jpeg', 0.8);

    } catch (error) {
      console.error("Calibration capture failed:", error);
      setIsCalibrating(false);
    }
  }, [uploadFrame]);

  return {
    isCalibrating,
    countdown,
    isCalibrationComplete,
  };
};