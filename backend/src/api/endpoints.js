import { FASTAPI_URL } from "../config/env.js";

const API_BASE = `${FASTAPI_URL}/api`;

export const ENDPOINTS = {
  ATTENTION_ANALYZE: `${API_BASE}/attention/analyze`,
};
export const SESSION_ENDPOINTS = {
  START: `${API_BASE}/session/start`,
  END: `${API_BASE}/session/end`,
};

export default ENDPOINTS;
