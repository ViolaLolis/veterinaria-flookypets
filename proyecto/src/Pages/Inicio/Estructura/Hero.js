import React from 'react';
import './Styles/Hero.css';

function Hero() {
  return (
    <section className="hero">
      <div className="hero__content">
        <h1 className="hero__title">Cuidamos la salud de tus mascotas</h1>
        <div className="hero__description-container">
          <div className="hero__description-left">
            <p>En Flooky Pets, nos especializamos en brindar servicios veterinarios integrales con un enfoque basado en el amor, el cuidado y la dedicación.</p>
          </div>
          <div className="hero__description-right">
            <p>Contamos con un equipo de profesionales altamente capacitados y con una infraestructura moderna que nos permite proporcionar atención de calidad.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;

