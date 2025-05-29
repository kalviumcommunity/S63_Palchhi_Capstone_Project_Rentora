import React from "react";
import { useNavigate } from "react-router-dom";
import { motion as Motion } from "framer-motion";
import '../styles/Home.css';
import '../styles/ShuffleHero.css';
import '../styles/SmoothScrollProperties.css';

import Navbar from "../components/common/Navbar";
import ShuffleHero from "../components/common/ShuffleHero";
import ParallaxProperties from "../components/common/ParallaxProperties";

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="homepage">
      <Navbar />

      {/* Hero */}
      <div className="hero">
        <video className="hero-video" autoPlay loop muted>
          <source src="/Videos/Hero Section.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        {/* Removed the overlay div */}
        <div className="hero-text">
          <h1>Rentora</h1>
          <h2>Secure & Seamless.</h2>
          <p>Verified listings and connecting buyers, sellers, and renters with confidence.</p>
          <div className="hero-buttons">
            <button className="discover" onClick={() => navigate('/properties')}>Discover</button>
            <button className="dream" onClick={() => navigate('/register')}>Find Your Dream Home</button>
          </div>
        </div>
      </div>

      {/* Recommendations - ShuffleHero */}
      <ShuffleHero />

      {/* Parallax Properties Section */}
      <ParallaxProperties />

      {/* Testimonials */}
      <div className="testimonials" style={{ backgroundColor: "rgb(247,248,247)", color: "rgb(45,56,58)", padding: "5rem 0 4.5rem", overflow: "hidden" }}>
        <div className="testimonial-header">
          <Motion.h2 
            initial={{ y: 48, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ ease: "easeInOut", duration: 0.75 }}
            className="text-4xl font-black uppercase text-center"
          >
            What Our Clients Say
          </Motion.h2>
          <Motion.p
            initial={{ y: 48, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ ease: "easeInOut", duration: 0.75, delay: 0.1 }}
            className="text-center mx-auto max-w-2xl mt-4 mb-12"
          >
            Discover how Rentora has transformed the property experience for buyers, sellers, and renters across the country
          </Motion.p>
        </div>

        {/* First Row - Moving Right */}
        <div className="testimonial-carousel-container">
          <Motion.div 
            className="testimonial-carousel right"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ ease: "easeInOut", duration: 0.75 }}
          >
            {/* First set of cards */}
            <div className="testimonial-card">
              <div className="testimonial-image">
                <img src="/testimonials/user1.jpg" alt="User 1" />
              </div>
              <div className="testimonial-content">
                <h4>Sarah Johnson</h4>
                <p>"Rentora made finding my dream apartment so easy! The verified listings gave me peace of mind, and I found the perfect place within a week."</p>
              </div>
            </div>
            <div className="testimonial-card">
              <div className="testimonial-image">
                <img src="/testimonials/user2.jpg" alt="User 2" />
              </div>
              <div className="testimonial-content">
                <h4>Michael Chen</h4>
                <p>"As a first-time homebuyer, I was nervous about the process. Rentora's platform was intuitive and the support team was incredibly helpful."</p>
              </div>
            </div>
            <div className="testimonial-card">
              <div className="testimonial-image">
                <img src="/testimonials/user3.jpg" alt="User 3" />
              </div>
              <div className="testimonial-content">
                <h4>Priya Patel</h4>
                <p>"The locality insights feature helped me choose the perfect neighborhood for my family. Couldn't be happier with our new home!"</p>
              </div>
            </div>
            <div className="testimonial-card">
              <div className="testimonial-image">
                <img src="/testimonials/user4.jpg" alt="User 4" />
              </div>
              <div className="testimonial-content">
                <h4>James Wilson</h4>
                <p>"I've used several real estate platforms, but Rentora stands out with its verified listings and seamless communication tools."</p>
              </div>
            </div>
            
            {/* Duplicate cards to ensure continuous flow */}
            <div className="testimonial-card">
              <div className="testimonial-image">
                <img src="/testimonials/user1.jpg" alt="User 1" />
              </div>
              <div className="testimonial-content">
                <h4>Sarah Johnson</h4>
                <p>"Rentora made finding my dream apartment so easy! The verified listings gave me peace of mind, and I found the perfect place within a week."</p>
              </div>
            </div>
            <div className="testimonial-card">
              <div className="testimonial-image">
                <img src="/testimonials/user2.jpg" alt="User 2" />
              </div>
              <div className="testimonial-content">
                <h4>Michael Chen</h4>
                <p>"As a first-time homebuyer, I was nervous about the process. Rentora's platform was intuitive and the support team was incredibly helpful."</p>
              </div>
            </div>
            <div className="testimonial-card">
              <div className="testimonial-image">
                <img src="/testimonials/user3.jpg" alt="User 3" />
              </div>
              <div className="testimonial-content">
                <h4>Priya Patel</h4>
                <p>"The locality insights feature helped me choose the perfect neighborhood for my family. Couldn't be happier with our new home!"</p>
              </div>
            </div>
            <div className="testimonial-card">
              <div className="testimonial-image">
                <img src="/testimonials/user4.jpg" alt="User 4" />
              </div>
              <div className="testimonial-content">
                <h4>James Wilson</h4>
                <p>"I've used several real estate platforms, but Rentora stands out with its verified listings and seamless communication tools."</p>
              </div>
            </div>
          </Motion.div>
        </div>

        {/* Second Row - Moving Left */}
        <div className="testimonial-carousel-container">
          <Motion.div 
            className="testimonial-carousel left"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ ease: "easeInOut", duration: 0.75, delay: 0.2 }}
            style={{ transform: "translateX(calc(-50%))" }} /* Start from offset position */
          >
            {/* First set of cards */}
            <div className="testimonial-card">
              <div className="testimonial-image">
                <img src="/testimonials/user5.jpg" alt="User 5" />
              </div>
              <div className="testimonial-content">
                <h4>Emma Rodriguez</h4>
                <p>"As a property owner, Rentora has simplified the process of finding reliable tenants. The verification system is a game-changer!"</p>
              </div>
            </div>
            <div className="testimonial-card">
              <div className="testimonial-image">
                <img src="/testimonials/user6.jpg" alt="User 6" />
              </div>
              <div className="testimonial-content">
                <h4>David Thompson</h4>
                <p>"The virtual tours feature saved me so much time. I was able to narrow down my options before physically visiting properties."</p>
              </div>
            </div>
            <div className="testimonial-card">
              <div className="testimonial-image">
                <img src="/testimonials/user7.jpg" alt="User 7" />
              </div>
              <div className="testimonial-content">
                <h4>Sophia Lee</h4>
                <p>"Rentora's customer service is exceptional. They were responsive and helpful throughout my entire rental process."</p>
              </div>
            </div>
            <div className="testimonial-card">
              <div className="testimonial-image">
                <img src="/testimonials/user8.jpg" alt="User 8" />
              </div>
              <div className="testimonial-content">
                <h4>Robert Garcia</h4>
                <p>"The transparent pricing and no hidden fees approach made my experience stress-free. Highly recommend Rentora!"</p>
              </div>
            </div>
            
            {/* Duplicate cards to ensure continuous flow */}
            <div className="testimonial-card">
              <div className="testimonial-image">
                <img src="/testimonials/user5.jpg" alt="User 5" />
              </div>
              <div className="testimonial-content">
                <h4>Emma Rodriguez</h4>
                <p>"As a property owner, Rentora has simplified the process of finding reliable tenants. The verification system is a game-changer!"</p>
              </div>
            </div>
            <div className="testimonial-card">
              <div className="testimonial-image">
                <img src="/testimonials/user6.jpg" alt="User 6" />
              </div>
              <div className="testimonial-content">
                <h4>David Thompson</h4>
                <p>"The virtual tours feature saved me so much time. I was able to narrow down my options before physically visiting properties."</p>
              </div>
            </div>
            <div className="testimonial-card">
              <div className="testimonial-image">
                <img src="/testimonials/user7.jpg" alt="User 7" />
              </div>
              <div className="testimonial-content">
                <h4>Sophia Lee</h4>
                <p>"Rentora's customer service is exceptional. They were responsive and helpful throughout my entire rental process."</p>
              </div>
            </div>
            <div className="testimonial-card">
              <div className="testimonial-image">
                <img src="/testimonials/user8.jpg" alt="User 8" />
              </div>
              <div className="testimonial-content">
                <h4>Robert Garcia</h4>
                <p>"The transparent pricing and no hidden fees approach made my experience stress-free. Highly recommend Rentora!"</p>
              </div>
            </div>
          </Motion.div>
        </div>

        {/* Third Row - Moving Right */}
        <div className="testimonial-carousel-container">
          <Motion.div 
            className="testimonial-carousel right"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ ease: "easeInOut", duration: 0.75, delay: 0.4 }}
          >
            {/* First set of cards */}
            <div className="testimonial-card">
              <div className="testimonial-image">
                <img src="/testimonials/user9.jpg" alt="User 9" />
              </div>
              <div className="testimonial-content">
                <h4>Olivia Martinez</h4>
                <p>"I sold my house through Rentora and was impressed by how quickly they connected me with serious buyers. The process was smooth from start to finish."</p>
              </div>
            </div>
            <div className="testimonial-card">
              <div className="testimonial-image">
                <img src="/testimonials/user10.jpg" alt="User 10" />
              </div>
              <div className="testimonial-content">
                <h4>William Kim</h4>
                <p>"The market insights helped me price my property correctly. Sold within two weeks of listing on Rentora!"</p>
              </div>
            </div>
            <div className="testimonial-card">
              <div className="testimonial-image">
                <img src="/testimonials/user11.jpg" alt="User 11" />
              </div>
              <div className="testimonial-content">
                <h4>Aisha Ahmed</h4>
                <p>"As an international student, finding accommodation was daunting. Rentora made it simple with their verified listings and secure payment system."</p>
              </div>
            </div>
            <div className="testimonial-card">
              <div className="testimonial-image">
                <img src="/testimonials/user12.jpg" alt="User 12" />
              </div>
              <div className="testimonial-content">
                <h4>Thomas Brown</h4>
                <p>"The communication tools on Rentora made negotiating with the seller straightforward. We closed the deal faster than expected!"</p>
              </div>
            </div>
            
            {/* Duplicate cards to ensure continuous flow */}
            <div className="testimonial-card">
              <div className="testimonial-image">
                <img src="/testimonials/user9.jpg" alt="User 9" />
              </div>
              <div className="testimonial-content">
                <h4>Olivia Martinez</h4>
                <p>"I sold my house through Rentora and was impressed by how quickly they connected me with serious buyers. The process was smooth from start to finish."</p>
              </div>
            </div>
            <div className="testimonial-card">
              <div className="testimonial-image">
                <img src="/testimonials/user10.jpg" alt="User 10" />
              </div>
              <div className="testimonial-content">
                <h4>William Kim</h4>
                <p>"The market insights helped me price my property correctly. Sold within two weeks of listing on Rentora!"</p>
              </div>
            </div>
            <div className="testimonial-card">
              <div className="testimonial-image">
                <img src="/testimonials/user11.jpg" alt="User 11" />
              </div>
              <div className="testimonial-content">
                <h4>Aisha Ahmed</h4>
                <p>"As an international student, finding accommodation was daunting. Rentora made it simple with their verified listings and secure payment system."</p>
              </div>
            </div>
            <div className="testimonial-card">
              <div className="testimonial-image">
                <img src="/testimonials/user12.jpg" alt="User 12" />
              </div>
              <div className="testimonial-content">
                <h4>Thomas Brown</h4>
                <p>"The communication tools on Rentora made negotiating with the seller straightforward. We closed the deal faster than expected!"</p>
              </div>
            </div>
          </Motion.div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
