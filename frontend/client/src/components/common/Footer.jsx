import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from 'react-icons/fa';
import { MdEmail, MdPhone } from 'react-icons/md';
import '../../styles/Footer.css';

const Footer = () => {
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6 }
    }
  };

  const handleEmailClick = () => {
    window.location.href = 'mailto:support@rentora.com';
  };

  const handlePhoneClick = () => {
    window.location.href = 'tel:+918000123456';
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <footer className="footer">
      <div className="footer-container">
        <motion.div 
          className="footer-column"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeIn}
        >
          <h4>Find Properties</h4>
          <ul>
            <li onClick={scrollToTop}><Link to="/properties?propertyType=rent">Rent</Link></li>
            <li onClick={scrollToTop}><Link to="/properties?propertyType=sale">Buy</Link></li>
            <li onClick={scrollToTop}><Link to="/properties">Search</Link></li>
            <li onClick={scrollToTop}><Link to="/register">List Property</Link></li>
          </ul>
        </motion.div>
        
        <motion.div 
          className="footer-column"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeIn}
          transition={{ delay: 0.2 }}
        >
          <h4>Company</h4>
          <ul>
            <li onClick={scrollToTop}><Link to="/about">About Us</Link></li>
            <li onClick={scrollToTop}><Link to="/contact">Contact Us</Link></li>
            <li onClick={scrollToTop}><Link to="/terms">Terms & Conditions</Link></li>
            <li onClick={scrollToTop}><Link to="/privacy">Privacy Policy</Link></li>
          </ul>
        </motion.div>
        
        <motion.div 
          className="footer-column contact-column"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeIn}
          transition={{ delay: 0.4 }}
        >
          <h4>Contact</h4>
          <div className="contact-info">
            <div className="contact-item" onClick={handleEmailClick}>
              <MdEmail className="contact-icon" />
              <span>support@rentora.com</span>
            </div>
            <div className="contact-item" onClick={handlePhoneClick}>
              <MdPhone className="contact-icon" />
              <span>+91 8000 123 456</span>
            </div>
          </div>
          
          <div className="social-media">
            <div className="social-icons">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer"><FaFacebook /></a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer"><FaTwitter /></a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer"><FaInstagram /></a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer"><FaLinkedin /></a>
            </div>
          </div>
        </motion.div>
      </div>
      
      <motion.div 
        className="footer-bottom"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeIn}
      >
        <p>&copy; {new Date().getFullYear()} Rentora. All rights reserved.</p>
      </motion.div>
    </footer>
  );
};

export default Footer;
