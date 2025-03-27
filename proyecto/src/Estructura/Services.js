import React from 'react';
import '../Styles/Services.css';

const Servicios = () => {
  const services = [
    { id: 1, title: 'Diagnóstico', image: '../Imagenes/diagnostico.png', description: 'Evaluación y diagnóstico profesional para tu mascota.' },
    { id: 2, title: 'Hospitalización', image: '../Imagenes/hospitalizacion.png', description: 'Cuidado integral para mascotas hospitalizadas.' },
    { id: 3, title: 'Cirugías', image: '../Imagenes/cirugia.png', description: 'Procedimientos quirúrgicos con atención especializada.' },
    { id: 4, title: 'Vacunación', image: '../Imagenes/vacunacion.png', description: 'Vacunas para proteger la salud de tu mascota.' },
    { id: 5, title: 'Consultas', image: '../Imagenes/consulta.png', description: 'Consulta general y atención personalizada.' },
    { id: 6, title: 'Emergencias', image: '../Imagenes/urgencia.png', description: 'Atención de emergencias las 24 horas.' },
    { id: 7, title: 'Cuidados', image: '../Imagenes/cuidados.png', description: 'Atención diaria para el bienestar de tu mascota.' },
    { id: 8, title: 'Peluquería', image: '../Imagenes/peluqueria_bañado.png', description: 'Servicios de aseo y peluquería para mascotas.' },
    { id: 9, title: 'Medicina Preventiva', image: '../Imagenes/medicina_preventiva.png', description: 'Programas de salud preventiva y control.' },
    { id: 10, title: 'Laboratorio', image: '../Imagenes/laboratorio.png', description: 'Análisis clínicos y pruebas de laboratorio.' }
  ];

  return (
    <section className="services">
      <h2>Nuestros Servicios</h2>
      <div className="services__list">
        {services.map(service => (
          <div key={service.id} className="services__item">
            <img src={service.image} alt={service.title} className="services__image" />
            <h3>{service.title}</h3>
            <p>{service.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Servicios;

