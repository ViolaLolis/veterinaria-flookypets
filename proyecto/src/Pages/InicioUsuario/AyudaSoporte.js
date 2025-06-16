import React, { useState } from 'react';
import { motion } from 'framer-motion';
import styles from './Styles/AyudaSoporte.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faQuestionCircle, 
  faEnvelope, 
  faPhone, 
  faArrowLeft,
  faChevronDown,
  faChevronUp,
  faUser,
  faPaperPlane,
  faHeadset
} from '@fortawesome/free-solid-svg-icons';
import { 
  faFacebook, 
  faTwitter, 
  faInstagram,
  faWhatsapp
} from '@fortawesome/free-brands-svg-icons';
import { useNavigate } from 'react-router-dom';

const AyudaSoporte = () => {
  const [activeQuestion, setActiveQuestion] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    mensaje: ''
  });
  const navigate = useNavigate();

  const handleVolver = () => navigate(-1);

  const preguntasFrecuentes = [
    {
      id: 1,
      pregunta: '¿Cómo agendo una cita?',
      respuesta: 'Ve a la sección de "Citas" en la barra de navegación inferior y selecciona "Agendar Cita". Sigue los pasos para elegir tu mascota, la fecha y hora deseada.',
      categoria: 'Citas'
    },
    {
      id: 2,
      pregunta: '¿Dónde puedo ver el historial médico de mi mascota?',
      respuesta: 'En la sección de "Mascotas", haz clic en la tarjeta de la mascota cuyo historial deseas ver. Allí encontrarás un botón o enlace para acceder al historial médico completo.',
      categoria: 'Historial'
    },
    {
      id: 3,
      pregunta: '¿Qué servicios veterinarios ofrecen?',
      respuesta: 'Ofrecemos una amplia gama de servicios que incluyen consultas generales y especializadas, vacunación, desparasitación, cirugías, diagnóstico por imagen (radiografías, ecografías), análisis de laboratorio, estética canina y felina, y más.',
      categoria: 'Servicios'
    },
    {
      id: 4,
      pregunta: '¿Cómo puedo contactar con un veterinario de urgencia?',
      respuesta: 'En caso de emergencia, por favor, comunícate directamente a nuestra línea de urgencias: +57 301 XXX XXXX. Esta línea está disponible las 24 horas del día, los 7 días de la semana.',
      categoria: 'Emergencias'
    },
    {
      id: 5,
      pregunta: '¿Cómo puedo actualizar mi información de perfil?',
      respuesta: 'Dirígete a la sección de "Perfil" en la barra de navegación. Allí encontrarás opciones para editar tu nombre, correo electrónico y otra información personal.',
      categoria: 'Perfil'
    },
  ];

  const toggleQuestion = (id) => {
    setActiveQuestion(activeQuestion === id ? null : id);
  };

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Lógica para enviar el formulario
    alert('Mensaje enviado con éxito. Nos pondremos en contacto contigo pronto.');
    setFormData({ nombre: '', email: '', mensaje: '' });
  };

  return (
    <motion.div 
      className={styles.container}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header con gradiente */}
      <motion.div 
        className={styles.header}
        initial={{ y: -20 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 120 }}
      >
        <div className={styles.headerContent}>
          <FontAwesomeIcon icon={faQuestionCircle} className={styles.mainIcon} />
          <div>
            <h2>Centro de Ayuda</h2>
            <p>Encuentra respuestas y soporte para tu experiencia FlookyPets</p>
          </div>
        </div>
        <motion.button 
          onClick={handleVolver}
          className={styles.backButton}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <FontAwesomeIcon icon={faArrowLeft} /> Volver
        </motion.button>
      </motion.div>
      {/* Contenido principal */}
      <div className={styles.mainContent}>
        {/* Sección de preguntas frecuentes */}
        <motion.div 
          className={styles.section}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className={styles.sectionHeader}>
            <FontAwesomeIcon icon={faQuestionCircle} className={styles.sectionIcon} />
            <h3>Preguntas Frecuentes</h3>
          </div>
          <div className={styles.faqList}>
            {preguntasFrecuentes.map((item) => (
              <motion.div 
                key={item.id}
                className={styles.faqCard}
                whileHover={{ scale: 1.01 }}
              >
                <button 
                  className={styles.questionButton}
                  onClick={() => toggleQuestion(item.id)}
                >
                  <span>{item.pregunta}</span>
                  <FontAwesomeIcon 
                    icon={activeQuestion === item.id ? faChevronUp : faChevronDown} 
                    className={styles.chevronIcon}
                  />
                </button>
                
                {activeQuestion === item.id && (
                  <motion.div
                    className={styles.answer}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <p>{item.respuesta}</p>
                    <div className={styles.faqMeta}>
                      <span className={styles.faqCategory}>{item.categoria}</span>
                      <button className={styles.faqHelpful}>
                        ¿Fue útil esta respuesta?
                      </button>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Sección de contacto */}
        <motion.div 
          className={styles.section}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className={styles.sectionHeader}>
            <FontAwesomeIcon icon={faHeadset} className={styles.sectionIcon} />
            <h3>Soporte Directo</h3>
          </div>
          
          <div className={styles.contactGrid}>
            <div className={styles.contactCard}>
              <div className={styles.contactIconWrapper}>
                <FontAwesomeIcon icon={faWhatsapp} className={styles.contactIcon} />
              </div>
              <h4>Chat en Vivo</h4>
              <p>Conéctate con nuestro equipo de soporte en tiempo real</p>
              <motion.button
                className={styles.contactButton}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
              >
                Iniciar Chat
              </motion.button>
            </div>
            
            <div className={styles.contactCard}>
              <div className={styles.contactIconWrapper}>
                <FontAwesomeIcon icon={faPhone} className={styles.contactIcon} />
              </div>
              <h4>Línea Telefónica</h4>
              <p>+57 300 123 4567<br/>Disponible 24/7 para emergencias</p>
              <motion.button
                className={styles.contactButton}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
              >
                Llamar Ahora
              </motion.button>
            </div>
            
            <div className={styles.contactCard}>
              <div className={styles.contactIconWrapper}>
                <FontAwesomeIcon icon={faEnvelope} className={styles.contactIcon} />
              </div>
              <h4>Correo Electrónico</h4>
              <p>soporte@flookypets.com<br/>Respuesta en menos de 24 horas</p>
              <motion.button
                className={styles.contactButton}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
              >
                Enviar Email
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Formulario de contacto */}
        <motion.div 
          className={styles.section}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className={styles.sectionHeader}>
            <FontAwesomeIcon icon={faPaperPlane} className={styles.sectionIcon} />
            <h3>Buzón de quejas</h3>
          </div>
          
          <form onSubmit={handleSubmit} className={styles.contactForm}>
            <div className={styles.formGroup}>
              <label htmlFor="nombre">
                <FontAwesomeIcon icon={faUser} className={styles.inputIcon} />
                Nombre Completo
              </label>
              <input
                type="text"
                id="nombre"
                value={formData.nombre}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className={styles.formGroup}>
              <label htmlFor="email">
                <FontAwesomeIcon icon={faEnvelope} className={styles.inputIcon} />
                Correo Electrónico
              </label>
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className={styles.formGroup}>
              <label htmlFor="mensaje">
                <FontAwesomeIcon icon={faQuestionCircle} className={styles.inputIcon} />
                Tu Mensaje
              </label>
              <textarea
                id="mensaje"
                rows="5"
                value={formData.mensaje}
                onChange={handleInputChange}
                required
              ></textarea>
            </div>
            
            <motion.button
              type="submit"
              className={styles.submitButton}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={!formData.nombre || !formData.email || !formData.mensaje}
            >
              Enviar Mensaje
            </motion.button>
          </form>
        </motion.div>

        {/* Redes sociales */}
        <motion.div 
          className={styles.section}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className={styles.sectionHeader}>
            <FontAwesomeIcon icon={faFacebook} className={styles.sectionIcon} />
            <h3>Síguenos en Redes</h3>
          </div>
          
          <div className={styles.socialGrid}>
            <motion.a
              href="https://www.facebook.com/FlookyPetsOficial"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.socialCard}
              whileHover={{ y: -5 }}
            >
              <FontAwesomeIcon icon={faFacebook} className={styles.socialIcon} />
              <span>Facebook</span>
            </motion.a>
            
            <motion.a
              href="https://twitter.com/FlookyPets"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.socialCard}
              whileHover={{ y: -5 }}
            >
              <FontAwesomeIcon icon={faTwitter} className={styles.socialIcon} />
              <span>X</span>
            </motion.a>
            
            <motion.a
              href="https://www.instagram.com/flookypets/"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.socialCard}
              whileHover={{ y: -5 }}
            >
              <FontAwesomeIcon icon={faInstagram} className={styles.socialIcon} />
              <span>Instagram</span>
            </motion.a>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default AyudaSoporte;