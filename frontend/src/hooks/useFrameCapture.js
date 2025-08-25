import { useEffect, useRef } from "react";

export const useFrameCapture = ({
    videoRef,
    width,
    height,
    intervalMs = 10000,
    framesPerInterval = 4,
    onFrameCaptured 
}) => {
    const canvasRef = useRef(null);

    useEffect(() => {
        if (!canvasRef.current) {
            canvasRef.current = document.createElement('canvas');
        }
        
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        canvas.width = width;
        canvas.height = height;

        const captureFrame = () => {
            const videoElement = videoRef.current;
            
            if (!videoElement || !videoElement.videoWidth || !videoElement.videoHeight) {
                console.warn("Video not ready for capture");
                return;
            }

            console.log("Capturing frame...");
            context.drawImage(videoElement, 0, 0, width, height);
            
            canvas.toBlob((blob) => {
                if (!blob) {
                    console.warn("Failed to create blob");
                    return;
                }
                
                onFrameCaptured(blob);
            }, "image/jpeg", 0.8);
        };

        const interval = setInterval(() => {
            for (let i = 0; i < framesPerInterval; i++) {
                setTimeout(captureFrame, i * (1000 / framesPerInterval));
            }
        }, intervalMs);

        return () => {
            clearInterval(interval);
        };
    }, [videoRef, width, height, intervalMs, framesPerInterval, onFrameCaptured]);
};