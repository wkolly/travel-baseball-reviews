import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { ChatMessage } from '@travel-baseball/shared';
import { useAuth } from '@/contexts/AuthContext';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001';

interface UseSocketReturn {
  socket: Socket | null;
  isConnected: boolean;
  joinRoom: (roomId: string) => void;
  leaveRoom: (roomId: string) => void;
  sendMessage: (roomId: string, message: string) => void;
  onNewMessage: (callback: (message: ChatMessage) => void) => void;
  onUserJoined: (callback: (data: { userId: string; userName: string; roomId: string }) => void) => void;
  onUserLeft: (callback: (data: { userId: string; userName: string; roomId: string }) => void) => void;
}

export const useSocket = (): UseSocketReturn => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { token, isAuthenticated } = useAuth();
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  useEffect(() => {
    if (!isAuthenticated || !token) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setIsConnected(false);
      }
      return;
    }

    const newSocket = io(SOCKET_URL, {
      auth: {
        token
      },
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: maxReconnectAttempts,
      reconnectionDelay: 1000,
    });

    // Connection event handlers
    newSocket.on('connect', () => {
      console.log('🔗 Connected to socket server');
      setIsConnected(true);
      reconnectAttempts.current = 0;
    });

    newSocket.on('disconnect', (reason) => {
      console.log('❌ Disconnected from socket server:', reason);
      setIsConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      setIsConnected(false);
      
      reconnectAttempts.current += 1;
      if (reconnectAttempts.current >= maxReconnectAttempts) {
        console.error('Max reconnection attempts reached');
        newSocket.disconnect();
      }
    });

    newSocket.on('error', (error) => {
      console.error('Socket error:', error);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
      setSocket(null);
      setIsConnected(false);
    };
  }, [token, isAuthenticated]);

  const joinRoom = (roomId: string) => {
    if (socket && isConnected) {
      socket.emit('join-room', roomId);
    }
  };

  const leaveRoom = (roomId: string) => {
    if (socket && isConnected) {
      socket.emit('leave-room', roomId);
    }
  };

  const sendMessage = (roomId: string, message: string) => {
    if (socket && isConnected) {
      socket.emit('send-message', { roomId, message });
    }
  };

  const onNewMessage = (callback: (message: ChatMessage) => void) => {
    if (socket) {
      socket.on('new-message', callback);
      return () => socket.off('new-message', callback);
    }
  };

  const onUserJoined = (callback: (data: { userId: string; userName: string; roomId: string }) => void) => {
    if (socket) {
      socket.on('user-joined', callback);
      return () => socket.off('user-joined', callback);
    }
  };

  const onUserLeft = (callback: (data: { userId: string; userName: string; roomId: string }) => void) => {
    if (socket) {
      socket.on('user-left', callback);
      return () => socket.off('user-left', callback);
    }
  };

  return {
    socket,
    isConnected,
    joinRoom,
    leaveRoom,
    sendMessage,
    onNewMessage,
    onUserJoined,
    onUserLeft,
  };
};