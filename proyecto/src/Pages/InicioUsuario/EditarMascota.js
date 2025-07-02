import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import styles from './Styles/EditarMascota.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaw, faDog, faCat, faBirthdayCake, faWeight, faPalette, faVenusMars, faMicrochip, faImage, faSave, faTimesCircle, faArrowLeft, faInfoCircle, faUpload, faTimes } from '@fortawesome/free-solid-svg-icons';
import { FaSpinner } from 'react-icons/fa';

// --- DATOS DE MASCOTAS LOCALES (SIMULADOS) ---
const datosMascotasLocales = {
    1: {
        id_mascota: 1,
        id_propietario: 3,
        nombre: 'Max',
        especie: 'Perro',
        raza: 'Labrador Retriever',
        edad: 3,
        peso: 28.5,
        fecha_nacimiento: '2020-05-10',
        color: 'Dorado',
        sexo: 'Macho',
        microchip: '123456789012345',
        imagen_url: 'https://res.cloudinary.com/dnemd8wp0/image/upload/v1719705600/flookypets_profiles/pet_max.jpg',
    },
    2: {
        id_mascota: 2,
        id_propietario: 3,
        nombre: 'Luna',
        especie: 'Gato',
        raza: 'Siamés',
        edad: 2,
        peso: 4.2,
        fecha_nacimiento: '2021-03-15',
        color: 'Blanco y café',
        sexo: 'Hembra',
        microchip: '234567890123456',
        imagen_url: 'https://res.cloudinary.com/dnemd8wp0/image/upload/v1719705600/flookypets_profiles/pet_luna.jpg',
    },
    3: {
        id_mascota: 3,
        id_propietario: 9,
        nombre: 'Rocky',
        especie: 'Perro',
        raza: 'Bulldog Francés',
        edad: 4,
        peso: 12.3,
        fecha_nacimiento: '2019-01-20',
        color: 'Atigrado',
        sexo: 'Macho',
        microchip: '345678901234567',
        imagen_url: 'https://res.cloudinary.com/dnemd8wp0/image/upload/v1719705600/flookypets_profiles/pet_rocky.jpg',
    },
};

