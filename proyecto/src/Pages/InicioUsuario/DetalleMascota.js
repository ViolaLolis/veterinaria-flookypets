import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate, useOutletContext } from 'react-router-dom'; // Importa useOutletContext
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaPaw, FaWeight, FaCalendarAlt, FaArrowLeft, FaSpinner, FaInfoCircle, FaEdit, FaTrash
} from 'react-icons/fa';
import { faDog, faCat } from '@fortawesome/free-solid-svg-icons';
import { authFetch } from './api';
import './Styles/DetalleMascota.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const DetalleMascota = () => { // Ya no recibe user directamente, lo obtiene del contexto
  const { user, showNotification } = useOutletContext(); // Obtiene user y showNotification del contexto del Outlet
  const { id } = useParams();
  const navigate = useNavigate();
  const [mascota, setMascota] = useState(null);
  const [historial, setHistorial] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchMascotaDetails = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const mascotaRes = await authFetch(`/mascotas/${id}`);
      if (mascotaRes.success) {
        setMascota(mascotaRes.data);
        const historialRes = await authFetch(`/historial_medico?id_mascota=${id}`);
        if (historialRes.success) {
          setHistorial(historialRes.data);
        } else {
          setError(historialRes.message || 'Error al cargar el historial médico de la mascota.');
        }
      } else {
        setError(mascotaRes.message || 'Error al cargar los detalles de la mascota.');
      }
    } catch (err) {
      console.error("Error fetching mascota details or historial:", err);
      setError('Error de conexión al servidor.');
    } finally {
      setIsLoading(false);
    }
  }, [id, authFetch]);

  useEffect(() => {
    fetchMascotaDetails();
  }, [fetchMascotaDetails]);

  const handleDeleteMascota = async () => {
    setIsDeleting(true);
    setError(null);
    try {
      const response = await authFetch(`/mascotas/${id}`, {
        method: 'DELETE',
      });
      if (response.success) {
        showNotification('Mascota eliminada correctamente.', 'success'); // Usar showNotification
        navigate('/usuario/mascotas');
      } else {
        showNotification(response.message || 'Error al eliminar la mascota.', 'error'); // Usar showNotification
        setError(response.message || 'Error al eliminar la mascota.');
      }
    } catch (err) {
      console.error("Error deleting mascota:", err);
      showNotification('Error de conexión al servidor al intentar eliminar la mascota.', 'error'); // Usar showNotification
      setError('Error de conexión al servidor al intentar eliminar la mascota.');
    } finally {
      setIsDeleting(false);
      setShowConfirmDelete(false);
    }
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <FaSpinner className="spinner-icon" />
        <p>Cargando detalles de la mascota...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-message">
        <FaInfoCircle className="info-icon" />
        <p>{error}</p>
        <button onClick={() => navigate(-1)} className="detalle-mascota-back">
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
        <button onClick={() => navigate(-1)} className="detalle-mascota-back">
          <FaArrowLeft /> Volver
        </button>
      </div>
    );
  }

  const isOwnerOrAdmin = user && (user.id === mascota.id_propietario || user.role === 'admin');

  return (
    <motion.div
      className="detalle-mascota-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <h2 className="detalle-mascota-title">Detalles de {mascota.nombre}</h2>
      <motion.div
        className="detalle-mascota-info"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <div className="info-item">
          <FaPaw className="info-icon" />
          <p><strong>Nombre:</strong> {mascota.nombre}</p>
        </div>
        <div className="info-item">
          <FontAwesomeIcon icon={mascota.especie === 'Perro' ? faDog : faCat} className="info-icon" />
          <p><strong>Especie:</strong> {mascota.especie}</p>
        </div>
        <div className="info-item">
          <FaPaw className="info-icon" />
          <p><strong>Raza:</strong> {mascota.raza || 'N/A'}</p>
        </div>
        <div className="info-item">
          <FaCalendarAlt className="info-icon" />
          <p><strong>Edad:</strong> {mascota.edad ? `${mascota.edad} años` : 'N/A'}</p>
        </div>
        <div className="info-item">
          <FaWeight className="info-icon" />
          <p><strong>Peso:</strong> {mascota.peso ? `${mascota.peso} kg` : 'N/A'}</p>
        </div>
        <div className="info-item">
          <FaPaw className="info-icon" />
          <p><strong>Sexo:</strong> {mascota.sexo || 'N/A'}</p>
        </div>
        <div className="info-item">
          <FaPaw className="info-icon" />
          <p><strong>Color:</strong> {mascota.color || 'N/A'}</p>
        </div>
        <div className="info-item">
          <FaPaw className="info-icon" />
          <p><strong>Microchip:</strong> {mascota.microchip || 'N/A'}</p>
        </div>
        <div className="info-item">
          <FaPaw className="info-icon" />
          <p><strong>Propietario:</strong> {mascota.propietario_nombre || 'N/A'}</p>
        </div>
      </motion.div>

      <motion.div
        className="detalle-mascota-historial"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <h3>Historial Médico</h3>
        {historial.length > 0 ? (
          <ul className="historial-list">
            {historial.map(item => (
              <li key={item.id_historial} className="historial-item">
                <span className="historial-date">{item.fecha_consulta}</span> - <span className="historial-diagnosis">{item.diagnostico}</span>
                <Link to={`/usuario/historial/${id}/${item.id_historial}`} className="historial-detail-link">Ver detalle</Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="no-historial">No hay historial médico registrado para esta mascota.</p>
        )}
        {isOwnerOrAdmin && (
          <Link to={`/usuario/historial/${id}/agregar`} className="detalle-mascota-button">Agregar entrada al historial</Link>
        )}
      </motion.div>

      <div className="detalle-mascota-actions">
        {isOwnerOrAdmin && (
          <>
            <Link to={`/usuario/mascotas/editar/${id}`} className="detalle-mascota-button editar">
              <FaEdit /> Editar Mascota
            </Link>
            <motion.button
              className="detalle-mascota-button eliminar"
              onClick={() => setShowConfirmDelete(true)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              disabled={isDeleting}
            >
              <FaTrash /> Eliminar Mascota
            </motion.button>
          </>
        )}
        <button onClick={() => navigate(-1)} className="detalle-mascota-back">
          <FaArrowLeft /> Volver a Mis Mascotas
        </button>
      </div>

      <AnimatePresence>
        {showConfirmDelete && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowConfirmDelete(false)}
          >
            <motion.div
              className="modal-content"
              initial={{ y: "-100vh", opacity: 0 }}
              animate={{ y: "0", opacity: 1 }}
              exit={{ y: "100vh", opacity: 0 }}
              transition={{ type: "spring", stiffness: 100, damping: 15 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3>Confirmar Eliminación</h3>
              <p>¿Estás seguro de que deseas eliminar a {mascota.nombre}? Esta acción eliminará también todo su historial médico y citas asociadas.</p>
              <div className="modal-actions">
                <motion.button
                  className="submit-btn"
                  onClick={handleDeleteMascota}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  disabled={isDeleting}
                >
                  {isDeleting ? <><FaSpinner className="spinner-icon" /> Eliminando...</> : 'Sí, Eliminar'}
                </motion.button>
                <motion.button
                  className="cancel-btn"
                  onClick={() => setShowConfirmDelete(false)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  disabled={isDeleting}
                >
                  Cancelar
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default DetalleMascota;