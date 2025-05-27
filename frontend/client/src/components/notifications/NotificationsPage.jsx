import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getUserNotifications, markAsRead, deleteNotification, markAllAsRead } from '../../api/notificationApi';
import { useAuth } from '../../context/AuthContext';
import { formatDistanceToNow, format } from 'date-fns';
import Loader from '../common/Loader';
import Pagination from '../common/Pagination';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1
  });
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [selectedType, setSelectedType] = useState('all');
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications(pagination.page, pagination.limit, unreadOnly, selectedType);
    }
  }, [isAuthenticated, pagination.page, unreadOnly, selectedType]);

  const fetchNotifications = async (page, limit, unreadOnly, type = 'all') => {
    setLoading(true);
    const response = await getUserNotifications(page, limit, unreadOnly, type !== 'all' ? type : undefined);
    if (response.success) {
      setNotifications(response.data);
      setPagination(response.pagination);
    } else {
      toast.error(response.message);
    }
    setLoading(false);
  };

  const handlePageChange = (newPage) => {
    setPagination({ ...pagination, page: newPage });
  };

  const handleMarkAsRead = async (notificationId) => {
    const response = await markAsRead(notificationId);
    if (response.success) {
      // Update local state
      setNotifications(
        notifications.map((notification) =>
          notification._id === notificationId
            ? { ...notification, read: true }
            : notification
        )
      );
      toast.success('Marked as read');
    } else {
      toast.error(response.message);
    }
  };

  const handleDelete = async (notificationId) => {
    if (window.confirm('Are you sure you want to delete this notification?')) {
      const response = await deleteNotification(notificationId);
      if (response.success) {
 
        setNotifications(
          notifications.filter((notification) => notification._id !== notificationId)
        );
        toast.success('Notification deleted');
      } else {
        toast.error(response.message);
      }
    }
  };

  const handleMarkAllAsRead = async () => {
    const response = await markAllAsRead();
    if (response.success) {
      // Update local state
      setNotifications(
        notifications.map((notification) => ({ ...notification, read: true }))
      );
      toast.success('All notifications marked as read');
    } else {
      toast.error(response.message);
    }
  };

  const handleFilterChange = (e) => {
    setUnreadOnly(e.target.checked);
    setPagination({ ...pagination, page: 1 }); 
  };

  const handleTypeChange = (type) => {
    setSelectedType(type);
    setPagination({ ...pagination, page: 1 }); 
  };


  const getNotificationIcon = (type) => {
    switch (type) {
      case 'new_message':
        return (
          <div className="bg-blue-100 p-2 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
              <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
              <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
            </svg>
          </div>
        );
      case 'listing_review':
        return (
          <div className="bg-yellow-100 p-2 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </div>
        );
      case 'listing_interest':
        return (
          <div className="bg-green-100 p-2 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
            </svg>
          </div>
        );
      case 'price_change':
        return (
          <div className="bg-purple-100 p-2 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
            </svg>
          </div>
        );
      case 'listing_approved':
        return (
          <div className="bg-green-100 p-2 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
        );
      case 'listing_rejected':
        return (
          <div className="bg-red-100 p-2 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="bg-gray-100 p-2 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
        );
    }
  };


  const groupNotificationsByDate = () => {
    const groups = {};
    
    notifications.forEach(notification => {
      const date = new Date(notification.createdAt);
      const dateKey = format(date, 'yyyy-MM-dd');
      
      if (!groups[dateKey]) {
        groups[dateKey] = {
          date,
          notifications: []
        };
      }
      
      groups[dateKey].notifications.push(notification);
    });
    
    return Object.values(groups).sort((a, b) => b.date - a.date);
  };

  const notificationGroups = groupNotificationsByDate();

  if (loading && notifications.length === 0) {
    return <Loader />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-4 md:mb-0 relative">
          Notifications
          <span className="block h-1 w-24 bg-blue-500 mt-2"></span>
        </h1>
        <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
          <div className="flex items-center">
            <label className="flex items-center bg-white px-3 py-2 rounded-lg shadow-sm border border-gray-200">
              <input
                type="checkbox"
                checked={unreadOnly}
                onChange={handleFilterChange}
                className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="text-gray-700">Unread only</span>
            </label>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleMarkAllAsRead}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg shadow-md transition duration-300 flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
              <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm9.707 5.707a1 1 0 00-1.414-1.414L9 12.586l-1.293-1.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Mark all as read
          </motion.button>
        </div>
      </div>

      <div className="mb-6 overflow-x-auto">
        <div className="flex space-x-2 pb-2">
          <button
            onClick={() => handleTypeChange('all')}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
              selectedType === 'all'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All
          </button>
          <button
            onClick={() => handleTypeChange('new_message')}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
              selectedType === 'new_message'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Messages
          </button>
          <button
            onClick={() => handleTypeChange('listing_review')}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
              selectedType === 'listing_review'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Reviews
          </button>
          <button
            onClick={() => handleTypeChange('listing_interest')}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
              selectedType === 'listing_interest'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Interests
          </button>
          <button
            onClick={() => handleTypeChange('system_notification')}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
              selectedType === 'system_notification'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            System
          </button>
        </div>
      </div>

      {notifications.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center py-16 bg-gray-50 rounded-xl shadow-sm"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <p className="text-gray-600 mb-2 text-lg">No notifications found</p>
          <p className="text-gray-500">Notifications will appear here when you receive them</p>
        </motion.div>
      ) : (
        <div className="space-y-6">
          <AnimatePresence>
            {notificationGroups.map((group, groupIndex) => (
              <motion.div 
                key={format(group.date, 'yyyy-MM-dd')}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: groupIndex * 0.1 }}
                className="bg-white rounded-xl shadow-md overflow-hidden"
              >
                <div className="bg-gray-50 px-6 py-3 border-b">
                  <h3 className="text-sm font-medium text-gray-500">
                    {format(group.date, 'EEEE, MMMM d, yyyy')}
                  </h3>
                </div>
                
                <div>
                  {group.notifications.map((notification, index) => (
                    <motion.div
                      key={notification._id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className={`p-5 border-b last:border-b-0 hover:bg-gray-50 transition-colors duration-200 ${
                        !notification.read ? 'bg-blue-50' : ''
                      }`}
                    >
                      <div className="flex">
                        <div className="mr-4 mt-1">
                          {getNotificationIcon(notification.type)}
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-2">
                            <h3 className="font-semibold text-gray-800">{notification.title}</h3>
                            <span className="text-sm text-gray-500 mt-1 sm:mt-0">
                              {formatDistanceToNow(new Date(notification.createdAt), {
                                addSuffix: true,
                              })}
                            </span>
                          </div>
                          <p className="text-gray-600 mb-3">{notification.message}</p>
                          
                          <div className="flex justify-between items-center">
                            {notification.actionLink && (
                              <Link
                                to={notification.actionLink}
                                className="text-blue-500 hover:text-blue-700 text-sm inline-flex items-center"
                                onClick={() => !notification.read && handleMarkAsRead(notification._id)}
                              >
                                View Details
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                              </Link>
                            )}
                            
                            <div className="flex items-center space-x-2">
                              {!notification.read && (
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => handleMarkAsRead(notification._id)}
                                  className="text-blue-500 hover:text-blue-700 p-1 rounded-full hover:bg-blue-50"
                                  title="Mark as read"
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-5 w-5"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                  >
                                    <path
                                      fillRule="evenodd"
                                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                </motion.button>
                              )}
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => handleDelete(notification._id)}
                                className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50"
                                title="Delete"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-5 w-5"
                                  viewBox="0 0 20 20"
                                  fill="currentColor"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              </motion.button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {pagination.pages > 1 && (
        <div className="mt-8">
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.pages}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;