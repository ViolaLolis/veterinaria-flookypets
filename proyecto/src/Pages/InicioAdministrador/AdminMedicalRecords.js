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
    const [error, setError] = useState('');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [currentRecord, setCurrentRecord] = useState(null);
    const [notification, setNotification] = useState(null);
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
            localStorage.removeItem('token');
            const errorData = await response.json().catch(() => ({ message: 'Error de autenticación/autorización.' }));
            setError(errorData.message || 'Sesión expirada o no autorizado. Por favor, inicia sesión de nuevo.');
            throw new Error(errorData.message || 'No autorizado');
        }

        if (!response.ok) {
            const contentType = response.headers.get("content-type");
            if (contentType && contentType.indexOf("application/json") !== -1) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Error del servidor: ${response.status}`);
            } else {
                const text = await response.text();
                console.error("Response was not JSON:", text);
                setError(`Error del servidor: Respuesta inesperada. Estado: ${response.status}`);
                throw new Error("Respuesta del servidor no es JSON");
            }
        }

        return response;
    }, []);

    const fetchMedicalRecords = useCallback(async () => {
        setIsLoading(true);
        setError('');
        setNotification(null);
        try {
            const response = await authFetch(`${API_BASE_URL}/admin/historiales`);
            const data = await response.json();
            if (data.success) {
                setMedicalRecords(data.data);
                setFilteredRecords(data.data);
            } else {
                setError(data.message || 'Error al cargar historiales médicos.');
            }
        } catch (err) {
            console.error('Error fetching medical records:', err);
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
            (record.veterinario && record.veterinario.toLowerCase().includes(lowercasedFilter)) ||
            record.diagnostico.toLowerCase().includes(lowercasedFilter) ||
            record.id_historial.toString().includes(lowercasedFilter)
        );
        setFilteredRecords(filtered);
    }, [searchTerm, medicalRecords]);

    const handleAddNew = () => {
        setCurrentRecord(null);
        setIsFormOpen(true);
        setError('');
        setNotification(null);
    };

    const handleEdit = (record) => {
        setCurrentRecord(record);
        setIsFormOpen(true);
        setError('');
        setNotification(null);
    };

    const handleDeleteConfirm = (record) => {
        setRecordToDelete(record);
        setShowDeleteConfirm(true);
        setError('');
        setNotification(null);
    };

    const handleDelete = async () => {
        setIsLoading(true);
        setNotification(null);
        setError('');
        try {
            const response = await authFetch(`${API_BASE_URL}/historial_medico/${recordToDelete.id_historial}`, {
                method: 'DELETE',
            });
            const data = await response.json();

            if (data.success) {
                setNotification({ message: data.message, type: 'success' });
                fetchMedicalRecords();
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

    const formatDateTime = (isoString) => {
        if (!isoString) return 'N/A';
        try {
            const date = new Date(isoString);
            const options = { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'America/Bogota' };
            return date.toLocaleString('es-CO', options);
        } catch (e) {
            console.error("Error formatting date:", e);
            return isoString;
        }
    };

    return (
        <div className="admin-container">
            <h1 className="admin-title" style={{ color: "var(--primary-dark)" }}><FaFileMedical /> Gestión de Historiales Médicos</h1>

            {notification && (
                <Notification
                    message={notification.message}
                    type={notification.type}
                    onClose={() => setNotification(null)}
                />
            )}
            {error && <div className="error-message" style={{ backgroundColor: "var(--danger-color)", color: "#fff" }}>{error}</div>}

            <div className="admin-actions">
                <div className="search-bar">
                    <FaSearch className="search-icon" />
                    <input
                        type="text"
                        placeholder="Buscar por mascota, propietario, veterinario, diagnóstico o ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                        disabled={isLoading}
                    />
                    {searchTerm && (
                        <FaTimes className="clear-search" onClick={() => setSearchTerm('')} />
                    )}
                </div>
                <button className="add-btn" onClick={handleAddNew} disabled={isLoading} style={{ backgroundColor: "var(--primary-color)", color: "#fff" }}>
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
                                    <td>{formatDateTime(record.fecha_consulta)}</td>
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
                                            style={{ backgroundColor: "var(--secondary-color)", color: "#fff" }}
                                        >
                                            <FaEdit /> Editar
                                        </button>
                                        <button
                                            onClick={() => handleDeleteConfirm(record)}
                                            className="btn-delete"
                                            disabled={isLoading}
                                            title="Eliminar Historial"
                                            style={{ backgroundColor: "var(--danger-color)", color: "#fff" }}
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
                    <FaInfoCircle className="info-icon" style={{ color: "var(--accent-color)" }} />
                    {searchTerm ?
                        'No se encontraron historiales médicos que coincidan con la búsqueda.' :
                        'No hay historiales médicos registrados. ¡Comienza agregando uno nuevo!'}
                    <button
                        className="add-btn"
                        onClick={handleAddNew}
                        disabled={isLoading}
                        style={{ backgroundColor: "var(--primary-color)", color: "#fff" }}
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
                    setCurrentRecord(null);
                }}
            />

            <Modal isOpen={showDeleteConfirm} onClose={() => setShowDeleteConfirm(false)} title="Confirmar Eliminación">
                <div className="modal-content-delete">
                    <p>¿Estás seguro de que quieres eliminar el historial médico de <strong>{recordToDelete?.mascota}</strong> ({recordToDelete?.propietario}) con fecha <strong>{formatDateTime(recordToDelete?.fecha_consulta)}</strong>?</p>
                    <div className="form-actions">
                        <button className="btn-delete" onClick={handleDelete} disabled={isLoading} style={{ backgroundColor: "var(--danger-dark)", color: "#fff" }}>
                            {isLoading ? <FaSpinner className="spinner" /> : <FaTrash />} Eliminar
                        </button>
                        <button className="btn-secondary" onClick={() => setShowDeleteConfirm(false)} disabled={isLoading} style={{ backgroundColor: "var(--secondary-dark)", color: "#fff" }}>
                            <FaTimes /> Cancelar
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default AdminMedicalRecords;