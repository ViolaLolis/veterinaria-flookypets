import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaw, faDog, faCat, faWeight, faCalendarAlt, faArrowLeft, faSpinner, faCheckCircle, faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import { authFetch } from './api'; // Importa authFetch
import './Styles/AgregarMascota.css';

const AgregarMascota = ({ user }) => { // Recibe el objeto 'user' como prop
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nombre: '',
    especie: 'perro',
    raza: '',
    edad: '',
    peso: '',
    sexo: 'Desconocido', // Añadir campo sexo
    color: '', // Añadir campo color
    microchip: '', // Añadir campo microchip
    fecha_nacimiento: '' // Añadir campo fecha_nacimiento
  });
  const [previewImage, setPreviewImage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState(null); // Para notificaciones

  /**
   * Muestra una notificación temporal en la UI.
   * @param {string} message - El mensaje a mostrar.
   * @param {string} type - El tipo de notificación ('success' o 'error').
   */
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    const timer = setTimeout(() => {
      setNotification(null);
    }, 3000); // La notificación desaparece después de 3 segundos
    return () => clearTimeout(timer);
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFormData(prev => ({ ...prev, imagen: file }));
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setNotification(null); // Limpiar notificaciones previas

    if (!user || !user.id) {
      showNotification('Error: No se pudo obtener el ID del propietario. Por favor, inicia sesión.', 'error');
      setIsSubmitting(false);
      return;
    }

    try {
      const petData = {
        ...formData,
        id_propietario: user.id, // Asocia la mascota al usuario logueado
        edad: parseInt(formData.edad) || null,
        peso: parseFloat(formData.peso) || null,
        // La imagen no se envía directamente en el JSON, se manejaría con FormData si el backend lo soporta
        // Por ahora, el backend no tiene un campo para imagen, así que la omitimos del envío
        imagen: undefined // Asegúrate de que no se envíe al backend si no hay un campo para ello
      };

      const response = await authFetch('/mascotas', {
        method: 'POST',
        body: JSON.stringify(petData),
      });

      if (response.success) {
        showNotification('¡Mascota registrada con éxito!', 'success');
        setTimeout(() => {
          navigate('/usuario/mascotas'); // Redirigir a la lista de mascotas
        }, 1500);
      } else {
        showNotification(response.message || 'Error al registrar la mascota.', 'error');
      }
    } catch (err) {
      console.error("Error registering pet:", err);
      showNotification('Error de conexión al servidor al registrar la mascota.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      className="agregar-mascota-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="agregar-mascota-header">
        <motion.button
          onClick={() => navigate(-1)}
          className="back-button"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <FontAwesomeIcon icon={faArrowLeft} />
        </motion.button>
        <h2>
          <FontAwesomeIcon icon={faPaw} className="title-icon" />
          Registrar Nueva Mascota
        </h2>
      </div>

      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
          >
            <FontAwesomeIcon icon={notification.type === 'success' ? faCheckCircle : faTimesCircle} />
            {notification.message}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        className="agregar-mascota-card"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <div className="pet-image-section">
          <div className="image-upload-container">
            {previewImage ? (
              <img src={previewImage} alt="Preview" className="pet-preview-image" />
            ) : (
              <div className="image-placeholder">
                <FontAwesomeIcon icon={formData.especie === 'perro' ? faDog : faCat} />
                <span>Sube una foto</span>
              </div>
            )}
            <input
              type="file"
              id="imagen"
              accept="image/*"
              onChange={handleImageChange}
              className="image-upload-input"
            />
            <label htmlFor="imagen" className="image-upload-label">
              <FontAwesomeIcon icon={faPaw} />
              Elegir imagen
            </label>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="agregar-mascota-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="nombre">
                <FontAwesomeIcon icon={faPaw} className="input-icon" />
                Nombre
              </label>
              <input
                type="text"
                id="nombre"
                value={formData.nombre}
                onChange={handleChange}
                required
                placeholder="Ej: Firulais"
              />
            </div>

            <div className="form-group">
              <label htmlFor="especie">
                <FontAwesomeIcon icon={formData.especie === 'perro' ? faDog : faCat} className="input-icon" />
                Especie
              </label>
              <select
                id="especie"
                value={formData.especie}
                onChange={handleChange}
              >
                <option value="perro">Perro</option>
                <option value="gato">Gato</option>
                <option value="otro">Otro</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="raza">
                <FontAwesomeIcon icon={faPaw} className="input-icon" />
                Raza
              </label>
              <input
                type="text"
                id="raza"
                value={formData.raza}
                onChange={handleChange}
                placeholder="Ej: Labrador"
              />
            </div>

            <div className="form-group">
              <label htmlFor="fecha_nacimiento">
                <FontAwesomeIcon icon={faCalendarAlt} className="input-icon" />
                Fecha de Nacimiento
              </label>
              <input
                type="date"
                id="fecha_nacimiento"
                value={formData.fecha_nacimiento}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="peso">
                <FontAwesomeIcon icon={faWeight} className="input-icon" />
                Peso (kg)
              </label>
              <input
                type="number"
                id="peso"
                value={formData.peso}
                onChange={handleChange}
                step="0.1"
                min="0"
                placeholder="0.0"
              />
            </div>
            <div className="form-group">
              <label htmlFor="sexo">
                <FontAwesomeIcon icon={faPaw} className="input-icon" />
                Sexo
              </label>
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
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="color">
                <FontAwesomeIcon icon={faPaw} className="input-icon" />
                Color
              </label>
              <input
                type="text"
                id="color"
                value={formData.color}
                onChange={handleChange}
                placeholder="Ej: Blanco, Negro, Atigrado"
              />
            </div>
            <div className="form-group">
              <label htmlFor="microchip">
                <FontAwesomeIcon icon={faPaw} className="input-icon" />
                Microchip
              </label>
              <input
                type="text"
                id="microchip"
                value={formData.microchip}
                onChange={handleChange}
                placeholder="Ej: 1234567890ABCDEF"
              />
            </div>
          </div>


          <div className="form-actions">
            <motion.button
              type="submit"
              className="submit-button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={!formData.nombre || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <FontAwesomeIcon icon={faSpinner} spin />
                  <span>Registrando...</span>
                </>
              ) : (
                'Registrar Mascota'
              )}
            </motion.button>
            <Link to="/usuario/mascotas" className="cancel-button">
              Cancelar
            </Link>
          </div>
        </form>
      </motion.div>

      <div className="pet-tips-section">
        <h3>Consejos para el registro</h3>
        <ul>
          <li>Proporciona información precisa sobre la raza y edad para mejores recomendaciones</li>
          <li>Sube una foto clara de tu mascota para fácil identificación</li>
          <li>Actualiza el peso regularmente para un seguimiento de salud preciso</li>
        </ul>
      </div>
    </motion.div>
  );
};

export default AgregarMascota;
