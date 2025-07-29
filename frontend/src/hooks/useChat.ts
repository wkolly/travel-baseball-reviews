import { useState, useEffect } from 'react';
import { useQuery, useMutation } from 'react-query';
import { chatAPI } from '@/services/api';
import { useSocket } from '@/hooks/useSocket';
import { ChatMessage } from '@travel-baseball/shared';

export const useChatRooms = () => {
  return useQuery('chatRooms', chatAPI.getRooms, {
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useRoomMessages = (roomId: string) => {
  return useQuery(
    ['roomMessages', roomId],
    () => chatAPI.getRoomMessages(roomId),
    {
      enabled: !!roomId,
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );
};

export const useChat = (roomId: string) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  
  const { 
    socket, 
    isConnected, 
    joinRoom, 
    leaveRoom, 
    sendMessage,
    onNewMessage,
    onUserJoined,
    onUserLeft 
  } = useSocket();

  // Fetch initial messages
  const { data: messagesData, isLoading } = useRoomMessages(roomId);

  // Send message mutation
  const sendMessageMutation = useMutation(
    (message: string) => chatAPI.sendMessage(roomId, { message }),
    {
      onError: (error) => {
        console.error('Failed to send message:', error);
      }
    }
  );

  // Initialize messages from API
  useEffect(() => {
    if (messagesData?.data?.messages) {
      setMessages(messagesData.data.messages);
    }
  }, [messagesData]);

  // Join room when component mounts
  useEffect(() => {
    if (socket && isConnected && roomId) {
      joinRoom(roomId);
      
      return () => {
        leaveRoom(roomId);
      };
    }
  }, [socket, isConnected, roomId, joinRoom, leaveRoom]);

  // Listen for new messages
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (message: ChatMessage) => {
      if (message.roomId === roomId) {
        setMessages(prev => {
          // Avoid duplicates
          if (prev.some(m => m.id === message.id)) {
            return prev;
          }
          return [...prev, message];
        });
      }
    };

    const handleUserJoined = (data: { userId: string; userName: string; roomId: string }) => {
      if (data.roomId === roomId) {
        console.log(`${data.userName} joined the room`);
      }
    };

    const handleUserLeft = (data: { userId: string; userName: string; roomId: string }) => {
      if (data.roomId === roomId) {
        console.log(`${data.userName} left the room`);
      }
    };

    const handleTypingStart = (data: { userId: string; userName: string; roomId: string }) => {
      if (data.roomId === roomId) {
        setTypingUsers(prev => new Set([...prev, data.userName]));
      }
    };

    const handleTypingStop = (data: { userId: string; userName: string; roomId: string }) => {
      if (data.roomId === roomId) {
        setTypingUsers(prev => {
          const newSet = new Set(prev);
          newSet.delete(data.userName);
          return newSet;
        });
      }
    };

    onNewMessage(handleNewMessage);
    onUserJoined(handleUserJoined);
    onUserLeft(handleUserLeft);

    // Listen for typing events
    socket.on('user-typing-start', handleTypingStart);
    socket.on('user-typing-stop', handleTypingStop);

    return () => {
      socket.off('user-typing-start', handleTypingStart);
      socket.off('user-typing-stop', handleTypingStop);
    };
  }, [socket, roomId, onNewMessage, onUserJoined, onUserLeft]);

  const handleSendMessage = async (message: string) => {
    if (!message.trim()) return;

    // Send via socket for real-time delivery
    if (socket && isConnected) {
      sendMessage(roomId, message.trim());
    }
    
    // Also send via API for persistence
    try {
      await sendMessageMutation.mutateAsync(message.trim());
    } catch (error) {
      console.error('Failed to persist message:', error);
    }
  };

  const handleTypingStart = () => {
    if (socket && isConnected) {
      socket.emit('typing-start', { roomId });
    }
  };

  const handleTypingStop = () => {
    if (socket && isConnected) {
      socket.emit('typing-stop', { roomId });
    }
  };

  return {
    messages,
    isLoading,
    isConnected,
    typingUsers: Array.from(typingUsers),
    sendMessage: handleSendMessage,
    onTypingStart: handleTypingStart,
    onTypingStop: handleTypingStop,
    isSending: sendMessageMutation.isLoading,
  };
};