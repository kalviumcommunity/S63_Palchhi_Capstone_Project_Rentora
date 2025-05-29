import React, { useState } from 'react';
import { FaStar } from 'react-icons/fa';
import { createReview, updateReview } from '../../api/reviewApi';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const ReviewForm = ({
  listingId,
  reviewId,
  initialData = { rating: 5, title: '', comment: '' },
  onReviewAdded,
  onReviewUpdated,
  onCancel,
  isEditing = false
}) => {
  const [rating, setRating] = useState(initialData.rating || 0);
  const [title, setTitle] = useState(initialData.title || '');
  const [comment, setComment] = useState(initialData.comment || '');
  const [hoveredRating, setHoveredRating] = useState(0);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setRating(name === 'rating' ? value : rating);
    setTitle(name === 'title' ? value : title);
    setComment(name === 'comment' ? value : comment);
    
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!title.trim()) {
      newErrors.title = 'Please enter a title';
    }
    
    if (!comment.trim()) {
      newErrors.comment = 'Please enter a comment';
    } else if (comment.length < 10) {
      newErrors.comment = 'Comment must be at least 10 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('Please log in to write a review');
      navigate('/login');
      return;
    }
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      const reviewData = {
        rating,
        title: title.trim(),
        comment: comment.trim()
      };

      let response;
      if (isEditing) {
        response = await updateReview(reviewId, reviewData);
        if (response.success) {
          onReviewUpdated(response.data);
          toast.success('Review updated successfully');
        }
      } else {
        response = await createReview(listingId, reviewData);
        if (response.success) {
          onReviewAdded(response.data);
          toast.success('Review added successfully');
        }
      }

      if (!response.success) {
        toast.error(response.message || 'Failed to submit review');
      }
    } catch (error) {
      if (error.response?.status === 401) {
        toast.error('Please log in to write a review');
        navigate('/login');
      } else {
        toast.error('Failed to submit review. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 p-6 rounded-lg mb-6">
      <h3 className="text-lg font-semibold mb-4">
        {isEditing ? 'Edit Your Review' : 'Write a Review'}
      </h3>
      
      <form onSubmit={handleSubmit} className="review-form">
        <div className="form-group">
          <label className="form-label">Rating</label>
          <div className="rating-input">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                className="star-button"
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                onClick={() => setRating(star)}
              >
                <FaStar
                  className={`star-icon ${
                    star <= (hoveredRating || rating)
                      ? 'text-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              </button>
            ))}
          </div>
          {errors.rating && <span className="error-message">{errors.rating}</span>}
        </div>
        
        <div className="form-group">
          <label htmlFor="title" className="form-label">Title</label>
          <input
            type="text"
            id="title"
            name="title"
            value={title}
            onChange={handleChange}
            className="form-input"
            placeholder="Give your review a title"
          />
          {errors.title && <span className="error-message">{errors.title}</span>}
        </div>
        
        <div className="form-group">
          <label htmlFor="comment" className="form-label">Review</label>
          <textarea
            id="comment"
            name="comment"
            value={comment}
            onChange={handleChange}
            className="form-textarea"
            rows="4"
            placeholder="Share your experience"
          ></textarea>
          {errors.comment && <span className="error-message">{errors.comment}</span>}
        </div>
        
        <div className="form-actions">
          <button
            type="button"
            onClick={onCancel}
            className="review-form-btn cancel"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="review-form-btn submit"
            disabled={loading}
          >
            {loading ? 'Submitting...' : isEditing ? 'Update Review' : 'Submit Review'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReviewForm;