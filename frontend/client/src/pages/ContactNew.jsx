import React, { useState, useEffect } from 'react';
import '../styles/Contact.css';
import { FaEnvelope, FaPhone, FaMapMarkerAlt, FaWhatsapp, FaFacebookF, FaInstagram, FaLinkedinIn, FaTwitter, FaCheck, FaSpinner } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import { useAuth } from '../context/AuthContext';
import axios from '../utils/axiosConfig';

const ContactNew = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    fullName: user ? user.name : '',
    phone: user ? user.phone || '' : '',
    email: user ? user.email : '',
    message: '',
    propertyInterest: 'buy',
    budget: '',
    preferredLocation: ''
  });

  const [status, setStatus] = useState({ 
    loading: false, 
    message: '', 
    success: null 
  });
  
  const [formErrors, setFormErrors] = useState({});
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const navigate = useNavigate();

  const validateForm = () => {
    const errors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\d{10}$/;

    if (!formData.fullName.trim()) errors.fullName = "Name is required";
    if (!formData.email.trim()) errors.email = "Email is required";
    else if (!emailRegex.test(formData.email)) errors.email = "Invalid email format";
    if (!formData.phone.trim()) errors.phone = "Phone number is required";
    else if (!phoneRegex.test(formData.phone)) errors.phone = "Phone must be 10 digits";
    if (!formData.message.trim()) errors.message = "Message is required";
    if (!formData.preferredLocation.trim()) errors.preferredLocation = "Location is required";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: null
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setStatus({ loading: true, message: '', success: null });

    try {
      const res = await axios.post('/contact', formData);
      
      setStatus({ 
        loading: false, 
        message: res.data.message || 'Message sent successfully!', 
        success: true 
      });
      
      setShowSuccessAnimation(true);
      
      
      setFormData({
        fullName: user ? user.name : '',
        phone: user ? user.phone || '' : '',
        email: user ? user.email : '',
        message: '',
        propertyInterest: 'buy',
        budget: '',
        preferredLocation: ''
      });
      
    
      setTimeout(() => {
        setShowSuccessAnimation(false);
      }, 3000);
      
    } catch (err) {
      console.error('Contact form error:', err);
      setStatus({ 
        loading: false, 
        message: err.response?.data?.error || 'Something went wrong. Please try again.', 
        success: false 
      });
    }
  };

  
  const offices = [
    {
      city: "Mumbai",
      address: "Rentora Tower, 42 Marine Drive, Mumbai 400001",
      phone: "+91 22 1234 5678",
      email: "mumbai@rentora.com"
    },
    {
      city: "Delhi",
      address: "Rentora House, 15 Connaught Place, New Delhi 110001",
      phone: "+91 11 2345 6789",
      email: "delhi@rentora.com"
    },
    {
      city: "Bangalore",
      address: "Rentora Heights, 78 MG Road, Bangalore 560001",
      phone: "+91 80 3456 7890",
      email: "bangalore@rentora.com"
    }
  ];


  const faqs = [
    {
      question: "How do I schedule a property viewing?",
      answer: "You can schedule a viewing by contacting us through this form, calling our office, or requesting a viewing directly from the property listing page."
    },
    {
      question: "What documents do I need for renting a property?",
      answer: "Typically, you'll need ID proof, address proof, income proof, and sometimes references from previous landlords."
    },
    {
      question: "Do you charge any brokerage fees?",
      answer: "Our fee structure varies based on the service. For rentals, we typically charge one month's rent as brokerage. For sales, our commission is 2% of the property value."
    }
  ];

  return (
    <>
      <Navbar />
      
      {/* Hero Section */}
      <div className="contact-hero">
        <div className="contact-hero-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
          <div className="shape shape-4"></div>
        </div>
        <div className="contact-hero-content">
          <h1>Get in Touch</h1>
          <p>We're here to help you find your perfect property</p>
        </div>
      </div>
      
      <div className="contact-page">
        {user && (user.role === 'admin' || user.role === 'seller') && (
          <div className="admin-actions">
            <button onClick={() => navigate('/all-contacts')} className="view-contacts-btn">
              View All Contact Submissions
            </button>
          </div>
        )}
        <div className="contact-container">
          {/* Main Content */}
          <div className="contact-main">
            {/* Left Column - Form */}
            <div className="contact-form-container">
              <div className="form-header">
                <h2>Send Us a Message</h2>
                <p>Fill out the form below and our team will get back to you within 24 hours</p>
              </div>
              
              <form onSubmit={handleSubmit} className="contact-form">
                <div className="form-group">
                  <label htmlFor="fullName">Full Name*</label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    className={formErrors.fullName ? 'error' : ''}
                  />
                  {formErrors.fullName && <span className="error-message">{formErrors.fullName}</span>}
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="email">Email Address*</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={formErrors.email ? 'error' : ''}
                    />
                    {formErrors.email && <span className="error-message">{formErrors.email}</span>}
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="phone">Phone Number*</label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className={formErrors.phone ? 'error' : ''}
                    />
                    {formErrors.phone && <span className="error-message">{formErrors.phone}</span>}
                  </div>
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="propertyInterest">I'm interested in</label>
                    <select
                      id="propertyInterest"
                      name="propertyInterest"
                      value={formData.propertyInterest}
                      onChange={handleChange}
                    >
                      <option value="buy">Buying a property</option>
                      <option value="rent">Renting a property</option>
                      <option value="sell">Selling my property</option>
                      <option value="other">Other inquiry</option>
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="budget">Budget (optional)</label>
                    <input
                      type="text"
                      id="budget"
                      name="budget"
                      placeholder="₹"
                      value={formData.budget}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <label htmlFor="preferredLocation">Preferred Location*</label>
                  <input
                    type="text"
                    id="preferredLocation"
                    name="preferredLocation"
                    value={formData.preferredLocation}
                    onChange={handleChange}
                    className={formErrors.preferredLocation ? 'error' : ''}
                  />
                  {formErrors.preferredLocation && <span className="error-message">{formErrors.preferredLocation}</span>}
                </div>
                
                <div className="form-group">
                  <label htmlFor="message">Your Message*</label>
                  <textarea
                    id="message"
                    name="message"
                    rows="5"
                    value={formData.message}
                    onChange={handleChange}
                    className={formErrors.message ? 'error' : ''}
                  ></textarea>
                  {formErrors.message && <span className="error-message">{formErrors.message}</span>}
                </div>
                
                <button 
                  type="submit" 
                  className="submit-button"
                  disabled={status.loading}
                >
                  {status.loading ? (
                    <>
                      <FaSpinner className="spinner" /> Sending...
                    </>
                  ) : (
                    'Send Message'
                  )}
                </button>
                
                {status.message && !showSuccessAnimation && (
                  <div className={`response-message ${status.success ? 'success' : 'error'}`}>
                    {status.message}
                  </div>
                )}
                
                {showSuccessAnimation && (
                  <div className="success-animation">
                    <div className="checkmark-circle">
                      <FaCheck className="checkmark" />
                    </div>
                    <p>Message sent successfully!</p>
                  </div>
                )}
              </form>
            </div>
            
            {/* Right Column - Contact Info */}
            <div className="contact-info-container">
              <div className="contact-info-card">
                <h3>Contact Information</h3>
                <p>Feel free to reach out to us through any of these channels</p>
                
                <div className="contact-details">
                  <div className="contact-item">
                    <FaPhone className="contact-icon" />
                    <div>
                      <h4>Phone</h4>
                      <p>+91 800 123 4567</p>
                      <p className="text-muted">Mon-Fri 9am-6pm</p>
                    </div>
                  </div>
                  
                  <div className="contact-item">
                    <FaEnvelope className="contact-icon" />
                    <div>
                      <h4>Email</h4>
                      <p>info@rentora.com</p>
                      <p className="text-muted">We reply within 24 hours</p>
                    </div>
                  </div>
                  
                  <div className="contact-item">
                    <FaMapMarkerAlt className="contact-icon" />
                    <div>
                      <h4>Head Office</h4>
                      <p>Rentora Towers, 123 Real Estate Avenue</p>
                      <p className="text-muted">Mumbai, India 400001</p>
                    </div>
                  </div>
                </div>
                
                <div className="social-links">
                  <a href="#" className="social-link"><FaFacebookF /></a>
                  <a href="#" className="social-link"><FaInstagram /></a>
                  <a href="#" className="social-link"><FaLinkedinIn /></a>
                  <a href="#" className="social-link"><FaTwitter /></a>
                </div>
                
                <div className="whatsapp-button">
                  <a href="https://wa.me/918001234567" target="_blank" rel="noreferrer">
                    <FaWhatsapp /> Chat on WhatsApp
                  </a>
                </div>
              </div>
              
              <div className="map-container">
                <iframe
                  className="google-map"
                  title="Google Map"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3771.1242673770366!2d72.82861307596283!3d19.0759837545434!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be7c8866a456c9f%3A0x8d1745d3d6d48d3b!2sBandra-Worli%20Sea%20Link!5e0!3m2!1sen!2sin!4v1698765432109!5m2!1sen!2sin"
                  allowFullScreen=""
                  loading="lazy"
                ></iframe>
              </div>
            </div>
          </div>
          
          {/* Offices Section */}
          <div className="offices-section">
            <h2>Our Offices</h2>
            <div className="offices-grid">
              {offices.map((office, index) => (
                <div className="office-card" key={index}>
                  <h3>{office.city}</h3>
                  <p className="office-address">{office.address}</p>
                  <div className="office-contact">
                    <p><FaPhone /> {office.phone}</p>
                    <p><FaEnvelope /> {office.email}</p>
                  </div>
                  <button className="office-button">Get Directions</button>
                </div>
              ))}
            </div>
          </div>
          
          {/* FAQ Section */}
          <div className="faq-section">
            <h2>Frequently Asked Questions</h2>
            <div className="faq-grid">
              {faqs.map((faq, index) => (
                <div className="faq-card" key={index}>
                  <h3>{faq.question}</h3>
                  <p>{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
          
          {/* Admin View Button - Only show for admins */}
          {user && (user.role === 'admin' || user.role === 'seller') && (
            <div className="admin-view">
              <button onClick={() => navigate('/all-contacts')}>
                View All Contact Requests
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* Call to Action */}
      <div className="contact-cta">
        <div className="cta-content">
          <h2>Ready to find your dream property?</h2>
          <p>Browse our extensive collection of premium properties</p>
          <button onClick={() => navigate('/')}>Explore Properties</button>
        </div>
      </div>
      
      <Footer />
    </>
  );
};

export default ContactNew;