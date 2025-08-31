import axios from "axios";
import {ENDPOINTS} from "../api/endpoints.js"
export async function processFrame(frameBase64, studentId, timestamp) {
  try {
    const currentTimestamp = timestamp || new Date().toISOString();
    console.log("Sending to FastAPI:", {
      endpoint: ENDPOINTS.ATTENTION.ANALYZE,
      studentId,
      frameDataLength: frameBase64.length,
      timestamp: currentTimestamp,
    });

    const response = await axios.post(
      ENDPOINTS.ATTENTION.ANALYZE,
      {
        studentId,
        frameBase64,
        timestamp: currentTimestamp,
      },
      {
        timeout: 10000,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    console.log("FastAPI response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error sending frame to FastAPI:", {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
    });
    throw error;
  }
}
