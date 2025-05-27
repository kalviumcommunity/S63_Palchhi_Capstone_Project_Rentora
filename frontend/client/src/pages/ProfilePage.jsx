import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { uploadProfileImage } from '../api/userApi';
import { FaCamera, FaUser, FaEdit, FaTrash, FaStar } from 'react-icons/fa';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import Loader from '../components/common/Loader';
import '../styles/Profile.css';
import { isGoogleProfileImage, DEFAULT_AVATAR_SVG, getSafeProfileImageUrl } from '../utils/imageUtils';

const ProfilePage = () => {
  const { user, updateProfile, refreshUserData } = useAuth();
  const navigate = useNavigate();
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
  const fileInputRef = useRef(null);

  
  const [googleImageFailed, setGoogleImageFailed] = useState(false);

  const [imageRefreshKey, setImageRefreshKey] = useState(Date.now());

  
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
          const response = await fetch('http://localhost:8000/api/my-listings', {
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

  if (!user) {
    navigate('/login');
    return null;
  }

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleEditToggle = () => {
    setEditMode(!editMode);
    
    if (!editMode) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const result = await updateProfile(formData);
      
      if (result.success) {
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
        setEditMode(false);
        await refreshUserData();
        
      
        setTimeout(() => {
          setMessage({ type: '', text: '' });
        }, 3000);
      } else {
        setMessage({ type: 'error', text: result.message || 'Failed to update profile' });
        
        
        setTimeout(() => {
          setMessage({ type: '', text: '' });
        }, 5000);
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred while updating profile' });
      console.error('Profile update error:', error);
      
  
      setTimeout(() => {
        setMessage({ type: '', text: '' });
      }, 5000);
    } finally {
      setLoading(false);
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
      
      
      setTimeout(() => {
        setMessage({ type: '', text: '' });
      }, 5000);
      return;
    }

    const maxSize = 5 * 1024 * 1024; 
    if (file.size > maxSize) {
      setMessage({ type: 'error', text: 'File size should be less than 5MB' });
      
      
      setTimeout(() => {
        setMessage({ type: '', text: '' });
      }, 5000);
      return;
    }

    setIsUploading(true);
    setMessage({ type: '', text: '' });

    try {
    
      const localImageUrl = URL.createObjectURL(file);
      
    
      setFormData({
        ...formData,
        profileImage: localImageUrl
      });
      
      
      const uploadFormData = new FormData();
      uploadFormData.append('images', file);

  
      const result = await uploadProfileImage(uploadFormData);
      
      if (result.success) {
        console.log('Upload response:', result);
        
      
        const imageUrl = result.data[0];
        console.log('Image URL from server:', imageUrl);
        
        
        const updateResult = await updateProfile({ profileImage: imageUrl });
        console.log('Profile update result:', updateResult);
        
        if (updateResult.success) {
        
          const refreshResult = await refreshUserData();
          console.log('Refresh user data result:', refreshResult);
          
          setMessage({ type: 'success', text: 'Profile image updated successfully!' });
          
          
          setTimeout(() => {
            setMessage({ type: '', text: '' });
          }, 3000);
        } else {
          setMessage({ type: 'error', text: updateResult.message || 'Failed to update profile with new image' });
          
          
          setTimeout(() => {
            setMessage({ type: '', text: '' });
          }, 5000);
        }
      } else {
        setMessage({ type: 'error', text: 'Failed to upload profile image' });
        
  
        setTimeout(() => {
          setMessage({ type: '', text: '' });
        }, 5000);
      }
    } catch (error) {
      console.error('Image upload error:', error);
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'An error occurred while uploading image'
      });
      
      
      setTimeout(() => {
        setMessage({ type: '', text: '' });
      }, 5000);
    } finally {
      setIsUploading(false);
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'buyer':
        return 'buyer';
      case 'seller':
        return 'seller';
      case 'admin':
        return 'admin';
      default:
        return '';
    }
  };

  const StatCard = ({ value, label }) => (
    <div className="stat-card">
      <h3>{value}</h3>
      <p>{label}</p>
    </div>
  );

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
                
                isGoogleProfileImage(user.profileImage) && googleImageFailed ? (
                  <div 
                    className="profile-image-placeholder"
                    onClick={handleProfileImageClick}
                  >
                    <FaUser />
                  </div>
                ) : (
                  <img 
                    src={`${getSafeProfileImageUrl(user.profileImage, DEFAULT_AVATAR_SVG)}&refresh=${imageRefreshKey}`}
                    alt={user.name} 
                    className="profile-image" 
                    onClick={handleProfileImageClick}
                    key={`profile-img-${imageRefreshKey}`} 
                    crossOrigin="anonymous" 
                    loading="eager" 
                    decoding="async" 
                    onLoad={() => {
                      console.log("Profile image loaded successfully");
              
                      if (googleImageFailed) {
                        setGoogleImageFailed(false);
                      }
                    }}
                    onError={(e) => {
                      console.log("Using default avatar due to image load failure");
                      e.target.onerror = null; 
                      
                    
                      if (isGoogleProfileImage(user.profileImage)) {
                        console.log("Google image failed to load - using fallback for future renders");
                        setGoogleImageFailed(true);
                        
                      
                        if (user.profileImage.includes('googleusercontent.com')) {
                          
                          const encodedUrl = encodeURIComponent(user.profileImage);
                          e.target.src = `http://localhost:8000/api/proxy/google-image?imageUrl=${encodedUrl}&t=${Date.now()}`;
                        } else {
                          e.target.src = DEFAULT_AVATAR_SVG;
                        }
                      } else {
                        e.target.src = DEFAULT_AVATAR_SVG; 
                      }
                    }}
                  />
                )
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
                accept="image/jpeg,image/png,image/jpg"
                onChange={handleFileChange}
              />
            </div>

            <div className="profile-info">
              <h2>{user.name}</h2>
              <p>{user.email}</p>
              {user.phone && <p>{user.phone}</p>}
              <span className={`profile-role ${getRoleColor(user.role)}`}>
                {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
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
                    value={user.role.charAt(0).toUpperCase() + user.role.slice(1)}
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
                      <img 
                        src={listing.images && listing.images.length > 0 
                          ? (listing.images[0].startsWith('http') 
                            ? listing.images[0] 
                            : `http://localhost:8000${listing.images[0]}`)
                          : 'https://via.placeholder.com/300x200?text=No+Image'} 
                        alt={listing.title} 
                        className="property-image"
                        onClick={() => navigate(`/listings/${listing._id}`)}
                        onError={(e) => {
                          console.error(`Failed to load image for listing ${listing._id}:`, listing.images[0]);
                          e.target.onerror = null;
                          e.target.src = 'https://via.placeholder.com/300x200?text=Image+Error';
                        }}
                      />
                      <div className="property-details">
                        <h3 className="property-title">{listing.title}</h3>
                        <p className="property-location">
                          {listing.location.city}, {listing.location.address}
                        </p>
                        <p className="property-price">₹{listing.price.toLocaleString()}</p>
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
                            onClick={() => {
                              if (window.confirm('Are you sure you want to delete this listing?')) {
                                // Delete logic here
                              }
                            }}
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
                    onClick={() => navigate('/my-listings')}
                  >
                    Manage Your Properties
                  </button>
                </div>
              )}
            </div>

            <div className={`tab-content ${activeTab === 'wishlist' ? 'active' : ''}`}>
              <div style={{ textAlign: 'center', padding: '2rem' }}>
                <p>Your wishlist is empty.</p>
                <button 
                  className="btn btn-primary"
                  onClick={() => navigate('/')}
                >
                  Browse Properties
                </button>
              </div>
            </div>

            <div className={`tab-content ${activeTab === 'reviews' ? 'active' : ''}`}>
              <div style={{ textAlign: 'center', padding: '2rem' }}>
                <p>You haven't received any reviews yet.</p>
              </div>
            </div>

            <div className={`tab-content ${activeTab === 'settings' ? 'active' : ''}`}>
              <div className="settings-section">
                <h3>Notification Preferences</h3>
                <div className="notification-option">
                  <input type="checkbox" id="emailNotifications" defaultChecked />
                  <label htmlFor="emailNotifications">Email Notifications</label>
                </div>
                <div className="notification-option">
                  <input type="checkbox" id="smsNotifications" />
                  <label htmlFor="smsNotifications">SMS Notifications</label>
                </div>
                <div className="notification-option">
                  <input type="checkbox" id="marketingEmails" defaultChecked />
                  <label htmlFor="marketingEmails">Marketing Emails</label>
                </div>
              </div>

              <div className="settings-section">
                <h3>Privacy Settings</h3>
                <div className="notification-option">
                  <input type="checkbox" id="profileVisibility" defaultChecked />
                  <label htmlFor="profileVisibility">Make profile visible to others</label>
                </div>
                <div className="notification-option">
                  <input type="checkbox" id="showContactInfo" />
                  <label htmlFor="showContactInfo">Show contact information on listings</label>
                </div>
              </div>

              <div className="delete-account">
                <h3>Delete Account</h3>
                <p>Once you delete your account, there is no going back. Please be certain.</p>
                <button className="btn btn-danger">
                  <FaTrash style={{ marginRight: '0.5rem' }} /> Delete Account
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ProfilePage;