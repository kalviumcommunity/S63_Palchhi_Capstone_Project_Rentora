import React, { useState, useEffect } from 'react';
import '../styles/Contact.css';
import { FaEnvelope, FaWhatsapp } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const Contact = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    message: ''
  });

  const [status, setStatus] = useState({ loading: false, message: '', success: null });
  const navigate = useNavigate();


  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, message: '', success: null });

    try {
      const res = await fetch('http://localhost:8000/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (res.ok) {
        setStatus({ loading: false, message: data.message, success: true });
        setFormData({ fullName: '', phone: '', email: '', message: '' });
      } else {
        setStatus({ loading: false, message: data.error || 'Something went wrong', success: false });
      }
    } catch (err) {
      setStatus({ loading: false, message: 'Server Error', success: false });
    }
  };

  useEffect(() => {
 
  }, []);

  return (
    <div className="contact-page">
      <div className="contact-container">
        {/* 💬 Eye-catching Heading and Image */}
        <h2 className="main-heading fade-in">Let's Make Your Dream Home a Reality 🏠</h2>
        <p className="sub-text fade-in">
          Got a question, feedback, or partnership idea? Reach out — we’d love to help you find your perfect place with Rentora!
        </p>
        {/* <img
          //src="/public/contacts.png"
          alt="Contact Rentora"
          className="contact-image fade-in"
        /> */}

        <div className="contact-content">
          {/* 📩 Contact Form */}
          <form onSubmit={handleSubmit} className="contact-form fade-in">
            <input
              type="text"
              name="fullName"
              placeholder="Full Name"
              required
              value={formData.fullName}
              onChange={handleChange}
            />
            <input
              type="tel"
              name="phone"
              placeholder="Phone"
              required
              value={formData.phone}
              onChange={handleChange}
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              required
              value={formData.email}
              onChange={handleChange}
            />
            <textarea
              name="message"
              placeholder="Your Message"
              required
              value={formData.message}
              onChange={handleChange}
            ></textarea>
            <button type="submit" disabled={status.loading}>
              {status.loading ? 'Submitting...' : 'Submit'}
            </button>
            {status.message && (
              <div className={`response-message ${status.success ? 'success' : 'error'}`}>
                {status.message}
              </div>
            )}
          </form>

          {/* 📍 Contact Info */}
          <div className="contact-info fade-in">
            <div className="icons">
              <a href="mailto:rentora@gmail.com" target="_blank" rel="noreferrer">
                <FaEnvelope /> Email Us
              </a>
              <a href="https://wa.me/1234567890" target="_blank" rel="noreferrer">
                <FaWhatsapp /> WhatsApp
              </a>
            </div>

            <iframe
              className="google-map"
              title="Google Map"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3153.404354627481!2d144.95592321531676!3d-37.81665397975152!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x6ad65d5df12d61e7%3A0x4f0d19f64567f94!2sEnvato!5e0!3m2!1sen!2sin!4v1614525268774!5m2!1sen!2sin"
              allowFullScreen=""
              loading="lazy"
            ></iframe>
          </div>
        </div>

        {/* 👁️ View All Contacts CTA */}
        <div className="admin-view">
          <button onClick={() => navigate('/all-contacts')}>
            View All Contacts
          </button>
        </div>
      </div>
    </div>
  );
};

export default Contact;
