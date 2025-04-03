import React, { useState, useEffect, useRef, useCallback } from 'react';
import './Styles/ImageCarousel.css';

function ImageCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const carrouselRef = useRef(null);
  const [catImages, setCatImages] = useState([]);

  useEffect(() => {
    fetch('https://api.thecatapi.com/v1/images/search?limit=20')
      .then(response => response.json())
      .then(data => {
        setCatImages(data);
      })
      .catch(error => console.error("Error fetching cat images:", error));
  }, []);

  const updateCarouselPosition = useCallback(() => {
    if (carrouselRef.current) {
      const translateValue = -currentIndex * 100 + '%';
      carrouselRef.current.style.transform = `translateX(${translateValue})`;
    }
  }, [carrouselRef, currentIndex]);

  const nextSlide = useCallback(() => {
    if (carrouselRef.current && catImages.length > 0) {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % catImages.length);
      updateCarouselPosition();
    }
  }, [carrouselRef, catImages, updateCarouselPosition]);

  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide();
    }, 5000);
    return () => clearInterval(interval);
  }, [catImages, nextSlide]);

  const goToSlide = (slideIndex) => {
    setCurrentIndex(slideIndex);
    updateCarouselPosition();
  };

  return (
    <section className="image-carousel-section">
      <h2>Galería de Mascotas Felices</h2>
      <div className="content-all">
        <div className="carousel-indicators top">
          {catImages.map((_, index) => (
            <button
              key={index}
              className={`indicator-button ${currentIndex === index ? 'active' : ''}`}
              onClick={() => goToSlide(index)}
            />
          ))}
        </div>
        <div className="content-carrousel" ref={carrouselRef}>
          {catImages.map((cat, index) => (
            <figure key={index}>
              <img src={cat.url} alt={`Gato ${index + 1}`} />
            </figure>
          ))}
        </div>
        <div className="carousel-indicators bottom">
          {catImages.map((_, index) => (
            <button
              key={index}
              className={`indicator-button ${currentIndex === index ? 'active' : ''}`}
              onClick={() => goToSlide(index)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default ImageCarousel;