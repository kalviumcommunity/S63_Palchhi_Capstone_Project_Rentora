import axiosInstance from '../utils/axiosConfig';

export const createChat = async (listingId, receiverId) => {
  try {
    const response = await axiosInstance.post('/api/chats', {
      listingId,
      receiverId
    });
    return {
      success: true,
      data: response.data.data
    };
  } catch (error) {
    console.error('Error creating chat:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to create chat'
    };
  }
};

export const getChats = async (page = 1, limit = 20) => {
  try {
    const response = await axiosInstance.get(`/api/chats?page=${page}&limit=${limit}`);
    return {
      success: true,
      data: response.data.data
    };
  } catch (error) {
    console.error('Error fetching chats:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to fetch chats'
    };
  }
};

// Alias for getChats to maintain compatibility with existing code
export const getUserChats = getChats;

export const getChatById = async (chatId) => {
  try {
    const response = await axiosInstance.get(`/api/chats/${chatId}`);
    return {
      success: true,
      data: response.data.data
    };
  } catch (error) {
    console.error('Error fetching chat:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to fetch chat'
    };
  }
};

export const getChatMessages = async (chatId, page = 1, limit = 50) => {
  try {
    const response = await axiosInstance.get(`/api/chats/${chatId}/messages?page=${page}&limit=${limit}`);
    return {
      success: true,
      messages: response.data.messages,
      total: response.data.total,
      currentPage: response.data.currentPage,
      totalPages: response.data.totalPages
    };
  } catch (error) {
    console.error('Error fetching chat messages:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to fetch chat messages'
    };
  }
};

export const sendMessage = async (chatId, content) => {
  try {
    const response = await axiosInstance.post(`/api/chats/${chatId}/messages`, { content });
    return {
      success: true,
      data: response.data.data
    };
  } catch (error) {
    console.error('Error sending message:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to send message'
    };
  }
};

export const markMessagesAsRead = async (chatId) => {
  try {
    const response = await axiosInstance.put(`/api/chats/${chatId}/read`);
    return {
      success: true,
      data: response.data.data
    };
  } catch (error) {
    console.error('Error marking messages as read:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to mark messages as read'
    };
  }
};

export const deleteChat = async (chatId) => {
  try {
    const response = await axiosInstance.delete(`/api/chats/${chatId}`);
    return {
      success: true,
      data: response.data.data
    };
  } catch (error) {
    console.error('Error deleting chat:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to delete chat'
    };
  }
};
