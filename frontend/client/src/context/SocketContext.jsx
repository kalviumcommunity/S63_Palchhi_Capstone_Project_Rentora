import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const socketInstance = io(import.meta.env.VITE_API_URL || 'http://localhost:8000', {
      withCredentials: true,
      transports: ['websocket'],
      autoConnect: true
    });

    socketInstance.on('connect', () => {
      console.log('Socket connected');
      setConnected(true);
    });

    socketInstance.on('disconnect', () => {
      console.log('Socket disconnected');
      setConnected(false);
    });

    socketInstance.on('error', (error) => {
      console.error('Socket error:', error);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  const value = {
    socket,
    connected,
    joinChat: (chatId) => {
      if (socket && connected) {
        socket.emit('join_chat', chatId);
      }
    },
    leaveChat: (chatId) => {
      if (socket && connected) {
        socket.emit('leave_chat', chatId);
      }
    },
    sendMessage: (chatId, content) => {
      if (socket && connected && user) {
        const messageData = {
          chatId,
          content,
          timestamp: new Date(),
          sender: user._id,
          read: false
        };
        
        socket.emit('send_message', { chatId, content });
        socket.emit('receive_message', {
          chatId,
          message: messageData
        });
      }
    },
    startTyping: (chatId) => {
      if (socket && connected) {
        socket.emit('typing', { chatId });
      }
    },
    stopTyping: (chatId) => {
      if (socket && connected) {
        socket.emit('stop_typing', { chatId });
      }
    }
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};