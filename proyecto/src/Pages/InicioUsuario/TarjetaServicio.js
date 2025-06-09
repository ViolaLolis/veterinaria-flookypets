import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarCheck } from '@fortawesome/free-solid-svg-icons';

const TarjetaServicio = ({ servicio, onAgendar }) => {
  return (
    <div>
      <div>
        <h3>{servicio.nombre}</h3>
        <p>{servicio.descripcion}</p>
        <div>
          <div>
            <span>30 min</span>
          </div>
          <div>
            <span>Especialista</span>
          </div>
        </div>
      </div>
      
      <div>
        <div>{servicio.precio}</div>
        <button onClick={onAgendar}>
          <FontAwesomeIcon icon={faCalendarCheck} /> Agendar
        </button>
      </div>
    </div>
  );
};

export default TarjetaServicio;