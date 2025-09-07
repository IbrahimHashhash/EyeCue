import { BACKEND_URL } from "../config/env";
import { SESSION_ID } from "../mocks/ids.js"

const API_BASE = `${BACKEND_URL}/api`;

const ENDPOINTS = {
  STUDENT: {
    FRAME: `${API_BASE}/student/frame`,
  },
  SCORE: {
    AVERAGE: `${API_BASE}/score/average-score?sessionId=${SESSION_ID}`,
  },
  SOCKET: {
    MAIN: BACKEND_URL,
  },
};

export default ENDPOINTS;
