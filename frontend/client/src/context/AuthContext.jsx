
import * as React from 'react';
import axiosInstance from '../utils/axiosConfig';
import { getCurrentUser, updateUserProfile } from '../api/userApi';
import { isGoogleProfileImage } from '../utils/imageUtils';

const AuthContext = React.createContext(null);

export const AuthProvider = ({ children }) => {
  
  const [user, setUser] = React.useState(() => {
    try {
      const storedUser = localStorage.getItem('user');
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (error) {
      console.error('Error parsing user data:', error);
      localStorage.removeItem('user'); 
      return null;
    }
  });
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
        
          axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          try {
            const response = await getCurrentUser();
            if (response.success) {
              setUser(response.user);
              localStorage.setItem('user', JSON.stringify(response.user));
            }
          } catch (err) {
            console.error('Failed to fetch user data:', err);
          
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            delete axiosInstance.defaults.headers.common['Authorization'];
            setUser(null);
          }
        }
        setLoading(false);
      } catch (error) {
        console.error('Auth check failed:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        delete axiosInstance.defaults.headers.common['Authorization'];
        setUser(null);
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await axiosInstance.post('/auth/login', { email, password });
      const { token, data: userData } = response.data;
   
      axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      
    
      setUser(userData);
  
      setTimeout(() => {
        refreshUserData();
      }, 500);
      
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Login failed' 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete axiosInstance.defaults.headers.common['Authorization'];
    setUser(null);
  };

  const updateProfile = async (userData) => {
    try {
      if (!user || !user._id) {
        throw new Error('User not authenticated');
      }
      
      console.log('Updating profile with data:', userData);
      const response = await updateUserProfile(user._id, userData);
      console.log('Profile update response:', response);
      
      if (response.success) {
      
        const updatedUser = { 
          ...user, 
          ...response.data
     
        };
        
        console.log('Setting updated user in context:', updatedUser);
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
       
        window.dispatchEvent(new CustomEvent('user-profile-updated', { 
          detail: { user: updatedUser } 
        }));
        

        setTimeout(() => {
          refreshUserData().catch(err => 
            console.error('Error refreshing user data after profile update:', err)
          );
        }, 1000);
        
        return { success: true, data: updatedUser };
      } else {
        return { success: false, message: 'Failed to update profile' };
      }
    } catch (error) {
      console.error('Profile update error:', error);
      

      if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        console.log('Authentication error during profile update, logging out');
        logout();
        return { 
          success: false, 
          message: 'Your session has expired. Please log in again.' 
        };
      }
      
      return { 
        success: false, 
        message: error.response?.data?.message || 'Profile update failed' 
      };
    }
  };

  const refreshUserData = async () => {
    try {
      console.log('Refreshing user data...');
      const response = await getCurrentUser();
      console.log('User data response:', response);
      
      if (response.success) {
      
        const updatedUser = { ...response.user };
        console.log('Setting updated user:', updatedUser);
        

        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
 
        window.dispatchEvent(new CustomEvent('user-data-refreshed', { 
          detail: { user: updatedUser } 
        }));
        
        return { success: true, user: updatedUser };
      }
      return { success: false, message: 'Failed to get current user data' };
    } catch (error) {
      console.error('Failed to refresh user data:', error);

      if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        console.log('Authentication error during refresh, logging out');
        logout();
      }
      
      return { 
        success: false, 
        message: error.response?.data?.message || 'Error refreshing user data'
      };
    }
  };

  const handleGoogleAuthSuccess = async (token, userData) => {
    try {

      axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      

      if (userData.profileImage && isGoogleProfileImage(userData.profileImage)) {
        console.log('Google profile image detected in auth flow:', userData.profileImage);
        
        try {
         
          const encodedUrl = encodeURIComponent(userData.profileImage);
          const timestamp = Date.now();
          const proxyResponse = await axiosInstance.get(`/proxy/google-image?imageUrl=${encodedUrl}&t=${timestamp}`);
          
          if (proxyResponse.data.success) {
            console.log('Successfully cached Google profile image:', proxyResponse.data.imageUrl);
            

            userData = {
              ...userData,
              profileImage: proxyResponse.data.imageUrl
            };
            
      
            const img = new Image();
            img.src = proxyResponse.data.imageUrl;
          }
        } catch (proxyError) {
          console.error('Failed to cache Google profile image:', proxyError);
          
  
          userData = {
            ...userData,
            profileImage: '/uploads/images/default-avatar.jpg' 
          };
        }
      }
      
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      
     
      setUser(userData);
    
      window.dispatchEvent(new CustomEvent('google-auth-success', { 
        detail: { user: userData, isNewUser: userData.isNewUser } 
      }));
      
     
      setTimeout(() => refreshUserData(), 500);
      setTimeout(() => {
        refreshUserData();
        
        window.dispatchEvent(new CustomEvent('user-data-refreshed'));
      }, 2000);
      
      return { success: true };
    } catch (error) {
      console.error('Google auth error:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Google authentication failed' 
      };
    }
  };

  const value = {
    user,
    loading,
    login,
    logout,
    updateProfile,
    refreshUserData,
    handleGoogleAuthSuccess,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
