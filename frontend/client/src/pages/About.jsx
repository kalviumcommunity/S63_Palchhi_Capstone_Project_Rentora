import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from "framer-motion";
import { FiArrowUpRight, FiHome, FiKey } from "react-icons/fi";
import '../styles/About.css';
import Navbar from '../components/common/Navbar';
import { useNavigate } from 'react-router-dom';

const About = () => {
  return (
    <>
      <Navbar />
      <div className="bg-white">
        <TextParallaxContent
          imgUrl="https://cdn.pixabay.com/photo/2017/08/27/10/16/interior-2685521_1280.jpg"
          subheading="OUR MISSION"
          heading="Transforming Real Estate Experiences"
        >
          <RentoraContent
            title="Redefining Property Rentals"
            description="Rentora is a next-generation platform designed to simplify and secure the way people rent, buy, and sell properties. We're building a community where verified listings meet genuine seekers, creating a trustworthy ecosystem for all your real estate needs."
            secondParagraph="To eliminate fake listings and unreliable transactions by creating a platform rooted in trust, transparency, and technology. Rentora helps users find real homes from real people — safely and effortlessly."
            stats={[
              { number: "1000+", label: "Verified Properties" },
              { number: "5000+", label: "Happy Users" },
              { number: "24/7", label: "Customer Support" }
            ]}
          />
        </TextParallaxContent>
        
        <TextParallaxContent
          imgUrl="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=2053&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          subheading="OUR JOURNEY"
          heading="The Rentora Story"
        >
          <RentoraContent
            title="From Challenge to Solution"
            description="Rentora was born out of a real problem — fake listings, poor communication, and confusing property platforms. We experienced these challenges firsthand and knew there had to be a better way."
            secondParagraph="So, we built Rentora to bring authenticity back to property search and listing — starting with verified users and clean design, and growing into a smarter real estate solution that puts users first."
            timeline={[
              { year: "2022", description: "Concept development and market research" },
              { year: "2023", description: "Platform launch and first verified listings" },
              { year: "2024", description: "Expanding features and growing community" }
            ]}
          />
        </TextParallaxContent>
        
        <TextParallaxContent
          imgUrl="https://images.unsplash.com/photo-1582883040775-f98dd8c04597?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          subheading="OUR PRINCIPLES"
          heading="What We Value"
        >
          <RentoraContent
            title="The Rentora Advantage"
            description="At Rentora, our values guide everything we do. They shape our decisions, our platform, and our community."
            secondParagraph="We prioritize creating a secure environment with verified listings, believe in a user-friendly interface, constantly evolve our platform, and foster connections between property owners and seekers."
            values={[
              { icon: "🛡", title: "Trust & Safety", description: "We prioritize creating a secure environment with verified listings and secure interactions", className: "trust-safety" },
              { icon: "⚡", title: "Simplicity", description: "We believe in a fast, user-friendly interface that makes property transactions effortless" },
              { icon: "🧠", title: "Innovation", description: "We constantly evolve our platform with intelligent filters and smart features" },
              { icon: "👥", title: "Community", description: "We foster connections between property owners and seekers, building a supportive ecosystem" }
            ]}
          />
        </TextParallaxContent>

        {/* CTA Section */}
        <motion.section 
          className="cta-section"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
          whileHover={{ 
            y: -5,
            boxShadow: "0 15px 40px rgba(33, 150, 243, 0.15)",
            borderColor: "rgba(33, 150, 243, 0.2)"
          }}
        >
          <div className="cta-content">
            <motion.div
              className="cta-icon-container"
              initial={{ opacity: 0, scale: 0.5 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ 
                type: "spring", 
                stiffness: 300, 
                damping: 15, 
                delay: 0.1 
              }}
            >
              <FiKey className="cta-icon" />
            </motion.div>
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="cta-heading"
            >
              Ready to Transform Your Rental Experience?
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              Join the Rentora community and discover a new standard in property rentals
            </motion.p>
            <motion.div 
              className="cta-buttons"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <motion.a 
                href="/listings" 
                className="cta-button primary"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ 
                  type: "spring", 
                  stiffness: 300, 
                  damping: 20, 
                  delay: 0.6 
                }}
              >
                Explore Properties <FiArrowUpRight className="inline ml-1" />
              </motion.a>
              <motion.a 
                href="/contact" 
                className="cta-button secondary"
                whileHover={{ 
                  scale: 1.05, 
                  backgroundColor: "rgba(33, 150, 243, 0.05)",
                  color: "var(--about-bright-blue)",
                  borderColor: "var(--about-bright-blue)"
                }}
                whileTap={{ scale: 0.95 }}
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ 
                  type: "spring", 
                  stiffness: 300, 
                  damping: 20, 
                  delay: 0.7 
                }}
              >
                Contact Us
              </motion.a>
            </motion.div>
          </div>
        </motion.section>
      </div>
    </>
  );
};

