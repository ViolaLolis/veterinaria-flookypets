import React, { useEffect, useRef } from 'react';
import './Styles/ContactInfo.css';

function ContactInfo() {
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            sectionRef.current.classList.add('visible');
            observer.unobserve(sectionRef.current);
          }
        });
      },
      {
        threshold: 0.1,
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
    <section id="contacto" className="contact-info" ref={sectionRef}>
      <h2 className="section-title">Información de Contacto</h2>
      <div className="contact-grid">
        <div className="contact-card">
          <h3>Nuestras Ubicaciones</h3>
          <ul>
            <li><strong>Sede Principal:</strong> Tranversal 12 # 4a-60, Soacha, Cundinamarca</li>
            <li><strong>Punto de Encuentro 1:</strong> Parque Central de Soacha</li>
            <li><strong>Punto de Encuentro 2:</strong> Centro Comercial Ventura Terreros</li>
          </ul>
        </div>

        <div className="contact-card">
          <h3>Fundación de la Veterinaria</h3>
          <p>Flooky Pets fue fundada en marzo de 2020 por un grupo de apasionados veterinarios con el objetivo de proporcionar atención médica de calidad y un trato amoroso a las mascotas de la comunidad de Soacha y sus alrededores.</p>
        </div>

        <div className="contact-card">
          <h3>Números de Teléfono</h3>
          <p><strong>Teléfono Principal:</strong> 321 892 8781</p>
          <p><strong>Urgencias:</strong> 300 123 4567</p>
        </div>
      </div>

      <div className="map-container">
        <h2 className="map-title">Donde nos ubicamos</h2>
        <div className="map-wrapper">
          <iframe
            title='mapa'
            loading="lazy"
            allowFullScreen
            referrerPolicy="no-referrer-when-downgrade"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3976.9728971442!2d-74.07800742426815!3d4.598916042707592!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8e3f99a7eccfe58f%3A0x9620f171953c6c95!2sTransversal%2045%2C%20Bogot%C3%A1%2C%20Colombia!5e0!3m2!1ses!2sco!4v1710798850813!5m2!1ses!2sco">
          </iframe>
        </div>
      </div>
    </section>
  );
}

export default ContactInfo;