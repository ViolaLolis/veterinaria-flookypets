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
    FaDog,
    FaCat
} from 'react-icons/fa';
import styles from './Styles/DetalleMascota.module.css'; // Asegúrate de que el CSS sea un módulo
import { authFetch } from '../../utils/api'; // Importar la función authFetch

const DetalleMascota = () => {
    const { user, showNotification } = useOutletContext();
    const { id } = useParams();
    const navigate = useNavigate();
    const [mascota, setMascota] = useState(null);
    const [historial, setHistorial] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    // showConfirmDelete y isDeleting ya no son necesarios
    // const [showConfirmDelete, setShowConfirmDelete] = useState(false);
    // const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        const fetchMascotaDetails = async () => {
            setIsLoading(true);
            setError(null);
            if (!user?.id) {
                showNotification('No se pudo cargar la información del usuario. Por favor, inicia sesión.', 'error');
                setIsLoading(false);
                return;
            }
            try {
                // Obtener detalles de la mascota
                const mascotaResponse = await authFetch(`/mascotas/${id}`);
                if (mascotaResponse.success) {
                    setMascota(mascotaResponse.data);

                    // Obtener historial médico de la mascota
                    const historialResponse = await authFetch(`/historial_medico?id_mascota=${id}`);
                    if (historialResponse.success) {
                        setHistorial(historialResponse.data);
                    } else {
                        showNotification(historialResponse.message || 'Error al cargar el historial médico.', 'error');
                        setHistorial([]); // Asegurarse de que el historial esté vacío si falla
                    }
                } else {
                    showNotification(mascotaResponse.message || 'Error al cargar la mascota.', 'error');
                    setError(mascotaResponse.message || 'No se encontró la mascota o no tienes permisos.');
                    setMascota(null);
                }
            } catch (err) {
                console.error("Error fetching mascota details or historial:", err);
                showNotification('Error de conexión al servidor.', 'error');
                setError('Error de conexión al servidor.');
                setMascota(null);
            } finally {
                setIsLoading(false);
            }
        };

        fetchMascotaDetails();
    }, [id, user, showNotification]);

    // La función handleDeleteMascota ya no es necesaria
    /*
    const handleDeleteMascota = async () => {
        setIsDeleting(true);
        try {
            const response = await authFetch(`/mascotas/${id}`, {
                method: 'DELETE',
            });

            if (response.success) {
                showNotification('Mascota eliminada correctamente.', 'success');
                navigate('/usuario/mascotas'); // Redirigir a la lista de mascotas
            } else {
                showNotification(response.message || 'Error al eliminar la mascota.', 'error');
            }
        } catch (err) {
            console.error("Error deleting mascota:", err);
            showNotification('Error de conexión al servidor al eliminar la mascota.', 'error');
        } finally {
            setIsDeleting(false);
            setShowConfirmDelete(false);
        }
    };
    */

    if (isLoading) {
        return (
            <div className={styles.loadingContainer}>
                <FaSpinner className={styles.spinnerIcon} />
                <p>Cargando detalles de la mascota...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.errorMessage}>
                <FaInfoCircle className={styles.infoIcon} />
                <p>{error}</p>
                <button onClick={() => navigate(-1)} className={styles.backButton}>
                    <FaArrowLeft /> Volver
                </button>
            </div>
        );
    }

    // Verificar si el usuario actual es el propietario o un administrador
    const isOwnerOrAdmin = user && (user.id === mascota.id_propietario || user.role === 'admin' || user.role === 'veterinario');

    return (
        <motion.div
            className={styles.detalleMascotaContainer}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
        >
            <h2 className={styles.detalleMascotaTitle}>Detalles de {mascota.nombre}</h2>

            <motion.div
                className={styles.detalleMascotaInfo}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
            >
                <div className={styles.infoItem}>
                    <FaPaw className={styles.infoIcon} />
                    <p><strong>Nombre:</strong> {mascota.nombre}</p>
                </div>
                <div className={styles.infoItem}>
                    {mascota.especie && (mascota.especie.toLowerCase() === 'perro' ? (
                        <FaDog className={styles.infoIcon} />
                    ) : (mascota.especie.toLowerCase() === 'gato' ? (
                        <FaCat className={styles.infoIcon} />
                    ) : (
                        <FaPaw className={styles.infoIcon} /> // Icono genérico si no es perro/gato
                    )))}
                    <p><strong>Especie:</strong> {mascota.especie}</p>
                </div>
                <div className={styles.infoItem}>
                    <FaPaw className={styles.infoIcon} />
                    <p><strong>Raza:</strong> {mascota.raza || 'N/A'}</p>
                </div>
                <div className={styles.infoItem}>
                    <FaCalendarAlt className={styles.infoIcon} />
                    <p><strong>Edad:</strong> {mascota.edad ? `${mascota.edad} años` : 'N/A'}</p>
                </div>
                <div className={styles.infoItem}>
                    <FaWeight className={styles.infoIcon} />
                    <p><strong>Peso:</strong> {mascota.peso ? `${mascota.peso} kg` : 'N/A'}</p>
                </div>
                <div className={styles.infoItem}>
                    <FaPaw className={styles.infoIcon} />
                    <p><strong>Sexo:</strong> {mascota.sexo || 'N/A'}</p>
                </div>
                <div className={styles.infoItem}>
                    <FaPaw className={styles.infoIcon} />
                    <p><strong>Color:</strong> {mascota.color || 'N/A'}</p>
                </div>
                <div className={styles.infoItem}>
                    <FaPaw className={styles.infoIcon} />
                    <p><strong>Microchip:</strong> {mascota.microchip || 'N/A'}</p>
                </div>
                <div className={styles.infoItem}>
                    <FaPaw className={styles.infoIcon} />
                    <p><strong>Propietario:</strong> {mascota.propietario_nombre || 'N/A'}</p>
                </div>
                {mascota.imagen_url && (
                    <div className={styles.imageContainer}>
                        <img src={mascota.imagen_url} alt={`Imagen de ${mascota.nombre}`} className={styles.mascotaImage} />
                    </div>
                )}
            </motion.div>

            <motion.div
                className={styles.detalleMascotaHistorial}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
            >
                <h3>Historial Médico</h3>
                {historial.length > 0 ? (
                    <ul className={styles.historialList}>
                        {historial.map(item => (
                            <li key={item.id_historial} className={styles.historialItem}>
                                <span className={styles.historialDate}>{new Date(item.fecha_consulta).toLocaleDateString('es-ES')}</span> - <span className={styles.historialDiagnosis}>{item.diagnostico}</span>
                                {/* Eliminado: <Link to={`/usuario/historial/${id}/${item.id_historial}`} className={styles.historialDetailLink}>Ver detalle</Link> */}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className={styles.noHistorial}>No hay historial médico registrado para esta mascota.</p>
                )}
                {(user?.role === 'veterinario' || user?.role === 'admin') && ( // Solo veterinarios y admins pueden agregar historial
                    <Link to={`/usuario/historial/${id}/agregar`} className={styles.detalleMascotaButton}>Agregar entrada al historial</Link>
                )}
            </motion.div>

            <div className={styles.detalleMascotaActions}>
                {isOwnerOrAdmin && (
                    <Link to={`/usuario/mascotas/editar/${id}`} className={`${styles.detalleMascotaButton} ${styles.editar}`}>
                        <FaEdit /> Editar Mascota
                    </Link>
                )}
                <button onClick={() => navigate(-1)} className={styles.detalleMascotaBack}>
                    <FaArrowLeft /> Volver a Mis Mascotas
                </button>
            </div>

            {/* Eliminado: Modal de confirmación de eliminación */}
            {/* <AnimatePresence>
                {showConfirmDelete && (
                    <motion.div
                        className={styles.modalOverlay}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowConfirmDelete(false)}
                    >
                        <motion.div
                            className={styles.modalContent}
                            initial={{ y: "-100vh", opacity: 0 }}
                            animate={{ y: "0", opacity: 1 }}
                            exit={{ y: "100vh", opacity: 0 }}
                            transition={{ type: "spring", stiffness: 100, damping: 15 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h3>Confirmar Eliminación</h3>
                            <p>¿Estás seguro de que deseas eliminar a {mascota.nombre}? Esta acción eliminará también todo su historial médico y citas asociadas.</p>
                            <div className={styles.modalActions}>
                                <motion.button
                                    className={styles.submitBtn}
                                    onClick={handleDeleteMascota}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    disabled={isDeleting}
                                >
                                    {isDeleting ? <><FaSpinner className={styles.spinnerIcon} /> Eliminando...</> : 'Sí, Eliminar'}
                                </motion.button>
                                <motion.button
                                    className={styles.cancelBtn}
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
            </AnimatePresence> */}
        </motion.div>
    );
};

export default DetalleMascota;