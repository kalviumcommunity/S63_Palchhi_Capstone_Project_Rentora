import axiosInstance from '../utils/axiosConfig';

export const getUnreadCount = async () => {
  try {
    const response = await axiosInstance.get('/api/notifications/unread-count');
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

export const getUserNotifications = async (page = 1, limit = 10) => {
  try {
    const response = await axiosInstance.get(`/api/notifications/user?page=${page}&limit=${limit}`);
    return {
      success: true,
      notifications: response.data.notifications,
      total: response.data.total,
      unreadCount: response.data.unreadCount
    };
  } catch (error) {
    console.error('Error fetching user notifications:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to fetch user notifications'
    };
  }
};

export const getNotifications = async (page = 1, limit = 10) => {
  try {
    const response = await axiosInstance.get(`/api/notifications?page=${page}&limit=${limit}`);
    return {
      success: true,
      notifications: response.data.notifications,
      total: response.data.total
    };
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to fetch notifications'
    };
  }
};

export const markAsRead = async (notificationId) => {
  try {
    const response = await axiosInstance.put(`/api/notifications/${notificationId}/read`);
    return {
      success: true,
      notification: response.data.notification
    };
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to mark notification as read'
    };
  }
};

export const markAllAsRead = async () => {
  try {
    const response = await axiosInstance.put('/api/notifications/mark-all-read');
    return {
      success: true
    };
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to mark all notifications as read'
    };
  }
};

export const deleteNotification = async (notificationId) => {
  try {
    const response = await axiosInstance.delete(`/api/notifications/${notificationId}`);
    return {
      success: true,
      message: 'Notification deleted successfully'
    };
  } catch (error) {
    console.error('Error deleting notification:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to delete notification'
    };
  }
};
