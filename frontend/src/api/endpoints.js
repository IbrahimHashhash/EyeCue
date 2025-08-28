import { BACKEND_URL } from "../config/env";

const API_BASE = `${BACKEND_URL}/api`;

const ENDPOINTS = {
  STUDENT: {
    FRAME: `${API_BASE}/student/frame`,
  },
  SCORE: {
    AVERAGE: `${API_BASE}/score/average-score`,
  },
  SOCKET: {
    MAIN: BACKEND_URL,
  },
};

export default ENDPOINTS;
