import * as React from 'react';
import { Link } from 'react-router-dom';
import { getUserNotifications, markAsRead, markAllAsRead, getUnreadCount } from '../../api/notificationApi';
import { useAuth } from '../../context/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'react-toastify';
import { motion as Motion, AnimatePresence } from 'framer-motion';

const NotificationsDropdown = () => {
  const [notifications, setNotifications] = React.useState([]);
  const [unreadCount, setUnreadCount] = React.useState(0);
  const [loading, setLoading] = React.useState(false);
  const [isOpen, setIsOpen] = React.useState(false);
  const dropdownRef = React.useRef(null);
  const pollingIntervalRef = React.useRef(null);
  const lastFetchRef = React.useRef(0);
  

  let isAuthenticated = false;
  let user = null;
  
  try {
    const auth = useAuth();
    isAuthenticated = auth.isAuthenticated;
    user = auth.user;
  } catch (error) {
    console.log('Auth context not available in NotificationsDropdown');
  }

 
  const fetchNotifications = React.useCallback(async (forceRefresh = false) => {
    if (!isAuthenticated) return;
    

    const now = Date.now();
    if (!forceRefresh && now - lastFetchRef.current < 30000) {
      console.log('Skipping notification fetch due to rate limiting');
      return;
    }
    
    lastFetchRef.current = now;
    setLoading(true);
    
    try {
     
      const response = await getUserNotifications(1, 5, false, undefined, forceRefresh);
      if (response.success) {
        setNotifications(response.data);
        setUnreadCount(response.unreadCount);
        
        
        if (response.cached) {
          setLoading(false);
        }
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  
  const fetchUnreadCount = React.useCallback(async (forceRefresh = false) => {
    if (!isAuthenticated) return;
    
    try {
      
      const response = await getUnreadCount(forceRefresh);
      if (response.success) {
        setUnreadCount(response.count);
      
        if (response.count > unreadCount && !response.cached) {
          const now = Date.now();
          if (now - lastFetchRef.current > 60000) { 
            fetchNotifications(false); 
            
   
            if (unreadCount > 0) {
              toast.info('You have new notifications', {
                position: 'top-right',
                autoClose: 3000,
              });
            }
          }
        }
      }
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  }, [isAuthenticated, unreadCount, fetchNotifications]);

 
  React.useEffect(() => {
    if (isAuthenticated) {
     
      const timer = setTimeout(() => {
        fetchUnreadCount(false); 
      }, 5000); 
      
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, fetchUnreadCount]);


  React.useEffect(() => {
    if (isAuthenticated && user?._id) {

      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
      
  
      pollingIntervalRef.current = setInterval(() => {
        fetchUnreadCount(false); 
      }, 300000); 
    }
    
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [isAuthenticated, user, fetchUnreadCount]);

  
  React.useEffect(() => {
    if (isOpen) {
     
      const now = Date.now();
      const forceRefresh = now - lastFetchRef.current > 120000;
      fetchNotifications(forceRefresh);
    }
  }, [isOpen, fetchNotifications]);

 
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleToggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleMarkAsRead = async (notificationId) => {
    const response = await markAsRead(notificationId);
    if (response.success) {

      setNotifications(
        notifications.map((notification) =>
          notification._id === notificationId
            ? { ...notification, read: true }
            : notification
        )
      );
      setUnreadCount(Math.max(0, unreadCount - 1));
    }
  };

  const handleMarkAllAsRead = async () => {
    const response = await markAllAsRead();
    if (response.success) {
    
      setNotifications(
        notifications.map((notification) => ({ ...notification, read: true }))
      );
      setUnreadCount(0);
      toast.success('All notifications marked as read');
    } else {
      toast.error(response.message);
    }
  };

  const dropdownVariants = {
    hidden: { opacity: 0, y: -10, scale: 0.95 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { 
        duration: 0.2,
        ease: "easeOut"
      }
    },
    exit: { 
      opacity: 0, 
      y: -10, 
      scale: 0.95,
      transition: { 
        duration: 0.15,
        ease: "easeIn"
      }
    }
  };

  const notificationVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: i => ({ 
      opacity: 1, 
      x: 0,
      transition: { 
        delay: i * 0.05,
        duration: 0.2
      }
    }),
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <Motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleToggleDropdown}
        className="relative p-2 text-gray-600 hover:text-gray-900 focus:outline-none"
        aria-label="Notifications"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        <AnimatePresence>
          {unreadCount > 0 && (
            <Motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Motion.span>
          )}
        </AnimatePresence>
      </Motion.button>

      <AnimatePresence>
        {isOpen && (
          <Motion.div
            variants={dropdownVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl z-20 overflow-hidden border border-gray-200"
          >
            <div className="px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 flex justify-between items-center">
              <h3 className="text-sm font-semibold text-white">Notifications</h3>
              {unreadCount > 0 && (
                <Motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleMarkAllAsRead}
                  className="text-xs text-white hover:text-blue-100 bg-blue-600 hover:bg-blue-700 px-2 py-1 rounded transition-colors duration-200"
                >
                  Mark all as read
                </Motion.button>
              )}
            </div>

            <div className="max-h-96 overflow-y-auto">
              {loading ? (
                <div className="px-4 py-6 text-center text-gray-500">
                  <svg className="animate-spin h-6 w-6 mx-auto mb-2 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Loading notifications...
                </div>
              ) : notifications.length === 0 ? (
                <div className="px-4 py-8 text-center text-gray-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto mb-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  <p>No notifications yet</p>
                </div>
              ) : (
                notifications.map((notification, index) => (
                  <Motion.div
                    key={notification._id}
                    custom={index}
                    variants={notificationVariants}
                    initial="hidden"
                    animate="visible"
                    className={`px-4 py-3 border-b hover:bg-gray-50 transition-colors duration-200 ${
                      !notification.read ? 'bg-blue-50' : ''
                    }`}
                  >
                    <Link
                      to={notification.actionLink || '#'}
                      onClick={() => !notification.read && handleMarkAsRead(notification._id)}
                      className="block"
                    >
                      <div className="flex justify-between">
                        <p className="text-sm font-semibold text-gray-800">{notification.title}</p>
                        <span className="text-xs text-gray-500">
                          {formatDistanceToNow(new Date(notification.createdAt), {
                            addSuffix: true,
                          })}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                      {!notification.read && (
                        <div className="mt-2 flex justify-end">
                          <span className="inline-block w-2 h-2 bg-blue-500 rounded-full"></span>
                        </div>
                      )}
                    </Link>
                  </Motion.div>
                ))
              )}
            </div>

            <div className="px-4 py-3 bg-gray-50 text-center">
              <Link
                to="/notifications"
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                onClick={() => setIsOpen(false)}
              >
                View all notifications
              </Link>
            </div>
          </Motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationsDropdown;