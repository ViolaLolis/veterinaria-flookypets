import React from 'react';
import "../Styles/InfoPage.css";

function About() {
  return (
    <div className="info-page">
      <h1>Sobre Flooky Pets</h1>
      <div className="content">
        <section>
          <h2>Nuestra Misión</h2>
          <p>En Flooky Pets nos dedicamos a proporcionar la mejor atención veterinaria para tus mascotas, con un enfoque en el bienestar animal y la satisfacción de nuestros clientes.</p>
        </section>
        
        <section>
          <h2>Nuestro Equipo</h2>
          <p>Contamos con un equipo de profesionales altamente capacitados y apasionados por los animales.</p>
        </section>
        
        <section>
          <h2>Instalaciones</h2>
          <p>Nuestro centro veterinario está equipado con tecnología de última generación para el diagnóstico y tratamiento de tus mascotas.</p>
        </section>
      </div>
    </div>
  );
}

export default About;