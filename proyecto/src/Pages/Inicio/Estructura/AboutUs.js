import React, { useEffect, useRef } from 'react';
import './Styles/AboutUs.css';

function AboutUs() {
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            sectionRef.current.classList.add('visible');
            observer.unobserve(sectionRef.current); // Stop observing after it's visible
          }
        });
      },
      {
        threshold: 0.1, // Adjust as needed
      }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  return (
    <section id="nosotros" className="about-us" ref={sectionRef}>
      <h2>Nuestra Filosofía</h2>
      <div className="about-us__content">
        <div className="about-us__mission">
          <h3>Misión</h3>
          <p>Proporcionar servicios veterinarios integrales y de alta calidad, enfocados en el bienestar animal y la satisfacción de nuestros clientes. Nos esforzamos por ser un centro de atención confiable y compasivo para las mascotas y sus familias.</p>
        </div>
        <div className="about-us__vision">
          <h3>Visión</h3>
          <p>Ser líderes en la región como clínica veterinaria de referencia, reconocidos por nuestra excelencia médica, innovación y compromiso con el cuidado animal. Aspiramos a expandir nuestros servicios y fortalecer nuestra comunidad de amantes de las mascotas.</p>
        </div>
        <div className="about-us__purpose">
          <h3>Propósito</h3>
          <p>Nuestro propósito fundamental es mejorar la calidad de vida de las mascotas a través de la prevención, el diagnóstico y el tratamiento de enfermedades, brindando un trato humano y profesional en cada interacción.</p>
        </div>
      </div>
    </section>
  );
}

export default AboutUs;