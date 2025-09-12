import { FASTAPI_URL } from "../config/env.js";

const API_BASE = `${FASTAPI_URL}/api`;

export const ENDPOINTS = {
  ATTENTION_ANALYZE: `${API_BASE}/attention/analyze`,
  START: `${API_BASE}/session/start`,
  END: `${API_BASE}/session/end`,
  GENERATE_REPORT: `${API_BASE}/session/report`,
};

export default ENDPOINTS;