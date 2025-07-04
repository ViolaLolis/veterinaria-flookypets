import React, { useState, useEffect, useCallback } from 'react';
import { FaFileMedical, FaPlus, FaSearch, FaTimes, FaEdit, FaTrash, FaInfoCircle, FaSpinner } from 'react-icons/fa';
import AdminMedicalRecordForm from './AdminMedicalRecordForm'; // Asegúrate de que la ruta sea correcta
import Modal from '../../Components/Modal'; // Asegúrate de que la ruta sea correcta
import Notification from '../../Components/Notification'; // Asegúrate de que la ruta sea correcta
import './Styles/AdminMedicalrecords.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const AdminMedicalRecords = ({ user }) => {
    const [medicalRecords, setMedicalRecords] = useState([]);
    const [filteredRecords, setFilteredRecords] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(''); // Estado para errores de carga o eliminación
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [currentRecord, setCurrentRecord] = useState(null);
    const [notification, setNotification] = useState(null); // Estado para notificaciones de éxito/info
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [recordToDelete, setRecordToDelete] = useState(null);

    const getAuthToken = () => {
        return localStorage.getItem('token');
    };

    const authFetch = useCallback(async (url, options = {}) => {
        const token = getAuthToken();
        if (!token) {
            setError('No se encontró token de autenticación. Por favor, inicia sesión de nuevo.');
            throw new Error('No se encontró token de autenticación');
        }

        const defaultHeaders = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };

        const response = await fetch(url, {
            ...options,
            headers: {
                ...defaultHeaders,
                ...options.headers,
            },
        });

        if (response.status === 401 || response.status === 403) {
            // Limpiar token si la sesión ha expirado y redirigir
            localStorage.removeItem('token');
            setError('Sesión expirada o no autorizado. Por favor, inicia sesión de nuevo.');
            // Opcional: Redirigir a la página de login
            // window.location.href = '/login'; 
            throw new Error('No autorizado');
        }

        // Mejora: Capturar mensajes de error específicos del backend para otros códigos de estado no exitosos
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `Error del servidor: ${response.status}`);
        }

        return response;
    }, []);

    const fetchMedicalRecords = useCallback(async () => {
        setIsLoading(true);
        setError(''); // Limpiar errores anteriores de carga
        setNotification(null); // Limpiar notificaciones anteriores
        try {
            const response = await authFetch(`${API_BASE_URL}/admin/historiales`);
            const data = await response.json();
            if (data.success) {
                setMedicalRecords(data.data);
                setFilteredRecords(data.data); // Asegurar que los filtrados se actualicen con los nuevos datos
            } else {
                setError(data.message || 'Error al cargar historiales médicos.');
            }
        } catch (err) {
            console.error('Error fetching medical records:', err);
            // El error ya se setea en authFetch, pero si hay un error de red, lo capturamos aquí
            setError(prev => prev || `Error al conectar con el servidor: ${err.message || 'Verifica tu conexión.'}`);
        } finally {
            setIsLoading(false);
        }
    }, [authFetch]);

    useEffect(() => {
        fetchMedicalRecords();
    }, [fetchMedicalRecords]);

    useEffect(() => {
        const lowercasedFilter = searchTerm.toLowerCase();
        const filtered = medicalRecords.filter(record =>
            record.mascota.toLowerCase().includes(lowercasedFilter) ||
            record.propietario.toLowerCase().includes(lowercasedFilter) ||
            (record.veterinario && record.veterinario.toLowerCase().includes(lowercasedFilter)) || // Asegurarse que veterinario exista
            record.diagnostico.toLowerCase().includes(lowercasedFilter) ||
            record.id_historial.toString().includes(lowercasedFilter) // Permite buscar por ID
        );
        setFilteredRecords(filtered);
    }, [searchTerm, medicalRecords]);

    const handleAddNew = () => {
        setCurrentRecord(null);
        setIsFormOpen(true);
        setError(''); // Limpiar errores al abrir el formulario
        setNotification(null); // Limpiar notificaciones al abrir el formulario
    };

    const handleEdit = (record) => {
        setCurrentRecord(record);
        setIsFormOpen(true);
        setError(''); // Limpiar errores al abrir el formulario
        setNotification(null); // Limpiar notificaciones al abrir el formulario
    };

    const handleDeleteConfirm = (record) => {
        setRecordToDelete(record);
        setShowDeleteConfirm(true);
        setError(''); // Limpiar errores al abrir la confirmación
        setNotification(null); // Limpiar notificaciones al abrir la confirmación
    };

    const handleDelete = async () => {
        setIsLoading(true); // Bloquear UI durante la eliminación
        setNotification(null); // Limpiar notificaciones anteriores
        setError(''); // Limpiar errores anteriores
        try {
            const response = await authFetch(`${API_BASE_URL}/historial_medico/${recordToDelete.id_historial}`, {
                method: 'DELETE',
            });
            const data = await response.json();

            if (data.success) {
                setNotification({ message: data.message, type: 'success' });
                fetchMedicalRecords(); // Recargar la lista
            } else {
                setError(data.message || 'Error al eliminar el historial médico. Intenta de nuevo.');
            }
        } catch (err) {
            console.error('Error deleting medical record:', err);
            setError(prev => prev || `Error al conectar con el servidor: ${err.message || 'Verifica tu conexión.'}`);
        } finally {
            setIsLoading(false);
            setShowDeleteConfirm(false);
            setRecordToDelete(null);
        }
    };

    // Función para formatear la fecha
    const formatDateTime = (isoString) => {
        if (!isoString) return 'N/A';
        try {
            const date = new Date(isoString);
            // Ajustar para la zona horaria de Bogotá (GMT-5)
            const options = { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'America/Bogota' };
            return date.toLocaleString('es-CO', options);
        } catch (e) {
            console.error("Error formatting date:", e);
            return isoString; // Retorna el string original si falla el formato
        }
    };

    return (
        <div className="admin-container">
            <h1 className="admin-title"><FaFileMedical /> Gestión de Historiales Médicos</h1>

            {notification && (
                <Notification
                    message={notification.message}
                    type={notification.type}
                    onClose={() => setNotification(null)}
                />
            )}
            {error && <div className="error-message">{error}</div>}

            <div className="admin-actions">
                <div className="search-bar">
                    <FaSearch className="search-icon" />
                    <input
                        type="text"
                        placeholder="Buscar por mascota, propietario, veterinario, diagnóstico o ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                        disabled={isLoading} // Deshabilitar búsqueda mientras se carga
                    />
                    {searchTerm && (
                        <FaTimes className="clear-search" onClick={() => setSearchTerm('')} />
                    )}
                </div>
                <button className="add-btn" onClick={handleAddNew} disabled={isLoading}>
                    <FaPlus /> Registrar Nuevo Historial
                </button>
            </div>

            {isLoading ? (
                <div className="loading-indicator">
                    <FaSpinner className="spinner" /> Cargando historiales médicos...
                </div>
            ) : filteredRecords.length > 0 ? (
                <div className="table-responsive">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>ID Historial</th>
                                <th>Fecha Consulta</th>
                                <th>Mascota</th>
                                <th>Propietario</th>
                                <th>Veterinario</th>
                                <th>Diagnóstico</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredRecords.map((record) => (
                                <tr key={record.id_historial}>
                                    <td>{record.id_historial}</td>
                                    <td>{formatDateTime(record.fecha_consulta)}</td> {/* Formatear fecha */}
                                    <td>{record.mascota} ({record.especie})</td>
                                    <td>{record.propietario}</td>
                                    <td>{record.veterinario || 'N/A'}</td>
                                    <td>{record.diagnostico}</td>
                                    <td className="actions-column">
                                        <button
                                            onClick={() => handleEdit(record)}
                                            className="btn-edit"
                                            disabled={isLoading}
                                            title="Editar Historial"
                                        >
                                            <FaEdit /> Editar
                                        </button>
                                        <button
                                            onClick={() => handleDeleteConfirm(record)}
                                            className="btn-delete"
                                            disabled={isLoading}
                                            title="Eliminar Historial"
                                        >
                                            <FaTrash /> Eliminar
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="no-results">
                    <FaInfoCircle className="info-icon" />
                    {searchTerm ?
                        'No se encontraron historiales médicos que coincidan con la búsqueda.' :
                        'No hay historiales médicos registrados. ¡Comienza agregando uno nuevo!'}
                    <button
                        className="add-btn"
                        onClick={handleAddNew}
                        disabled={isLoading}
                    >
                        <FaPlus /> Registrar Nuevo Historial
                    </button>
                </div>
            )}

            <AdminMedicalRecordForm
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                record={currentRecord}
                onSaveSuccess={() => {
                    fetchMedicalRecords();
                    setCurrentRecord(null); // Limpiar el estado de edición
                }}
            />

            <Modal isOpen={showDeleteConfirm} onClose={() => setShowDeleteConfirm(false)} title="Confirmar Eliminación">
                <div className="modal-content-delete">
                    <p>¿Estás seguro de que quieres eliminar el historial médico de <strong>{recordToDelete?.mascota}</strong> ({recordToDelete?.propietario}) con fecha <strong>{formatDateTime(recordToDelete?.fecha_consulta)}</strong>?</p>
                    <div className="form-actions">
                        <button className="btn-delete" onClick={handleDelete} disabled={isLoading}>
                            {isLoading ? <FaSpinner className="spinner" /> : <FaTrash />} Eliminar
                        </button>
                        <button className="btn-secondary" onClick={() => setShowDeleteConfirm(false)} disabled={isLoading}> {/* Deshabilitar durante carga */}
                            <FaTimes /> Cancelar
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default AdminMedicalRecords;