import { Server, Socket } from 'socket.io';
import { verifyToken } from '../utils/auth';
import { prisma } from '../utils/database';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

export const setupSocketHandlers = (io: Server) => {
  // Authentication middleware for socket connections
  io.use(async (socket: AuthenticatedSocket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Authentication error: No token provided'));
      }

      const decoded = verifyToken(token);
      
      // Verify user still exists
      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: { id: true, name: true, email: true }
      });

      if (!user) {
        return next(new Error('Authentication error: User not found'));
      }

      socket.userId = user.id;
      socket.user = user;
      next();
    } catch (error) {
      next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket: AuthenticatedSocket) => {
    console.log(`🔗 User ${socket.user?.name} connected (${socket.userId})`);

    // Join user to their personal room for private messages
    socket.join(`user:${socket.userId}`);

    // Handle joining chat rooms
    socket.on('join-room', async (roomId: string) => {
      try {
        // Verify room exists
        const room = await prisma.chatRoom.findUnique({
          where: { id: roomId }
        });

        if (!room) {
          socket.emit('error', { message: 'Chat room not found' });
          return;
        }

        socket.join(roomId);
        
        // Notify other users in the room
        socket.to(roomId).emit('user-joined', {
          userId: socket.userId,
          userName: socket.user?.name,
          roomId
        });

        console.log(`👥 User ${socket.user?.name} joined room ${room.name}`);
      } catch (error) {
        console.error('Error joining room:', error);
        socket.emit('error', { message: 'Failed to join room' });
      }
    });

    // Handle leaving chat rooms
    socket.on('leave-room', async (roomId: string) => {
      try {
        socket.leave(roomId);
        
        // Notify other users in the room
        socket.to(roomId).emit('user-left', {
          userId: socket.userId,
          userName: socket.user?.name,
          roomId
        });

        console.log(`👋 User ${socket.user?.name} left room ${roomId}`);
      } catch (error) {
        console.error('Error leaving room:', error);
      }
    });

    // Handle sending messages
    socket.on('send-message', async (data: { roomId: string; message: string }) => {
      try {
        const { roomId, message } = data;

        if (!message || message.trim().length === 0) {
          socket.emit('error', { message: 'Message cannot be empty' });
          return;
        }

        if (message.length > 1000) {
          socket.emit('error', { message: 'Message too long' });
          return;
        }

        // Verify room exists and user is a member
        const room = await prisma.chatRoom.findUnique({
          where: { id: roomId }
        });

        if (!room) {
          socket.emit('error', { message: 'Chat room not found' });
          return;
        }

        // Save message to database
        const chatMessage = await prisma.chatMessage.create({
          data: {
            message: message.trim(),
            roomId,
            userId: socket.userId!
          },
          include: {
            user: {
              select: {
                id: true,
                name: true
              }
            },
            room: {
              select: {
                id: true,
                name: true,
                type: true
              }
            }
          }
        });

        // Emit message to all users in the room
        io.to(roomId).emit('new-message', chatMessage);

        console.log(`💬 Message sent in ${room.name} by ${socket.user?.name}`);
      } catch (error) {
        console.error('Error sending message:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Handle typing indicators
    socket.on('typing-start', (data: { roomId: string }) => {
      socket.to(data.roomId).emit('user-typing-start', {
        userId: socket.userId,
        userName: socket.user?.name,
        roomId: data.roomId
      });
    });

    socket.on('typing-stop', (data: { roomId: string }) => {
      socket.to(data.roomId).emit('user-typing-stop', {
        userId: socket.userId,
        userName: socket.user?.name,
        roomId: data.roomId
      });
    });

    // Handle disconnection
    socket.on('disconnect', (reason) => {
      console.log(`❌ User ${socket.user?.name} disconnected: ${reason}`);
      
      // Notify all rooms the user was in
      socket.rooms.forEach(roomId => {
        if (roomId !== socket.id && !roomId.startsWith('user:')) {
          socket.to(roomId).emit('user-left', {
            userId: socket.userId,
            userName: socket.user?.name,
            roomId
          });
        }
      });
    });

    // Handle connection errors
    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });
  });

  // Handle server errors
  io.engine.on('connection_error', (err) => {
    console.error('Socket.io connection error:', err);
  });
};