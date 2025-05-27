import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const { user, token } = useAuth();

  useEffect(() => {
 
    if (user && token) {
      
      const socketInstance = io(import.meta.env.VITE_API_URL || 'http://localhost:8000', {
        auth: {
          token
        }
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
        console.error('Socket connection error:', error.message);
        setConnected(false);
      });

      
      setSocket(socketInstance);

      
      return () => {
        socketInstance.disconnect();
      };
    }

    return () => {
    
    };
  }, [user, token]);

  
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
      if (socket && connected) {
        
        const messageData = {
          chatId,
          content,
          timestamp: new Date(),
          sender: user.id,
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