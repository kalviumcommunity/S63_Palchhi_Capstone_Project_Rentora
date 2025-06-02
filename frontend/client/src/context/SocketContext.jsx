import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { API_URL } from '../config';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    // Return a default context instead of throwing an error
    return {
      socket: null,
      connected: false,
      joinChat: () => {},
      leaveChat: () => {},
      sendMessage: () => {},
      startTyping: () => {},
      stopTyping: () => {}
    };
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return; // Don't connect if no user is logged in

    const socketInstance = io(API_URL, {
      withCredentials: true,
      transports: ['websocket'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });

    socketInstance.on('connect', () => {
      console.log('Socket connected');
      setConnected(true);
    });

    socketInstance.on('disconnect', () => {
      console.log('Socket disconnected');
      setConnected(false);
    });

    socketInstance.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      setConnected(false);
    });

    socketInstance.on('error', (error) => {
      console.error('Socket error:', error);
    });

    setSocket(socketInstance);

    return () => {
      if (socketInstance) {
        socketInstance.disconnect();
      }
    };
  }, [user]);

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