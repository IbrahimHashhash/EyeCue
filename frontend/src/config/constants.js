export const FRAME_SETTINGS = {
  width: 640,
  height: 480,
  intervalMs: 10000,    
  framesPerInterval: 1,  
};

export const SOCKET_SETTINGS = {
  transports: ["websocket", "polling"],
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
};

export const AUTH_CONSTANTS = {
  STORAGE_KEY: "user",
  ROUTES: {
    TEACHER: "/dashboard",
    STUDENT: "/camera-capture",
  },
  ROLES: {
    TEACHER: "teacher",
    STUDENT: "student",
  },
};

export const FORM_DEFAULTS = {
  name: "",
  role: "student",
};

export const STORAGE_KEY = 'sessionId';