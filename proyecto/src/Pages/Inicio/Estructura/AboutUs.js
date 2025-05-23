import React, { useEffect, useRef, useState } from 'react';
import './Styles/AboutUs.css';

// Importa tus imágenes aquí
import teamImage from '../Imagenes/estrella.PNG'; // Ejemplo: imagen del equipo
import facilityImage from '../Imagenes/ojo.PNG'; // Ejemplo: imagen de instalaciones
import careImage from '../Imagenes/corazon.PNG'; // Ejemplo: imagen de cuidado animal
import logoImage from '../Imagenes/flooty.png'; // Ejemplo: logo de la veterinaria

function AboutUs() {
  const sectionRef = useRef(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Datos para el carrusel con imágenes
  const carouselItems = [
    {
      title: "Equipo Profesional",
      content: "Contamos con veterinarios especializados en diferentes áreas de la medicina animal.",
      image: teamImage // <-- Aquí asignas la imagen importada
    },
    {
      title: "Instalaciones Modernas",
      content: "Nuestra clínica está equipada con tecnología de última generación para el diagnóstico y tratamiento.",
      image: facilityImage // <-- Aquí asignas la imagen importada
    },
    {
      title: "Atención Personalizada",
      content: "Cada mascota recibe un trato individualizado según sus necesidades específicas.",
      image: careImage // <-- Aquí asignas la imagen importada
    }
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            sectionRef.current.classList.add('visible');
            observer.unobserve(sectionRef.current);
            
            const interval = setInterval(() => {
              setCurrentSlide((prev) => (prev + 1) % carouselItems.length);
            }, 5000);
            
            return () => clearInterval(interval);
          }
        });
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) observer.observe(sectionRef.current);

    return () => {
      if (sectionRef.current) observer.unobserve(sectionRef.current);
    };
  }, [carouselItems.length]);

  return (
    <section id="nosotros" className="about-us" ref={sectionRef}>
      <h2 className="about-us__title">Nosotros</h2>
      
      <div className="about-us__grid">
        {/* Columna izquierda - Misión, Visión y Propósito */}
        <div className="about-us__content">
          <div className="about-card mission-card">
            <div className="card-content">
              <div className="card-icon">🌟</div>
              <h3>Misión</h3>
              <p>Proporcionar servicios veterinarios integrales y de alta calidad, enfocados en el bienestar animal y la satisfacción de nuestros clientes.</p>
            </div>
            {/* Espacio para imagen decorativa */}
            <div className="card-image" style={{backgroundImage: `url(${teamImage})`}}></div>
          </div>
          
          <div className="about-card vision-card">
            <div className="card-content">
              <div className="card-icon">👁️</div>
              <h3>Visión</h3>
              <p>Ser líderes en la región como clínica veterinaria de referencia, reconocidos por nuestra excelencia médica e innovación.</p>
            </div>
            {/* Espacio para imagen decorativa */}
            <div className="card-image" style={{backgroundImage: `url(${facilityImage})`}}></div>
          </div>
          
          <div className="about-card purpose-card">
            <div className="card-content">
              <div className="card-icon">❤️</div>
              <h3>Propósito</h3>
              <p>Mejorar la calidad de vida de las mascotas a través de prevención, diagnóstico y tratamiento con trato humano y profesional.</p>
            </div>
            {/* Espacio para imagen decorativa */}
            <div className="card-image" style={{backgroundImage: `url(${careImage})`}}></div>
          </div>
        </div>
        
        {/* Columna derecha - Carrusel y Fundación */}
        <div className="about-us__right-column">
          {/* Carrusel con imágenes */}
          <div className="about-carousel">
            {carouselItems.map((item, index) => (
              <div 
                key={index}
                className={`carousel-item ${index === currentSlide ? 'active' : ''}`}
                style={{backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url(${item.image})`}}
              >
                <div className="carousel-content">
                  <h4>{item.title}</h4>
                  <p>{item.content}</p>
                </div>
              </div>
            ))}
            
            <div className="carousel-dots">
              {carouselItems.map((_, index) => (
                <button
                  key={index}
                  className={`dot ${index === currentSlide ? 'active' : ''}`}
                  onClick={() => setCurrentSlide(index)}
                  aria-label={`Ir a slide ${index + 1}`}
                />
              ))}
            </div>
          </div>
          
          {/* Fundación con logo */}
          <div className="about-card foundation-card">
            <div className="card-content">
              <img src={logoImage} alt="Logo Flooky Pets" className="foundation-logo" />
              <h3>Nuestra Historia</h3>
              <p>Flooky Pets fue fundada en marzo de 2020 por un grupo de apasionados veterinarios con el objetivo de proporcionar atención médica de calidad en Soacha.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default AboutUs;