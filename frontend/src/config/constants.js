export const FRAME_SETTINGS = {
  width: 640,
  height: 480,
  intervalMs: 10000,    
  framesPerInterval: 4,  
};

export const SOCKET_SETTINGS = {
  transports: ["websocket", "polling"],
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
};
