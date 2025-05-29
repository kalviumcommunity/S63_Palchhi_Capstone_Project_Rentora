import React, { useState, useEffect } from 'react';
import '../styles/feedback.css';
import Navbar from '../components/common/Navbar';

const FeedbackPage = () => {

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    feedbackType: 'general',
    rating: 0,
    message: '',
  });

  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);
  const [formTouched, setFormTouched] = useState(false);


  const [formErrors, setFormErrors] = useState({});
  
  useEffect(() => {
    if (formTouched) {
      const errors = {};
      
      if (!formData.name.trim()) {
        errors.name = 'Name is required';
      }
      
      if (!formData.email.trim()) {
        errors.email = 'Email is required';
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        errors.email = 'Email is invalid';
      }
      
      if (formData.rating === 0) {
        errors.rating = 'Please select a rating';
      }
      
      if (!formData.message.trim()) {
        errors.message = 'Feedback message is required';
      } else if (formData.message.trim().length < 10) {
        errors.message = 'Please provide more detailed feedback (at least 10 characters)';
      }
      
      setFormErrors(errors);
    }
  }, [formData, formTouched]);

  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    setFormTouched(true);
  };


  const handleRatingClick = (rating) => {
    setFormData({
      ...formData,
      rating,
    });
    setFormTouched(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormTouched(true);
    

    if (Object.keys(formErrors).length > 0) {
      return;
    }
    
    setIsSubmitting(true);
    setError(null);

    try {
     
   
      await new Promise(resolve => setTimeout(resolve, 1500));
      
   
      console.log('Feedback submitted:', formData);
      
    
      setSubmitted(true);
      
   
      setFormData({
        name: '',
        email: '',
        phone: '',
        feedbackType: 'general',
        rating: 0,
        message: '',
      });
      setFormTouched(false);
    } catch (err) {
      setError('There was an error submitting your feedback. Please try again.');
      console.error('Error submitting feedback:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="feedback-page">
      <Navbar />
      
      <div className="feedback-hero">
        <div className="feedback-hero-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
          <div className="shape shape-4"></div>
        </div>
        <div className="feedback-hero-content">
          <h1>We Value Your Feedback</h1>
          <p>Help us improve Rentora with your valuable insights and suggestions</p>
        </div>
      </div>

      <div className="feedback-container">
        {submitted ? (
          <div className="feedback-success">
            <div className="success-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
            </div>
            <h2>Thank You for Your Feedback!</h2>
            <p>We appreciate you taking the time to share your thoughts with us. Your feedback helps us improve Rentora for everyone.</p>
            <button 
              className="submit-new-btn"
              onClick={() => setSubmitted(false)}
            >
              Submit Another Feedback
            </button>
          </div>
        ) : (
          <div className="feedback-form-container">
            <div className="feedback-form-header">
              <h2>Share Your Experience</h2>
              <p>We're constantly working to make Rentora better for our users. Your feedback is invaluable to us.</p>
            </div>

            <form className="feedback-form" onSubmit={handleSubmit}>
              <div className={`form-group ${formErrors.name ? 'has-error' : ''}`}>
                <label htmlFor="name">Full Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  className={formErrors.name ? 'error-input' : ''}
                />
                {formErrors.name && <div className="field-error">{formErrors.name}</div>}
              </div>

              <div className="form-row">
                <div className={`form-group ${formErrors.email ? 'has-error' : ''}`}>
                  <label htmlFor="email">Email Address</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email address"
                    className={formErrors.email ? 'error-input' : ''}
                  />
                  {formErrors.email && <div className="field-error">{formErrors.email}</div>}
                </div>

                <div className="form-group">
                  <label htmlFor="phone">Phone Number (Optional)</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Enter your phone number"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="feedbackType">Feedback Type</label>
                <select
                  id="feedbackType"
                  name="feedbackType"
                  value={formData.feedbackType}
                  onChange={handleChange}
                >
                  <option value="general">General Feedback</option>
                  <option value="suggestion">Suggestion</option>
                  <option value="bug">Bug Report</option>
                  <option value="complaint">Complaint</option>
                  <option value="praise">Praise</option>
                </select>
              </div>

              <div className={`form-group ${formErrors.rating ? 'has-error' : ''}`}>
                <label>How would you rate your experience with Rentora?</label>
                <div className="rating-container">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <div 
                      key={star} 
                      className={`star ${formData.rating >= star ? 'active' : ''}`}
                      onClick={() => handleRatingClick(star)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                      </svg>
                    </div>
                  ))}
                  <span className="rating-text">
                    {formData.rating === 0 ? 'Select a rating' : 
                     formData.rating === 1 ? 'Poor' :
                     formData.rating === 2 ? 'Fair' :
                     formData.rating === 3 ? 'Good' :
                     formData.rating === 4 ? 'Very Good' : 'Excellent'}
                  </span>
                </div>
                {formErrors.rating && <div className="field-error">{formErrors.rating}</div>}
              </div>

              <div className={`form-group ${formErrors.message ? 'has-error' : ''}`}>
                <label htmlFor="message">Your Feedback</label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Please share your thoughts, suggestions, or report any issues you've encountered..."
                  rows="5"
                  className={formErrors.message ? 'error-input' : ''}
                ></textarea>
                {formErrors.message && <div className="field-error">{formErrors.message}</div>}
              </div>

              {error && <div className="error-message">{error}</div>}

              <button 
                type="submit" 
                className="submit-btn"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span className="loading-spinner"></span>
                ) : (
                  'Submit Feedback'
                )}
              </button>
            </form>
          </div>
        )}

        <div className="feedback-info">
          <div className="info-card">
            <div className="info-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="16" x2="12" y2="12"></line>
                <line x1="12" y1="8" x2="12.01" y2="8"></line>
              </svg>
            </div>
            <h3>Why Your Feedback Matters</h3>
            <p>Your insights help us understand what's working well and where we can improve. We use your feedback to enhance our platform and provide better service.</p>
          </div>

          <div className="info-card">
            <div className="info-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
              </svg>
            </div>
            <h3>Need Immediate Help?</h3>
            <p>For urgent matters, please contact our customer support team directly at <a href="mailto:support@rentora.com">support@rentora.com</a> or call us at <a href="tel:+1234567890">+1 (234) 567-890</a>.</p>
          </div>

          <div className="info-card">
            <div className="info-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
            </div>
            <h3>Join Our Community</h3>
            <p>Connect with other Rentora users, share your experiences, and get tips from our community. Follow us on social media for updates and news.</p>
            <div className="social-links">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="social-link" aria-label="Facebook">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                </svg>
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="social-link" aria-label="Twitter">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path>
                </svg>
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="social-link" aria-label="Instagram">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="social-link" aria-label="LinkedIn">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                  <rect x="2" y="9" width="4" height="12"></rect>
                  <circle cx="4" cy="4" r="2"></circle>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="feedback-faq">
        <h2>Frequently Asked Questions</h2>
        <div className="faq-container">
          <div className="faq-item">
            <h3>How is my feedback used?</h3>
            <p>Your feedback is reviewed by our product team and used to improve our services. We prioritize changes based on user feedback to ensure we're addressing the most important issues.</p>
          </div>
          <div className="faq-item">
            <h3>Will I receive a response to my feedback?</h3>
            <p>For general feedback, we may not respond individually. However, if you report a specific issue or request contact, our team will reach out to you via the email address provided.</p>
          </div>
          <div className="faq-item">
            <h3>How can I report a technical issue?</h3>
            <p>Select "Bug Report" in the feedback type dropdown and provide as much detail as possible about the issue, including steps to reproduce it and any error messages you received.</p>
          </div>
          <div className="faq-item">
            <h3>Can I suggest new features?</h3>
            <p>Absolutely! Select "Suggestion" in the feedback type dropdown and describe the feature you'd like to see. We love hearing your ideas for improving Rentora.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeedbackPage;