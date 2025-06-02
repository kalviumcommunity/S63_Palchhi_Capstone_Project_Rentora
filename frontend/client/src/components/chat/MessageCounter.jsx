import React, { useState, useEffect } from 'react';
import { useSocket } from '../../context/SocketContext';
import { getUserChats } from '../../api/chatApi';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

const MessageCounter = () => {
  const [unreadCount, setUnreadCount] = useState(0);
  const { socket, connected } = useSocket();
  const { user } = useAuth();

  const fetchUnreadCount = async () => {
    try {
      const response = await getUserChats();
      if (response.success) {
        const totalUnread = response.data.reduce((sum, chat) => sum + (chat.unreadCount || 0), 0);
        setUnreadCount(totalUnread);
      }
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchUnreadCount();
    }
  }, [user]);

  useEffect(() => {
    if (!socket || !connected) return;

    const handleNewMessage = () => {
      fetchUnreadCount();
    };

    const handleChatUpdated = (data) => {
      if (data.type === 'read_status') {
        fetchUnreadCount();
      }
    };

    const handleMessagesRead = () => {
      fetchUnreadCount();
    };

    socket.on('receive_message', handleNewMessage);
    socket.on('chat_updated', handleChatUpdated);
    socket.on('messages_read', handleMessagesRead);

    return () => {
      socket.off('receive_message', handleNewMessage);
      socket.off('chat_updated', handleChatUpdated);
      socket.off('messages_read', handleMessagesRead);
    };
  }, [socket, connected]);

  // If socket is not available, just show the count without real-time updates
  if (!socket) {
    return (
      <AnimatePresence>
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            className="message-badge"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </motion.span>
        )}
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence>
      {unreadCount > 0 && (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0 }}
          className="message-badge"
        >
          {unreadCount > 9 ? '9+' : unreadCount}
        </motion.span>
      )}
    </AnimatePresence>
  );
};

export default MessageCounter; 