import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaw, faDog, faCat, faWeight, faCalendarAlt, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import './Styles/AgregarMascota.css';

const AgregarMascota = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nombre: '',
    especie: 'perro',
    raza: '',
    edad: '',
    peso: '',
    imagen: null
  });
  const [previewImage, setPreviewImage] = useState(null);

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

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Mascota agregada:', formData);
    navigate('/usuario/mascotas');
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
              <label htmlFor="edad">
                <FontAwesomeIcon icon={faCalendarAlt} className="input-icon" />
                Edad (años)
              </label>
              <input
                type="number"
                id="edad"
                value={formData.edad}
                onChange={handleChange}
                min="0"
                max="30"
                placeholder="0"
              />
            </div>
          </div>

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

          <div className="form-actions">
            <motion.button
              type="submit"
              className="submit-button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={!formData.nombre}
            >
              Registrar Mascota
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