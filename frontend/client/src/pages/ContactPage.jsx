import React, { useState } from 'react';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import '../styles/Contact.css';
import { FaPhone, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [formStatus, setFormStatus] = useState({ type: '', message: '' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    

    if (!formData.name || !formData.email || !formData.message) {
      setFormStatus({
        type: 'error',
        message: 'Please fill in all required fields.'
      });
      return;
    }
    
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setFormStatus({
        type: 'error',
        message: 'Please enter a valid email address.'
      });
      return;
    }
    
    
    setFormStatus({
      type: 'loading',
      message: 'Sending your message...'
    });
    
    
    setTimeout(() => {
      setFormStatus({
        type: 'success',
        message: 'Thank you! Your message has been sent successfully.'
      });
      
      
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      });
      
      
      setTimeout(() => {
        setFormStatus({ type: '', message: '' });
      }, 5000);
    }, 1500);
  };

  return (
    <>
      <Navbar />
      <div className="contact-container">
        <div className="contact-header">
          <h1>Contact Us</h1>
          <p>We'd love to hear from you. Get in touch with us!</p>
        </div>
        
        <div className="contact-content">
          <div className="contact-info">
            <div className="contact-card">
              <FaPhone className="contact-icon" />
              <h3>Phone</h3>
              <p>+1 (555) 123-4567</p>
              <p>Mon-Fri, 9am-5pm</p>
            </div>
            
            <div className="contact-card">
              <FaEnvelope className="contact-icon" />
              <h3>Email</h3>
              <p>info@rentora.com</p>
              <p>support@rentora.com</p>
            </div>
            
            <div className="contact-card">
              <FaMapMarkerAlt className="contact-icon" />
              <h3>Address</h3>
              <p>123 Property Street</p>
              <p>Real Estate City, RE 12345</p>
            </div>
          </div>
          
          <div className="contact-form-container">
            <h2>Send Us a Message</h2>
            <form className="contact-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="name">Name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="email">Email *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="subject">Subject</label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="message">Message *</label>
                <textarea
                  id="message"
                  name="message"
                  rows="5"
                  value={formData.message}
                  onChange={handleChange}
                  required
                ></textarea>
              </div>
              
              {formStatus.message && (
                <div className={`form-status ${formStatus.type}`}>
                  {formStatus.message}
                </div>
              )}
              
              <button type="submit" className="submit-btn">
                {formStatus.type === 'loading' ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ContactPage;