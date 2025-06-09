import React, { useState } from 'react';
import styles from './Styles/AyudaSoporte.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faQuestionCircle, faEnvelope, faPhone, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { faFacebook, faTwitter, faInstagram } from '@fortawesome/free-brands-svg-icons';
import { useNavigate } from 'react-router-dom';

const AyudaSoporte = () => {
  const [activeQuestion, setActiveQuestion] = useState(null);
  const navigate = useNavigate();

  const handleVolver = () => {
    navigate(-1);
  };

  const preguntasFrecuentes = [
    {
      id: 1,
      pregunta: '¿Cómo agendo una cita?',
      respuesta: 'Ve a la sección de "Citas" en la barra de navegación inferior y selecciona "Agendar Cita". Sigue los pasos para elegir tu mascota, la fecha y hora deseada.',
    },
    {
      id: 2,
      pregunta: '¿Dónde puedo ver el historial médico de mi mascota?',
      respuesta: 'En la sección de "Mascotas", haz clic en la tarjeta de la mascota cuyo historial deseas ver. Allí encontrarás un botón o enlace para acceder al historial médico completo.',
    },
    {
      id: 3,
      pregunta: '¿Qué servicios veterinarios ofrecen?',
      respuesta: 'Ofrecemos una amplia gama de servicios que incluyen consultas generales y especializadas, vacunación, desparasitación, cirugías, diagnóstico por imagen (radiografías, ecografías), análisis de laboratorio, estética canina y felina, y más. Puedes ver la lista completa y sus detalles en la sección de "Servicios".',
    },
    {
      id: 4,
      pregunta: '¿Cómo puedo contactar con un veterinario de urgencia?',
      respuesta: 'En caso de emergencia, por favor, comunícate directamente a nuestra línea de urgencias: +57 301 XXX XXXX. Esta línea está disponible las 24 horas del día, los 7 días de la semana.',
    },
    {
      id: 5,
      pregunta: '¿Cómo puedo actualizar mi información de perfil?',
      respuesta: 'Dirígete a la sección de "Perfil" en la barra de navegación. Allí encontrarás opciones para editar tu nombre, correo electrónico y otra información personal.',
    },
    // Agrega más preguntas y respuestas aquí
  ];

  const toggleQuestion = (id) => {
    setActiveQuestion(activeQuestion === id ? null : id);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <FontAwesomeIcon icon={faQuestionCircle} className={styles.icon} />
        <h3>Ayuda y Soporte</h3>
        <button onClick={handleVolver} className={styles.volverBtn}>
          <FontAwesomeIcon icon={faArrowLeft} className={styles.volverIcon} /> Volver
        </button>
      </div>

      <div className={styles.seccion}>
        <h4>Preguntas Frecuentes</h4>
        <ul className={styles.faqList}>
          {preguntasFrecuentes.map((item) => (
            <li key={item.id} className={styles.faqItem}>
              <button className={styles.questionButton} onClick={() => toggleQuestion(item.id)}>
                {item.pregunta}
                <span className={styles.arrow}>{activeQuestion === item.id ? '▲' : '▼'}</span>
              </button>
              {activeQuestion === item.id && (
                <div className={styles.answer}>
                  <p>{item.respuesta}</p>
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>

      <div className={styles.seccion}>
        <h4>Contacto</h4>
        <p>Si tienes alguna otra pregunta o necesitas soporte adicional, contáctanos a través de los siguientes medios:</p>
        <ul className={styles.contactList}>
          <li>
            <FontAwesomeIcon icon={faEnvelope} className={styles.contactIcon} />
            Email: <a href="mailto:soporte@flookypets.com">soporte@flookypets.com</a>
          </li>
          <li>
            <FontAwesomeIcon icon={faPhone} className={styles.contactIcon} />
            Teléfono: <a href="tel:+573001234567">+57 300 123 4567</a>
          </li>
        </ul>
      </div>

      <div className={styles.seccion}>
        <h4>Síguenos en Redes Sociales</h4>
        <ul className={styles.socialList}>
          <li>
            <a href="https://www.facebook.com/FlookyPetsOficial" target="_blank" rel="noopener noreferrer">
              <FontAwesomeIcon icon={faFacebook} className={styles.socialIcon} /> Facebook
            </a>
          </li>
          <li>
            <a href="https://twitter.com/FlookyPets" target="_blank" rel="noopener noreferrer">
              <FontAwesomeIcon icon={faTwitter} className={styles.socialIcon} /> Twitter
            </a>
          </li>
          <li>
            <a href="https://www.instagram.com/flookypets/" target="_blank" rel="noopener noreferrer">
              <FontAwesomeIcon icon={faInstagram} className={styles.socialIcon} /> Instagram
            </a>
          </li>
        </ul>
      </div>
      <div className={styles.seccion}>
        <h4>Formulario de Contacto</h4>
        <form className={styles.contactForm}>
          <div className={styles.formGroup}>
            <label htmlFor="nombre">Nombre:</label>
            <input type="text" id="nombre" />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="email">Email:</label>
            <input type="email" id="email" />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="mensaje">Mensaje:</label>
            <textarea id="mensaje" rows="5"></textarea>
          </div>
          <button type="submit" className={styles.submitButton}>Enviar Mensaje</button>
        </form>
      </div>
    </div>
  );
};

export default AyudaSoporte;