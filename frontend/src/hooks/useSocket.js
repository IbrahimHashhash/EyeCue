import { useEffect, useRef } from "react";
import { io } from "socket.io-client";
import ENDPOINTS from "../api/endpoints";
import { SOCKET_SETTINGS } from "../config/constants";

export const useSocket = (onAttentionUpdate, endpointKey = ENDPOINTS.SOCKET.MAIN) => {
    const socketRef = useRef(null);

    useEffect(() => {
        if (!endpointKey) {
            console.error(`Invalid endpoint: ${endpointKey}`);
            return;
        }

        socketRef.current = io(endpointKey, SOCKET_SETTINGS);

        const socket = socketRef.current;

        socket.on("connect", () => {
            console.log("Connected to WebSocket server:", socket.id);
        });

        socket.on("disconnect", (reason) => {
            console.log("Disconnected from WebSocket server:", reason);
        });

        socket.on("connect_error", (error) => {
            console.error("WebSocket connection error:", error);
        });

        socket.on("attentionUpdate", (data) => {
            console.log("Received attention update:", data);
            if (onAttentionUpdate) onAttentionUpdate(data);
        });

        return () => {
            if (socket) socket.disconnect();
        };
    }, [onAttentionUpdate, endpointKey]);

    return socketRef.current;
};
