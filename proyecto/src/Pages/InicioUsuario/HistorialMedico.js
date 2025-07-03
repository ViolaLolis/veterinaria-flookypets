import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom'; // Importamos useNavigate
import { motion, AnimatePresence } from 'framer-motion';
import styles from './Styles/HistorialMedico.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faStethoscope, faFileMedicalAlt, faPrint, faDownload, faSearch,
    faChevronDown, faChevronUp, faCalendarAlt, faWeight, faThermometerHalf, // Añadimos iconos para Peso y Temperatura
    faSyringe, faPrescriptionBottleAlt, faNotesMedical, faArrowLeft // Icono para el botón de volver
} from '@fortawesome/free-solid-svg-icons';

// Datos de ejemplo para el historial médico (pueden venir de una API real)
const historialLocal = [
    {
        id_historial: 1,
        fecha_consulta: '2024-06-01',
        diagnostico: 'Gastroenteritis',
        tratamiento: 'Antibióticos y dieta blanda',
        observaciones: 'Recuperación lenta pero estable, se recomienda seguimiento nutricional.',
        peso_actual: 10.5,
        temperatura: 38.5,
        proxima_cita: '2024-06-15',
        veterinario_nombre: 'Dr. David Pérez',
        veterinario_id: 'V001'
    },
    {
        id_historial: 2,
        fecha_consulta: '2024-03-20',
        diagnostico: 'Vacunación anual (Rabia y Polivalente)',
        tratamiento: 'Vacuna antirrábica y vacuna polivalente aplicadas.',
        observaciones: 'Sin reacciones adversas post-vacunación.',
        peso_actual: 10.2,
        temperatura: 38.3,
        proxima_cita: '2025-03-20',
        veterinario_nombre: 'Dra. Ana Gómez',
        veterinario_id: 'V002'
    },
    {
        id_historial: 3,
        fecha_consulta: '2023-11-10',
        diagnostico: 'Revisión general',
        tratamiento: 'Desparasitación interna con pastilla.',
        observaciones: 'Excelente estado de salud general. Pelaje brillante y buen ánimo.',
        peso_actual: 9.8,
        temperatura: 38.2,
        proxima_cita: '', // Sin próxima cita específica
        veterinario_nombre: 'Dr. David Pérez',
        veterinario_id: 'V001'
    },
    {
        id_historial: 4,
        fecha_consulta: '2023-08-05',
        diagnostico: 'Reacción alérgica leve',
        tratamiento: 'Antihistamínicos tópicos por 3 días.',
        observaciones: 'Posible reacción a picadura de insecto. Inflamación de la pata izquierda.',
        peso_actual: 9.9,
        temperatura: 38.6,
        proxima_cita: '',
        veterinario_nombre: 'Dra. Ana Gómez',
        veterinario_id: 'V002'
    }
];

