import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaArrowLeft, FaPaperPlane, FaTrash, FaHome } from 'react-icons/fa';
import { getChatById, sendMessage, markMessagesAsRead, deleteChat } from '../../api/chatApi';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import Loader from '../common/Loader';
import '../../styles/Chat.css';

const ChatRoom = ({ chatId }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { socket, connected, joinChat, leaveChat, sendMessage: socketSendMessage, startTyping, stopTyping } = useSocket();
  
  const [chat, setChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sending, setSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState(null);
  
  const messagesEndRef = useRef(null);
  const messageInputRef = useRef(null);
  

  useEffect(() => {
    const fetchChat = async () => {
      try {
        setLoading(true);
        const response = await getChatById(chatId);
        
        if (response.success) {
          setChat(response.data);
          setMessages(response.data.messages);
        } else {
          setError('Failed to load chat');
        }
      } catch (err) {
        setError('Error loading chat: ' + (err.message || 'Unknown error'));
      } finally {
        setLoading(false);
      }
    };
    
    fetchChat();
  }, [chatId]);
  
  
  useEffect(() => {
    if (connected && chatId) {
      joinChat(chatId);
      
    
      markMessagesAsRead(chatId).catch(err => {
        console.error('Error marking messages as read:', err);
      });
    }
    
    return () => {
      if (connected && chatId) {
        leaveChat(chatId);
      }
    };
  }, [connected, chatId, joinChat, leaveChat]);

  useEffect(() => {
    if (!socket) return;
    
    const handleNewMessage = (data) => {
      if (data.chatId === chatId) {

        const messageExists = messages.some(msg => 
          msg.content === data.message.content && 
          msg.sender === data.message.sender &&
          new Date(msg.timestamp).getTime() === new Date(data.message.timestamp).getTime()
        );
        
        if (!messageExists) {
          setMessages(prev => [...prev, data.message]);
        }
        
       
        if (data.message.sender !== user._id) {
          markMessagesAsRead(chatId).catch(err => {
            console.error('Error marking messages as read:', err);
          });
        }
      }
    };
    
    const handleTyping = (data) => {
      if (data.chatId === chatId && data.userId !== user._id) {
        setIsTyping(true);
      }
    };
    
    const handleStopTyping = (data) => {
      if (data.chatId === chatId && data.userId !== user._id) {
        setIsTyping(false);
      }
    };
    

    const handleChatUpdated = (data) => {
      if (data.chatId === chatId) {
     
        getChatById(chatId)
          .then(response => {
            if (response.success) {
              setChat(response.data);
              setMessages(response.data.messages);
            }
          })
          .catch(err => {
            console.error('Error refreshing chat:', err);
          });
      }
    };
    
    socket.on('receive_message', handleNewMessage);
    socket.on('chat_updated', handleChatUpdated);
    socket.on('user_typing', handleTyping);
    socket.on('user_stop_typing', handleStopTyping);
    
    return () => {
      socket.off('receive_message', handleNewMessage);
      socket.off('chat_updated', handleChatUpdated);
      socket.off('user_typing', handleTyping);
      socket.off('user_stop_typing', handleStopTyping);
    };
  }, [socket, chatId, user._id, messages]);
  

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
 
  const handleMessageChange = (e) => {
    setNewMessage(e.target.value);

    startTyping(chatId);
    

    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }

    const timeout = setTimeout(() => {
      stopTyping(chatId);
    }, 2000);
    
    setTypingTimeout(timeout);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim()) return;
    
    try {
      setSending(true);
      
  
      const response = await sendMessage(chatId, newMessage.trim());
      
    
      socketSendMessage(chatId, newMessage.trim());
      
   
      if (response && response.success && response.data) {
        setMessages(prev => [...prev, response.data]);
      } else {

        const tempMessage = {
          _id: Date.now().toString(), 
          sender: user._id,
          content: newMessage.trim(),
          timestamp: new Date(),
          read: false
        };
        setMessages(prev => [...prev, tempMessage]);
      }
      
   
      setNewMessage('');
      messageInputRef.current?.focus();
      
  
      stopTyping(chatId);
      if (typingTimeout) {
        clearTimeout(typingTimeout);
      }
    } catch (err) {
      console.error('Error sending message:', err);
      alert('Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };
  

  const handleDeleteChat = async () => {
    if (window.confirm('Are you sure you want to delete this conversation? This action cannot be undone.')) {
      try {
        const response = await deleteChat(chatId);
        
        if (response.success) {
          navigate('/chats');
        } else {
          alert('Failed to delete conversation. Please try again.');
        }
      } catch (err) {
        console.error('Error deleting chat:', err);
        alert('Error deleting conversation: ' + (err.message || 'Unknown error'));
      }
    }
  };
  

  const formatMessageTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
 
  const formatMessageDate = (timestamp) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' });
    }
  };
  

  const groupMessagesByDate = () => {
    const groups = {};
    
    messages.forEach(message => {
      const date = new Date(message.timestamp).toDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
    });
    
    return Object.entries(groups).map(([date, messages]) => ({
      date,
      messages
    }));
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
      <div className="chat-room-loading">
        <Loader />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="chat-room-error">
        <p>{error}</p>
        <button onClick={() => navigate('/chats')}>Back to Chats</button>
      </div>
    );
  }
  
  if (!chat) {
    return (
      <div className="chat-room-not-found">
        <h3>Chat not found</h3>
        <button onClick={() => navigate('/chats')}>Back to Chats</button>
      </div>
    );
  }

  const otherParticipant = chat.participants.find(
    participant => participant._id !== user._id
  );
  
  return (
    <div className="chat-room-container">
      <div className="chat-room-header">
        <button className="back-button" onClick={() => navigate('/chats')}>
          <FaArrowLeft />
        </button>
        
        <div className="chat-room-user">
          <img 
            src={otherParticipant.avatar || '/default-avatar.png'} 
            alt={otherParticipant.name}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = '/default-avatar.png';
            }}
          />
          <div>
            <h3>{otherParticipant.name}</h3>
            {isTyping && <p className="typing-indicator">typing...</p>}
          </div>
        </div>
        
        <button className="delete-chat-button" onClick={handleDeleteChat}>
          <FaTrash />
        </button>
      </div>
      
      <div className="chat-room-property">
        <Link to={`/property/${chat.listing._id}`} className="property-link">
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
          <div>
            <h4>{chat.listing.title}</h4>
            <p>₹{chat.listing.price.toLocaleString()}{chat.listing.propertyType === 'rent' ? '/month' : ''}</p>
            <p>{chat.listing.location.city}, {chat.listing.location.state}</p>
          </div>
          <FaHome className="property-icon" />
        </Link>
      </div>
      
      <div className="chat-room-messages">
        {groupMessagesByDate().map((group, groupIndex) => (
          <div key={groupIndex} className="message-group">
            <div className="message-date">
              <span>{formatMessageDate(group.messages[0].timestamp)}</span>
            </div>
            
            {group.messages.map((message, messageIndex) => (
              <div 
                key={messageIndex} 
                className={`message ${message.sender === user._id ? 'sent' : 'received'}`}
              >
                <div className="message-content">
                  <p>{message.content}</p>
                  <span className="message-time">
                    {formatMessageTime(message.timestamp)}
                    {message.sender === user._id && (
                      <span className={`message-status ${message.read ? 'read' : 'delivered'}`}>
                        {message.read ? '✓✓' : '✓'}
                      </span>
                    )}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ))}
        
        <div ref={messagesEndRef} />
      </div>
      
      <form className="chat-room-input" onSubmit={handleSubmit}>
        <input
          type="text"
          value={newMessage}
          onChange={handleMessageChange}
          placeholder="Type a message..."
          disabled={sending}
          ref={messageInputRef}
        />
        <button type="submit" disabled={!newMessage.trim() || sending}>
          <FaPaperPlane />
        </button>
      </form>
    </div>
  );
};

export default ChatRoom;