import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useOutletContext } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaPaw,
  FaWeight,
  FaCalendarAlt,
  FaArrowLeft,
  FaSpinner,
  FaInfoCircle,
  FaEdit,
  FaTrash,
  FaDog,
  FaCat
} from 'react-icons/fa';
import './Styles/DetalleMascota.css';

const mascotasLocales = [
  {
    id: '1',
    nombre: 'Firulais',
    especie: 'Perro',
    raza: 'Labrador',
    edad: 5,
    peso: 25,
    sexo: 'Macho',
    color: 'Negro',
    microchip: '123456789',
    propietario_nombre: 'Juan Pérez',
    id_propietario: '100',
  },
  {
    id: '2',
    nombre: 'Misu',
    especie: 'Gato',
    raza: 'Siames',
    edad: 3,
    peso: 4,
    sexo: 'Hembra',
    color: 'Blanco',
    microchip: '',
    propietario_nombre: 'Ana López',
    id_propietario: '101',
  },
];

const historialLocales = {
  '1': [
    {
      id_historial: '1001',
      fecha_consulta: '2024-01-15',
      diagnostico: 'Vacunación anual',
    },
    {
      id_historial: '1002',
      fecha_consulta: '2023-12-10',
      diagnostico: 'Chequeo general',
    },
  ],
  '2': [
    {
      id_historial: '2001',
      fecha_consulta: '2024-02-20',
      diagnostico: 'Desparasitación',
    },
  ],
};

const DetalleMascota = () => {
  const { user, showNotification } = useOutletContext();
  const { id } = useParams();
  const navigate = useNavigate();
  const [mascota, setMascota] = useState(null);
  const [historial, setHistorial] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    setError(null);

    const mascotaEncontrada = mascotasLocales.find(m => m.id === id);
    if (!mascotaEncontrada) {
      setError('No se encontró la mascota.');
      setIsLoading(false);
      return;
    }
    setMascota(mascotaEncontrada);
    setHistorial(historialLocales[id] || []);
    setIsLoading(false);
  }, [id]);

  const handleDeleteMascota = () => {
    setIsDeleting(true);
    setTimeout(() => {
      showNotification('Mascota eliminada correctamente.', 'success');
      navigate('/usuario/mascotas');
      setIsDeleting(false);
      setShowConfirmDelete(false);
    }, 1000);
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
          {mascota.especie === 'Perro' ? (
            <FaDog className="info-icon" />
          ) : (
            <FaCat className="info-icon" />
          )}
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
