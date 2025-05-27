import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getUserChats } from '../../api/chatApi';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import Loader from '../common/Loader';
import '../../styles/Chat.css';

const ChatList = () => {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const { socket, connected } = useSocket();

  const fetchChats = async () => {
    try {
      setLoading(true);
      const response = await getUserChats();
      if (response.success) {
        setChats(response.data);
      } else {
        setError('Failed to load chats');
      }
    } catch (err) {
      setError('Error loading chats: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchChats();
  }, []);

  
  useEffect(() => {
    if (!socket || !connected) return;

  
    const handleNewMessage = (data) => {
      console.log('New message received in ChatList:', data);
      
      fetchChats();
    };

    
    const handleChatUpdated = (data) => {
      console.log('Chat updated in ChatList:', data);
      
      fetchChats();
    };

    
    socket.on('receive_message', handleNewMessage);
    
    
    socket.on('chat_updated', handleChatUpdated);
    
    return () => {
      socket.off('receive_message', handleNewMessage);
      socket.off('chat_updated', handleChatUpdated);
    };
  }, [socket, connected]);
  
  
  useEffect(() => {
    if (socket && connected && user && user._id) {
  
      socket.emit('join_personal_room', user._id);
      
      return () => {
        
        socket.emit('leave_personal_room', user._id);
      };
    }
  }, [socket, connected, user]);

  
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
    
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {

      return 'Yesterday';
    } else if (diffDays < 7) {
   
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {

      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };


  const formatImageUrl = (imagePath) => {
    if (!imagePath) return '/default-property.png';
    
    if (imagePath.startsWith('http')) {
      return imagePath;
    } else {
      const normalizedPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
      return `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}${normalizedPath}`;
    }
  };

  if (loading) {
    return (
      <div className="chat-list-loading">
        <Loader />
      </div>
    );
  }

  if (error) {
    return (
      <div className="chat-list-error">
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  if (chats.length === 0) {
    return (
      <div className="chat-list-empty">
        <h3>No conversations yet</h3>
        <p>Start browsing properties to chat with sellers or buyers</p>
        <Link to="/properties" className="browse-properties-btn">Browse Properties</Link>
      </div>
    );
  }

  return (
    <div className="chat-list-container">
      <h2>Your Conversations</h2>
      <div className="chat-list">
        {chats.map((chat) => (
          <Link 
            to={`/chat/${chat._id}`} 
            key={chat._id} 
            className={`chat-item ${chat.unreadCount > 0 ? 'unread' : ''}`}
          >
            <div className="chat-item-avatar">
              <img 
                src={chat.otherParticipant.avatar || '/default-avatar.png'} 
                alt={chat.otherParticipant.name} 
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/default-avatar.png';
                }}
              />
              {chat.unreadCount > 0 && (
                <span className="unread-badge">{chat.unreadCount}</span>
              )}
            </div>
            
            <div className="chat-item-content">
              <div className="chat-item-header">
                <h4>{chat.otherParticipant.name}</h4>
                <span className="chat-time">
                  {chat.lastMessage ? formatTime(chat.lastMessage.timestamp) : ''}
                </span>
              </div>
              
              <div className="chat-item-property">
                <img 
                  src={chat.listing.images && chat.listing.images.length > 0 
                    ? formatImageUrl(chat.listing.images[0]) 
                    : '/default-property.png'
                  } 
                  alt={chat.listing.title}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/default-property.png';
                  }}
                />
                <span>{chat.listing.title}</span>
              </div>
              
              {chat.lastMessage && (
                <p className="chat-last-message">
                  {chat.lastMessage.sender === user.id ? 'You: ' : ''}
                  {chat.lastMessage.content.length > 40 
                    ? chat.lastMessage.content.substring(0, 40) + '...' 
                    : chat.lastMessage.content
                  }
                </p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default ChatList;