import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useOutletContext } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FaSpinner, FaInfoCircle, FaPlusCircle, FaArrowLeft,
    FaFileMedical, FaCalendarAlt
} from 'react-icons/fa';
import './Styles/HistorialMedico.css'; // Asegúrate que el nombre del archivo sea .css, no .module.css
import { authFetch } from '../../utils/api'; // Importar la función authFetch

const HistorialMedico = () => {
    const { mascotaId } = useParams();
    const navigate = useNavigate();
    const { user, showNotification } = useOutletContext();

    const [mascota, setMascota] = useState(null);
    const [historial, setHistorial] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [initialLoadComplete, setInitialLoadComplete] = useState(false); // Nuevo estado

    useEffect(() => {
        const fetchHistorialAndMascota = async () => {
            setIsLoading(true);
            setError(null);

            if (!user?.id) {
                showNotification('No se pudo cargar la información del usuario. Por favor, inicia sesión.', 'error');
                setIsLoading(false);
                setInitialLoadComplete(true); // Marcar como completo para mostrar el mensaje de error o no autorizado
                return;
            }

            try {
                // 1. Obtener detalles de la mascota
                const mascotaResponse = await authFetch(`/mascotas/${mascotaId}`);
                if (mascotaResponse.success) {
                    setMascota(mascotaResponse.data);
                } else {
                    showNotification(mascotaResponse.message || 'Error al cargar la mascota.', 'error');
                    setError(mascotaResponse.message || 'No se encontró la mascota o no tienes permisos.');
                    setIsLoading(false);
                    setInitialLoadComplete(true); // Marcar como completo en caso de error
                    return;
                }

                // 2. Obtener historial médico de la mascota
                const historialResponse = await authFetch(`/historial_medico?id_mascota=${mascotaId}`);
                if (historialResponse.success) {
                    setHistorial(historialResponse.data);
                } else {
                    showNotification(historialResponse.message || 'Error al cargar el historial médico.', 'error');
                    setHistorial([]);
                }
            } catch (err) {
                console.error("Error fetching mascota details or historial:", err);
                showNotification('Error de conexión al servidor.', 'error');
                setError('Error de conexión al servidor.');
            } finally {
                setIsLoading(false);
                // Marcar que la carga inicial ha terminado una vez que los datos están disponibles
                // o si ha ocurrido un error que ya ha sido manejado.
                setInitialLoadComplete(true);
            }
        };

        fetchHistorialAndMascota();
    }, [mascotaId, user, showNotification]);

    // Renderizado condicional basado en el estado de carga y error
    if (isLoading && !initialLoadComplete) { // Muestra el spinner solo si es la carga inicial y no ha terminado
        return (
            <div className="loading-container">
                <FaSpinner className="spinner-icon" />
                <p>Cargando historial médico...</p>
            </div>
        );
    }

    if (error) { // Muestra el mensaje de error si hay un error
        return (
            <div className="error-message">
                <FaInfoCircle className="info-icon" />
                <p>{error}</p>
                {/* Botón "Volver" en caso de error */}
                <button onClick={() => navigate('/usuario/mascotas')} className="back-button">
                    <FaArrowLeft /> Volver a Mis Mascotas
                </button>
            </div>
        );
    }

    if (!mascota) { // Si no hay mascota (ej. ID inválido después de la carga inicial)
        return (
            <div className="no-data-message">
                <FaInfoCircle className="info-icon" />
                <p>No se encontró la mascota.</p>
                <Link to="/usuario/mascotas" className="back-button">
                    <FaArrowLeft /> Volver a Mis Mascotas
                </Link>
            </div>
        );
    }

    const canAddHistorial = user && (user.role === 'veterinario' || user.role === 'admin');

    return (
        <motion.div
            className="historial-container"
            // animate={{ opacity: 1 }} // Puedes dejar animate si quieres que siempre se re-anime al volver a este componente.
            // transition={{ duration: 0.3 }}
        >
            <div className="historial-header">
                <FaFileMedical className="historial-icon" />
                <h2>Historial Médico de {mascota.nombre}</h2>
                {/* MODIFICACIÓN AQUÍ: Cambiado navigate(-1) a navigate('/usuario/mascotas') */}
                <button onClick={() => navigate('/usuario/mascotas')} className="back-button">
                    <FaArrowLeft /> Volver a Mis Mascotas
                </button>
            </div>

            <div className="mascota-info-card">
                <h3>Información de la Mascota</h3>
                <p><strong>Nombre:</strong> {mascota.nombre}</p>
                <p><strong>Especie:</strong> {mascota.especie}</p>
                <p><strong>Raza:</strong> {mascota.raza || 'N/A'}</p>
                <p><strong>Edad:</strong> {mascota.edad ? `${mascota.edad} años` : 'N/A'}</p>
            </div>

            <div className="historial-list-section">
                <h3>Registros Médicos</h3>
                {canAddHistorial && (
                    <Link to={`/usuario/historial/${mascotaId}/agregar`} className="add-historial-button">
                        <FaPlusCircle /> Añadir Nuevo Registro
                    </Link>
                )}
                {historial.length > 0 ? (
                    <ul className="historial-list">
                        <AnimatePresence>
                            {historial.map(item => (
                                <motion.li
                                    key={item.id_historial}
                                    className="historial-item"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, x: -50 }}
                                    whileHover={{ scale: 1.02 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <div className="item-header">
                                        <FaCalendarAlt className="item-icon" />
                                        <span className="item-date">{new Date(item.fecha_consulta).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                                        <span className="item-veterinario">Dr. {item.veterinario_nombre || 'N/A'}</span>
                                    </div>
                                    <div className="item-body">
                                        <p><strong>Diagnóstico:</strong> {item.diagnostico}</p>
                                        <p><strong>Tratamiento:</strong> {item.tratamiento}</p>
                                        {item.peso_actual && <p><strong>Peso:</strong> {item.peso_actual} kg</p>}
                                        {item.temperatura && <p><strong>Temperatura:</strong> {item.temperatura} °C</p>}
                                        {item.observaciones && <p><strong>Observaciones:</strong> {item.observaciones}</p>}
                                        {item.proxima_cita && <p><strong>Próxima Cita:</strong> {new Date(item.proxima_cita).toLocaleDateString('es-ES')}</p>}
                                    </div>
                                    <div className="item-actions">
                                        <Link to={`/usuario/historial/${mascotaId}/${item.id_historial}`} className="view-detail-button">
                                            Ver Detalle
                                        </Link>
                                    </div>
                                </motion.li>
                            ))}
                        </AnimatePresence>
                    </ul>
                ) : (
                    <div className="no-historial-message">
                        <FaInfoCircle />
                        <p>No hay registros médicos para esta mascota.</p>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default HistorialMedico;