const EditarMascota = () => {
    const { mascotaId } = useParams();
    const navigate = useNavigate();
    const fileInputRef = useRef(null); // Ref para el input de archivo

    const [formData, setFormData] = useState({
        nombre: '',
        especie: '',
        raza: '',
        edad: '',
        peso: '',
        fecha_nacimiento: '',
        color: '',
        sexo: 'Desconocido',
        microchip: '',
    });

    const [imageFile, setImageFile] = useState(null); // Para el archivo de imagen
    const [imagePreviewUrl, setImagePreviewUrl] = useState(''); // Para la URL de previsualización

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [mascotaFound, setMascotaFound] = useState(true);

    useEffect(() => {
        setIsLoading(true);
        const timer = setTimeout(() => {
            const mascota = datosMascotasLocales[mascotaId];
            if (mascota) {
                setFormData({
                    nombre: mascota.nombre || '',
                    especie: mascota.especie || '',
                    raza: mascota.raza || '',
                    edad: mascota.edad || '',
                    peso: mascota.peso || '',
                    fecha_nacimiento: mascota.fecha_nacimiento || '',
                    color: mascota.color || '',
                    sexo: mascota.sexo || 'Desconocido',
                    microchip: mascota.microchip || '',
                });
                // Si hay una URL de imagen, la mostramos como previsualización inicial
                if (mascota.imagen_url) {
                    setImagePreviewUrl(mascota.imagen_url);
                }
                setMascotaFound(true);
            } else {
                setFormData({
                    nombre: '',
                    especie: '',
                    raza: '',
                    edad: '',
                    peso: '',
                    fecha_nacimiento: '',
                    color: '',
                    sexo: 'Desconocido',
                    microchip: '',
                });
                setImageFile(null);
                setImagePreviewUrl('');
                setMascotaFound(false);
            }
            setIsLoading(false);
        }, 500);

        return () => clearTimeout(timer);
    }, [mascotaId]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));
    };

    // Manejar el cambio del input de archivo
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            // Crear una URL para previsualizar la imagen
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreviewUrl(reader.result);
            };
            reader.readAsDataURL(file);
        } else {
            setImageFile(null);
            setImagePreviewUrl('');
        }
    };

    // Función para remover la imagen seleccionada
    const handleRemoveImage = () => {
        setImageFile(null);
        setImagePreviewUrl('');
        if (fileInputRef.current) {
            fileInputRef.current.value = ""; // Limpia el valor del input file
        }
    };

    const handleGoBack = () => {
        navigate(-1);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 1500));

            console.log('Datos del formulario "guardados" localmente:', formData);
            if (imageFile) {
                console.log('Archivo de imagen "cargado" localmente:', imageFile.name, imageFile);
            } else {
                console.log('No se seleccionó ninguna imagen nueva.');
            }

            alert(`¡Mascota "${formData.nombre}" (ID: ${mascotaId}) "actualizada" localmente con éxito!`);
            navigate('/usuario/mascotas');
        } catch (err) {
            alert('Error al "guardar" los cambios localmente. Revisa la consola.');
            console.error('Error al simular el guardado:', err);
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className={styles['editMascota-loadingContainer']}>
                <FaSpinner className={styles.spinnerIcon} />
                <p>Cargando datos de la mascota...</p>
            </div>
        );
    }

    return (
        <motion.div
            className={styles['editMascota-container']}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            <div className={styles['editMascota-header']}>
                <motion.button
                    onClick={handleGoBack}
                    className={styles['editMascota-backButton']}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    <FontAwesomeIcon icon={faArrowLeft} />
                </motion.button>
                <FontAwesomeIcon icon={faPaw} className={styles.icon} />
                <h3>Editar Mascota</h3> {/* Fixed Title */}
            </div>

            {!mascotaFound && (
                <motion.div
                    className={styles['editMascota-infoMessage']}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                >
                    <FontAwesomeIcon icon={faInfoCircle} /> No se encontró una mascota con el ID `{mascotaId}`. Puedes rellenar los campos para simular una nueva mascota.
                </motion.div>
            )}

            <form onSubmit={handleSubmit} className={styles['editMascota-form']}>
                <div className={styles['editMascota-formGrid']}>
                    {/* Nombre */}
                    <div className={styles['editMascota-formGroup']}>
                        <label htmlFor="nombre">
                            <FontAwesomeIcon icon={faDog} /> Nombre:
                        </label>
                        <input
                            type="text"
                            id="nombre"
                            name="nombre"
                            value={formData.nombre}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    {/* Especie */}
                    <div className={styles['editMascota-formGroup']}>
                        <label htmlFor="especie">
                            <FontAwesomeIcon icon={faCat} /> Especie:
                        </label>
                        <input
                            type="text"
                            id="especie"
                            name="especie"
                            value={formData.especie}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    {/* Raza */}
                    <div className={styles['editMascota-formGroup']}>
                        <label htmlFor="raza">
                            <FontAwesomeIcon icon={faPaw} /> Raza:
                        </label>
                        <input
                            type="text"
                            id="raza"
                            name="raza"
                            value={formData.raza}
                            onChange={handleChange}
                        />
                    </div>

                    {/* Edad */}
                    <div className={styles['editMascota-formGroup']}>
                        <label htmlFor="edad">
                            <FontAwesomeIcon icon={faBirthdayCake} /> Edad (años):
                        </label>
                        <input
                            type="number"
                            id="edad"
                            name="edad"
                            value={formData.edad}
                            onChange={handleChange}
                            min="0"
                        />
                    </div>

                    {/* Peso */}
                    <div className={styles['editMascota-formGroup']}>
                        <label htmlFor="peso">
                            <FontAwesomeIcon icon={faWeight} /> Peso (kg):
                        </label>
                        <input
                            type="number"
                            id="peso"
                            name="peso"
                            value={formData.peso}
                            onChange={handleChange}
                            min="0"
                            step="0.1"
                        />
                    </div>

                    {/* Fecha de Nacimiento */}
                    <div className={styles['editMascota-formGroup']}>
                        <label htmlFor="fecha_nacimiento">
                            <FontAwesomeIcon icon={faBirthdayCake} /> Fecha de Nacimiento:
                        </label>
                        <input
                            type="date"
                            id="fecha_nacimiento"
                            name="fecha_nacimiento"
                            value={formData.fecha_nacimiento}
                            onChange={handleChange}
                        />
                    </div>

                    {/* Color */}
                    <div className={styles['editMascota-formGroup']}>
                        <label htmlFor="color">
                            <FontAwesomeIcon icon={faPalette} /> Color:
                        </label>
                        <input
                            type="text"
                            id="color"
                            name="color"
                            value={formData.color}
                            onChange={handleChange}
                        />
                    </div>

                    {/* Sexo */}
                    <div className={styles['editMascota-formGroup']}>
                        <label htmlFor="sexo">
                            <FontAwesomeIcon icon={faVenusMars} /> Sexo:
                        </label>
                        <select
                            id="sexo"
                            name="sexo"
                            value={formData.sexo}
                            onChange={handleChange}
                            required
                        >
                            <option value="Macho">Macho</option>
                            <option value="Hembra">Hembra</option>
                            <option value="Desconocido">Desconocido</option>
                        </select>
                    </div>

                    {/* Microchip */}
                    <div className={styles['editMascota-formGroup']}>
                        <label htmlFor="microchip">
                            <FontAwesomeIcon icon={faMicrochip} /> Microchip:
                        </label>
                        <input
                            type="text"
                            id="microchip"
                            name="microchip"
                            value={formData.microchip}
                            onChange={handleChange}
                        />
                    </div>

                    {/* Campo de carga de Imagen */}
                    <div className={`${styles['editMascota-formGroup']} ${styles['editMascota-imageUploadGroup']}`}>
                        <label>
                            <FontAwesomeIcon icon={faImage} /> Imagen de la Mascota:
                        </label>
                        <input
                            type="file"
                            id="imageUpload"
                            name="image"
                            accept="image/*"
                            onChange={handleImageChange}
                            className={styles['editMascota-hiddenFileInput']}
                            ref={fileInputRef} // Asignar la ref al input
                        />
                        <motion.label
                            htmlFor="imageUpload"
                            className={`${styles['editMascota-uploadButton']} ${styles['editMascota-whiteText']}`}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <FontAwesomeIcon icon={faUpload} /> Seleccionar Imagen
                        </motion.label>

                        {imagePreviewUrl && (
                            <motion.div
                                className={styles['editMascota-imagePreviewContainer']}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                transition={{ duration: 0.2 }}
                            >
                                <img src={imagePreviewUrl} alt="Previsualización de Mascota" />
                                <motion.button
                                    type="button"
                                    onClick={handleRemoveImage}
                                    className={styles['editMascota-removeImageButton']}
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                >
                                    <FontAwesomeIcon icon={faTimes} />
                                </motion.button>
                            </motion.div>
                        )}
                    </div>
                </div>

                <motion.button
                    type="submit"
                    className={styles['editMascota-saveButton']}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    disabled={isSaving}
                >
                    {isSaving ? (
                        <>
                            <FaSpinner className={styles['editMascota-spinner']} /> Guardando...
                        </>
                    ) : (
                        <>
                            <FontAwesomeIcon icon={faSave} /> Guardar Cambios
                        </>
                    )}
                </motion.button>
            </form>
        </motion.div>
    );
};

export default EditarMascota;