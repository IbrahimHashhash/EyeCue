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
  SESSION: {
    START: `${API_BASE}/session/start`,
    END: `${API_BASE}/session/end`,
    REPORT: `${API_BASE}/session/report`,
    DOWNLOAD_PDF: `${API_BASE}/session/download-pdf`,
  },
};

export default ENDPOINTS;