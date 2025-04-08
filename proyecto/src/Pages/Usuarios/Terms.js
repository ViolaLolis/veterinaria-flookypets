import React from 'react';
import "../Styles/InfoPage.css";

function Terms() {
  return (
    <div className="info-page">
      <h1>Términos y Condiciones</h1>
      <div className="content">
        <section>
          <h2>Uso del Servicio</h2>
          <p>Al utilizar nuestros servicios, aceptas cumplir con estos términos y condiciones.</p>
        </section>
        
        <section>
          <h2>Privacidad</h2>
          <p>Respetamos tu privacidad y protegemos tus datos personales de acuerdo con nuestra política de privacidad.</p>
        </section>
        
        <section>
          <h2>Responsabilidades</h2>
          <p>El dueño es responsable de proporcionar información precisa sobre la mascota y su historial médico.</p>
        </section>
      </div>
    </div>
  );
}

export default Terms;