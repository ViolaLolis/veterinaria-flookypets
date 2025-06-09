import React from 'react';
import { useNavigate } from 'react-router-dom';
import TarjetaServicio from './TarjetaServicio';

const ServiciosVeterinaria = () => {
  const navigate = useNavigate();
  const servicios = [
    { id: 1, nombre: 'Consulta General', descripcion: 'Revisión médica básica para tu mascota.', precio: '$50.000' },
    { id: 2, nombre: 'Vacunación', descripcion: 'Programas de vacunación personalizados.', precio: '$30.000' },
    // ...otros servicios
  ];

  const handleAgendar = (servicioId) => {
    navigate('/usuario/citas/agendar', { 
      state: { servicioId } 
    });
  };

  return (
    <div>
      <div>
        <h3>Nuestros Servicios</h3>
        <p>Cuidamos la salud y el bienestar de tus mascotas.</p>
      </div>
      <div>
        {servicios.map(servicio => (
          <div key={servicio.id}>
            <TarjetaServicio 
              servicio={servicio} 
              onAgendar={() => handleAgendar(servicio.id)}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ServiciosVeterinaria;