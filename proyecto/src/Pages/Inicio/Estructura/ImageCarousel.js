import React, { useState, useEffect, useRef, useCallback } from 'react';
import './Styles/ImageCarousel.css';

function ImageCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [catImages, setCatImages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const carouselRef = useRef(null);

  useEffect(() => {
    setIsLoading(true);
    fetch('https://api.thecatapi.com/v1/images/search?limit=20')
      .then(response => response.json())
      .then(data => {
        setCatImages(data);
        setIsLoading(false);
      })
      .catch(error => {
        console.error("Error fetching cat images:", error);
        setIsLoading(false);
      });
  }, []);

  const nextSlide = useCallback(() => {
    if (catImages.length > 0) {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % catImages.length);
    }
  }, [catImages]);

  const prevSlide = () => {
    if (catImages.length > 0) {
      setCurrentIndex((prevIndex) => 
        prevIndex === 0 ? catImages.length - 1 : prevIndex - 1
      );
    }
  };

  const goToSlide = (slideIndex) => {
    setCurrentIndex(slideIndex);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide();
    }, 5000);
    return () => clearInterval(interval);
  }, [catImages, nextSlide]);

  return (
    <div className="image-carousel-container">
      {isLoading ? (
        <div className="loading-overlay">
          <div className="spinner"></div>
          <p>Cargando imágenes de mascotas...</p>
        </div>
      ) : (
        <>
          <h2 className="carousel-title">
            <span>Bienvenido a</span>
            <span className="highlight">Flooky Pets</span>
          </h2>
          
          <div className="full-page-carousel" ref={carouselRef}>
            {catImages.length > 0 && (
              <>
                <div className="carousel-inner">
                  {catImages.map((img, index) => (
                    <div 
                      key={img.id}
                      className={`carousel-item ${index === currentIndex ? 'active' : ''}`}
                    >
                      <img 
                        src={img.url} 
                        alt={`Cat ${index}`} 
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
                  {catImages.map((_, index) => (
                    <button
                      key={index}
                      className={`indicator ${index === currentIndex ? 'active' : ''}`}
                      onClick={() => goToSlide(index)}
                      aria-label={`Ir a imagen ${index + 1}`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default ImageCarousel;