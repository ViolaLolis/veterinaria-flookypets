import React from 'react';
import '../Styles/ContactInfo.css';

function ContactInfo() {
  return (
    <section id="contacto" className="contact-info">
      <h2>Información de Contacto</h2>
      <div className="contact-info__locations">
        <h3>Nuestras Ubicaciones</h3>
        <ul>
          <li><strong>Sede Principal:</strong> Tranversal 12 # 4a-60, Soacha, Cundinamarca</li>
          <li><strong>Punto de Encuentro 1:</strong> Parque Central de Soacha</li>
          <li><strong>Punto de Encuentro 2:</strong> Centro Comercial Ventura Terreros</li>
        </ul>
      </div>
      <div className="contact-info__foundation">
        <h3>Fundación de la Veterinaria</h3>
        <p>Flooky Pets fue fundada en marzo de 2020 por un grupo de apasionados veterinarios con el objetivo de proporcionar atención médica de calidad y un trato amoroso a las mascotas de la comunidad de Soacha y sus alrededores.</p>
      </div>
      <div className="contact-info__numbers">
        <h3>Números de Teléfono</h3>
        <p><strong>Teléfono Principal:</strong> 321 892 8781</p>
        <p><strong>Urgencias:</strong> 300 123 4567</p>
      </div>
    </section>
  );
}

export default ContactInfo;