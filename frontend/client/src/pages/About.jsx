import React from 'react';
import '../styles/About.css';

const About = () => {
  return (
    <div className="about-page">
      {/* Top About Section */}
      <section className="about-top">
        <div className="about-text">
          <h1>🏠 About us</h1>
          <h3>Who We Are</h3>
          <p>
            Rentora is a next generation platform designed to simplify and secure the way people rent, buy, and sell properties. Whether you're a tenant looking for a verified home, a landlord waiting for genuine tenants, or someone ready to sell, Rentora is your trusted companion in the real estate journey.
          </p>
        </div>
        <div className="about-image">
          <img src="/public/about1.png" alt="About Rentora" />
        </div>
      </section>

      {/* Mission & Vision Section */}
      <section className="mission-vision">
        <div className="mission-box">
          <img src="/public/mission.png" alt="Mission" />
          <div>
            <h2>Our Mission</h2>
            <p>
              We aim to eliminate fake listings and unreliable transactions by creating a platform rooted in trust, transparency, and technology. Rentora helps users find real homes from real people — safely and effortlessly.
            </p>
          </div>
        </div>
        <div className="vision-box">
          <div>
            <h2>Our Vision</h2>
            <p>
              To redefine the real estate experience by making property dealings as seamless, secure, and accessible as online shopping. We envision a future where every rental or sell feels effortless and worry-free.
            </p>
          </div>
          <img src="/public/vision.png" alt="Vision" />
        </div>
      </section>

      {/* Story Section */}
      <section className="story-section">
        <div className="story-image">
          <img src="/public/story.png" alt="Our Story" />
        </div>
        <div className="story-text">
          <h2>Our Story</h2>
          <p>
            Rentora was born out of a real problem — fake listings, poor communication, and confusing property platforms. We experienced it firsthand and knew there had to be a better way. So, we built Rentora to bring <strong>authenticity back to property search and listing</strong> — starting with verified users and clean design, and growing into a smarter real estate solution.
          </p>
        </div>
      </section>

      {/* Why Rentora & What We Value */}
      <section className="why-value">
        <div className="why-rentora">
          <h3>Why Rentora ?</h3>
          <ul>
            <li>✔ Verified Listings</li>
            <li>✔ Multiple Discovery Modes (Fast, Flexible & Pre-order)</li>
            <li>✔ Sleek & Responsive Interface</li>
            <li>✔ Real time Updates and Smart Matches</li>
            <li>✔ Built-in User Authentication</li>
          </ul>
        </div>
        <div className="what-we-value">
          <h3>What We Value</h3>
          <ul>
            <li><strong>✔ Trust & Safety</strong> - Verified listings and secure interactions.</li>
            <li><strong>✔ Simplicity</strong> - Fast, user-friendly interface for quick actions.</li>
            <li><strong>✔ Smart Features</strong> - Intelligent filters, delivery modes, and deal suggestions.</li>
            <li><strong>✔ Community First</strong> - Built for people, powered by people.</li>
          </ul>
        </div>
      </section>

      {/* Contact Section */}
      <section className="lets-connect">
        <h3>Let's Connect</h3>
        <p>
          Have a question, suggestion, or want to partner with us? We're all ears. <a href="/contact">Visit our Contact Page</a> or drop us a message.
        </p>
      </section>
    </div>
  );
};

export default About;
