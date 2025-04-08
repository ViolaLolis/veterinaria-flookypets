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
import laboratorio from '../Imagenes/laboratorio.png';

const Servicios = () => {
  const [expandedServiceId, setExpandedServiceId] = useState(null);

  const services = [
    {
      id: 1,
      title: 'Diagnóstico Avanzado',
      image: diagnostico,
      description: 'En Flooky Pets utilizamos tecnología de última generación para diagnósticos precisos. Realizamos análisis completos incluyendo radiografías digitales, ecografías y pruebas específicas para detectar cualquier condición en tu mascota.',
      fullDescription: 'Nuestro servicio de diagnóstico avanzado incluye radiografías digitales de alta resolución que permiten visualizar el interior del cuerpo de tu mascota con gran detalle. Las ecografías son realizadas por especialistas y nos ayudan a evaluar órganos internos en tiempo real. Además, ofrecemos una amplia gama de pruebas de laboratorio específicas para identificar enfermedades y condiciones particulares. Nuestro equipo está capacitado para interpretar estos resultados y ofrecer un diagnóstico preciso y un plan de tratamiento efectivo.'
    },
    {
      id: 2,
      title: 'Hospitalización Especializada',
      image: hospitalizacion,
      description: 'Nuestro área de hospitalización cuenta con monitoreo 24/7, jaulas térmicas y atención personalizada. Cada paciente recibe un plan de cuidados individualizado con seguimiento constante de nuestros veterinarios.',
      fullDescription: 'Las instalaciones de hospitalización de Flooky Pets están diseñadas para proporcionar un ambiente seguro y confortable para tu mascota durante su recuperación. Contamos con sistemas de monitoreo continuo las 24 horas del día, los 7 días de la semana, lo que nos permite vigilar de cerca el estado de cada paciente. Las jaulas térmicas están disponibles para aquellos que necesitan regulación de temperatura. Nuestro equipo veterinario y de enfermería trabaja en estrecha colaboración para crear y seguir planes de cuidados individualizados, asegurando que cada mascota reciba la atención y el cariño que necesita.'
    },
    {
      id: 3,
      title: 'Cirugías Veterinarias',
      image: cirugia,
      description: 'Realizamos procedimientos quirúrgicos con equipamiento de alta precisión y protocolos de esterilización certificados. Desde esterilizaciones hasta cirugías ortopédicas complejas, tu mascota está en las mejores manos.',
      fullDescription: 'En Flooky Pets, la seguridad y el bienestar de tu mascota durante la cirugía son nuestra máxima prioridad. Utilizamos equipos quirúrgicos de última generación y seguimos estrictos protocolos de esterilización para minimizar el riesgo de infecciones. Nuestro equipo de cirujanos veterinarios tiene experiencia en una amplia gama de procedimientos, desde cirugías de rutina como esterilizaciones y castraciones, hasta cirugías ortopédicas complejas y la extirpación de tumores. Cada procedimiento se planifica cuidadosamente y se realiza con la mayor precisión y cuidado.'
    },
    {
      id: 4,
      title: 'Programa de Vacunación',
      image: vacunacion,
      description: 'En Flooky Pets diseñamos calendarios de vacunación personalizados según especie, edad y estilo de vida. Incluimos vacunas esenciales y opcionales, con seguimiento de recordatorios y controles post-vacunación.',
      fullDescription: 'La vacunación es una parte crucial del cuidado preventivo de tu mascota. En Flooky Pets, entendemos que cada animal es único, por lo que diseñamos calendarios de vacunación personalizados que tienen en cuenta la especie, la edad, el estilo de vida y el entorno de tu mascota. Ofrecemos todas las vacunas esenciales para proteger contra enfermedades comunes y peligrosas, así como vacunas opcionales según las necesidades individuales. Además, realizamos un seguimiento de los recordatorios de vacunación y ofrecemos controles post-vacunación para asegurar la salud de tu compañero.'
    },
    {
      id: 5,
      title: 'Consultas Especializadas',
      image: consulta,
      description: 'Nuestros veterinarios ofrecen consultas detalladas con tiempo suficiente para evaluar completamente a tu mascota. Incluimos medicina preventiva, nutrición y asesoramiento sobre comportamiento animal.',
      fullDescription: 'En Flooky Pets, creemos en la importancia de una consulta veterinaria exhaustiva. Nuestros veterinarios se toman el tiempo necesario para escuchar tus preocupaciones, realizar un examen físico completo de tu mascota y responder a todas tus preguntas. Además de la evaluación médica, nuestras consultas incluyen asesoramiento sobre medicina preventiva, pautas de nutrición adecuadas para la etapa de vida y las necesidades específicas de tu mascota, y orientación sobre problemas de comportamiento animal para fortalecer el vínculo entre tú y tu compañero.'
    },
    {
      id: 6,
      title: 'Urgencias 24/7',
      image: urgencia,
      description: 'Servicio de emergencias veterinarias disponible las 24 horas con equipo especializado y UCI para mascotas. Atendemos intoxicaciones, traumatismos y cualquier situación crítica que requiera atención inmediata.',
      fullDescription: 'Sabemos que las emergencias pueden ocurrir en cualquier momento. Por eso, Flooky Pets ofrece un servicio de urgencias veterinarias las 24 horas del día, los 7 días de la semana. Contamos con un equipo veterinario especializado en el manejo de situaciones críticas y una Unidad de Cuidados Intensivos (UCI) equipada con la tecnología necesaria para atender intoxicaciones, traumatismos, dificultad respiratoria y cualquier otra emergencia que ponga en riesgo la vida de tu mascota. Estamos preparados para actuar rápidamente y brindar la mejor atención en momentos de necesidad.'
    },
    {
      id: 7,
      title: 'Cuidados Especiales',
      image: cuidados,
      description: 'Ofrecemos servicios de fisioterapia, rehabilitación y cuidados paliativos. Programas personalizados para mascotas geriátricas, con condiciones crónicas o en recuperación post-quirúrgica.',
      fullDescription: 'En Flooky Pets, entendemos que algunas mascotas necesitan cuidados especiales para mejorar su calidad de vida. Ofrecemos servicios de fisioterapia y rehabilitación diseñados para ayudar a la recuperación de lesiones, cirugías o condiciones neurológicas. Nuestros programas de cuidados paliativos se centran en proporcionar confort y alivio a mascotas con enfermedades terminales, asegurando que sus últimos días sean lo más cómodos y dignos posible. También ofrecemos programas personalizados para el cuidado de mascotas geriátricas, abordando las necesidades específicas del envejecimiento.'
    },
    {
      id: 8,
      title: 'Spa & Peluquería',
      image: peluqueria,
      description: 'Nuestro spa veterinario incluye baños terapéuticos, cortes de pelo profesionales, limpieza dental y cuidado de uñas. Utilizamos productos hipoalergénicos y técnicas libres de estrés para tu mascota.',
      fullDescription: 'En el spa de Flooky Pets, consentimos a tu mascota mientras cuidamos de su higiene y bienestar. Ofrecemos baños terapéuticos con productos hipoalergénicos, cortes de pelo realizados por profesionales con experiencia en diferentes razas, limpieza dental para mantener una buena salud bucal y cuidado de uñas para evitar problemas. Nuestro objetivo es que tu mascota se sienta cómoda y disfrute de la experiencia, utilizando técnicas suaves y libres de estrés.'
    },
    {
      id: 9,
      title: 'Medicina Preventiva',
      image: medicinaPreventiva,
      description: 'Programas integrales que incluyen desparasitaciones, control de peso, chequeos geriátricos y planes de salud anuales. Prevenimos antes que curar, con enfoque en el bienestar a largo plazo.',
      fullDescription: 'La medicina preventiva es fundamental para asegurar una vida larga y saludable para tu mascota. En Flooky Pets, ofrecemos programas integrales que incluyen desparasitaciones internas y externas, control de peso para prevenir la obesidad, chequeos geriátricos para detectar problemas de salud en etapas tempranas y planes de salud anuales que combinan exámenes, vacunas y pruebas de detección. Nuestro enfoque está en la prevención de enfermedades y en la promoción del bienestar a largo plazo de tu compañero.'
    },
    {
      id: 10,
      title: 'Laboratorio Clínico',
      image: laboratorio,
      description: 'Análisis de sangre, orina, heces y pruebas especializadas con resultados rápidos y precisos. Contamos con equipos de última tecnología para diagnósticos completos en nuestras instalaciones.',
      fullDescription: 'Nuestro laboratorio clínico en Flooky Pets está equipado con tecnología de última generación para realizar una amplia gama de análisis, incluyendo pruebas de sangre, orina y heces. Esto nos permite obtener resultados rápidos y precisos, lo cual es crucial para un diagnóstico oportuno y un tratamiento eficaz. Además de las pruebas de rutina, también ofrecemos pruebas especializadas para detectar enfermedades específicas. Nuestro equipo de laboratorio trabaja en estrecha colaboración con los veterinarios para proporcionar información esencial para el cuidado de la salud de tu mascota.'
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
                  e.target.src = 'https://via.placeholder.com/150?text=Imagen+no+disponible';
                }}
              />
            </div>
            <div className="services__item-info">
              <h3 className="services__item-title">{service.title}</h3>
              <p className="services__item-description">{service.description}</p>
              {expandedServiceId !== service.id && (
                <button className="services__show-more" onClick={() => handleShowMore(service.id)}>
                  Mostrar más <svg viewBox="0 0 24 24" fill="currentColor" className="icon">
                    <path fillRule="evenodd" d="M12 14.5V5.5a1 1 0 112 0v9a1 1 0 01-1.707.707l-3 3a1 1 0 01-1.414-1.414L12 14.5z" clipRule="evenodd" />
                  </svg>
                </button>
              )}
              {expandedServiceId === service.id && (
                <div className="services__full-description">
                  <p>{service.fullDescription}</p>
                  <button className="services__show-less" onClick={() => handleShowMore(service.id)}>
                    Mostrar menos <svg viewBox="0 0 24 24" fill="currentColor" className="icon">
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