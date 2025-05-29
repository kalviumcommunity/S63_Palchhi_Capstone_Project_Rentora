import React, { useState, useEffect } from 'react';
import { getListingReviews } from '../../api/reviewApi';
import ReviewItem from './ReviewItem';
import ReviewForm from './ReviewForm';
import { useAuth } from '../../context/AuthContext';
import Loader from '../common/Loader';
import { toast } from 'react-toastify';

const ReviewsList = ({ listingId, sellerId }) => {
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (listingId) {
      fetchReviews();
    }
  }, [listingId]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await getListingReviews(listingId);
      if (response.success) {
        setReviews(response.reviews || []);
        setAverageRating(response.averageRating || 0);
      } else {
        toast.error(response.message || 'Failed to fetch reviews');
        setReviews([]);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
      toast.error('Failed to fetch reviews');
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  const handleReviewAdded = (newReview) => {
    setReviews(prevReviews => [newReview, ...prevReviews]);
    setShowForm(false);

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
    
    const filteredReviews = reviews.filter(review => review._id !== reviewId);
    if (filteredReviews.length > 0) {
      const totalRating = filteredReviews.reduce((sum, review) => sum + review.rating, 0);
      setAverageRating(totalRating / filteredReviews.length);
    } else {
      setAverageRating(0);
    }
    
    toast.success('Review deleted successfully');
  };

  const hasReviewed = user && reviews.some(review => review.user?._id === user._id);
  const isSeller = user && user._id === sellerId;

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="mt-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Reviews ({reviews?.length || 0})</h2>
        <div className="flex items-center">
          <div className="flex items-center mr-4">
            {[1, 2, 3, 4, 5].map((star) => (
              <svg
                key={star}
                xmlns="http://www.w3.org/2000/svg"
                className={`h-5 w-5 ${
                  star <= Math.round(averageRating) ? 'text-yellow-400' : 'text-gray-300'
                }`}
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
            <span className="ml-1 text-gray-600">
              {averageRating ? averageRating.toFixed(1) : 'No ratings yet'}
            </span>
          </div>
          
          {user && !hasReviewed && !isSeller && !showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
            >
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
        <p className="text-gray-500 text-center py-6">No reviews yet. Be the first to review!</p>
      ) : (
        <div className="space-y-6">
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
      )}
    </div>
  );
};

export default ReviewsList;