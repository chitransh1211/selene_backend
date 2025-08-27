import { Server } from 'socket.io';

let io;
const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CORS_ORIGIN, // Frontend origin
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    console.log(`New client connected: ${socket.id}`);
    
    socket.on('disconnect', (reason) => {
      console.log(`Client disconnected: ${socket.id}, reason: ${reason}`);
    });
  });
};

const emitNotification = (event, data) => {
  if (io) {
    io.emit(event, data);
    console.log(`Emitted ${event}:`, data);
  } else {
    console.error('Socket.io is not initialized');
  }
};

export { io, initializeSocket, emitNotification };
