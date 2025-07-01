import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    FaNotesMedical, FaSearch, FaPaw, FaUserMd, FaCalendarAlt,
    FaSpinner, FaInfoCircle, FaEye, FaTimes, FaTag, FaFileMedical,
    FaUser, FaClock, FaWeightHanging, FaThermometerHalf, FaCalendarCheck // Added new icons for details modal
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion'; // Import for modal animations
import { authFetch } from './api'; // Asegúrate de que la ruta sea correcta a tu api.js
import './Styles/AdminStyles.css'; // Asegúrate de que este CSS exista

function AdminMedicalRecords({ user }) { // Asegúrate de que `user` se pasa como prop
    const [records, setRecords] = useState([]);
    const [filteredRecords, setFilteredRecords] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate(); // Inicializa useNavigate

    // Estados para el modal de detalles del historial médico
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedRecordDetails, setSelectedRecordDetails] = useState(null);
    const [isDetailLoading, setIsDetailLoading] = useState(false);
    const [detailError, setDetailError] = useState('');

    /**
     * Muestra una notificación temporal en la UI.
     * @param {string} message - El mensaje a mostrar.
     * @param {string} type - El tipo de notificación ('success' o 'error').
     */
    const showNotification = useCallback((message, type = 'success') => {
        // En un entorno de producción, aquí integrarías un sistema de notificaciones (ej. Toastify)
        console.log(`Notificación (${type}): ${message}`);
    }, []);

    /**
     * Carga la lista de historiales médicos desde la API.
     * Maneja los estados de carga y error.
     */
    const fetchRecords = useCallback(async () => {
        setIsLoading(true);
        setError('');
        try {
            // Realiza la petición para obtener historiales médicos desde el backend
            const responseData = await authFetch('/admin/historiales'); // Endpoint definido en server.js

            if (responseData.success && Array.isArray(responseData.data)) {
                setRecords(responseData.data);
                setFilteredRecords(responseData.data);
            } else {
                setError(responseData.message || 'Formato de datos de historiales médicos incorrecto.');
                showNotification(responseData.message || 'Error al cargar historiales médicos: Formato incorrecto.', 'error');
            }
        } catch (err) {
            setError(`Error al cargar historiales médicos: ${err.message}`);
            console.error('Error fetching medical records:', err);
        } finally {
            setIsLoading(false);
        }
    }, [showNotification, setError, setIsLoading]); // authFetch is stable, no need to include

    // useEffect para cargar los historiales médicos cuando el componente se monta
    useEffect(() => {
        if (user && user.token) { // Solo cargar si el usuario está autenticado
            fetchRecords();
        } else {
            setIsLoading(false);
            setError('No autorizado. Por favor, inicie sesión.');
            showNotification('No autorizado para ver historiales médicos.', 'error');
        }
    }, [fetchRecords, user, showNotification]);

    // useEffect para filtrar los historiales médicos cada vez que cambia el término de búsqueda o la lista de historiales
    useEffect(() => {
        const results = records.filter(record =>
            record.mascota.toLowerCase().includes(searchTerm.toLowerCase()) ||
            record.propietario.toLowerCase().includes(searchTerm.toLowerCase()) ||
            record.diagnostico.toLowerCase().includes(searchTerm.toLowerCase()) ||
            record.tratamiento.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (record.veterinario && record.veterinario.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (record.fecha_consulta && new Date(record.fecha_consulta).toLocaleDateString().toLowerCase().includes(searchTerm.toLowerCase()))
        );
        setFilteredRecords(results);
    }, [searchTerm, records]);

    /**
     * Maneja el clic en el botón "Ver Detalles" para mostrar la información detallada del historial médico en un modal.
     * @param {number} idHistorial - El ID del historial médico a visualizar.
     */
    const handleViewDetails = useCallback(async (idHistorial) => {
        setIsDetailLoading(true);
        setDetailError('');
        setSelectedRecordDetails(null); // Limpiar detalles previos

        try {
            // Llama a la API para obtener los detalles específicos del historial médico
            const responseData = await authFetch(`/historial_medico/${idHistorial}`);

            if (responseData.success && responseData.data) {
                setSelectedRecordDetails(responseData.data);
                setShowDetailModal(true); // Abre el modal
            } else {
                setDetailError(responseData.message || 'Error al obtener detalles del historial médico.');
                showNotification(responseData.message || 'Error al cargar detalles.', 'error');
            }
        } catch (err) {
            setDetailError(`Error al cargar detalles: ${err.message}`);
            console.error('Error fetching medical record details:', err);
        } finally {
            setIsDetailLoading(false);
        }
    }, [showNotification]); // authFetch is stable, no need to include

    /**
     * Cierra el modal de detalles del historial médico y limpia los estados relacionados.
     */
    const handleCloseDetailModal = useCallback(() => {
        setShowDetailModal(false);
        setSelectedRecordDetails(null);
        setDetailError('');
        setIsDetailLoading(false);
    }, []);


    if (isLoading) {
        return (
            <div className="loading-container">
                <FaSpinner className="spinner-icon" />
                <p>Cargando historiales médicos...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="error-message">
                <FaInfoCircle className="icon" /> {error}
            </div>
        );
    }

    return (
        <div className="admin-content-container">
            <div className="admin-content-header">
                <h2>
                    <FaNotesMedical className="header-icon" />
                    Historiales Médicos
                </h2>
                <div className="header-actions">
                    <div className="search-box">
                        <FaSearch className="search-icon" />
                        <input
                            type="text"
                            placeholder="Buscar historiales..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <div className="admin-table-container">
                {filteredRecords.length > 0 ? (
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>ID Historial</th>
                                <th>Fecha</th>
                                <th>Mascota</th>
                                <th>Dueño</th>
                                <th>Veterinario</th>
                                <th>Diagnóstico</th>
                                <th>Tratamiento</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredRecords.map(record => (
                                <tr key={record.id_historial}>
                                    <td>{record.id_historial}</td>
                                    <td>
                                        <FaCalendarAlt className="icon" /> {new Date(record.fecha_consulta).toLocaleDateString()}
                                    </td>
                                    <td>
                                        <FaPaw className="icon" /> {record.mascota} ({record.especie})
                                    </td>
                                    <td>{record.propietario}</td>
                                    <td>
                                        <FaUserMd className="icon" /> {record.veterinario || 'N/A'}
                                    </td>
                                    <td>{record.diagnostico}</td>
                                    <td>{record.tratamiento}</td>
                                    <td className="actions-cell">
                                        <button
                                            className="btn-details" // Usando la clase btn-details para un estilo consistente
                                            onClick={() => handleViewDetails(record.id_historial)} // Pasar el ID del historial
                                        >
                                            <FaEye /> Ver Detalles
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <div className="no-results">
                        <FaInfoCircle className="info-icon" />
                        {searchTerm ?
                            'No se encontraron historiales médicos que coincidan con la búsqueda.' :
                            'No hay historiales médicos registrados.'}
                    </div>
                )}
            </div>

            {/* Medical Record Detail Modal */}
            <AnimatePresence>
                {showDetailModal && (
                    <motion.div
                        key="medical-record-detail-modal"
                        className="modal-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.div
                            className="modal-content modal-detail-content" // Añadida clase para estilos específicos de detalle
                            initial={{ y: "-100vh", opacity: 0 }}
                            animate={{ y: "0", opacity: 1 }}
                            exit={{ y: "100vh", opacity: 0 }}
                            transition={{ type: "spring", stiffness: 120, damping: 20 }}
                        >
                            <button className="close-modal-btn" onClick={handleCloseDetailModal}>
                                <FaTimes />
                            </button>
                            <div className="modal-header">
                                <h3>
                                    <FaFileMedical className="form-icon" />
                                    Detalles del Historial Médico
                                </h3>
                            </div>

                            {isDetailLoading ? (
                                <div className="loading-container">
                                    <FaSpinner className="spinner-icon" />
                                    <p>Cargando detalles...</p>
                                </div>
                            ) : detailError ? (
                                <div className="error-message">
                                    <FaInfoCircle className="icon" /> {detailError}
                                </div>
                            ) : selectedRecordDetails ? (
                                <div className="detail-grid">
                                    <div className="detail-item">
                                        <strong><FaTag /> ID Historial:</strong> {selectedRecordDetails.id_historial}
                                    </div>
                                    <div className="detail-item">
                                        <strong><FaCalendarAlt /> Fecha Consulta:</strong> {new Date(selectedRecordDetails.fecha_consulta).toLocaleDateString()}
                                    </div>
                                    <div className="detail-item">
                                        <strong><FaPaw /> Mascota:</strong> {selectedRecordDetails.mascota_nombre} ({selectedRecordDetails.especie}, {selectedRecordDetails.raza})
                                    </div>
                                    <div className="detail-item">
                                        <strong><FaUser /> Propietario:</strong> {selectedRecordDetails.propietario_nombre}
                                    </div>
                                    <div className="detail-item">
                                        <strong><FaUserMd /> Veterinario:</strong> {selectedRecordDetails.veterinario_nombre || 'N/A'}
                                    </div>
                                    <div className="detail-item full-width">
                                        <strong><FaNotesMedical /> Diagnóstico:</strong> {selectedRecordDetails.diagnostico}
                                    </div>
                                    <div className="detail-item full-width">
                                        <strong><FaNotesMedical /> Tratamiento:</strong> {selectedRecordDetails.tratamiento}
                                    </div>
                                    <div className="detail-item full-width">
                                        <strong><FaInfoCircle /> Observaciones:</strong> {selectedRecordDetails.observaciones || 'Ninguna'}
                                    </div>
                                    <div className="detail-item">
                                        <strong><FaWeightHanging /> Peso Actual:</strong> {selectedRecordDetails.peso_actual ? `${selectedRecordDetails.peso_actual} kg` : 'N/A'}
                                    </div>
                                    <div className="detail-item">
                                        <strong><FaThermometerHalf /> Temperatura:</strong> {selectedRecordDetails.temperatura ? `${selectedRecordDetails.temperatura} °C` : 'N/A'}
                                    </div>
                                    <div className="detail-item">
                                        <strong><FaCalendarCheck /> Próxima Cita:</strong> {selectedRecordDetails.proxima_cita ? new Date(selectedRecordDetails.proxima_cita).toLocaleDateString() : 'No programada'}
                                    </div>
                                </div>
                            ) : (
                                <p>No se pudieron cargar los detalles del historial médico.</p>
                            )}
                            <div className="modal-footer">
                                <button className="cancel-btn" onClick={handleCloseDetailModal}>Cerrar</button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default AdminMedicalRecords;
