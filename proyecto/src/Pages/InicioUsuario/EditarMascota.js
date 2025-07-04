import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaPaw, FaEdit, FaArrowLeft, FaSpinner, FaUpload, FaInfoCircle } from 'react-icons/fa';
import styles from './Styles/EditarMascota.module.css'; // Importar el CSS sin .module
import { authFetch } from '../../utils/api'; // Importar la función authFetch
import { validateField } from '../../utils/validation'; // Importar la función de validación

const EditarMascota = () => {
  const { id } = useParams(); // ID de la mascota a editar
  const navigate = useNavigate();
  const { user, showNotification } = useOutletContext(); // Obtener user y showNotification del contexto

  const [formData, setFormData] = useState({
    nombre_mascota: '',
    especie_mascota: '',
    raza_mascota: '',
    edad_mascota: '',
    peso_mascota: '',
    sexo_mascota: '',
    color_mascota: '',
    microchip_mascota: '',
    imagen_mascota: null, // Para el archivo de imagen
  });
  const [currentImageUrl, setCurrentImageUrl] = useState(null); // Para la URL de la imagen existente
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState(null); // Para mostrar la vista previa de la nueva imagen

  const fetchMascotaDetails = useCallback(async () => {
    setIsLoading(true);
    if (!user?.id) {
      showNotification('No se pudo cargar la información del usuario. Por favor, inicia sesión.', 'error');
      setIsLoading(false);
      return;
    }
    try {
      const response = await authFetch(`/mascotas/${id}`);
      if (response.success) {
        const mascotaData = response.data;
        // Verificar si el usuario actual es el propietario o un administrador
        if (user.id !== mascotaData.id_propietario && user.role !== 'admin') {
          showNotification('No tienes permisos para editar esta mascota.', 'error');
          navigate('/usuario/mascotas'); // Redirigir si no tiene permisos
          return;
        }

        setFormData({
          nombre_mascota: mascotaData.nombre || '',
          especie_mascota: mascotaData.especie || '',
          raza_mascota: mascotaData.raza || '',
          edad_mascota: mascotaData.edad || '',
          peso_mascota: mascotaData.peso || '',
          sexo_mascota: mascotaData.sexo || '',
          color_mascota: mascotaData.color || '',
          microchip_mascota: mascotaData.microchip || '',
          imagen_mascota: null, // No cargar el archivo, solo la URL
        });
        setCurrentImageUrl(mascotaData.imagen_url || null);
      } else {
        showNotification(response.message || 'Error al cargar los datos de la mascota.', 'error');
        navigate('/usuario/mascotas'); // Redirigir en caso de error
      }
    } catch (err) {
      console.error("Error fetching pet details for editing:", err);
      showNotification('Error de conexión al servidor.', 'error');
      navigate('/usuario/mascotas');
    } finally {
      setIsLoading(false);
    }
  }, [id, user, navigate, showNotification]);

  useEffect(() => {
    fetchMascotaDetails();
  }, [fetchMascotaDetails]);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
    const error = validateField(id, value, formData, false); // isNewEntry=false para edición
    setErrors(prev => ({ ...prev, [id]: error }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validar tipo de archivo y tamaño
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({ ...prev, imagen_mascota: 'Solo se permiten archivos de imagen.' }));
        setImagePreview(null);
        return;
      }
      if (file.size > 5 * 1024 * 1024) { // 5MB
        setErrors(prev => ({ ...prev, imagen_mascota: 'La imagen no debe exceder los 5MB.' }));
        setImagePreview(null);
        return;
      }

      setFormData(prev => ({ ...prev, imagen_mascota: file }));
      setErrors(prev => ({ ...prev, imagen_mascota: null }));
      setImagePreview(URL.createObjectURL(file)); // Crear URL para la vista previa
    } else {
      setFormData(prev => ({ ...prev, imagen_mascota: null }));
      setImagePreview(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    let newErrors = {};
    Object.keys(formData).forEach(key => {
      if (key !== 'imagen_mascota') {
        const error = validateField(key, formData[key], formData, false);
        if (error) {
          newErrors[key] = error;
        }
      }
    });
    if (errors.imagen_mascota) {
      newErrors.imagen_mascota = errors.imagen_mascota;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      showNotification('Por favor, corrige los errores en el formulario.', 'error');
      setIsSubmitting(false);
      return;
    }

    try {
      let imageUrlToSave = currentImageUrl; // Por defecto, mantener la imagen actual
      if (formData.imagen_mascota) {
        // Si se seleccionó una nueva imagen, subirla
        const formDataImage = new FormData();
        formDataImage.append('image', formData.imagen_mascota);
        const uploadResponse = await authFetch('/upload-image', {
          method: 'POST',
          body: formDataImage,
          headers: {
            // No Content-Type header when sending FormData, browser sets it
          }
        });
        if (uploadResponse.success) {
          imageUrlToSave = uploadResponse.imageUrl;
        } else {
          showNotification(uploadResponse.message || 'Error al subir la nueva imagen de la mascota.', 'error');
          setIsSubmitting(false);
          return;
        }
      }

      const updatedMascota = {
        nombre: formData.nombre_mascota,
        especie: formData.especie_mascota,
        raza: formData.raza_mascota,
        edad: formData.edad_mascota ? parseInt(formData.edad_mascota) : null,
        peso: formData.peso_mascota ? parseFloat(formData.peso_mascota) : null,
        sexo: formData.sexo_mascota,
        color: formData.color_mascota,
        microchip: formData.microchip_mascota,
        imagen_url: imageUrlToSave, // Usar la nueva URL o la existente
      };

      const response = await authFetch(`/mascotas/${id}`, {
        method: 'PUT',
        body: updatedMascota,
      });

      if (response.success) {
        showNotification('¡Mascota actualizada con éxito!', 'success');
        navigate(`/usuario/mascotas/${id}`); // Redirigir al detalle de la mascota
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
        <FaSpinner className="spinner-icon" />
        <p>Cargando datos de la mascota...</p>
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
      <div className="editar-mascota-header">
        <FaEdit className="editar-mascota-icon" />
        <h2>Editar Mascota</h2>
        <button onClick={() => navigate(-1)} className="back-button">
          <FaArrowLeft /> Volver
        </button>
      </div>

      <form onSubmit={handleSubmit} className="editar-mascota-form">
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="nombre_mascota">Nombre:</label>
            <input
              type="text"
              id="nombre_mascota"
              value={formData.nombre_mascota}
              onChange={handleChange}
              placeholder="Nombre de la mascota"
              required
            />
            {errors.nombre_mascota && <p className="error-text">{errors.nombre_mascota}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="especie_mascota">Especie:</label>
            <input
              type="text"
              id="especie_mascota"
              value={formData.especie_mascota}
              onChange={handleChange}
              placeholder="Ej: Perro, Gato, Ave"
              required
            />
            {errors.especie_mascota && <p className="error-text">{errors.especie_mascota}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="raza_mascota">Raza:</label>
            <input
              type="text"
              id="raza_mascota"
              value={formData.raza_mascota}
              onChange={handleChange}
              placeholder="Ej: Labrador, Siames"
            />
            {errors.raza_mascota && <p className="error-text">{errors.raza_mascota}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="edad_mascota">Edad (años):</label>
            <input
              type="number"
              id="edad_mascota"
              value={formData.edad_mascota}
              onChange={handleChange}
              placeholder="Edad en años"
              min="0"
              max="30"
            />
            {errors.edad_mascota && <p className="error-text">{errors.edad_mascota}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="peso_mascota">Peso (kg):</label>
            <input
              type="number"
              id="peso_mascota"
              value={formData.peso_mascota}
              onChange={handleChange}
              placeholder="Peso en kg"
              step="0.1"
              min="0.1"
              max="200"
            />
            {errors.peso_mascota && <p className="error-text">{errors.peso_mascota}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="sexo_mascota">Sexo:</label>
            <select
              id="sexo_mascota"
              value={formData.sexo_mascota}
              onChange={handleChange}
            >
              <option value="">Seleccionar</option>
              <option value="Macho">Macho</option>
              <option value="Hembra">Hembra</option>
            </select>
            {errors.sexo_mascota && <p className="error-text">{errors.sexo_mascota}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="color_mascota">Color:</label>
            <input
              type="text"
              id="color_mascota"
              value={formData.color_mascota}
              onChange={handleChange}
              placeholder="Ej: Marrón, Negro"
            />
            {errors.color_mascota && <p className="error-text">{errors.color_mascota}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="microchip_mascota">Número de Microchip (opcional):</label>
            <input
              type="text"
              id="microchip_mascota"
              value={formData.microchip_mascota}
              onChange={handleChange}
              placeholder="Número de identificación"
            />
            {errors.microchip_mascota && <p className="error-text">{errors.microchip_mascota}</p>}
          </div>

          <div className="form-group full-width">
            <label htmlFor="imagen_mascota" className="image-upload-label">
              <FaUpload /> Cambiar Imagen de la Mascota (opcional)
            </label>
            <input
              type="file"
              id="imagen_mascota"
              accept="image/*"
              onChange={handleFileChange}
              className="file-input"
            />
            {(imagePreview || currentImageUrl) && (
              <div className="image-preview-container">
                <img
                  src={imagePreview || currentImageUrl}
                  alt="Vista previa de la mascota"
                  className="image-preview"
                  onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/150x150/cccccc/ffffff?text=No+Img'; }}
                />
              </div>
            )}
            {errors.imagen_mascota && <p className="error-text">{errors.imagen_mascota}</p>}
          </div>
        </div>

        <motion.button
          type="submit"
          className="submit-button"
          disabled={isSubmitting || Object.values(errors).some(error => error !== null)}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          {isSubmitting ? (
            <>
              <FaSpinner className="spinner-icon" />
              <span>Guardando...</span>
            </>
          ) : (
            <>
              <FaEdit /> Guardar Cambios
            </>
          )}
        </motion.button>
      </form>
    </motion.div>
  );
};

export default EditarMascota;
