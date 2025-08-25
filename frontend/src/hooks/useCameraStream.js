import { useEffect } from "react";

export const useCameraStream = (videoRef) => {
    useEffect(() => {
        navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } })
            .then(stream => { if (videoRef.current) videoRef.current.srcObject = stream; })
            .catch(err => { console.error("Camera access error:", err); });
    }, [videoRef]);
};
