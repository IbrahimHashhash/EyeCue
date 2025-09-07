export const FRAME_SETTINGS = {
  width: 640,
  height: 480,
  intervalMs: 1000,    
  framesPerInterval: 1,  
};

export const SOCKET_SETTINGS = {
  transports: ["websocket", "polling"],
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
};