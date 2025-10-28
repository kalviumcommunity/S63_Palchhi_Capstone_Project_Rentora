import axiosInstance from '../utils/axiosConfig';

export const createChat = async (participantId) => {
  try {
    const response = await axiosInstance.post('/chats', {
      participantId
    });
    return response.data;
  } catch (error) {
    console.error('Error creating chat:', error);
    throw error;
  }
};

export const getUserChats = async (page = 1, limit = 10) => {
  try {
    const response = await axiosInstance.get(`/chats?page=${page}&limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user chats:', error);
    throw error;
  }
};

export const getChatById = async (chatId) => {
  try {
    const response = await axiosInstance.get(`/chats/${chatId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching chat:', error);
    throw error;
  }
};

export const getChatMessages = async (chatId, page = 1, limit = 50) => {
  try {
    const response = await axiosInstance.get(`/chats/${chatId}/messages?page=${page}&limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching chat messages:', error);
    throw error;
  }
};

export const sendMessage = async (chatId, content) => {
  try {
    const response = await axiosInstance.post(`/chats/${chatId}/messages`, { content });
    return response.data;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

export const markChatAsRead = async (chatId) => {
  try {
    const response = await axiosInstance.put(`/chats/${chatId}/read`);
    return response.data;
  } catch (error) {
    console.error('Error marking chat as read:', error);
    throw error;
  }
};

export const deleteChat = async (chatId) => {
  try {
    const response = await axiosInstance.delete(`/chats/${chatId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting chat:', error);
    throw error;
  }
};
