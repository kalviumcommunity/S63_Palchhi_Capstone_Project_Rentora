import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Check, Trash2, Filter, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '../../context/AuthContext';
import { getNotifications, markAsRead, deleteNotification, markAllAsRead } from '../../api/notificationApi';
import '../../styles/Notifications.css';

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    pages: 1
  });
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user, pagination.page, showUnreadOnly, activeFilter]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await getNotifications(
        pagination.page,
        pagination.limit,
        {
          unreadOnly: showUnreadOnly,
          type: activeFilter === 'all' ? undefined : activeFilter
        }
      );
      
      if (response.success) {
        setNotifications(response.data);
        setPagination(response.pagination);
        setError(null);
      } else {
        setError(response.message || 'Failed to fetch notifications');
        setNotifications([]);
      }
    } catch (err) {
      setError('Failed to fetch notifications');
      console.error('Error fetching notifications:', err);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await markAsRead(notificationId);
      setNotifications(prevNotifications => 
        prevNotifications.map(notification =>
          notification._id === notificationId
            ? { ...notification, read: true }
            : notification
        )
      );
    } catch (err) {
      console.error('Error marking notification as read:', err);
      setError('Failed to mark notification as read');
    }
  };

  const handleDelete = async (notificationId) => {
    try {
      await deleteNotification(notificationId);
      setNotifications(prevNotifications => 
        prevNotifications.filter(notification => notification._id !== notificationId)
      );
    } catch (err) {
      console.error('Error deleting notification:', err);
      setError('Failed to delete notification');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      setNotifications(prevNotifications => 
        prevNotifications.map(notification => ({ ...notification, read: true }))
      );
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
      setError('Failed to mark all notifications as read');
    }
  };

  const handleViewDetails = (notification) => {
    if (notification.link) {
      navigate(notification.link);
    }
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
    fetchNotifications();
  };

  if (!user) {
    return (
      <div className="notifications-page">
        <div className="notifications-container">
          <h1>Notifications</h1>
          <p>Please log in to view your notifications.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="notifications-container">
        <div className="loading-spinner">Loading notifications...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="notifications-container">
        <div className="error-message">{error}</div>
        <button 
          className="retry-button"
          onClick={fetchNotifications}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="notifications-page">
      <div className="notifications-container">
        <div className="notifications-header">
          <h1 className="notifications-title">Notifications</h1>
          <div className="notifications-actions">
            <label className="filter-toggle">
              <input
                type="checkbox"
                checked={showUnreadOnly}
                onChange={(e) => setShowUnreadOnly(e.target.checked)}
              />
              Show unread only
            </label>
            <button className="mark-all-read-btn" onClick={handleMarkAllAsRead}>
              <Check size={18} />
              Mark all as read
            </button>
          </div>
        </div>

        <div className="notification-filters">
          <button
            className={`filter-btn ${activeFilter === 'all' ? 'active' : ''}`}
            onClick={() => setActiveFilter('all')}
          >
            All
          </button>
          <button
            className={`filter-btn ${activeFilter === 'message' ? 'active' : ''}`}
            onClick={() => setActiveFilter('message')}
          >
            Messages
          </button>
          <button
            className={`filter-btn ${activeFilter === 'booking' ? 'active' : ''}`}
            onClick={() => setActiveFilter('booking')}
          >
            Bookings
          </button>
          <button
            className={`filter-btn ${activeFilter === 'review' ? 'active' : ''}`}
            onClick={() => setActiveFilter('review')}
          >
            Reviews
          </button>
        </div>

        {notifications.length === 0 ? (
          <div className="empty-state">
            <Bell className="empty-state-icon" size={64} />
            <p className="empty-state-text">No notifications found</p>
            <p className="empty-state-subtext">
              {showUnreadOnly ? 'You have no unread notifications' : 'You have no notifications yet'}
            </p>
          </div>
        ) : (
          <>
            <div className="notifications-list">
              {notifications.map((notification) => (
                <div
                  key={notification._id}
                  className={`notification-item ${!notification.read ? 'unread' : ''}`}
                >
                  <div className="notification-icon">
                    <Bell size={24} />
                  </div>
                  <div className="notification-content">
                    <div className="notification-header">
                      <h3 className="notification-title">{notification.title}</h3>
                      <span className="notification-time">
                        {format(new Date(notification.createdAt), 'h:mm a')}
                      </span>
                    </div>
                    <p className="notification-message">{notification.message}</p>
                    <div className="notification-actions">
                      {!notification.read && (
                        <button
                          className="action-btn mark-read-btn"
                          onClick={() => handleMarkAsRead(notification._id)}
                        >
                          <Check size={16} />
                        </button>
                      )}
                      <button
                        className="action-btn delete-btn"
                        onClick={() => handleDelete(notification._id)}
                      >
                        <Trash2 size={16} />
                      </button>
                      {notification.link && (
                        <button
                          className="view-details-link"
                          onClick={() => handleViewDetails(notification)}
                        >
                          <Eye size={16} />
                          View Details
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {pagination.pages > 1 && (
              <div className="pagination-container">
                <button
                  className="pagination-btn"
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                >
                  Previous
                </button>
                <span className="pagination-info">
                  Page {pagination.page} of {pagination.pages}
                </span>
                <button
                  className="pagination-btn"
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.pages}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;