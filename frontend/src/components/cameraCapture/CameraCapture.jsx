import { useEffect, useRef, useState } from "react";
import "./styles/CameraCapture.css"
const API = process.env.REACT_APP_API_URL || "";

const CameraCapture = () => {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [failedFrames, setFailedFrames] = useState([]);

    useEffect(() => {
        const startCamera = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: "user" },
                });
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
            } catch (err) {
                console.error("Camera access error:", err);
            }
        };
        startCamera();
    }, []);

    useEffect(() => {
        const captureFrame = async () => {
            if (!videoRef.current || !canvasRef.current) return;
            const video = videoRef.current;
            const canvas = canvasRef.current;
            const context = canvas.getContext("2d");

            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            context.drawImage(video, 0, 0, canvas.width, canvas.height);

            const frame = canvas.toDataURL("image/jpeg");

            try {
                if (API) {
                    const response = await fetch(API, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ image: frame }),
                    });
                    if (!response.ok) throw new Error("Server error");
                    console.log("Frame sent to API");
                } else {
                    throw new Error("No API set");
                }
            } catch (err) {
                console.warn("API failed. Frame stored in memory.");
                setFailedFrames((prev) => [...prev, frame]);
            }
        };

        const interval = setInterval(() => {
            // Capture 4 frames, 1 per second
            for (let i = 0; i < 4; i++) {
                setTimeout(captureFrame, i * 1000); // Delay each capture by 1s
            }
        }, 30000); // Every 30 seconds

        return () => clearInterval(interval);
    }, []);

    const downloadFrames = () => {
        failedFrames.forEach((frame, index) => {
            const link = document.createElement("a");
            link.href = frame;
            link.download = `frame_${index + 1}.jpg`;
            link.click();
        });
    };

    return (
        <div className="container">
            <h2>Live Camera Feed</h2>
            <div className="video-wrapper">
                <video ref={videoRef} autoPlay playsInline muted />
                <canvas ref={canvasRef} style={{ display: "none" }} />
            </div>
            <p>Stored frames (in-memory): {failedFrames.length}</p>
            {failedFrames.length > 0 && (
                <button onClick={downloadFrames}>Download Stored Frames</button>
            )}
        </div>
    );
};

export default CameraCapture;
