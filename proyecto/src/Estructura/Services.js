import React from 'react';
import '../Styles/Services.css';

// Importación de todas las imágenes
import diagnostico from '../Imagenes/diagnostico.png';
import hospitalizacion from '../Imagenes/hospitalizacion.png';
import cirugia from '../Imagenes/CirujiaVeterinaria.jpg';
import vacunacion from '../Imagenes/vacunacion.png';
import consulta from '../Imagenes/ConsultaVeterinmaria.png';
import urgencia from '../Imagenes/Urgencia24Horas.png';
import cuidados from '../Imagenes/Cuidados_para_mi_mascota_veterinario.png';
import peluqueria from '../Imagenes/peluqueria.png';
import medicinaPreventiva from '../Imagenes/Medicina_Preventiva.png';
import laboratorio from '../Imagenes/laboratorio.png';

const Servicios = () => {
  const services = [
    { 
      id: 1, 
      title: 'Diagnóstico Avanzado', 
      image: diagnostico, 
      description: 'En Flooky Pets utilizamos tecnología de última generación para diagnósticos precisos. Realizamos análisis completos incluyendo radiografías digitales, ecografías y pruebas específicas para detectar cualquier condición en tu mascota.' 
    },
    { 
      id: 2, 
      title: 'Hospitalización Especializada', 
      image: hospitalizacion, 
      description: 'Nuestro área de hospitalización cuenta con monitoreo 24/7, jaulas térmicas y atención personalizada. Cada paciente recibe un plan de cuidados individualizado con seguimiento constante de nuestros veterinarios.' 
    },
    { 
      id: 3, 
      title: 'Cirugías Veterinarias', 
      image: cirugia, 
      description: 'Realizamos procedimientos quirúrgicos con equipamiento de alta precisión y protocolos de esterilización certificados. Desde esterilizaciones hasta cirugías ortopédicas complejas, tu mascota está en las mejores manos.' 
    },
    { 
      id: 4, 
      title: 'Programa de Vacunación', 
      image: vacunacion, 
      description: 'En Flooky Pets diseñamos calendarios de vacunación personalizados según especie, edad y estilo de vida. Incluimos vacunas esenciales y opcionales, con seguimiento de recordatorios y controles post-vacunación.' 
    },
    { 
      id: 5, 
      title: 'Consultas Especializadas', 
      image: consulta, 
      description: 'Nuestros veterinarios ofrecen consultas detalladas con tiempo suficiente para evaluar completamente a tu mascota. Incluimos medicina preventiva, nutrición y asesoramiento sobre comportamiento animal.' 
    },
    { 
      id: 6, 
      title: 'Urgencias 24/7', 
      image: urgencia, 
      description: 'Servicio de emergencias veterinarias disponible las 24 horas con equipo especializado y UCI para mascotas. Atendemos intoxicaciones, traumatismos y cualquier situación crítica que requiera atención inmediata.' 
    },
    { 
      id: 7, 
      title: 'Cuidados Especiales', 
      image: cuidados, 
      description: 'Ofrecemos servicios de fisioterapia, rehabilitación y cuidados paliativos. Programas personalizados para mascotas geriátricas, con condiciones crónicas o en recuperación post-quirúrgica.' 
    },
    { 
      id: 8, 
      title: 'Spa & Peluquería', 
      image: peluqueria, 
      description: 'Nuestro spa veterinario incluye baños terapéuticos, cortes de pelo profesionales, limpieza dental y cuidado de uñas. Utilizamos productos hipoalergénicos y técnicas libres de estrés para tu mascota.' 
    },
    { 
      id: 9, 
      title: 'Medicina Preventiva', 
      image: medicinaPreventiva, 
      description: 'Programas integrales que incluyen desparasitaciones, control de peso, chequeos geriátricos y planes de salud anuales. Prevenimos antes que curar, con enfoque en el bienestar a largo plazo.' 
    },
    { 
      id: 10, 
      title: 'Laboratorio Clínico', 
      image: laboratorio, 
      description: 'Análisis de sangre, orina, heces y pruebas especializadas con resultados rápidos y precisos. Contamos con equipos de última tecnología para diagnósticos completos en nuestras instalaciones.' 
    }
  ];

  return (
    <section className="services" id="servicios">
      <h2 className="services__title">Nuestros Servicios en Flooky Pets</h2>
      <p className="services__subtitle">Cuidado integral con amor y profesionalismo</p>
      <div className="services__list">
        {services.map(service => (
          <div key={service.id} className="services__item">
            <div className="services__image-container">
              <img 
                src={service.image} 
                alt={service.title} 
                className="services__image" 
                onError={(e) => {
                  e.target.onerror = null; 
                  e.target.src = 'https://via.placeholder.com/150?text=Imagen+no+disponible';
                }}
              />
            </div>
            <h3 className="services__item-title">{service.title}</h3>
            <p className="services__item-description">{service.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Servicios;