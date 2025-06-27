import axiosInstance from '../utils/axiosConfig';

export const getUnreadCount = async () => {
  try {
    const response = await axiosInstance.get('/notifications/unread-count');
    return {
      success: true,
      count: response.data.count
    };
  } catch (error) {
    console.error('Error fetching unread notifications count:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to fetch unread count'
    };
  }
};

export const getUserNotifications = async (page = 1, limit = 10, unreadOnly = false, type = undefined) => {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      unreadOnly: unreadOnly.toString()
    });

    if (type) {
      params.append('type', type);
    }

    const response = await axiosInstance.get(`/notifications?${params.toString()}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching notifications:', error);
    throw error;
  }
};

export const getNotifications = async () => {
  try {
    const response = await axiosInstance.get('/notifications');
    return response.data.data || [];
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return [];
  }
};

export const markAsRead = async (notificationId) => {
  try {
    const response = await axiosInstance.put(`/notifications/${notificationId}/read`);
    return response.data;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
};

export const markAllAsRead = async () => {
  try {
    const response = await axiosInstance.put('/notifications/mark-all-read');
    return response.data;
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    throw error;
  }
};

export const deleteNotification = async (notificationId) => {
  try {
    const response = await axiosInstance.delete(`/notifications/${notificationId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting notification:', error);
    throw error;
  }
};
