import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import './Styles/EliminarMetodoPago.css'; // Importa el CSS

const EliminarMetodoPago = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const handleEliminar = () => {
    // Aquí iría la lógica para enviar la solicitud de eliminación del método de pago al backend
    console.log(`Eliminar método de pago con ID: ${id}`);
    navigate('/usuario/perfil/pagos'); // Redirigir a la lista de métodos de pago
  };

  return (
    <div className="eliminar-pago-container">
      <h2 className="eliminar-pago-title">Eliminar Método de Pago</h2>
      <p className="eliminar-pago-confirmacion">
        ¿Estás seguro de que deseas eliminar este método de pago?
      </p>
      <div className="eliminar-pago-actions">
        <button onClick={handleEliminar} className="eliminar-pago-button eliminar">Eliminar</button>
        <Link to="/usuario/perfil/pagos" className="eliminar-pago-button cancelar">Cancelar</Link>
      </div>
    </div>
  );
};

export default EliminarMetodoPago;