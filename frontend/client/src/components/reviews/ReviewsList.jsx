import React, { useState, useEffect } from 'react';
import { getListingReviews } from '../../api/reviewApi';
import ReviewItem from './ReviewItem';
import ReviewForm from './ReviewForm';
import { useAuth } from '../../context/AuthContext';
import Loader from '../common/Loader';
import { toast } from 'react-toastify';
import { FaStar, FaPencilAlt, FaTrash } from 'react-icons/fa';
import '../../styles/Reviews.css';

const ReviewsList = ({ listingId, sellerId }) => {
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalReviews, setTotalReviews] = useState(0);
  const { user } = useAuth();

  const ITEMS_PER_PAGE = 5;

  useEffect(() => {
    if (listingId) {
      fetchReviews();
    }
  }, [listingId, currentPage]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getListingReviews(listingId, currentPage, ITEMS_PER_PAGE);
      if (response.success) {
        setReviews(response.reviews || []);
        setAverageRating(response.averageRating || 0);
        setTotalReviews(response.total || 0);
        setTotalPages(Math.ceil((response.total || 0) / ITEMS_PER_PAGE));
      } else {
        setError(response.message || 'Failed to fetch reviews');
        setReviews([]);
        setAverageRating(0);
        setTotalReviews(0);
        setTotalPages(1);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
      setError('Failed to fetch reviews. Please try again later.');
      setReviews([]);
      setAverageRating(0);
      setTotalReviews(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  const handleReviewAdded = (newReview) => {
    setReviews(prevReviews => [newReview, ...prevReviews]);
    setShowForm(false);
    setTotalReviews(prev => prev + 1);
    setTotalPages(Math.ceil((totalReviews + 1) / ITEMS_PER_PAGE));

    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0) + newReview.rating;
    setAverageRating(totalRating / (reviews.length + 1));
    
    toast.success('Review added successfully');
  };

  const handleReviewUpdated = (updatedReview) => {
    setReviews(prevReviews => 
      prevReviews.map(review => 
        review._id === updatedReview._id ? updatedReview : review
      )
    );

    const updatedReviews = reviews.map(review => 
      review._id === updatedReview._id ? updatedReview : review
    );
    const totalRating = updatedReviews.reduce((sum, review) => sum + review.rating, 0);
    setAverageRating(totalRating / updatedReviews.length);
    
    toast.success('Review updated successfully');
  };

  const handleReviewDeleted = (reviewId) => {
    setReviews(prevReviews => prevReviews.filter(review => review._id !== reviewId));
    setTotalReviews(prev => prev - 1);
    setTotalPages(Math.ceil((totalReviews - 1) / ITEMS_PER_PAGE));
    
    const filteredReviews = reviews.filter(review => review._id !== reviewId);
    if (filteredReviews.length > 0) {
      const totalRating = filteredReviews.reduce((sum, review) => sum + review.rating, 0);
      setAverageRating(totalRating / filteredReviews.length);
    } else {
      setAverageRating(0);
    }
    
    toast.success('Review deleted successfully');
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const hasReviewed = user && reviews.some(review => review.user?._id === user._id);
  const isSeller = user && user._id === sellerId;

  if (loading && currentPage === 1) {
    return <Loader />;
  }

  if (error) {
    return (
      <div className="reviews-section">
        <div className="text-center py-8">
          <p className="text-red-500 mb-4">{error}</p>
          <button 
            onClick={fetchReviews}
            className="review-form-btn submit"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="reviews-section">
      <div className="reviews-header">
        <div className="reviews-title">
          Reviews
          <span className="reviews-count">{totalReviews}</span>
        </div>
        <div className="reviews-summary">
          <div className="average-rating">
            <div className="stars-container">
              {[1, 2, 3, 4, 5].map((star) => (
                <FaStar
                  key={star}
                  className={`star-icon ${
                    star <= Math.round(averageRating) ? 'text-yellow-400' : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span>{averageRating ? averageRating.toFixed(1) : 'No ratings yet'}</span>
          </div>
          
          {user && !hasReviewed && !isSeller && !showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="write-review-btn"
            >
              <FaPencilAlt />
              Write a Review
            </button>
          )}
        </div>
      </div>

      {showForm && (
        <ReviewForm
          listingId={listingId}
          onReviewAdded={handleReviewAdded}
          onCancel={() => setShowForm(false)}
        />
      )}

      {!reviews || reviews.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No reviews yet. Be the first to review!</p>
        </div>
      ) : (
        <>
          <div className="reviews-list">
            {reviews.map((review) => (
              <ReviewItem
                key={review._id}
                review={review}
                onReviewUpdated={handleReviewUpdated}
                onReviewDeleted={handleReviewDeleted}
                currentUser={user}
              />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="pagination">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="pagination-btn"
              >
                Previous
              </button>
              <span className="pagination-info">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="pagination-btn"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ReviewsList;