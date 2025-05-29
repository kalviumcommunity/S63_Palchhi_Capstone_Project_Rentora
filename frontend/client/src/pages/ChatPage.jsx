import React from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import ChatList from '../components/chat/ChatList';
import ChatRoom from '../components/chat/ChatRoom';
import '../styles/Chat.css';

const ChatPage = () => {
  const { chatId } = useParams();

  return (
    <div className="chat-page">
      <Navbar />
      
      <div className="chat-container">
        {chatId ? (
          <ChatRoom chatId={chatId} />
        ) : (
          <ChatList />
        )}
      </div>
    </div>
  );
};

export default ChatPage;