import React, { useState } from 'react';
import './Styles/Services.css';

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


const Servicios = () => {
  const [expandedServiceId, setExpandedServiceId] = useState(null);

  const services = [
    {
      id: 1,
      title: 'Diagnóstico Avanzado',
      image: diagnostico,
      fullDescription: 'Nuestro servicio de diagnóstico avanzado incluye radiografías digitales de alta resolución que permiten visualizar el interior del cuerpo de tu mascota con gran detalle. Las ecografías son realizadas por especialistas y nos ayudan a evaluar órganos internos en tiempo real. Además, ofrecemos una amplia gama de pruebas de laboratorio específicas para identificar enfermedades y condiciones particulares. Nuestro equipo está capacitado para interpretar estos resultados y ofrecer un diagnóstico preciso y un plan de tratamiento efectivo.'
    },
    {
      id: 2,
      title: 'Hospitalización ',
      image: hospitalizacion,
      fullDescription: 'Las instalaciones de hospitalización de Flooky Pets están diseñadas para proporcionar un ambiente seguro y confortable para tu mascota durante su recuperación. Contamos con sistemas de monitoreo continuo las 24 horas del día, los 7 días de la semana, lo que nos permite vigilar de cerca el estado de cada paciente. Las jaulas térmicas están disponibles para aquellos que necesitan regulación de temperatura. Nuestro equipo veterinario y de enfermería trabaja en estrecha colaboración para crear y seguir planes de cuidados individualizados, asegurando que cada mascota reciba la atención y el cariño que necesita.'
    },
    {
      id: 3,
      title: 'Cirugías Veterinarias',
      image: cirugia,
      fullDescription: 'En Flooky Pets, la seguridad y el bienestar de tu mascota durante la cirugía son nuestra máxima prioridad. Utilizamos equipos quirúrgicos de última generación y seguimos estrictos protocolos de esterilización para minimizar el riesgo de infecciones. Nuestro equipo de cirujanos veterinarios tiene experiencia en una amplia gama de procedimientos, desde cirugías de rutina como esterilizaciones y castraciones, hasta cirugías ortopédicas complejas y la extirpación de tumores. Cada procedimiento se planifica cuidadosamente y se realiza con la mayor precisión y cuidado.'
    },
    {
      id: 4,
      title: 'Programa de Vacunación',
      image: vacunacion,
      fullDescription: 'La vacunación es una parte crucial del cuidado preventivo de tu mascota. En Flooky Pets, entendemos que cada animal es único, por lo que diseñamos calendarios de vacunación personalizados que tienen en cuenta la especie, la edad, el estilo de vida y el entorno de tu mascota. Ofrecemos todas las vacunas esenciales para proteger contra enfermedades comunes y peligrosas, así como vacunas opcionales según las necesidades individuales. Además, realizamos un seguimiento de los recordatorios de vacunación y ofrecemos controles post-vacunación para asegurar la salud de tu compañero.'
    },
    {
      id: 5,
      title: 'Consultas Especializadas',
      image: consulta,
      fullDescription: 'En Flooky Pets, creemos en la importancia de una consulta veterinaria exhaustiva. Nuestros veterinarios se toman el tiempo necesario para escuchar tus preocupaciones, realizar un examen físico completo de tu mascota y responder a todas tus preguntas. Además de la evaluación médica, nuestras consultas incluyen asesoramiento sobre medicina preventiva, pautas de nutrición adecuadas para la etapa de vida y las necesidades específicas de tu mascota, y orientación sobre problemas de comportamiento animal para fortalecer el vínculo entre tú y tu compañero.'
    },
    {
      id: 6,
      title: 'Urgencias 24/7',
      image: urgencia,
      fullDescription: 'Sabemos que las emergencias pueden ocurrir en cualquier momento. Por eso, Flooky Pets ofrece un servicio de urgencias veterinarias las 24 horas del día, los 7 días de la semana. Contamos con un equipo veterinario especializado en el manejo de situaciones críticas y una Unidad de Cuidados Intensivos (UCI) equipada con la tecnología necesaria para atender intoxicaciones, traumatismos, dificultad respiratoria y cualquier otra emergencia que ponga en riesgo la vida de tu mascota. Estamos preparados para actuar rápidamente y brindar la mejor atención en momentos de necesidad.'
    },
    {
      id: 7,
      title: 'Cuidados Especiales',
      image: cuidados,
      fullDescription: 'En Flooky Pets, entendemos que algunas mascotas necesitan cuidados especiales para mejorar su calidad de vida. Ofrecemos servicios de fisioterapia y rehabilitación diseñados para ayudar a la recuperación de lesiones, cirugías o condiciones neurológicas. Nuestros programas de cuidados paliativos se centran en proporcionar confort y alivio a mascotas con enfermedades terminales, asegurando que sus últimos días sean lo más cómodos y dignos posible. También ofrecemos programas personalizados para el cuidado de mascotas geriátricas, abordando las necesidades específicas del envejecimiento.'
    },
    {
      id: 8,
      title: 'Spa & Peluquería',
      image: peluqueria,
      fullDescription: 'En el spa de Flooky Pets, consentimos a tu mascota mientras cuidamos de su higiene y bienestar. Ofrecemos baños terapéuticos con productos hipoalergénicos, cortes de pelo realizados por profesionales con experiencia en diferentes razas, limpieza dental para mantener una buena salud bucal y cuidado de uñas para evitar problemas. Nuestro objetivo es que tu mascota se sienta cómoda y disfrute de la experiencia, utilizando técnicas suaves y libres de estrés.'
    },
    {
      id: 9,
      title: 'Medicina Preventiva',
      image: medicinaPreventiva,
      fullDescription: 'La medicina preventiva es fundamental para asegurar una vida larga y saludable para tu mascota. En Flooky Pets, ofrecemos programas integrales que incluyen desparasitaciones internas y externas, control de peso para prevenir la obesidad, chequeos geriátricos para detectar problemas de salud en etapas tempranas y planes de salud anuales que combinan exámenes, vacunas y pruebas de detección. Nuestro enfoque está en la prevención de enfermedades y en la promoción del bienestar a largo plazo de tu compañero.'
    }
  ];

  const handleShowMore = (id) => {
    setExpandedServiceId(expandedServiceId === id ? null : id);
  };

  return (
    <section className="services" id="servicios">
      <h2 className="services__title">Nuestros Servicios en Flooky Pets</h2>
      <p className="services__subtitle">Cuidado integral con amor y profesionalismo</p>
      <div className="services__list">
        {services.map(service => (
          <div key={service.id} className={`services__item ${expandedServiceId === service.id ? 'expanded' : ''}`}>
            <div className="services__image-container">
              <img
                src={service.image}
                alt={service.title}
                className="services__image"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://via.placeholder.com/300x200?text=Imagen+no+disponible'; // Placeholder más grande
                }}
              />
            </div>
            <div className="services__item-info">
              <h3 className="services__item-title">{service.title}</h3>
              
              {expandedServiceId !== service.id && (
                <button className="services__show-more" onClick={() => handleShowMore(service.id)}>
                  Mostrar más 
                  <svg className="services__icon" viewBox="0 0 24 24" fill="currentColor">
                    <path fillRule="evenodd" d="M12 14.5V5.5a1 1 0 112 0v9a1 1 0 01-1.707.707l-3 3a1 1 0 01-1.414-1.414L12 14.5z" clipRule="evenodd" />
                  </svg>
                </button>
              )}
              {expandedServiceId === service.id && (
                <div className="services__full-description">
                  <p>{service.fullDescription}</p>
                  <button className="services__show-less" onClick={() => handleShowMore(service.id)}>
                    Mostrar menos 
                    <svg className="services__icon" viewBox="0 0 24 24" fill="currentColor">
                      <path fillRule="evenodd" d="M12 9.5v9a1 1 0 11-2 0v-9a1 1 0 011.707-.707l3-3a1 1 0 011.414 1.414L12 9.5z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Servicios;