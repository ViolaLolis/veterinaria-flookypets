import React, { useState, useEffect, useRef, useCallback } from 'react';
import './Styles/ImageCarousel.css';

function ImageCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const carouselRef = useRef(null);

  // Array de imágenes con URLs externas (puedes reemplazarlas con las que prefieras)
  const images = [
    {
      id: 1,
      url: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80",
      alt: "Gato 1"
    },
    {
      id: 2,
      url: "https://images.unsplash.com/photo-1533738363-b7f9aef128ce?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80",
      alt: "Gato 2"
    },
    {
      id: 3,
      url: "https://images.unsplash.com/photo-1526336024174-e58f5cdd8e13?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80",
      alt: "Gato 3"
    },
    {
      id: 4,
      url: "https://images.unsplash.com/photo-1596854407944-bf87f6fdd49e?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80",
      alt: "Gato 4"
    }
  ];

  const nextSlide = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
  }, [images.length]);

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };

  const goToSlide = (slideIndex) => {
    setCurrentIndex(slideIndex);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide();
    }, 5000);
    return () => clearInterval(interval);
  }, [nextSlide]);

  return (
    <div className="image-carousel-container">
      <h2 className="carousel-title">
        <span>Bienvenido a</span>
        <span className="highlight">Flooky Pets</span>
        
      </h2>
      <div className="full-page-carousel" ref={carouselRef}>
        <div className="carousel-inner">
          {images.map((img, index) => (
            <div 
              key={img.id}
              className={`carousel-item ${index === currentIndex ? 'active' : ''}`}
            >
              <img 
                src={img.url} 
                alt={img.alt}
                className="carousel-image"
                loading="lazy"
              />
              <div className="image-overlay"></div>
            </div>
          ))}
        </div>
        
        <button className="carousel-control prev" onClick={prevSlide}>
          <span className="carousel-control-icon">&#10094;</span>
        </button>
        <button className="carousel-control next" onClick={nextSlide}>
          <span className="carousel-control-icon">&#10095;</span>
        </button>
        
        <div className="carousel-indicators">
          {images.map((_, index) => (
            <button
              key={index}
              className={`indicator ${index === currentIndex ? 'active' : ''}`}
              onClick={() => goToSlide(index)}
              aria-label={`Ir a imagen ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default ImageCarousel;