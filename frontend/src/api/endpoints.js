import { BACKEND_URL } from "../config/env";

const SESSION_ID = 6;
const API_BASE = `${BACKEND_URL}/api`;

const ENDPOINTS = {
  STUDENT: {
    FRAME: `${API_BASE}/student/frame`,
  },
  SCORE: {
    AVERAGE: `${API_BASE}/score/average-score?sessionId=${SESSION_ID}`,
  },
  AUTH: {
    GUEST_LOGIN: `${API_BASE}/auth/guest-login`,
  },
  SOCKET: {
    MAIN: BACKEND_URL,
  },
};

export default ENDPOINTS;