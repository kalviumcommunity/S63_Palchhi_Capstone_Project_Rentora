import React, { useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  motion as Motion,
  useMotionTemplate,
  useScroll,
  useTransform,
} from "framer-motion";
import { FiMapPin } from "react-icons/fi";

const SECTION_HEIGHT = 1500;

const ParallaxProperties = () => {
  return (
    <div className="bg-zinc-950">
      <Hero />
      <FeaturedProperties />
    </div>
  );
};

const Hero = () => {
  return (
    <div
      style={{ height: `calc(${SECTION_HEIGHT}px + 100vh)` }}
      className="relative w-full"
    >
      <CenterImage />
      <ParallaxImages />
      <div className="absolute bottom-0 left-0 right-0 h-96 bg-gradient-to-b from-zinc-950/0 to-zinc-950" />
    </div>
  );
};

const CenterImage = () => {
  const { scrollY } = useScroll();
  const clip1 = useTransform(scrollY, [0, 1500], [25, 0]);
  const clip2 = useTransform(scrollY, [0, 1500], [75, 100]);
  const clipPath = useMotionTemplate`polygon(${clip1}% ${clip1}%, ${clip2}% ${clip1}%, ${clip2}% ${clip2}%, ${clip1}% ${clip2}%)`;
  const backgroundSize = useTransform(
    scrollY,
    [0, SECTION_HEIGHT + 500],
    ["170%", "100%"]
  );
  const opacity = useTransform(
    scrollY,
    [SECTION_HEIGHT, SECTION_HEIGHT + 500],
    [1, 0]
  );
  return (
    <Motion.div
      className="sticky top-0 h-screen w-full"
      style={{
        clipPath,
        backgroundSize,
        opacity,
        backgroundImage:
          "url(/dreamHomeImage.png)",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    />
  );
};

const ParallaxImages = () => {
  return (
    <div className="mx-auto max-w-5xl px-4 pt-200px">
      <ParallaxImg
        src="/propertyImage1.png"
        alt="Luxury villa with pool"
        start={-200}
        end={200}
        className="w-1/3"
      />
      <ParallaxImg
        src="/propertyImage2.png"
        alt="Modern apartment interior"
        start={200}
        end={-250}
        className="mx-auto w-2/3"
      />
      <ParallaxImg
        src="/PropertyImage3.png"
        alt="Beachfront property"
        start={-200}
        end={200}
        className="ml-auto w-1/3"
      />
      <ParallaxImg
        src="/rentalHomeImage.png"
        alt="Penthouse with city view"
        start={0}
        end={-500}
        className="ml-24 w-5/12"
      />
    </div>
  );
};

const ParallaxImg = ({ className, alt, src, start, end }) => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: [`${start}px end`, `end ${end * -1}px`],
  });
  const opacity = useTransform(scrollYProgress, [0.75, 1], [1, 0]);
  const scale = useTransform(scrollYProgress, [0.75, 1], [1, 0.85]);
  const y = useTransform(scrollYProgress, [0, 1], [start, end]);
  const transform = useMotionTemplate`translateY(${y}px) scale(${scale})`;
  return (
    <Motion.img
      src={src}
      alt={alt}
      className={className}
      ref={ref}
      style={{ transform, opacity }}
    />
  );
};

const FeaturedProperties = () => {
  return (
    <section
      id="featured-properties"
      className="mx-auto max-w-5xl px-4 py-48 text-white"
    >
      <Motion.h1
        initial={{ y: 48, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        transition={{ ease: "easeInOut", duration: 0.75 }}
        className="mb-20 text-4xl font-black uppercase text-zinc-50"
      >
        Featured Properties
      </Motion.h1>
      <PropertyItem 
        title="Bricks Marvella" 
        date="₹99.71 Lacs - ₹2.68 Cr" 
        location="Hyderabad" 
      />
      <PropertyItem 
        title="5 BHK Fully Furnished Flat" 
        date="₹2,000 Rent / Month" 
        location="Jaipur" 
      />
      <PropertyItem 
        title="Shaligram Rudraksh Kingston" 
        date="Price On Request" 
        location="Bhopal" 
      />
      <PropertyItem 
        title="Luxury Penthouse" 
        date="₹1.5 Cr" 
        location="Mumbai" 
      />
      <PropertyItem 
        title="Beachfront Villa" 
        date="₹3.2 Cr" 
        location="Goa" 
      />
      <PropertyItem 
        title="Modern Studio Apartment" 
        date="₹15,000 Rent / Month" 
        location="Bangalore" 
      />
      <PropertyItem 
        title="Heritage Haveli" 
        date="₹2.8 Cr" 
        location="Udaipur" 
      />
    </section>
  );
};

const PropertyItem = ({ title, date, location }) => {
  const navigate = useNavigate();
  
  return (
    <Motion.div
      initial={{ y: 48, opacity: 0 }}
      whileInView={{ y: 0, opacity: 1 }}
      transition={{ ease: "easeInOut", duration: 0.75 }}
      className="mb-9 flex items-center justify-between border-b border-zinc-800 px-3 pb-9 cursor-pointer"
      onClick={() => navigate('/properties')}
    >
      <div>
        <p className="mb-1-5 text-xl text-zinc-50">{title}</p>
        <p className="text-sm uppercase text-zinc-500">{date}</p>
      </div>
      <div className="flex items-center gap-1-5 text-end text-sm uppercase text-zinc-500">
        <p>{location}</p>
        <FiMapPin />
      </div>
    </Motion.div>
  );
};

export default ParallaxProperties;