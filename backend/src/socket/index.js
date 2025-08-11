import { Server } from 'socket.io'; 

let io;  

export function init(server) {
  io = new Server(server, {
    cors: {
      origin: '*',  
      methods: ['GET', 'POST']
    }
  });

  io.on('connection', (socket) => {   
    console.log('New client connected:', socket.id);

    socket.on('disconnect', () => {  
      console.log('Client disconnected:', socket.id);
    });
  });
}

export function getIO() {   
  if (!io) {
    throw new Error('Socket.io not initialized!');
  }
  
  return io;
}