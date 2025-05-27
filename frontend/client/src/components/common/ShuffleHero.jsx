import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion as Motion } from "framer-motion";

const shuffle = (array) => {
  let currentIndex = array.length,
    randomIndex;
  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }
  return array;
};


const propertyImage1 = '/propertyImage1.png';
const propertyImage2 = '/propertyImage2.png';
const PropertyImage3 = '/PropertyImage3.png';
const dreamHomeImage = '/dreamHomeImage.png';
const rentalHomeImage = '/rentalHomeImage.png';

const squareData = [
  {
    id: 1,
    src: "/property-images/home1.jpg",
    fallback: propertyImage1
  },
  {
    id: 2,
    src: "/property-images/home2.jpg",
    fallback: propertyImage2
  },
  {
    id: 3,
    src: "/property-images/home3.jpg",
    fallback: PropertyImage3
  },
  {
    id: 4,
    src: "/property-images/home4.jpg",
    fallback: dreamHomeImage
  },
  {
    id: 5,
    src: "/property-images/home5.jpg",
    fallback: rentalHomeImage
  },
  {
    id: 6,
    src: "/property-images/home6.jpg",
    fallback: propertyImage1
  },
  {
    id: 7,
    src: "/property-images/home7.jpg",
    fallback: propertyImage2
  },
  {
    id: 8,
    src: "/property-images/home8.jpg",
    fallback: PropertyImage3
  },
  {
    id: 9,
    src: "/property-images/home9.jpg",
    fallback: dreamHomeImage
  },
  {
    id: 10,
    src: "/property-images/home10.jpg",
    fallback: rentalHomeImage
  },
  {
    id: 11,
    src: "/property-images/home11.jpg",
    fallback: propertyImage1
  },
  {
    id: 12,
    src: "/property-images/home12.jpg",
    fallback: propertyImage2
  },
  {
    id: 13,
    src: "/property-images/home13.jpg",
    fallback: PropertyImage3
  },
  {
    id: 14,
    src: "/property-images/home14.jpg",
    fallback: dreamHomeImage
  },
  {
    id: 15,
    src: "/property-images/home15.jpg",
    fallback: rentalHomeImage
  },
  {
    id: 16,
    src: "/property-images/home16.jpg",
    fallback: propertyImage1
  },
];

const generateSquares = () => {
  return shuffle(squareData).map((sq) => (
    <Motion.div
      key={sq.id}
      layout
      transition={{ duration: 1.5, type: "spring" }}
      className="w-full h-full"
      style={{
        backgroundImage: `url(${sq.src}), url(${sq.fallback})`,
        backgroundSize: "cover",
      }}
    ></Motion.div>
  ));
};

const ShuffleGrid = () => {
  const timeoutRef = useRef(null);
  const [squares, setSquares] = useState(generateSquares());

  useEffect(() => {
    shuffleSquares();
    return () => clearTimeout(timeoutRef.current);
  }, []);

  const shuffleSquares = () => {
    setSquares(generateSquares());
    timeoutRef.current = setTimeout(shuffleSquares, 3000);
  };

  return (
    <div className="grid grid-cols-4 grid-rows-4 h-[450px] gap-1">
      {squares.map((sq) => sq)}
    </div>
  );
};

const ShuffleHero = () => {
  const navigate = useNavigate();
  
  return (
    <section className="recommend-section w-full px-8 py-12 grid grid-cols-1 md:grid-cols-2 items-center gap-8 max-w-6xl mx-auto">
      <div>
        <span className="block mb-4 text-xs md:text-sm text-indigo-500 font-medium">
          Trusted by thousands
        </span>
        <h2 className="text-4xl md:text-6xl font-semibold">
          Connecting real people with real homes
        </h2>
        <p className="text-base md:text-lg text-slate-700 my-4 md:my-6">
          Find your perfect home with verified listings, secure transactions, and personalized recommendations—all in one place.
        </p>
        <button 
          className="bg-indigo-500 text-white font-medium py-2 px-4 rounded transition-all hover:bg-indigo-600 active:scale-95"
          onClick={() => navigate('/register')}
        >
          Find Your Home
        </button>
      </div>
      <ShuffleGrid />
    </section>
  );
};

export default ShuffleHero;
