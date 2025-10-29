import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { uploadProfileImage, updateUserProfile, deleteListing, deleteAccount, updateNotificationPreferences } from '../api/userApi';
import { getWishlist, removeFromWishlist } from '../api/wishlistApi';
import { getUserReviews } from '../api/reviewApi';
import { FaCamera, FaUser, FaEdit, FaTrash, FaStar } from 'react-icons/fa';
import Navbar from '../components/common/Navbar';
import Loader from '../components/common/Loader';
import '../styles/Profile.css';
import { DEFAULT_IMAGE_PATHS, API_URL } from '../config';
import { 
  isGoogleProfileImage, 
  DEFAULT_AVATAR_SVG, 
  getSafeProfileImageUrl, 
  handleImageError,
  getImageUrl as getUtilImageUrl,
  clearImageCache
} from '../utils/imageUtils';

const ProfilePage = () => {
  const { user, updateProfile, refreshUserData, setUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  });
  const [userListings, setUserListings] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);
  const [imageRefreshKey, setImageRefreshKey] = useState(Date.now());

  const [googleImageFailed, setGoogleImageFailed] = useState(false);

  const [notificationPreferences, setNotificationPreferences] = useState({
    emailNotifications: true,
    smsNotifications: false,
    marketingEmails: true,
    profileVisibility: true,
    showContactInfo: false
  });

  const [wishlistItems, setWishlistItems] = useState([]);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      console.log('User data updated in ProfilePage:', user);
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        profileImage: user.profileImage || '',
      });
      
      setGoogleImageFailed(false);
      
      setImageRefreshKey(Date.now());
      
      if (user.profileImage && isGoogleProfileImage(user.profileImage)) {
        console.log('Google profile image detected - may use fallback if rate limited');
      } else if (user.profileImage) {
        console.log(`Profile data loaded with profile image: ${user.profileImage}`);
      }

      setNotificationPreferences({
        emailNotifications: user.preferences?.emailNotifications ?? true,
        smsNotifications: user.preferences?.smsNotifications ?? false,
        marketingEmails: user.preferences?.marketingEmails ?? true,
        profileVisibility: user.preferences?.profileVisibility ?? true,
        showContactInfo: user.preferences?.showContactInfo ?? false
      });
    }
  }, [user]);
  
  useEffect(() => {
    const handleProfileUpdate = () => {
      setImageRefreshKey(Date.now());
      setGoogleImageFailed(false);
    };
    
    window.addEventListener('user-profile-updated', handleProfileUpdate);
    window.addEventListener('user-data-refreshed', handleProfileUpdate);
    window.addEventListener('google-auth-success', handleProfileUpdate);
    
    return () => {
      window.removeEventListener('user-profile-updated', handleProfileUpdate);
      window.removeEventListener('user-data-refreshed', handleProfileUpdate);
      window.removeEventListener('google-auth-success', handleProfileUpdate);
    };
  }, []);

  useEffect(() => {
        const fetchUserListings = async () => {
      if (user && (user.role === 'seller' || user.role === 'admin')) {
        try {
          const response = await fetch(`${API_URL}/api/my-listings`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });
          
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
          
          const data = await response.json();
          if (data.success) {
            setUserListings(data.data);
          }
        } catch (error) {
          console.error('Error fetching user listings:', error);
          setMessage({ type: 'error', text: 'Failed to load your listings. Please try again later.' });
        }
      }
    };

    fetchUserListings();
  }, [user]);

  useEffect(() => {
    const fetchWishlist = async () => {
      if (user) {
        try {
          setWishlistLoading(true);
          const response = await getWishlist();
          if (response.success) {
            setWishlistItems(response.data.listings || []);
          } else {
            setMessage({ type: 'error', text: response.message || 'Failed to load wishlist' });
          }
        } catch (error) {
          console.error('Error fetching wishlist:', error);
          setMessage({ type: 'error', text: 'An error occurred while loading your wishlist' });
        } finally {
          setWishlistLoading(false);
        }
      }
    };

    if (activeTab === 'wishlist') {
      fetchWishlist();
    }
  }, [user, activeTab]);

  useEffect(() => {
    const fetchReviews = async () => {
      if (user) {
        try {
          setReviewsLoading(true);
          const response = await getUserReviews();
          if (response.success) {
            setReviews(response.reviews || []);
          } else {
            setMessage({ type: 'error', text: response.message || 'Failed to load reviews' });
          }
        } catch (error) {
          console.error('Error fetching reviews:', error);
          setMessage({ type: 'error', text: 'An error occurred while loading reviews' });
        } finally {
          setReviewsLoading(false);
        }
      }
    };

    if (activeTab === 'reviews') {
      fetchReviews();
    }
  }, [user, activeTab]);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const tabParam = searchParams.get('tab');
    if (tabParam && ['profile', 'listings', 'wishlist', 'reviews', 'settings'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [location.search]);

  if (!user) {
    navigate('/login');
    return null;
  }

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEditToggle = () => {
    if (editMode) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
      });
    }
    setEditMode(!editMode);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const result = await updateUserProfile(user._id, formData);
      
      if (result.success) {
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
        setEditMode(false);
        
        const updatedUser = { ...user, ...result.data };
        setUser(updatedUser);
      } else {
        setMessage({ type: 'error', text: result.message || 'Failed to update profile' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred while updating profile' });
      console.error('Profile update error:', error);
    } finally {
      setLoading(false);
      setTimeout(() => {
        setMessage({ type: '', text: '' });
      }, 5000);
    }
  };

  const handleProfileImageClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      setMessage({ type: 'error', text: 'Only JPG, JPEG, and PNG files are allowed' });
      return;
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      setMessage({ type: 'error', text: 'File size should be less than 5MB' });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setMessage({ type: '', text: '' });

    try {
      const formData = new FormData();
      formData.append('profileImage', file);

      const result = await uploadProfileImage(
        user._id, 
        formData,
        (progress) => {
          setUploadProgress(progress);
        }
      );
      
      if (result.success) {
        setMessage({ type: 'success', text: 'Profile image updated successfully!' });
        
        // Log the response data for debugging
        console.log('Profile image upload response:', result.data);
        
        // Get the profile image path from the response
        const profileImage = result.data.profileImage;
        
        console.log('Profile image response data:', result.data);
        
        // Update the user context with the new image path
        const updatedUser = { 
          ...user, 
          profileImage: profileImage
        };
        
        // Log the updated user data
        console.log('Updated user data:', updatedUser);
        
        // Update the user context
        setUser(updatedUser);
        
        // Clear image cache to ensure the new image is loaded
        clearImageCache();
        
        // Force a re-render of the profile image
        setImageRefreshKey(Date.now());
        
        // Dispatch a custom event to notify other components
        window.dispatchEvent(new CustomEvent('user-profile-updated', {
          detail: { 
            timestamp: Date.now(),
            user: updatedUser
          }
        }));
      } else {
        setMessage({ type: 'error', text: result.message || 'Failed to upload profile image' });
      }
    } catch (error) {
      console.error('Image upload error:', error);
      setMessage({ 
        type: 'error', 
        text: error.message === 'Network Error' 
          ? 'Server connection failed. Please check if the server is running.' 
          : 'An error occurred while uploading the image'
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      setTimeout(() => {
        setMessage({ type: '', text: '' });
      }, 5000);
    }
  };

  const getRoleColor = (role) => {
    if (!role) return 'role-default';
    
    switch (role.toLowerCase()) {
      case 'admin':
        return 'role-admin';
      case 'seller':
        return 'role-seller';
      case 'buyer':
        return 'role-buyer';
      default:
        return 'role-default';
    }
  };

  const StatCard = ({ value, label }) => {
    const displayValue = isNaN(value) ? 0 : value;
    return (
      <div className="stat-card">
        <h3>{displayValue}</h3>
        <p>{label}</p>
      </div>
    );
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) {
      console.log('No image path provided, using default avatar');
      return DEFAULT_IMAGE_PATHS.AVATAR;
    }
    
    // Use the utility function from imageUtils.js to handle all image URL processing
    const imageUrl = getUtilImageUrl(imagePath);
    
    // Add a timestamp to the URL to prevent caching issues
    const timestamp = Date.now();
    const separator = imageUrl.includes('?') ? '&' : '?';
    const finalUrl = `${imageUrl}${separator}t=${timestamp}`;
    
    console.log('Final image URL:', finalUrl);
    return finalUrl;
  };

  const handleDeleteListing = async (listingId) => {
    if (!window.confirm('Are you sure you want to delete this listing? This action cannot be undone.')) {
      return;
    }

    try {
      setLoading(true);
      const response = await deleteListing(listingId);
      
      if (response.success) {
        setMessage({ type: 'success', text: 'Listing deleted successfully!' });
        // Update the listings list
        setUserListings(prevListings => prevListings.filter(listing => listing._id !== listingId));
      } else {
        setMessage({ type: 'error', text: response.message || 'Failed to delete listing' });
      }
    } catch (error) {
      console.error('Error deleting listing:', error);
      setMessage({ type: 'error', text: 'An error occurred while deleting the listing' });
    } finally {
      setLoading(false);
      setTimeout(() => {
        setMessage({ type: '', text: '' });
      }, 5000);
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      try {
        setLoading(true);
        await deleteAccount(user._id);
        logout();
        navigate('/');
      } catch (error) {
        console.error('Error deleting account:', error);
        setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to delete account' });
      } finally {
        setLoading(false);
      }
    }
  };

  const handlePreferenceChange = async (preference, value) => {
    try {
      setLoading(true);
      const updatedPreferences = {
        ...notificationPreferences,
        [preference]: value
      };
      
      const response = await updateNotificationPreferences(user._id, updatedPreferences);
      
      if (response.success) {
        setNotificationPreferences(updatedPreferences);
        setMessage({ type: 'success', text: 'Preferences updated successfully!' });
        
        // Update user context with new preferences
        setUser(prevUser => ({
          ...prevUser,
          preferences: updatedPreferences
        }));
      } else {
        setMessage({ type: 'error', text: response.message || 'Failed to update preferences' });
      }
    } catch (error) {
      console.error('Error updating preferences:', error);
      setMessage({ type: 'error', text: 'An error occurred while updating preferences' });
    } finally {
      setLoading(false);
      setTimeout(() => {
        setMessage({ type: '', text: '' });
      }, 5000);
    }
  };

  const handleRemoveFromWishlist = async (listingId) => {
    try {
      setLoading(true);
      const response = await removeFromWishlist(listingId);
      
      if (response.success) {
        setMessage({ type: 'success', text: 'Property removed from wishlist!' });
        // Update the wishlist items
        setWishlistItems(prevItems => prevItems.filter(item => item._id !== listingId));
      } else {
        setMessage({ type: 'error', text: response.message || 'Failed to remove from wishlist' });
      }
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      setMessage({ type: 'error', text: 'An error occurred while removing from wishlist' });
    } finally {
      setLoading(false);
      setTimeout(() => {
        setMessage({ type: '', text: '' });
      }, 5000);
    }
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <FaStar
        key={i}
        className={i < rating ? 'text-yellow-400' : 'text-gray-300'}
      />
    ));
  };

  return (
    <>
      <Navbar />
      <div className="profile-container">
        <div className="profile-header">
          <div>
            <h1>My Profile</h1>
            <p>Manage your account settings and preferences</p>
          </div>
        </div>

        <div className="profile-content">
          <div className="profile-sidebar">
            <div className="profile-image-container">
              {isUploading ? (
                <Loader />
              ) : user.profileImage ? (
                <img 
                  src={getImageUrl(user.profileImage)}
                  alt={user.name} 
                  className="profile-image" 
                  onClick={handleProfileImageClick}
                  key={`profile-img-${imageRefreshKey}`} 
                  crossOrigin="anonymous" 
                  loading="eager" 
                  decoding="async" 
                  onLoad={(e) => {
                    console.log("Profile image loaded successfully:", e.target.src);
                    if (googleImageFailed) {
                      setGoogleImageFailed(false);
                    }
                  }}
                  onError={(e) => {
                    console.error("Profile image failed to load:", {
                      src: e.target.src,
                      originalPath: user.profileImage
                    });
                    
                    // Try with a direct API_URL path first
                    if (user.profileImage) {
                      // Clean up the path and create a direct URL
                      const cleanPath = user.profileImage
                        .replace(/^\/+|\/+$/g, '')  // Remove leading/trailing slashes
                        .replace(/\/+/, '/');      // Normalize slashes
                      
                      // Try the cleaned path
                      e.target.src = `${API_URL}/${cleanPath}?t=${Date.now()}`;
                      console.log("Trying alternative URL:", e.target.src);
                      
                      // Set a backup error handler if this also fails
                      e.target.onerror = (e2) => {
                        console.error("Fallback image also failed, using default avatar");
                        e2.target.onerror = null;
                        e2.target.src = DEFAULT_IMAGE_PATHS.AVATAR;
                      };
                    } else {
                      // Use default avatar if no profile image
                      e.target.onerror = null;
                      e.target.src = DEFAULT_IMAGE_PATHS.AVATAR;
                    }
                  }}
                />
              ) : (
                <div 
                  className="profile-image-placeholder"
                  onClick={handleProfileImageClick}
                >
                  <FaUser />
                </div>
              )}
              <button 
                className="change-photo-btn"
                onClick={handleProfileImageClick}
                title="Change profile photo"
              >
                <FaCamera />
              </button>
              <input
                type="file"
                ref={fileInputRef}
                className="file-input"
                accept="image/*"
                onChange={handleFileChange}
              />
            </div>

            <div className="profile-info">
              <h2>{user.name}</h2>
              <p>{user.email}</p>
              {user.phone && <p>{user.phone}</p>}
              <span className={`profile-role ${getRoleColor(user?.role)}`}>
                {user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'User'}
              </span>
            </div>

            <div className="profile-stats">
              <StatCard 
                value={userListings.length} 
                label="Properties" 
              />
              <StatCard 
                value={new Date(user.createdAt).getFullYear()} 
                label="Joined" 
              />
            </div>
          </div>

          <div className="profile-main">
            <div className="profile-tabs">
              <div 
                className={`profile-tab ${activeTab === 'profile' ? 'active' : ''}`}
                onClick={() => handleTabChange('profile')}
              >
                Profile
              </div>
              {(user.role === 'seller' || user.role === 'admin') && (
                <div 
                  className={`profile-tab ${activeTab === 'listings' ? 'active' : ''}`}
                  onClick={() => handleTabChange('listings')}
                >
                  My Listings
                </div>
              )}
              <div 
                className={`profile-tab ${activeTab === 'wishlist' ? 'active' : ''}`}
                onClick={() => handleTabChange('wishlist')}
              >
                Wishlist
              </div>
              <div 
                className={`profile-tab ${activeTab === 'reviews' ? 'active' : ''}`}
                onClick={() => handleTabChange('reviews')}
              >
                Reviews
              </div>
              <div 
                className={`profile-tab ${activeTab === 'settings' ? 'active' : ''}`}
                onClick={() => handleTabChange('settings')}
              >
                Settings
              </div>
            </div>

            {message.text && (
              <div className={`alert ${message.type === 'success' ? 'alert-success' : 'alert-danger'}`}>
                {message.text}
              </div>
            )}

            <div className={`tab-content ${activeTab === 'profile' ? 'active' : ''}`}>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="name">Full Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    className="form-control"
                    value={formData.name}
                    onChange={handleInputChange}
                    disabled={!editMode}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="email">Email Address</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    className="form-control"
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={!editMode}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="phone">Phone Number</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    className="form-control"
                    value={formData.phone}
                    onChange={handleInputChange}
                    disabled={!editMode}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="role">Role</label>
                  <input
                    type="text"
                    id="role"
                    className="form-control"
                    value={user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'User'}
                    disabled
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="memberSince">Member Since</label>
                  <input
                    type="text"
                    id="memberSince"
                    className="form-control"
                    value={new Date(user.createdAt).toLocaleDateString()}
                    disabled
                  />
                </div>
                
                {editMode ? (
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                      {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button 
                      type="button" 
                      className="btn btn-secondary"
                      onClick={handleEditToggle}
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button 
                    type="button" 
                    className="btn btn-primary"
                    onClick={handleEditToggle}
                  >
                    <FaEdit style={{ marginRight: '0.5rem' }} /> Edit Profile
                  </button>
                )}
              </form>
            </div>

            <div className={`tab-content ${activeTab === 'listings' ? 'active' : ''}`}>
              {loading ? (
                <Loader />
              ) : userListings.length > 0 ? (
                <div className="property-list">
                  {userListings.map(listing => (
                    <div key={listing._id} className="property-card">
                      <div className="property-image-container">
                        <img 
                          src={listing.images && listing.images.length > 0 
                            ? getImageUrl(listing.images[0])
                            : DEFAULT_IMAGE_PATHS.PROPERTY} 
                          alt={listing.title} 
                          className="property-image"
                          onClick={() => navigate(`/edit-listing/${listing._id}`)}
                          onError={(e) => {
                            console.error(`Failed to load image for listing ${listing._id}:`, listing.images[0]);
                            e.target.onerror = null;
                            e.target.src = DEFAULT_IMAGE_PATHS.PROPERTY;
                          }}
                        />
                        <div className="property-price">₹{listing.price.toLocaleString()}</div>
                      </div>
                      <div className="property-details">
                        <h3 className="property-title">{listing.title}</h3>
                        <p className="property-location">
                          {listing.location.city}, {listing.location.address}
                        </p>
                        <div className="property-meta">
                          <span>{listing.bedrooms} Beds</span>
                          <span>{listing.bathrooms} Baths</span>
                          {listing.squareFeet && (
                            <span>{listing.squareFeet} sq.ft</span>
                          )}
                        </div>
                        <div className="property-actions">
                          <button 
                            className="btn btn-primary btn-sm" 
                            onClick={() => navigate(`/edit-listing/${listing._id}`)}
                          >
                            <FaEdit /> Edit
                          </button>
                          <button 
                            className="btn btn-danger btn-sm" 
                            onClick={() => handleDeleteListing(listing._id)}
                          >
                            <FaTrash /> Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '2rem' }}>
                  <p>You haven't created any listings yet.</p>
                  <button 
                    className="btn btn-primary"
                    onClick={() => navigate('/add-listing')}
                  >
                    Create Your First Listing
                  </button>
                </div>
              )}
            </div>

            <div className={`tab-content ${activeTab === 'wishlist' ? 'active' : ''}`}>
              {wishlistLoading ? (
                <Loader />
              ) : wishlistItems.length > 0 ? (
                <div className="property-list">
                  {wishlistItems.map(item => (
                    <div key={item._id} className="property-card">
                      <div className="property-image-container">
                        <img 
                          src={item.images && item.images.length > 0 
                            ? getImageUrl(item.images[0])
                            : DEFAULT_IMAGE_PATHS.PROPERTY} 
                          alt={item.title} 
                          className="property-image"
                          onClick={() => navigate(`/properties/${item._id}`)}
                          onError={(e) => {
                            console.error(`Failed to load image for wishlist item ${item._id}:`, item.images[0]);
                            e.target.onerror = null;
                            e.target.src = DEFAULT_IMAGE_PATHS.PROPERTY;
                          }}
                        />
                        <div className="property-price">₹{item.price.toLocaleString()}</div>
                      </div>
                      <div className="property-details">
                        <h3 className="property-title">{item.title}</h3>
                        <p className="property-location">
                          {item.location.city}, {item.location.address}
                        </p>
                        <div className="property-meta">
                          <span>{item.bedrooms} Beds</span>
                          <span>{item.bathrooms} Baths</span>
                          {item.squareFeet && (
                            <span>{item.squareFeet} sq.ft</span>
                          )}
                        </div>
                        <div className="item-actions">
                          <button onClick={() => navigate(`/properties/${item._id}`)} className="btn btn-primary btn-sm">View Details</button>
                          <button onClick={() => handleRemoveFromWishlist(item._id)} className="btn btn-danger btn-sm">Remove</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '2rem' }}>
                  <p>Your wishlist is empty.</p>
                  <button 
                    className="btn btn-primary"
                    onClick={() => navigate('/properties')}
                  >
                    Browse Properties
                  </button>
                </div>
              )}
            </div>

            <div className={`tab-content ${activeTab === 'reviews' ? 'active' : ''}`}>
              {reviewsLoading ? (
                <div className="loading-spinner">
                  <Loader />
                </div>
              ) : reviews.length > 0 ? (
                <div className="review-list">
                  {reviews.map((review) => (
                    <div key={review._id} className="review-card">
                      <div className="review-header">
                        <img
                          src={review.user.profileImage || '/default-avatar.png'}
                          alt={review.user.name}
                          className="review-avatar"
                        />
                        <div className="review-author">
                          <h4>{review.user.name}</h4>
                          <p>{review.listing.title}</p>
                        </div>
                        <div className="review-rating">
                          {renderStars(review.rating)}
                        </div>
                      </div>
                      <div className="review-content">
                        <h3>{review.title}</h3>
                        <p>{review.comment}</p>
                      </div>
                      <div className="review-date">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '2rem' }}>
                  <p>You haven't received any reviews yet.</p>
                </div>
              )}
            </div>

            <div className={`tab-content ${activeTab === 'settings' ? 'active' : ''}`}>
              <div className="settings-section">
                <h3>Notification Preferences</h3>
                <div className="notification-option">
                  <input 
                    type="checkbox" 
                    id="emailNotifications" 
                    checked={notificationPreferences.emailNotifications}
                    onChange={(e) => handlePreferenceChange('emailNotifications', e.target.checked)}
                  />
                  <label htmlFor="emailNotifications">Email Notifications</label>
                </div>
                <div className="notification-option">
                  <input 
                    type="checkbox" 
                    id="smsNotifications" 
                    checked={notificationPreferences.smsNotifications}
                    onChange={(e) => handlePreferenceChange('smsNotifications', e.target.checked)}
                  />
                  <label htmlFor="smsNotifications">SMS Notifications</label>
                </div>
                <div className="notification-option">
                  <input 
                    type="checkbox" 
                    id="marketingEmails" 
                    checked={notificationPreferences.marketingEmails}
                    onChange={(e) => handlePreferenceChange('marketingEmails', e.target.checked)}
                  />
                  <label htmlFor="marketingEmails">Marketing Emails</label>
                </div>
              </div>

              <div className="settings-section">
                <h3>Privacy Settings</h3>
                <div className="notification-option">
                  <input 
                    type="checkbox" 
                    id="profileVisibility" 
                    checked={notificationPreferences.profileVisibility}
                    onChange={(e) => handlePreferenceChange('profileVisibility', e.target.checked)}
                  />
                  <label htmlFor="profileVisibility">Make profile visible to others</label>
                </div>
                <div className="notification-option">
                  <input 
                    type="checkbox" 
                    id="showContactInfo" 
                    checked={notificationPreferences.showContactInfo}
                    onChange={(e) => handlePreferenceChange('showContactInfo', e.target.checked)}
                  />
                  <label htmlFor="showContactInfo">Show contact information on listings</label>
                </div>
              </div>

              <div className="delete-account">
                <h3>Delete Account</h3>
                <p>Once you delete your account, there is no going back. Please be certain.</p>
                <button 
                  className="btn btn-danger"
                  onClick={handleDeleteAccount}
                  disabled={loading}
                >
                  <FaTrash style={{ marginRight: '0.5rem' }} /> Delete Account
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProfilePage;