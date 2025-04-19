import React from "react";
import { useNavigate } from "react-router-dom";
import '../styles/Home.css';

import bgImage from '../../public/bgImage.png';
import propertyImage1 from '../../public/propertyImage1.png';
import propertyImage from '../../public/propertyImage.png';
import propertyImage2 from '../../public/propertyImage2.png';
import propertyImage3 from '../../public/propertyImage3.png';
import dreamHomeImage from '../../public/dreamHomeImage.png';
import rentalHomeImage from '../../public/rentalHomeImage.png';
import localityInsightsImage from '../../public/localityInsightsImage.png';
import genuineReviewsImage from '../../public/genuineReviewsImage.png';
import latestNewsImage from '../../public/latestNewsImage.png';
import aboutPropertyImage from '../../public/aboutPropertyImage.png';
import familyImg from '../../public/familyImg.png';

import Navbar from "../components/common/Navbar";
import Footer from "../components/common/Footer";

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="homepage">
      <Navbar />

      {/* Hero */}
      <div className="hero" style={{ backgroundImage: `url(${bgImage})` }}>
        <div className="hero-text">
          <h1>Rentora</h1>
          <h2>Secure & Seamless.</h2>
          <p>Verified listings and connecting buyers, sellers, and renters with confidence.</p>
          <div className="hero-buttons">
            <button className="discover">Discover</button>
            <button className="dream" onClick={() => navigate('/register')}>Find Your Dream Home</button>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="recommend-section">
        <h2>Connecting real people with real homes—affordably and safely.</h2>

        <div className="recommend-block">
          <div className="recommend-text">
            <h3>Get home recommendations</h3>
            <p>Sign in for a more personalized experience.</p>
            <button className="signup" onClick={() => navigate('/register')}>Sign Up</button>
            <div className="recommend-tags">
              <div className="tag blue">Recommended homes based on your monthly budget</div>
              <div className="tag orange">Recommended homes based on your preferred location</div>
            </div>
          </div>
          <div className="recommend-card">
            <img src={propertyImage} alt="Recommendation" />
          </div>
        </div>
      </div>

      {/* Properties */}
      <div className="property-cards">
        <div className="card">
          <img src={propertyImage1} alt="Bricks Marvella" />
          <h4>Bricks Marvella</h4>
          <p>2, 3, 4 BHK Apartment, Tellapur, Hyderabad</p>
          <p>₹99.71 Lacs - ₹2.68 Cr</p>
          <button className="for-sale">For Sell</button>
        </div>
        <div className="card">
          <img src={propertyImage2} alt="Flat" />
          <h4>5 BHK Fully Furnished Flat</h4>
          <p>For Rent in Dasarahalli, Jaipur</p>
          <p>₹2,000 Rent / ₹75,000 Security / 750 sq.ft</p>
          <button className="for-sale">For Rent</button>
        </div>
        <div className="card">
          <img src={propertyImage3} alt="Rudraksh" />
          <h4>Shaligram Rudraksh Kingston</h4>
          <p>Independent House/Villa, Bawadia Kalan, Bhopal</p>
          <p>Price On Request</p>
          <button className="for-sale">For Sell</button>
        </div>
      </div>

      {/* Lifestyle Section */}
      <div className="lifestyle">
        <div className="left">
          <img src={dreamHomeImage} alt="Lifestyle" />
        </div>
        <div className="right">
          <h2>Find, Buy & Own Your Dream Home</h2>
          <p>Explore from Apartments, land, penthouse, townhouses, villas and more</p>
          <button className="explore">Explore Buying</button>
        </div>

        <div className="middle-image">
          <img src={familyImg} alt="Separator" />
        </div>

        <div className="right"></div>

        <div className="left">
          <img src={rentalHomeImage} alt="Rental" />
          <h2>Rental Homes for Everyone</h2>
          <p>Explore from Apartments, land, penthouse, townhouses, villas and more</p>
          <button className="explore">Explore Renting</button>
        </div>
      </div>

      {/* Insights */}
      <div className="insights">
        <div className="insight-header">
          <h2>Insights & Tools</h2>
          <p>Go from browsing to buying</p>
          <button className="insight-btn">View all Insights</button>
        </div>

        <div className="insight-cards">
          <div className="insight-card">
            <img src={localityInsightsImage} alt="Locality" />
            <h5>Locality Insights</h5>
            <p>Know more about different localities</p>
          </div>
          <div className="insight-card">
            <img src={genuineReviewsImage} alt="Reviews" />
            <h5>Genuine Reviews</h5>
            <p>Know what residents are saying</p>
          </div>
          <div className="insight-card">
            <img src={latestNewsImage} alt="News" />
            <h5>Latest News</h5>
            <p>Around real estate and allied industries</p>
          </div>
          <div className="insight-card">
            <img src={aboutPropertyImage} alt="Property" />
            <h5>About My Property</h5>
            <p>Track prices & analyse market demands</p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default HomePage;
