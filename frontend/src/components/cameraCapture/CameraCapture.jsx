import { useEffect, useRef } from "react";
import "./cameraCapture.css";

const API = process.env.REACT_APP_API_URL || "";

const CameraCapture = () => {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    useEffect(() => {
        navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } })
            .then((stream) => {
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
            })
            .catch((err) => {
                console.error("Camera access error:", err);
            });
    }, []);
    useEffect(() => {
        const captureFrame = async () => {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            if (!video || !canvas) return;

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
                console.warn("API failed. Frame dropped.");
            }
        };

        const interval = setInterval(() => {
            for (let i = 0; i < 4; i++) {
                setTimeout(captureFrame, i * 1000);
            }
        }, 30000); 

        return () => clearInterval(interval);
    }, [videoRef, canvasRef]);

    return (
        <div className="container">
            <h2>Live Camera Feed</h2>
            <div className="video-wrapper">
                <video ref={videoRef} autoPlay playsInline muted />
                <canvas ref={canvasRef} style={{ display: "none" }} />
            </div>
        </div>
    );
};
export default CameraCapture;
