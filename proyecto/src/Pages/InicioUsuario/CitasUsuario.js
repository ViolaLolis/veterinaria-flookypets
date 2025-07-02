import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './Styles/CitasUsuario.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faCalendarAlt, faShoppingCart, faPaw, faUserCog, faClipboardList,
    faChevronDown, faChevronUp, faTimesCircle // Added faTimesCircle for cancel
} from '@fortawesome/free-solid-svg-icons';
import { FaSpinner } from 'react-icons/fa';
import { toast } from 'react-toastify'; // Import toast for user feedback

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
    const [userAppointments, setUserAppointments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isManagingAppointment, setIsManagingAppointment] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [appointmentToManage, setAppointmentToManage] = useState(null);

    // Datos de citas de ejemplo. He extendido el 'detalle' de la cita 3
    // para que supere el maxLength y puedas ver el botón "Leer más".
    const localAppointments = [
        {
            id_cita: '1',
            fecha: '2025-07-10 10:00:00',
            servicio_nombre: 'Consulta General',
            mascota_nombre: 'Firulais',
            mascota_especie: 'Perro',
            veterinario_nombre: 'Dr. López',
            estado: 'pendiente',
            detalle: 'No hay observaciones adicionales para esta cita en particular.'
        },
        {
            id_cita: '2',
            fecha: '2025-07-15 14:00:00',
            servicio_nombre: 'Vacunación',
            mascota_nombre: 'Mishi',
            mascota_especie: 'Gato',
            veterinario_nombre: 'Dra. García',
            estado: 'aceptada',
            detalle: 'Cita programada para la tercera dosis de la vacuna antirrábica. Se recomienda que la mascota esté en ayunas 8 horas antes.'
        },
        {
            id_cita: '3',
            fecha: '2025-07-05 09:00:00',
            servicio_nombre: 'Urgencia',
            mascota_nombre: 'Rocky',
            mascota_especie: 'Perro',
            veterinario_nombre: 'Dr. Smith',
            estado: 'completa',
            // Este es el texto largo para probar el "Leer más"
            detalle: 'Revisión general y desparasitación completa. Se encontró una pequeña irritación en la pata derecha que fue tratada con pomada antibiótica. Se le recetó un collar isabelino para evitar que se lama la herida y se programó un seguimiento en 5 días. Además, se discutió la dieta.'
        },
         {
            id_cita: '4',
            fecha: '2025-07-20 11:30:00',
            servicio_nombre: 'Chequeo Dental',
            mascota_nombre: 'Pelusa',
            mascota_especie: 'Conejo',
            veterinario_nombre: 'Dra. Pérez',
            estado: 'cancelada',
            detalle: 'Cita cancelada por parte del usuario. Se dejó nota para reprogramar si es necesario en el futuro.'
        }
    ];

    useEffect(() => {
        // Simular carga de datos
        setTimeout(() => {
            setUserAppointments(localAppointments);
            setIsLoading(false);
        }, 1000);
    }, []);

    const openConfirmModal = (appointment) => {
        setAppointmentToManage(appointment);
        setShowConfirmModal(true);
    };

    const closeModal = () => {
        setShowConfirmModal(false);
        setAppointmentToManage(null);
    };

    const handleAppointmentAction = () => {
        if (!appointmentToManage) return;

        setIsManagingAppointment(true);
        // Simular llamada a API para cancelar
        setTimeout(() => {
            setUserAppointments(prev =>
                prev.map(cita =>
                    cita.id_cita === appointmentToManage.id_cita
                        ? { ...cita, estado: 'cancelada' } // Actualiza el estado a 'cancelada'
                        : cita
                )
            );
            toast.success(`Cita para ${appointmentToManage.mascota_nombre} ha sido cancelada.`, {
                position: "bottom-right", autoClose: 3000
            });
            setIsManagingAppointment(false);
            closeModal();
        }, 800);
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
                    <AnimatePresence> {/* Add AnimatePresence here for list items */}
                        {userAppointments.map(cita => (
                            <motion.li
                                key={cita.id_cita}
                                className={styles.citaItem}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, x: -50 }} // Animation for when item is removed (e.g., cancelled)
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
                                    {/* Aquí es donde pasas el detalle a tu componente ReadMoreLessText */}
                                    <ReadMoreLessText text={cita.detalle} maxLength={100} /> {/* Ajustado maxLength para el ejemplo */}
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
                        onClick={() => navigate('/usuario/citas/agendar')} // Ejemplo para agendar
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
                            onClick={(e) => e.stopPropagation()} // Evita que el clic dentro del modal cierre el overlay
                        >
                            <h3>¿Cancelar cita?</h3>
                            <p>¿Estás seguro de cancelar la cita para <strong>{appointmentToManage.mascota_nombre}</strong> el <strong>{formatDateTime(appointmentToManage.fecha)}</strong>?</p>
                            <p className={styles.penalizacionWarning}>* Podría implicar penalización o pérdida de cupo.</p>

                            <div className={styles.modalActions}>
                                <motion.button
                                    className={styles.confirmButton} // Clase específica para el botón de confirmar
                                    onClick={handleAppointmentAction}
                                    disabled={isManagingAppointment}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    {isManagingAppointment ? <FaSpinner className={styles.buttonSpinner} /> : 'Sí, cancelar'}
                                </motion.button>
                                <motion.button
                                    className={styles.cancelButton} // Clase específica para el botón de cancelar
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