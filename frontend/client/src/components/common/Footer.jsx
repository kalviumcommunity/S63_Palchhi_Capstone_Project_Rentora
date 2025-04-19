import React from 'react';
import '../../styles/Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-column">
          <h4>Rentora</h4>
          <ul>
            <li>Mobile Apps</li>
            <li>Our Services</li>
            <li>Price Trends</li>
            <li>Post your Property</li>
            <li>Real Estate Investments</li>
            <li>Builders in India</li>
            <li>Area Converter</li>
            <li>Articles</li>
            <li>Rent Receipt</li>
            <li>Customer service</li>
          </ul>
        </div>
        <div className="footer-column">
          <h4>Company</h4>
          <ul>
            <li>About us</li>
            <li>Contact us</li>
            <li>Careers with us</li>
            <li>Terms & Conditions</li>
            <li>Request Info</li>
            <li>Feedback</li>
            <li>Report a Problem</li>
            <li>Privacy Policy</li>
            <li>Testimonials</li>
            <li>Safety Guide</li>
          </ul>
        </div>
        <div className="footer-column">
          <h4>For owners & tenants</h4>
          <ul>
            <li>List Your Property</li>
            <li>Refer an Owner</li>
            <li>Refer a Tenant</li>
          </ul>
        </div>
        <div className="footer-column">
          <h4>More Info</h4>
          <ul>
            <li>Help Center</li>
            <li>Privacy Policy</li>
            <li>Terms of Use</li>
          </ul>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