const HistorialMedico = () => {
    const { mascotaId } = useParams(); // Si necesitas el ID de la mascota para filtrar un historial más grande
    const navigate = useNavigate(); // Hook para la navegación
    const [expandedRow, setExpandedRow] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    // Función para formatear fechas
    const formatFecha = (fechaString) => {
        if (!fechaString) return 'N/A';
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(fechaString).toLocaleDateString('es-ES', options);
    };

    const toggleRow = (id) => {
        setExpandedRow(expandedRow === id ? null : id);
    };

    const filteredHistorial = historialLocal.filter(item =>
        item.diagnostico.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.tratamiento.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.observaciones.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.veterinario_nombre && item.veterinario_nombre.toLowerCase().includes(searchTerm.toLowerCase())) ||
        formatFecha(item.fecha_consulta).toLowerCase().includes(searchTerm.toLowerCase()) || // Buscar por fecha formateada
        formatFecha(item.proxima_cita).toLowerCase().includes(searchTerm.toLowerCase()) // Buscar por próxima cita formateada
    );

    // Efecto para desplazar al inicio cuando se carga la página o cambia el filtro
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [searchTerm]);

    return (
        <motion.div
            className={styles.container}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
        >
            <div className={styles.header}>
                <div className={styles.headerContent}>
                    <FontAwesomeIcon icon={faFileMedicalAlt} className={styles.mainIcon} />
                    <h2>Historial Clínico</h2>
                    <p>Registro completo de atenciones médicas de tu mascota</p>
                </div>

                <div className={styles.controls}>
                    <div className={styles.searchContainer}>
                        <FontAwesomeIcon icon={faSearch} className={styles.searchIcon} />
                        <input
                            type="text"
                            placeholder="Buscar por diagnóstico, tratamiento, veterinario..."
                            className={styles.searchInput}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className={styles.actionButtons}>
                        {/* Botón para volver atrás */}
                        <motion.button
                            className={styles.actionButton}
                            onClick={() => navigate(-1)} // Vuelve a la página anterior
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <FontAwesomeIcon icon={faArrowLeft} /> Volver
                        </motion.button>
                        <motion.button
                            className={styles.actionButton}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <FontAwesomeIcon icon={faPrint} /> Imprimir
                        </motion.button>
                        <motion.button
                            className={styles.actionButton}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <FontAwesomeIcon icon={faDownload} /> Exportar
                        </motion.button>
                    </div>
                </div>
            </div>

            {filteredHistorial.length > 0 ? (
                <div className={styles.historialContainer}>
                    <AnimatePresence mode='wait'> {/* Usa mode='wait' para transiciones de salida */}
                        {filteredHistorial.map(item => (
                            <motion.div
                                key={item.id_historial}
                                className={styles.historialCard}
                                initial={{ opacity: 0, y: 20 }} // Más movimiento al entrar
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, height: 0, transition: { duration: 0.2 } }} // Animación al salir
                                transition={{ duration: 0.4 }}
                            >
                                <div
                                    className={styles.cardHeader}
                                    onClick={() => toggleRow(item.id_historial)}
                                >
                                    <div className={styles.cardDate}>
                                        <FontAwesomeIcon icon={faCalendarAlt} />
                                        <span>{formatFecha(item.fecha_consulta)}</span> {/* Fecha formateada */}
                                    </div>
                                    <h3 className={styles.cardDiagnosis}>
                                        <FontAwesomeIcon icon={faStethoscope} /> {item.diagnostico}
                                    </h3>
                                    <div className={styles.cardVet}>
                                        <span>Atendido por: <strong>{item.veterinario_nombre || 'N/A'}</strong></span>
                                    </div>
                                    <div className={styles.cardToggle}>
                                        <FontAwesomeIcon icon={expandedRow === item.id_historial ? faChevronUp : faChevronDown} />
                                    </div>
                                </div>

                                <AnimatePresence>
                                    {expandedRow === item.id_historial && (
                                        <motion.div
                                            className={styles.cardContent}
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            <div className={styles.detailRow}>
                                                <h4><FontAwesomeIcon icon={faPrescriptionBottleAlt} /> Tratamiento:</h4>
                                                <p>{item.tratamiento}</p>
                                            </div>
                                            {item.observaciones && (
                                                <div className={styles.detailRow}>
                                                    <h4><FontAwesomeIcon icon={faNotesMedical} /> Observaciones:</h4>
                                                    <p>{item.observaciones}</p>
                                                </div>
                                            )}
                                            {item.peso_actual && (
                                                <div className={styles.detailRow}>
                                                    <h4><FontAwesomeIcon icon={faWeight} /> Peso Actual:</h4>
                                                    <p>{item.peso_actual} kg</p>
                                                </div>
                                            )}
                                            {item.temperatura && (
                                                <div className={styles.detailRow}>
                                                    <h4><FontAwesomeIcon icon={faThermometerHalf} /> Temperatura:</h4>
                                                    <p>{item.temperatura} °C</p>
                                                </div>
                                            )}
                                            {item.proxima_cita && (
                                                <div className={styles.detailRow}>
                                                    <h4><FontAwesomeIcon icon={faCalendarAlt} /> Próxima Cita:</h4>
                                                    <p>{formatFecha(item.proxima_cita)}</p> {/* Fecha formateada */}
                                                </div>
                                            )}
                                            <div className={styles.cardActions}>
                                                <Link to={`/usuario/historial/${mascotaId}/${item.id_historial}`} className={styles.smallActionButton}>
                                                    Ver Detalles
                                                </Link>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            ) : (
                <motion.div
                    className={styles.noHistorial}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    <FontAwesomeIcon icon={faStethoscope} className={styles.noHistorialIcon} />
                    <h3>No se encontraron registros médicos</h3>
                    <p>{searchTerm ? 'Intenta con otro término de búsqueda' : 'Esta mascota no tiene historial médico registrado.'}</p>
                </motion.div>
            )}
        </motion.div>
    );
};

export default HistorialMedico;