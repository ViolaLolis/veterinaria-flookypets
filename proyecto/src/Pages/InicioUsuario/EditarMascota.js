import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {faArrowLeft,faSpinner, faCheckCircle, faTimesCircle
} from '@fortawesome/free-solid-svg-icons';
import { authFetch } from './api'; // Importa authFetch
import './Styles/EditarMascota.css'; // Importa el CSS

const EditarMascota = ({ user }) => { // Recibe el objeto 'user' como prop
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nombre: '',
    especie: '',
    raza: '',
    edad: '',
    peso: '',
    sexo: '',
    color: '',
    microchip: '',
    fecha_nacimiento: ''
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(null);

  /**
   * Muestra una notificación temporal en la UI.
   * @param {string} message - El mensaje a mostrar.
   * @param {string} type - El tipo de notificación ('success' o 'error').
   */
  const showNotification = useCallback((message, type = 'success') => {
    setNotification({ message, type });
    const timer = setTimeout(() => {
      setNotification(null);
    }, 3000); // La notificación desaparece después de 3 segundos
    return () => clearTimeout(timer);
  }, []);

  const fetchMascotaDetails = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authFetch(`/mascotas/${id}`);
      if (response.success) {
        const mascotaData = response.data;
        setFormData({
          nombre: mascotaData.nombre || '',
          especie: mascotaData.especie || '',
          raza: mascotaData.raza || '',
          edad: mascotaData.edad || '',
          peso: mascotaData.peso || '',
          sexo: mascotaData.sexo || 'Desconocido',
          color: mascotaData.color || '',
          microchip: mascotaData.microchip || '',
          fecha_nacimiento: mascotaData.fecha_nacimiento ? mascotaData.fecha_nacimiento.split('T')[0] : ''
        });
      } else {
        setError(response.message || 'Error al cargar los detalles de la mascota.');
      }
    } catch (err) {
      console.error("Error fetching pet details:", err);
      setError('Error de conexión al servidor.');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchMascotaDetails();
  }, [fetchMascotaDetails]);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setNotification(null);

    if (!formData.nombre || !formData.especie) {
      showNotification('Por favor, completa el nombre y la especie de la mascota.', 'error');
      setIsSubmitting(false);
      return;
    }

    try {
      const updatedPet = {
        nombre: formData.nombre,
        especie: formData.especie,
        raza: formData.raza,
        edad: parseInt(formData.edad) || null,
        peso: parseFloat(formData.peso) || null,
        sexo: formData.sexo,
        color: formData.color,
        microchip: formData.microchip,
        fecha_nacimiento: formData.fecha_nacimiento
      };

      const response = await authFetch(`/mascotas/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updatedPet),
      });

      if (response.success) {
        showNotification('¡Mascota actualizada con éxito!', 'success');
        setTimeout(() => {
          navigate(`/usuario/mascota/${id}`); // Redirigir al detalle de la mascota
        }, 1500);
      } else {
        showNotification(response.message || 'Error al actualizar la mascota.', 'error');
      }
    } catch (err) {
      console.error("Error updating pet:", err);
      showNotification('Error de conexión al servidor al actualizar la mascota.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <FontAwesomeIcon icon={faSpinner} spin className="spinner-icon" />
        <p>Cargando datos de la mascota...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-message">
        <FontAwesomeIcon icon={faTimesCircle} className="error-icon" />
        <p>{error}</p>
        <button onClick={() => navigate(-1)} className="back-button">
          <FontAwesomeIcon icon={faArrowLeft} /> Volver
        </button>
      </div>
    );
  }

  return (
    <motion.div
      className="editar-mascota-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <h2 className="editar-mascota-title">Editar Mascota</h2>

      <AnimatePresence>
        {notification && (
          <motion.div
            className={`notification ${notification.type}`}
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
          >
            <FontAwesomeIcon icon={notification.type === 'success' ? faCheckCircle : faTimesCircle} />
            {notification.message}
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSubmit} className="editar-mascota-form">
        <div className="form-group">
          <label htmlFor="nombre">Nombre:</label>
          <input
            type="text"
            id="nombre"
            value={formData.nombre}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="especie">Especie:</label>
          <select
            id="especie"
            value={formData.especie}
            onChange={handleChange}
            required
          >
            <option value="">Selecciona una especie</option>
            <option value="Perro">Perro</option>
            <option value="Gato">Gato</option>
            <option value="Otro">Otro</option>
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="raza">Raza:</label>
          <input
            type="text"
            id="raza"
            value={formData.raza}
            onChange={handleChange}
          />
        </div>
        <div className="form-group">
          <label htmlFor="fecha_nacimiento">Fecha de Nacimiento:</label>
          <input
            type="date"
            id="fecha_nacimiento"
            value={formData.fecha_nacimiento}
            onChange={handleChange}
          />
        </div>
        <div className="form-group">
          <label htmlFor="edad">Edad (años):</label>
          <input
            type="number"
            id="edad"
            value={formData.edad}
            onChange={handleChange}
            min="0"
          />
        </div>
        <div className="form-group">
          <label htmlFor="peso">Peso (kg):</label>
          <input
            type="number"
            id="peso"
            value={formData.peso}
            onChange={handleChange}
            step="0.1"
            min="0"
          />
        </div>
        <div className="form-group">
          <label htmlFor="sexo">Sexo:</label>
          <select
            id="sexo"
            value={formData.sexo}
            onChange={handleChange}
          >
            <option value="Macho">Macho</option>
            <option value="Hembra">Hembra</option>
            <option value="Desconocido">Desconocido</option>
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="color">Color:</label>
          <input
            type="text"
            id="color"
            value={formData.color}
            onChange={handleChange}
          />
        </div>
        <div className="form-group">
          <label htmlFor="microchip">Microchip:</label>
          <input
            type="text"
            id="microchip"
            value={formData.microchip}
            onChange={handleChange}
          />
        </div>
        <motion.button
          type="submit"
          className="editar-mascota-button"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <FontAwesomeIcon icon={faSpinner} spin />
              <span>Guardando...</span>
            </>
          ) : (
            'Guardar Cambios'
          )}
        </motion.button>
        <Link to={`/usuario/mascota/${id}`} className="editar-mascota-cancel">Cancelar</Link>
      </form>
    </motion.div>
  );
};

export default EditarMascota;
