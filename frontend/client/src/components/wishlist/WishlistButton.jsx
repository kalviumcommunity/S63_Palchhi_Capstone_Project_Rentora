import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { addToWishlist, removeFromWishlist, checkWishlist } from '../../api/wishlistApi';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

const WishlistButton = ({ listingId, size = 'md', className = '' }) => {
  const [inWishlist, setInWishlist] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      checkWishlistStatus();
    } else {
      setLoading(false);
    }
  }, [user, listingId]);

  const checkWishlistStatus = async () => {
    setLoading(true);
    const response = await checkWishlist(listingId);
    if (response.success) {
      setInWishlist(response.inWishlist);
    }
    setLoading(false);
  };

  const handleWishlistToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      toast.info('Please login to save properties to your wishlist');
      navigate('/login');
      return;
    }

    setLoading(true);
    
    if (inWishlist) {
      const response = await removeFromWishlist(listingId);
      if (response.success) {
        setInWishlist(false);
        toast.success('Removed from wishlist');
      } else {
        toast.error(response.message);
      }
    } else {
      const response = await addToWishlist(listingId);
      if (response.success) {
        setInWishlist(true);
        toast.success('Added to wishlist');
      } else {
        toast.error(response.message);
      }
    }
    
    setLoading(false);
  };

  // Size classes
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-10 w-10'
  };

  return (
    <button
      onClick={handleWishlistToggle}
      disabled={loading}
      className={`${className} rounded-full flex items-center justify-center focus:outline-none transition-colors ${
        inWishlist ? 'text-red-500 hover:text-red-600' : 'text-gray-400 hover:text-red-500'
      } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
      aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className={sizeClasses[size] || sizeClasses.md}
        viewBox="0 0 20 20"
        fill={inWishlist ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <path
          fillRule="evenodd"
          d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
          clipRule="evenodd"
        />
      </svg>
    </button>
  );
};

export default WishlistButton;