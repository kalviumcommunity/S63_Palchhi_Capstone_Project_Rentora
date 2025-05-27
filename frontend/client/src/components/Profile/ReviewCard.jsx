import React from 'react';
import { FaStar } from 'react-icons/fa';

const ReviewCard = ({ review }) => {

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <FaStar 
          key={i} 
          color={i <= rating ? '#f39c12' : '#e4e5e9'} 
        />
      );
    }
    return stars;
  };

  return (
    <div className="review-card">
      <div className="review-header">
        <img 
          src={review.author.profileImage || 'https://via.placeholder.com/50?text=User'} 
          alt={review.author.name} 
          className="review-avatar"
        />
        <div className="review-author">
          <h4>{review.author.name}</h4>
          <p>{review.property.title}</p>
        </div>
        <div className="review-rating">
          {renderStars(review.rating)}
        </div>
      </div>
      <div className="review-content">
        {review.content}
      </div>
      <div className="review-date">
        {new Date(review.createdAt).toLocaleDateString()}
      </div>
    </div>
  );
};

export default ReviewCard;