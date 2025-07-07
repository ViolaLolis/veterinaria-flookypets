// CitasUsuario.js

import React, { useState, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './Styles/CitasUsuario.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faCalendarAlt, faShoppingCart, faPaw, faUser, faClipboardList, faTimesCircle, faPlusCircle,
} from '@fortawesome/free-solid-svg-icons';
import { FaSpinner } from 'react-icons/fa';
import { authFetch } from '../../utils/api';

// El componente ReadMoreLessText ha sido eliminado según tu solicitud.
// Si deseas reintroducirlo, asegúrate de definirlo o importarlo correctamente.

const CitasUsuario = () => {
    const navigate = useNavigate();
    const { user, showNotification } = useOutletContext();
    const [userAppointments, setUserAppointments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isManagingAppointment, setIsManagingAppointment] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [appointmentToManage, setAppointmentToManage] = useState(null);

    const fetchUserAppointments = async () => {
        setIsLoading(true);
        if (!user?.id) {
            showNotification('No se pudo cargar la información del usuario. Por favor, inicia sesión.', 'error');
            setIsLoading(false);
            return;
        }
        try {
            // Asegúrate de que esta URL coincida con la ruta en tu backend
            const response = await authFetch(`/api/citas?id_cliente=${user.id}`);
            if (response.success) {
                const mappedAppointments = response.data.map(cita => ({
                    id_cita: cita.id_cita,
                    // La fecha ya debería venir formateada desde el backend
                    fecha: cita.fecha,
                    servicio_nombre: cita.servicio_nombre || 'Servicio Desconocido',
                    mascota_nombre: cita.mascota_nombre || 'Mascota Desconocida',
                    mascota_especie: cita.mascota_especie || 'N/A',
                    veterinario_nombre: cita.veterinario_nombre || 'Sin asignar',
                    estado: cita.estado,
                    detalle: cita.detalle || 'No hay observaciones adicionales para esta cita en particular.' // Usa 'detalle' que viene del backend
                }));
                // Ordenar las citas: primero pendientes/aceptadas, luego completadas/canceladas, por fecha.
                const sortedAppointments = mappedAppointments.sort((a, b) => {
                    const statusOrder = { 'pendiente': 1, 'aceptada': 2, 'completa': 3, 'cancelada': 4, 'rechazada': 5 };
                    if (statusOrder[a.estado] !== statusOrder[b.estado]) {
                        return statusOrder[a.estado] - statusOrder[b.estado];
                    }
                    // Asegúrate de que las fechas sean objetos Date válidos para la comparación
                    // Al venir del backend en formato ISO, new Date() debería manejarlas bien.
                    return new Date(a.fecha).getTime() - new Date(b.fecha).getTime();
                });
                setUserAppointments(sortedAppointments);
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
    }, [user?.id]);

    const openConfirmModal = (appointment) => {
        setAppointmentToManage(appointment);
        setShowConfirmModal(true);
    };

    const closeModal = () => {
        setShowConfirmModal(false);
        setAppointmentToManage(null);
    };

    const handleCancelAppointment = async () => {
        if (!appointmentToManage) return;

        setIsManagingAppointment(true);
        try {
            const response = await authFetch(`/api/citas/${appointmentToManage.id_cita}`, { // Ruta actualizada para coincidir con tu backend
                method: 'PUT',
                body: JSON.stringify({ estado: 'cancelada' }), // Asegúrate de enviar como JSON string
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.success) {
                setUserAppointments(prev =>
                    prev.map(cita =>
                        cita.id_cita === appointmentToManage.id_cita
                            ? { ...cita, estado: 'cancelada' }
                            : cita
                    ).sort((a, b) => { // Re-ordenar después de la actualización
                        const statusOrder = { 'pendiente': 1, 'aceptada': 2, 'completa': 3, 'cancelada': 4, 'rechazada': 5 };
                        if (statusOrder[a.estado] !== statusOrder[b.estado]) {
                            return statusOrder[a.estado] - statusOrder[b.estado];
                        }
                        // Aquí también, asegúrate de que sean fechas válidas.
                        return new Date(a.fecha).getTime() - new Date(b.fecha).getTime();
                    })
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
        if (!dateTimeString) {
            return 'Fecha no disponible';
        }
        try {
            const date = new Date(dateTimeString);
            if (isNaN(date.getTime())) {
                console.warn("Fecha inválida generada para el string:", dateTimeString);
                return 'Fecha no válida';
            }
            return date.toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (error) {
            console.error("Error al formatear la fecha:", dateTimeString, error);
            return 'Error de formato de fecha';
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

            <div className={styles.actionsTop}>
                <motion.button
                    className={styles.agendarCitaButton}
                    onClick={() => navigate('/usuario/servicios')}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    <FontAwesomeIcon icon={faPlusCircle} /> Agendar Nueva Cita
                </motion.button>
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
                                whileHover={{ scale: 1.01 }}
                                transition={{ duration: 0.2, ease: "easeOut" }}
                            >
                                <div className={styles.citaInfoGrid}>
                                    <div className={styles.infoRow}><FontAwesomeIcon icon={faCalendarAlt} className={styles.infoIcon} /> <span className={styles.infoLabel}>Fecha:</span> {formatDateTime(cita.fecha)}</div>
                                    <div className={styles.infoRow}><FontAwesomeIcon icon={faShoppingCart} className={styles.infoIcon} /> <span className={styles.infoLabel}>Servicio:</span> {cita.servicio_nombre}</div>
                                    <div className={styles.infoRow}><FontAwesomeIcon icon={faPaw} className={styles.infoIcon} /> <span className={styles.infoLabel}>Mascota:</span> {cita.mascota_nombre} ({cita.mascota_especie})</div>
                                    <div className={styles.infoRow}><FontAwesomeIcon icon={faUser} className={styles.infoIcon} /> <span className={styles.infoLabel}>Veterinario:</span> {cita.veterinario_nombre}</div>
                                    <div className={`${styles.statusBadge} ${styles[cita.estado.toLowerCase()]}`}>{cita.estado}</div>
                                </div>

                                <div className={styles.citaDetailSection}>
                                    <div className={styles.citaObservacionContainer}>
                                        <FontAwesomeIcon icon={faClipboardList} className={styles.observacionIcon} />
                                        <strong>Detalles de la Cita:</strong>
                                    </div>
                                    {/* Aquí se reemplaza ReadMoreLessText por un span o p normal */}
                                    <p>{cita.detalle}</p>
                                </div>

                                <div className={styles.citaActions}>
                                    {(cita.estado === 'pendiente' || cita.estado === 'aceptada') && (
                                        <motion.button
                                            className={styles.accionBtnDanger}
                                            onClick={() => openConfirmModal(cita)}
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            disabled={isManagingAppointment}
                                        >
                                            {isManagingAppointment ? <FaSpinner className={styles.buttonSpinner} /> : <><FontAwesomeIcon icon={faTimesCircle} /> Cancelar Cita</>}
                                        </motion.button>
                                    )}
                                </div>
                            </motion.li>
                        ))}
                    </AnimatePresence>
                </ul>
            ) : (
                <motion.div
                    className={styles.noCitas}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <FontAwesomeIcon icon={faCalendarAlt} className={styles.noCitasIcon} />
                    <h4>¡Parece que no tienes citas programadas!</h4>
                    <p>Es un buen momento para agendar una nueva cita para tu mascota.</p>
                    <motion.button
                        className={styles.accionBtnPrimary}
                        onClick={() => navigate('/usuario/servicios')}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <FontAwesomeIcon icon={faPlusCircle} /> Agendar Nueva Cita
                    </motion.button>
                </motion.div>
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
                            <button className={styles.modalCloseButton} onClick={closeModal} aria-label="Cerrar modal">
                                <FontAwesomeIcon icon={faTimesCircle} />
                            </button>
                            <h3>¿Cancelar cita?</h3>
                            <p>Estás a punto de cancelar la cita para <strong>{appointmentToManage.mascota_nombre}</strong> el <strong>{formatDateTime(appointmentToManage.fecha)}</strong>.</p>
                            <p className={styles.penalizacionWarning}>* La cancelación podría implicar una penalización o la pérdida del cupo.</p>

                            <div className={styles.modalActions}>
                                <motion.button
                                    className={styles.modalButtonDanger}
                                    onClick={handleCancelAppointment}
                                    disabled={isManagingAppointment}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    {isManagingAppointment ? <FaSpinner className={styles.buttonSpinner} /> : 'Sí, cancelar'}
                                </motion.button>
                                <motion.button
                                    className={styles.modalButtonSecondary}
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