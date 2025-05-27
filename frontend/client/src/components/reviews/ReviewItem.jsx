import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { deleteReview } from '../../api/reviewApi';
import ReviewForm from './ReviewForm';
import { formatDistanceToNow } from 'date-fns';

const ReviewItem = ({ review, onReviewUpdated, onReviewDeleted }) => {
  const [editing, setEditing] = useState(false);
  const { user } = useAuth();
  
  const isAuthor = user && user._id === review.user._id;
  const isAdmin = user && user.role === 'admin';
  
  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this review?')) {
      const response = await deleteReview(review._id);
      if (response.success) {
        onReviewDeleted(review._id);
      }
    }
  };
  
  const handleEditClick = () => {
    setEditing(true);
  };
  
  const handleCancelEdit = () => {
    setEditing(false);
  };
  
  const handleReviewUpdated = (updatedReview) => {
    setEditing(false);
    onReviewUpdated(updatedReview);
  };

  if (editing) {
    return (
      <ReviewForm
        listingId={review.listing}
        reviewId={review._id}
        initialData={{
          rating: review.rating,
          title: review.title,
          comment: review.comment
        }}
        onReviewUpdated={handleReviewUpdated}
        onCancel={handleCancelEdit}
        isEditing={true}
      />
    );
  }

  return (
    <div className="border-b pb-6">
      <div className="flex justify-between items-start">
        <div className="flex items-start">
          <img
            src={review.user.profileImage || '/default-avatar.png'}
            alt={review.user.name}
            className="w-10 h-10 rounded-full mr-3"
          />
          <div>
            <h4 className="font-semibold">{review.user.name}</h4>
            <div className="flex items-center mt-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <svg
                  key={star}
                  xmlns="http://www.w3.org/2000/svg"
                  className={`h-4 w-4 ${
                    star <= review.rating ? 'text-yellow-400' : 'text-gray-300'
                  }`}
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
              <span className="ml-2 text-sm text-gray-500">
                {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}
              </span>
              {review.isVerified && (
                <span className="ml-2 bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded">
                  Verified
                </span>
              )}
            </div>
          </div>
        </div>
        
        {(isAuthor || isAdmin) && (
          <div className="flex space-x-2">
            {isAuthor && (
              <button
                onClick={handleEditClick}
                className="text-blue-500 hover:text-blue-700"
              >
                Edit
              </button>
            )}
            <button
              onClick={handleDelete}
              className="text-red-500 hover:text-red-700"
            >
              Delete
            </button>
          </div>
        )}
      </div>
      
      <h3 className="font-semibold mt-3">{review.title}</h3>
      <p className="text-gray-700 mt-2">{review.comment}</p>
    </div>
  );
};

export default ReviewItem;