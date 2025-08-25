import { Server } from 'socket.io';
import {FE_ORIGINS} from "../config/env"
let io;

export function init(server) {
    io = new Server(server, {
        cors: {
            origin: FE_ORIGINS, 
            methods: ['GET', 'POST'],
            allowedHeaders: ['Content-Type', 'Authorization']
        },
        transports: ['websocket', 'polling']
    });

    io.on('connection', (socket) => {
        console.log('Client connected:', socket.id);

        socket.on('disconnect', (reason) => {
            console.log('Client disconnected:', socket.id, 'Reason:', reason);
        });

        socket.on('error', (error) => {
            console.error('Socket error:', error);
        });
    });

    console.log('WebSocket server initialized');
    return io;
}

export function getIO() {
    if (!io) {
        throw new Error('Socket.io not initialized. Call init() first.');
    }
    return io;
}
