import React from 'react';
import { useNavigate } from 'react-router-dom';
import "../Styles/InfoPage.css";

function Help() {
  const navigate = useNavigate();
  
  const faqs = [
    {
      question: "¿Cómo agendo una cita?",
      answer: "Puedes agendar citas desde la sección 'Mis Citas' o mediante el calendario disponible."
    },
    {
      question: "¿Puedo cancelar una cita?",
      answer: "Sí, puedes cancelar citas con al menos 24 horas de anticipación desde la sección de citas."
    },
    {
      question: "¿Cómo solicito cambios en mis mascotas?",
      answer: "Debes enviar una solicitud desde la sección de mascotas que será revisada por nuestro equipo."
    }
  ];

  return (
    <div className="info-page">
      <h1>Centro de Ayuda</h1>
      <div className="content">
        <section>
          <h2>Preguntas Frecuentes</h2>
          <div className="faq-list">
            {faqs.map((faq, index) => (
              <div key={index} className="faq-item">
                <h3>{faq.question}</h3>
                <p>{faq.answer}</p>
              </div>
            ))}
          </div>
        </section>
        
        <section>
          <h2>Contacto</h2>
          <p>Para asistencia inmediata, por favor contáctanos:</p>
          <ul>
            <li>Teléfono: +1 234 567 890</li>
            <li>Email: ayuda@flookypets.com</li>
            <li>Horario: Lunes a Viernes de 9AM a 6PM</li>
          </ul>
        </section>
        
        <button 
          className="contact-button"
          onClick={() => navigate('/contacto')}
        >
          Formulario de Contacto
        </button>
      </div>
    </div>
  );
}

export default Help;