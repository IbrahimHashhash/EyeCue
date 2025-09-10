import { BACKEND_URL } from "../config/env";

const API_BASE = `${BACKEND_URL}/api`;

const ENDPOINTS = {
  STUDENT: {
    FRAME: `${API_BASE}/student/frame`,
  },
  AUTH: {
    GUEST_LOGIN: `${API_BASE}/auth/guest-login`,
  },
  SOCKET: {
    MAIN: BACKEND_URL,
  },
};

export default ENDPOINTS;