const IMG_PADDING = 12;

const TextParallaxContent = ({ imgUrl, subheading, heading, children }) => {
  return (
    <div
      style={{
        paddingLeft: IMG_PADDING,
        paddingRight: IMG_PADDING,
      }}
    >
      <div className="relative h-[150vh]">
        <StickyImage imgUrl={imgUrl} />
        <OverlayCopy heading={heading} subheading={subheading} />
      </div>
      {children}
    </div>
  );
};

const StickyImage = ({ imgUrl }) => {
  const targetRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["end end", "end start"],
  });
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.85]);
  const opacity = useTransform(scrollYProgress, [0, 1], [1, 0]);
  return (
    <motion.div
      style={{
        backgroundImage: `url(${imgUrl})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        height: `calc(100vh - ${IMG_PADDING * 2}px)`,
        top: IMG_PADDING,
        scale,
      }}
      ref={targetRef}
      className="sticky z-0 overflow-hidden rounded-3xl"
    >
      <motion.div
        className="absolute inset-0 bg-neutral-950/70"
        style={{
          opacity,
        }}
      />
    </motion.div>
  );
};

const OverlayCopy = ({ subheading, heading }) => {
  const targetRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [250, -250]);
  const opacity = useTransform(scrollYProgress, [0.25, 0.5, 0.75], [0, 1, 0]);
  return (
    <motion.div
      style={{
        y,
        opacity,
      }}
      ref={targetRef}
      className="absolute left-0 top-0 flex h-screen w-full flex-col items-center justify-center text-white"
    >
      <p className="mb-2 text-center text-xl md:mb-4 md:text-3xl">
        {subheading}
      </p>
      <p className="text-center text-4xl font-bold md:text-7xl">{heading}</p>
    </motion.div>
  );
};

const RentoraContent = ({ title, description, secondParagraph, stats, timeline, values }) => (
  <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 px-4 pb-24 pt-12 md:grid-cols-12">
    <h2 className="col-span-1 text-3xl font-bold md:col-span-4">
      {title}
    </h2>
    <div className="col-span-1 md:col-span-8">
      <p className="mb-4 text-xl text-neutral-600 md:text-2xl">
        {description}
      </p>
      <p className="mb-8 text-xl text-neutral-600 md:text-2xl">
        {secondParagraph}
      </p>
      
      {stats && (
        <div className="stats-container mb-8">
          {stats.map((stat, index) => (
            <div className="stat-item" key={index}>
              <span className="stat-number">{stat.number}</span>
              <span className="stat-label">{stat.label}</span>
            </div>
          ))}
        </div>
      )}
      
      {timeline && (
        <div className="timeline mb-8">
          {timeline.map((item, index) => (
            <motion.div 
              className="timeline-item" 
              key={index}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
              viewport={{ once: true }}
            >
              <motion.div 
                className="timeline-marker"
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                transition={{ 
                  type: "spring", 
                  stiffness: 300, 
                  damping: 15, 
                  delay: index * 0.2 + 0.2 
                }}
                viewport={{ once: true }}
              ></motion.div>
              <div className="timeline-content">
                <motion.h4
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.2 + 0.3 }}
                  viewport={{ once: true }}
                >{item.year}</motion.h4>
                <motion.p
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.2 + 0.4 }}
                  viewport={{ once: true }}
                >{item.description}</motion.p>
              </div>
            </motion.div>
          ))}
        </div>
      )}
      
      {values && (
        <div className="values-list mb-8">
          {values.map((value, index) => (
            <motion.div 
              className={`value-item ${value.className || ''}`} 
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ 
                y: -5, 
                boxShadow: "0 10px 20px rgba(0,0,0,0.1)",
                backgroundColor: "var(--about-accent-blue)"
              }}
            >
              <motion.div 
                className="value-icon"
                initial={{ scale: 0.8, rotate: -10 }}
                whileInView={{ scale: 1, rotate: 0 }}
                transition={{ 
                  type: "spring", 
                  stiffness: 300, 
                  damping: 15, 
                  delay: index * 0.1 + 0.2 
                }}
                whileHover={{ scale: 1.2, rotate: 5 }}
              >
                {value.icon}
              </motion.div>
              <div className="value-text">
                <motion.h3
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.1 + 0.3 }}
                >
                  {value.title}
                </motion.h3>
                <motion.p
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.1 + 0.4 }}
                >
                  {value.description}
                </motion.p>
              </div>
            </motion.div>
          ))}
        </div>
      )}
      
      <button className="w-full rounded bg-neutral-900 px-9 py-4 text-xl text-white transition-colors hover:bg-neutral-700 md:w-fit">
        Learn more <FiArrowUpRight className="inline" />
      </button>
    </div>
  </div>
);

export default About;
 