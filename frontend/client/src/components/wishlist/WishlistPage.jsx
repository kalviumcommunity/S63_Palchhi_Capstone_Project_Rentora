import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getWishlist, removeFromWishlist, clearWishlist } from '../../api/wishlistApi';
import { useAuth } from '../../context/AuthContext';
import Loader from '../common/Loader';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { FaMapMarkerAlt, FaBed, FaBath, FaRulerCombined } from 'react-icons/fa';
import '../../styles/WishlistPage.css';

const WishlistPage = () => {
  const [wishlist, setWishlist] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const formatImageUrl = (imagePath) => {
    if (!imagePath) return '/placeholder-property.jpg';
    
    if (imagePath.startsWith('http')) {
      return imagePath;
    } else {
      const normalizedPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
      return `http://localhost:8000${normalizedPath}`;
    }
  };

  useEffect(() => {
    if (user) {
      fetchWishlist();
    }
  }, [user]);

  const fetchWishlist = async () => {
    setLoading(true);
    const response = await getWishlist();
    if (response.success) {
      setWishlist(response.data);
    } else {
      toast.error(response.message);
    }
    setLoading(false);
  };

  const handleRemove = async (listingId) => {
    try {
      setLoading(true);
      const response = await removeFromWishlist(listingId);
      if (response.success) {
        toast.success('Removed from wishlist');
        setWishlist(prevWishlist => ({
          ...prevWishlist,
          listings: prevWishlist.listings.filter(item => item._id !== listingId)
        }));
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      toast.error('Failed to remove from wishlist');
    } finally {
      setLoading(false);
    }
  };

  const handleClearAll = async () => {
    if (window.confirm('Are you sure you want to clear your wishlist?')) {
      const response = await clearWishlist();
      if (response.success) {
        toast.success('Wishlist cleared');
        fetchWishlist();
      } else {
        toast.error(response.message);
      }
    }
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 relative">
          My Wishlist
          <span className="block h-1 w-20 bg-blue-500 mt-2"></span>
        </h1>
        {wishlist?.listings?.length > 0 && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleClearAll}
            className="bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded-lg shadow-md transition duration-300 flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            Clear All
          </motion.button>
        )}
      </div>

      {!wishlist?.listings?.length ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center py-16 bg-gray-50 rounded-xl shadow-sm"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          <p className="text-gray-600 mb-6 text-lg">Your wishlist is empty</p>
          <Link
            to="/properties"
            className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 rounded-lg shadow-md transition duration-300 inline-flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
            </svg>
            Browse Properties
          </Link>
        </motion.div>
      ) : (
        <div className="properties-grid">
          {wishlist.listings.map((listing, index) => (
            <motion.div 
              key={listing._id} 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="property-card"
            >
              <div className="property-image">
                <img
                  src={formatImageUrl(listing.images?.[0])}
                  alt={listing.title}
                  className="w-full h-56 object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/placeholder-property.jpg';
                  }}
                />
                <div className="property-badge">
                  {listing.propertyType === 'rent' ? 'For Rent' : 'For Sale'}
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemove(listing._id);
                  }}
                  className="absolute top-3 right-3 bg-white p-2 rounded-full shadow-md hover:bg-gray-100 transition duration-300"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-red-500"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </motion.button>
              </div>
              
              <div className="property-details">
                <h3 className="property-title">{listing.title}</h3>
                <p className="property-location">
                  <FaMapMarkerAlt /> {listing.location.city}, {listing.location.state}
                </p>
                <p className="property-price">₹{listing.price.toLocaleString()}{listing.propertyType === 'rent' ? '/month' : ''}</p>
                
                <div className="property-features">
                  <div className="feature">
                    <FaBed /> {listing.bedrooms} {listing.bedrooms === 1 ? 'Bed' : 'Beds'}
                  </div>
                  <div className="feature">
                    <FaBath /> {listing.bathrooms} {listing.bathrooms === 1 ? 'Bath' : 'Baths'}
                  </div>
                  {listing.squareFeet && (
                    <div className="feature">
                      <FaRulerCombined /> {listing.squareFeet} sq.ft
                    </div>
                  )}
                </div>
                
                <div className="property-actions">
                  <Link
                    to={`/properties/${listing._id}`}
                    className="block text-center bg-blue-500 hover:bg-blue-600 text-white px-4 py-3 rounded-lg shadow-md transition duration-300"
                  >
                    View Details
                  </Link>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemove(listing._id);
                    }}
                    className="block w-full text-center bg-red-500 hover:bg-red-600 text-white px-4 py-3 rounded-lg shadow-md transition duration-300 mt-3"
                  >
                    Remove from Wishlist
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WishlistPage;