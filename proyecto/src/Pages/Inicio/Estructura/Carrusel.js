import React, { useState, useEffect } from 'react';
import './Styles/Carrusel.css';

const images = [
  "https://cdn2.thedogapi.com/images/BJa4kxc4X.jpg",
  "https://cdn2.thecatapi.com/images/MTY3ODIyMQ.jpg",
  "https://cdn2.thedogapi.com/images/SkM9sec47.jpg",
];

function Carrusel() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="carousel-container">
      <img src={images[index]} alt="Mascota" className="carousel-image" />
    </div>
  );
}

export default Carrusel;
