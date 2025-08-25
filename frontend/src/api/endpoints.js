import { BACKEND_URL } from "../config/env";

const API_BASE = `${BACKEND_URL}/api`;

export const ENDPOINTS = {
  STUDENT: {
    FRAME: `${API_BASE}/student/frame`,
  },
  SCORE: {
    AVERAGE: `${API_BASE}/average-score`,
  }
};

export default ENDPOINTS;