import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaComments } from 'react-icons/fa';
import { createChat } from '../../api/chatApi';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

const ChatButton = ({ listingId, ownerId, ownerName }) => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();

  const handleStartChat = async () => {
    if (!isAuthenticated) {
      toast.info('Please log in to start a chat');
      navigate('/login', { state: { from: location.pathname } });
      return;
    }

    if (!listingId || !ownerId) {
      console.error('Missing required props:', { listingId, ownerId });
      toast.error('Cannot start chat: Missing property information');
      return;
    }

    if (user._id === ownerId) {
      toast.info('This is your own listing');
      return;
    }

    try {
      setLoading(true);
      console.log('Starting chat with:', { listingId, ownerId, user: user._id });
      
      const response = await createChat(
        listingId.toString(), 
        ownerId.toString()  // This is the receiverId (owner of the listing)
      );
      
      console.log('Chat creation response:', response);
      
      if (response && response.success) {
        toast.success(`Chat started with ${ownerName}`);
        // Navigate to the chat page with the chat ID
        navigate(`/chat/${response.data._id}`);
      } else {
        toast.error(response?.message || 'Failed to start chat');
      }
    } catch (error) {
      console.error('Error starting chat:', error);
      toast.error(`Error starting chat: ${error.message || 'Please try again'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button 
      className="chat-button"
      onClick={handleStartChat}
      disabled={loading}
    >
      <FaComments /> {loading ? 'Starting chat...' : 'Chat with Owner'}
    </button>
  );
};

export default ChatButton;