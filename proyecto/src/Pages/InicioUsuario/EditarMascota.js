import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaEdit, FaArrowLeft, FaSpinner, FaUpload, FaTimesCircle } from 'react-icons/fa';
import styles from './Styles/EditarMascota.module.css';
import { authFetch } from '../../utils/api';
import { validateField } from '../../utils/validation';

const EditarMascota = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, showNotification } = useOutletContext();

    const [formData, setFormData] = useState({
        nombre_mascota: '',
        especie_mascota: '',
        raza_mascota: '',
        edad_mascota: '',
        peso_mascota: '',
        sexo_mascota: '',
        color_mascota: '',
        microchip_mascota: '', // Este valor se cargará pero no será editable
        imagen_mascota: null,
    });
    const [currentImageUrl, setCurrentImageUrl] = useState(null);
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [imagePreview, setImagePreview] = useState(null);

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
                if (user.id !== mascotaData.id_propietario && user.role !== 'admin') {
                    showNotification('No tienes permisos para editar esta mascota.', 'error');
                    navigate('/usuario/mascotas');
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
                    microchip_mascota: mascotaData.microchip || '', // Se carga el valor existente
                    imagen_mascota: null,
                });
                setCurrentImageUrl(mascotaData.imagen_url || null);
                setImagePreview(mascotaData.imagen_url || null);
            } else {
                showNotification(response.message || 'Error al cargar los datos de la mascota.', 'error');
                navigate('/usuario/mascotas');
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
        const { id, value, type } = e.target;
        // Convertir a mayúsculas solo si el tipo de input es 'text'
        const newValue = (type === 'text') ? value.toUpperCase() : value;
        setFormData(prev => ({ ...prev, [id]: newValue }));
        const error = validateField(id, newValue, formData, false);
        setErrors(prev => ({ ...prev, [id]: error }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                setErrors(prev => ({ ...prev, imagen_mascota: 'Solo se permiten archivos de imagen.' }));
                setImagePreview(null);
                e.target.value = null;
                return;
            }
            if (file.size > 5 * 1024 * 1024) { // 5MB
                setErrors(prev => ({ ...prev, imagen_mascota: 'La imagen no debe exceder los 5MB.' }));
                setImagePreview(null);
                e.target.value = null;
                return;
            }

            setFormData(prev => ({ ...prev, imagen_mascota: file }));
            setErrors(prev => ({ ...prev, imagen_mascota: null }));
            setImagePreview(URL.createObjectURL(file));
        } else {
            setFormData(prev => ({ ...prev, imagen_mascota: null }));
            setImagePreview(currentImageUrl);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        let newErrors = {};
        Object.keys(formData).forEach(key => {
            if (key !== 'imagen_mascota' && key !== 'microchip_mascota') { // Excluir imagen y microchip de la validación estándar del formulario
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
            showNotification('Por favor, corrige los errores en el formulario antes de guardar.', 'error');
            setIsSubmitting(false);
            return;
        }

        try {
            let imageUrlToSave = currentImageUrl;
            if (formData.imagen_mascota) {
                const formDataImage = new FormData();
                formDataImage.append('image', formData.imagen_mascota);

                const uploadResponse = await authFetch('/upload-image', {
                    method: 'POST',
                    body: formDataImage,
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
                microchip: formData.microchip_mascota, // Aseguramos que se envíe el microchip existente
                imagen_url: imageUrlToSave,
            };

            const response = await authFetch(`/mascotas/${id}`, {
                method: 'PUT',
                body: updatedMascota,
            });

            if (response.success) {
                showNotification('¡Mascota actualizada con éxito!', 'success');
                navigate(`/usuario/mascotas/${id}`);
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
            <div className={styles.loadingContainer}>
                <FaSpinner className={styles.spinnerIcon} />
                <p>Cargando datos de la mascota...</p>
            </div>
        );
    }

    return (
        <motion.div
            className={styles.editarMascotaContainer}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <div className={styles.editarMascotaHeader}>
                <button onClick={() => navigate(-1)} className={styles.backButton}>
                    <FaArrowLeft /> Volver
                </button>
                <h2><FaEdit className={styles.headerIcon} /> Editar Mascota</h2>
            </div>

            <form onSubmit={handleSubmit} className={styles.editarMascotaForm}>
                <div className={styles.formGrid}>
                    <div className={`${styles.formGroup} ${errors.nombre_mascota ? styles.hasError : ''}`}>
                        <label htmlFor="nombre_mascota">Nombre:</label>
                        <input
                            type="text"
                            id="nombre_mascota"
                            value={formData.nombre_mascota}
                            onChange={handleChange}
                            placeholder="Nombre de la mascota"
                            required
                        />
                        {errors.nombre_mascota && <p className={styles.errorText}><FaTimesCircle /> {errors.nombre_mascota}</p>}
                    </div>

                    <div className={`${styles.formGroup} ${errors.especie_mascota ? styles.hasError : ''}`}>
                        <label htmlFor="especie_mascota">Especie:</label>
                        <input
                            type="text"
                            id="especie_mascota"
                            value={formData.especie_mascota}
                            onChange={handleChange}
                            placeholder="Ej: Perro, Gato, Ave"
                            required
                        />
                        {errors.especie_mascota && <p className={styles.errorText}><FaTimesCircle /> {errors.especie_mascota}</p>}
                    </div>

                    <div className={`${styles.formGroup} ${errors.raza_mascota ? styles.hasError : ''}`}>
                        <label htmlFor="raza_mascota">Raza:</label>
                        <input
                            type="text"
                            id="raza_mascota"
                            value={formData.raza_mascota}
                            onChange={handleChange}
                            placeholder="Ej: Labrador, Siames"
                        />
                        {errors.raza_mascota && <p className={styles.errorText}><FaTimesCircle /> {errors.raza_mascota}</p>}
                    </div>

                    <div className={`${styles.formGroup} ${errors.edad_mascota ? styles.hasError : ''}`}>
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
                        {errors.edad_mascota && <p className={styles.errorText}><FaTimesCircle /> {errors.edad_mascota}</p>}
                    </div>

                    <div className={`${styles.formGroup} ${errors.peso_mascota ? styles.hasError : ''}`}>
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
                        {errors.peso_mascota && <p className={styles.errorText}><FaTimesCircle /> {errors.peso_mascota}</p>}
                    </div>

                    <div className={`${styles.formGroup} ${errors.sexo_mascota ? styles.hasError : ''}`}>
                        <label htmlFor="sexo_mascota">Sexo:</label>
                        <select
                            id="sexo_mascota"
                            value={formData.sexo_mascota}
                            onChange={handleChange}
                            required
                        >
                            <option value="">Seleccionar</option>
                            <option value="Macho">Macho</option>
                            <option value="Hembra">Hembra</option>
                        </select>
                        {errors.sexo_mascota && <p className={styles.errorText}><FaTimesCircle /> {errors.sexo_mascota}</p>}
                    </div>

                    <div className={`${styles.formGroup} ${errors.color_mascota ? styles.hasError : ''}`}>
                        <label htmlFor="color_mascota">Color:</label>
                        <input
                            type="text"
                            id="color_mascota"
                            value={formData.color_mascota}
                            onChange={handleChange}
                            placeholder="Ej: Marrón, Negro"
                        />
                        {errors.color_mascota && <p className={styles.errorText}><FaTimesCircle /> {errors.color_mascota}</p>}
                    </div>

                    {/* Campo de Microchip deshabilitado */}
                    <div className={`${styles.formGroup} ${errors.microchip_mascota ? styles.hasError : ''}`}>
                        <label htmlFor="microchip_mascota">Número de Microchip:</label> {/* Etiqueta sin "opcional" */}
                        <input
                            type="text"
                            id="microchip_mascota"
                            value={formData.microchip_mascota}
                            onChange={handleChange} // onChange se mantiene pero no se disparará
                            placeholder="Número de identificación"
                            disabled // Campo deshabilitado
                        />
                        {errors.microchip_mascota && <p className={styles.errorText}><FaTimesCircle /> {errors.microchip_mascota}</p>}
                    </div>

                    <div className={`${styles.formGroup} ${styles.fullWidth} ${styles.imageUploadWrapper}`}>
                        <label className={styles.imageUploadLabel}>Foto de la Mascota:</label>
                        <div
                            className={`${styles.imageUploadArea} ${errors.imagen_mascota ? styles.hasErrorBorder : ''}`}
                            onClick={() => document.getElementById('imagen_mascota').click()}
                        >
                            {(imagePreview || currentImageUrl) ? (
                                <div className={styles.imagePreviewContainer}>
                                    <img
                                        src={imagePreview || currentImageUrl}
                                        alt="Vista previa de la mascota"
                                        className={styles.imagePreview}
                                        onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/180x180/cccccc/ffffff?text=No+Img'; }}
                                    />
                                    <div className={styles.overlay}>
                                        <FaUpload />
                                        <span>Cambiar Imagen</span>
                                    </div>
                                </div>
                            ) : (
                                <div className={styles.imagePlaceholder}>
                                    <FaUpload />
                                    <span>Subir Imagen</span>
                                    <p>Haz clic para seleccionar una foto</p>
                                </div>
                            )}
                        </div>
                        <input
                            type="file"
                            id="imagen_mascota"
                            accept="image/*"
                            onChange={handleFileChange}
                            className={styles.fileInput}
                        />
                        {errors.imagen_mascota && <p className={styles.errorText}><FaTimesCircle /> {errors.imagen_mascota}</p>}
                    </div>
                </div>

                <motion.button
                    type="submit"
                    className={styles.submitButton}
                    disabled={isSubmitting || Object.values(errors).some(error => error !== null)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                >
                    {isSubmitting ? (
                        <>
                            <FaSpinner className={styles.spinnerIcon} />
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