import React, { useState, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom'; // Importa useOutletContext
import { motion, AnimatePresence } from 'framer-motion';
import styles from './Styles/CitasUsuario.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faCalendarAlt, faShoppingCart, faPaw, faUserCog, faClipboardList,
    faChevronDown, faChevronUp, faTimesCircle
} from '@fortawesome/free-solid-svg-icons';
import { FaSpinner } from 'react-icons/fa';
import { authFetch } from '../../utils/api'; // Importar la función authFetch

// Componente de leer más / menos
const ReadMoreLessText = ({ text, maxLength = 100 }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    // Si el texto es nulo, indefinido o vacío, no renderiza nada o un placeholder
    if (!text || text.trim() === 'N/A' || text.trim() === '') {
        return <span className={styles.noDetailText}>No hay detalles adicionales.</span>;
    }

    // Si la longitud del texto es menor o igual al máximo, lo muestra completo sin botón
    if (text.length <= maxLength) {
        return <span>{text}</span>;
    }

    // Si es más largo, muestra truncado o completo con el botón
    const displayedText = isExpanded ? text : `${text.substring(0, maxLength)}...`;

    return (
        <div>
            <span>{displayedText}</span>
            <motion.button
                onClick={() => setIsExpanded(!isExpanded)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={styles.readMoreButton}
                aria-expanded={isExpanded} // Para accesibilidad
                aria-controls="cita-detalle-texto" // Si el span tuviera un ID, vincularlo
            >
                {isExpanded ? (
                    <>Leer menos <FontAwesomeIcon icon={faChevronUp} /></>
                ) : (
                    <>Leer más <FontAwesomeIcon icon={faChevronDown} /></>
                )}
            </motion.button>
        </div>
    );
};

const CitasUsuario = () => {
    const navigate = useNavigate();
    const { user, showNotification } = useOutletContext(); // Obtener user y showNotification del contexto
    const [userAppointments, setUserAppointments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isManagingAppointment, setIsManagingAppointment] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [appointmentToManage, setAppointmentToManage] = useState(null);

    // Función para obtener las citas del usuario
    const fetchUserAppointments = async () => {
        setIsLoading(true);
        if (!user?.id) {
            showNotification('No se pudo cargar la información del usuario. Por favor, inicia sesión.', 'error');
            setIsLoading(false);
            return;
        }
        try {
            // Se asume que la API de citas puede filtrar por id_cliente
            const response = await authFetch(`/citas?id_cliente=${user.id}`);
            if (response.success) {
                // Mapear los datos para que coincidan con la estructura esperada por el frontend
                const mappedAppointments = response.data.map(cita => ({
                    id_cita: cita.id_cita,
                    fecha: cita.fecha,
                    servicio_nombre: cita.servicio_nombre, // Asumiendo que el backend retorna el nombre del servicio
                    mascota_nombre: cita.mascota_nombre,   // Asumiendo que el backend retorna el nombre de la mascota
                    mascota_especie: cita.mascota_especie, // Asumiendo que el backend retorna la especie de la mascota
                    veterinario_nombre: cita.veterinario_nombre || 'Sin asignar', // Asumiendo nombre del veterinario
                    estado: cita.estado,
                    detalle: cita.servicios || 'No hay observaciones adicionales para esta cita en particular.'
                }));
                setUserAppointments(mappedAppointments);
            } else {
                showNotification(response.message || 'Error al cargar tus citas.', 'error');
            }
        } catch (err) {
            console.error("Error fetching user appointments:", err);
            showNotification('Error de conexión al servidor al cargar las citas.', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchUserAppointments();
    }, [user]); // Depende del objeto user para recargar cuando esté disponible

    const openConfirmModal = (appointment) => {
        setAppointmentToManage(appointment);
        setShowConfirmModal(true);
    };

    const closeModal = () => {
        setShowConfirmModal(false);
        setAppointmentToManage(null);
    };

    const handleAppointmentAction = async () => {
        if (!appointmentToManage) return;

        setIsManagingAppointment(true);
        try {
            // Llamada a la API para cancelar la cita
            const response = await authFetch(`/citas/${appointmentToManage.id_cita}`, {
                method: 'PUT',
                body: { estado: 'cancelada' } // Actualizar el estado a 'cancelada'
            });

            if (response.success) {
                // Actualizar el estado local de las citas
                setUserAppointments(prev =>
                    prev.map(cita =>
                        cita.id_cita === appointmentToManage.id_cita
                            ? { ...cita, estado: 'cancelada' }
                            : cita
                    )
                );
                showNotification(`Cita para ${appointmentToManage.mascota_nombre} ha sido cancelada.`, 'success');
            } else {
                showNotification(response.message || 'Error al cancelar la cita.', 'error');
            }
        } catch (err) {
            console.error("Error cancelling appointment:", err);
            showNotification('Error de conexión al cancelar la cita.', 'error');
        } finally {
            setIsManagingAppointment(false);
            closeModal();
        }
    };

    const formatDateTime = (dateTimeString) => {
        try {
            const date = new Date(dateTimeString);
            return date.toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch {
            return 'Fecha inválida';
        }
    };

    if (isLoading) {
        return (
            <div className={styles.loadingContainer}>
                <FaSpinner className={styles.spinnerIcon} />
                <p>Cargando tus citas...</p>
            </div>
        );
    }

    return (
        <motion.div className={styles.container} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
            <div className={styles.header}>
                <FontAwesomeIcon icon={faCalendarAlt} className={styles.icon} />
                <h3>Mis Citas</h3>
            </div>

            {userAppointments.length > 0 ? (
                <ul className={styles.listaCitas}>
                    <AnimatePresence>
                        {userAppointments.map(cita => (
                            <motion.li
                                key={cita.id_cita}
                                className={styles.citaItem}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, x: -50 }}
                                whileHover={{ scale: 1.02 }}
                            >
                                <div className={styles.citaInfo}>
                                    <div><FontAwesomeIcon icon={faCalendarAlt} /> {formatDateTime(cita.fecha)}</div>
                                    <div><FontAwesomeIcon icon={faShoppingCart} /> {cita.servicio_nombre}</div>
                                    <div><FontAwesomeIcon icon={faPaw} /> {cita.mascota_nombre} ({cita.mascota_especie})</div>
                                    <div><FontAwesomeIcon icon={faUserCog} /> {cita.veterinario_nombre}</div>
                                    <div className={`${styles.statusBadge} ${styles[cita.estado]}`}>{cita.estado}</div>
                                </div>

                                <div className={styles.citaObservacionContainer}>
                                    <FontAwesomeIcon icon={faClipboardList} className={styles.observacionIcon} />
                                    <strong>Observación:</strong>
                                    <ReadMoreLessText text={cita.detalle} maxLength={100} />
                                </div>

                                <div className={styles.citaActions}>
                                    {(cita.estado === 'pendiente' || cita.estado === 'aceptada') && (
                                        <motion.button
                                            className={styles.accionBtnSecondary}
                                            onClick={() => openConfirmModal(cita)}
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            disabled={isManagingAppointment}
                                        >
                                            <FontAwesomeIcon icon={faTimesCircle} /> Cancelar Cita
                                        </motion.button>
                                    )}
                                </div>
                            </motion.li>
                        ))}
                    </AnimatePresence>
                </ul>
            ) : (
                <div className={styles.noCitas}>
                    <FontAwesomeIcon icon={faCalendarAlt} />
                    <p>No tienes citas programadas.</p>
                    <motion.button
                        className={styles.accionBtnPrimary}
                        onClick={() => navigate('/usuario/servicios')}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        Agendar Nueva Cita
                    </motion.button>
                </div>
            )}

            <AnimatePresence>
                {showConfirmModal && appointmentToManage && (
                    <motion.div
                        className={styles.modalOverlay}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={closeModal}
                    >
                        <motion.div
                            className={styles.modalContent}
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h3>¿Cancelar cita?</h3>
                            <p>¿Estás seguro de cancelar la cita para <strong>{appointmentToManage.mascota_nombre}</strong> el <strong>{formatDateTime(appointmentToManage.fecha)}</strong>?</p>
                            <p className={styles.penalizacionWarning}>* Podría implicar penalización o pérdida de cupo.</p>

                            <div className={styles.modalActions}>
                                <motion.button
                                    className={styles.confirmButton}
                                    onClick={handleAppointmentAction}
                                    disabled={isManagingAppointment}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    {isManagingAppointment ? <FaSpinner className={styles.buttonSpinner} /> : 'Sí, cancelar'}
                                </motion.button>
                                <motion.button
                                    className={styles.cancelButton}
                                    onClick={closeModal}
                                    disabled={isManagingAppointment}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    No, volver
                                </motion.button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default CitasUsuario;
