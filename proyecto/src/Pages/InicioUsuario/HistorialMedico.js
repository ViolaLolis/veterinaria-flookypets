import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useOutletContext } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaSpinner, FaInfoCircle, FaPlusCircle, FaArrowLeft,
  FaFileMedical, FaCalendarAlt, FaUserMd, FaWeight, FaThermometerHalf
} from 'react-icons/fa';
import styles from './Styles/HistorialMedico.module.css'; // Importar el CSS sin .module
import { authFetch } from '../../utils/api'; // Importar la función authFetch
import { toast } from 'react-toastify'; // Import toast for user feedback

const HistorialMedico = () => {
  const { mascotaId } = useParams();
  const navigate = useNavigate();
  const { user, showNotification } = useOutletContext(); // Obtener user y showNotification del contexto

  const [mascota, setMascota] = useState(null);
  const [historial, setHistorial] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHistorialAndMascota = async () => {
      setIsLoading(true);
      setError(null);

      if (!user?.id) {
        showNotification('No se pudo cargar la información del usuario. Por favor, inicia sesión.', 'error');
        setIsLoading(false);
        return;
      }

      try {
        // 1. Obtener detalles de la mascota
        const mascotaResponse = await authFetch(`/mascotas/${mascotaId}`);
        if (mascotaResponse.success) {
          setMascota(mascotaResponse.data);
        } else {
          showNotification(mascotaResponse.message || 'Error al cargar la mascota.', 'error');
          setError(mascotaResponse.message || 'No se encontró la mascota o no tienes permisos.');
          setIsLoading(false);
          return;
        }

        // 2. Obtener historial médico de la mascota
        const historialResponse = await authFetch(`/historial_medico?id_mascota=${mascotaId}`);
        if (historialResponse.success) {
          setHistorial(historialResponse.data);
        } else {
          showNotification(historialResponse.message || 'Error al cargar el historial médico.', 'error');
          setHistorial([]); // Asegurarse de que el historial esté vacío si falla
        }
      } catch (err) {
        console.error("Error fetching mascota details or historial:", err);
        showNotification('Error de conexión al servidor.', 'error');
        setError('Error de conexión al servidor.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistorialAndMascota();
  }, [mascotaId, user, showNotification]);

  if (isLoading) {
    return (
      <div className="loading-container">
        <FaSpinner className="spinner-icon" />
        <p>Cargando historial médico...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-message">
        <FaInfoCircle className="info-icon" />
        <p>{error}</p>
        <button onClick={() => navigate(-1)} className="back-button">
          <FaArrowLeft /> Volver
        </button>
      </div>
    );
  }

  if (!mascota) {
    return (
      <div className="no-data-message">
        <FaInfoCircle className="info-icon" />
        <p>No se encontró la mascota.</p>
        <Link to="/usuario/mascotas" className="back-button">
          <FaArrowLeft /> Volver a Mis Mascotas
        </Link>
      </div>
    );
  }

  // Verificar si el usuario actual es el propietario o un veterinario/administrador
  const isOwnerOrVetOrAdmin = user && (user.id === mascota.id_propietario || user.role === 'veterinario' || user.role === 'admin');
  const canAddHistorial = user && (user.role === 'veterinario' || user.role === 'admin');

  return (
    <motion.div
      className="historial-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="historial-header">
        <FaFileMedical className="historial-icon" />
        <h2>Historial Médico de {mascota.nombre}</h2>
        <button onClick={() => navigate(-1)} className="back-button">
          <FaArrowLeft /> Volver
        </button>
      </div>

      <div className="mascota-info-card">
        <h3>Información de la Mascota</h3>
        <p><strong>Nombre:</strong> {mascota.nombre}</p>
        <p><strong>Especie:</strong> {mascota.especie}</p>
        <p><strong>Raza:</strong> {mascota.raza || 'N/A'}</p>
        <p><strong>Edad:</strong> {mascota.edad ? `${mascota.edad} años` : 'N/A'}</p>
      </div>

      <div className="historial-list-section">
        <h3>Registros Médicos</h3>
        {canAddHistorial && (
          <Link to={`/usuario/historial/${mascotaId}/agregar`} className="add-historial-button">
            <FaPlusCircle /> Añadir Nuevo Registro
          </Link>
        )}
        {historial.length > 0 ? (
          <ul className="historial-list">
            <AnimatePresence>
              {historial.map(item => (
                <motion.li
                  key={item.id_historial}
                  className="historial-item"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="item-header">
                    <FaCalendarAlt className="item-icon" />
                    <span className="item-date">{new Date(item.fecha_consulta).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                    <span className="item-veterinario">Dr. {item.veterinario_nombre || 'N/A'}</span>
                  </div>
                  <div className="item-body">
                    <p><strong>Diagnóstico:</strong> {item.diagnostico}</p>
                    <p><strong>Tratamiento:</strong> {item.tratamiento}</p>
                    {item.peso_actual && <p><strong>Peso:</strong> {item.peso_actual} kg</p>}
                    {item.temperatura && <p><strong>Temperatura:</strong> {item.temperatura} °C</p>}
                    {item.observaciones && <p><strong>Observaciones:</strong> {item.observaciones}</p>}
                    {item.proxima_cita && <p><strong>Próxima Cita:</strong> {new Date(item.proxima_cita).toLocaleDateString('es-ES')}</p>}
                  </div>
                  <div className="item-actions">
                    <Link to={`/usuario/historial/${mascotaId}/${item.id_historial}`} className="view-detail-button">
                      Ver Detalle
                    </Link>
                  </div>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        ) : (
          <div className="no-historial-message">
            <FaInfoCircle />
            <p>No hay registros médicos para esta mascota.</p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default HistorialMedico;
