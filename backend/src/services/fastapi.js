import axios from 'axios';
import { FASTAPI_URL } from '../config/env.js';

export async function processFrame(frameBase64, timestamp, studentId) {
    try {
        const response = await axios.post(
            `${FASTAPI_URL}/process_frame`,
            {
                frameBase64,
                timestamp,
                studentId
            },
            {
                timeout: 5000,
            }
        );

        return response.data;

    } catch (error) {
        console.error('Error sending frame to FastAPI:', error.message);

        throw error;
    }
}