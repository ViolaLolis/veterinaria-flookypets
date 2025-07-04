// src/Pages/InicioAdministrador/AdminMedicalRecords.js
import React, { useState, useEffect, useCallback } from 'react';
import { FaFileMedical, FaPlus, FaSearch, FaTimes, FaEdit, FaTrash, FaInfoCircle, FaSpinner } from 'react-icons/fa';
import AdminMedicalRecordForm from './AdminMedicalRecordForm'; // Asegúrate de que la ruta sea correcta
import Modal from '../../Components/Modal'; // Asegúrate de que la ruta sea correcta
import Notification from '../../Components/Notification'; // Asegúrate de que la ruta sea correcta
import './Styles/AdminStyles.css';

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

        // Manejo de errores de autenticación/autorización
        if (response.status === 401 || response.status === 403) {
            const errorData = await response.json().catch(() => ({ message: 'Error de autenticación/autorización.' }));
            setError(errorData.message || 'Sesión expirada o no autorizado. Por favor, inicia sesión de nuevo.');
            throw new Error(errorData.message || 'No autorizado');
        }

        // Manejo de errores de respuesta no JSON
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.indexOf("application/json") !== -1) {
            return response; // Si es JSON, retorna la respuesta para que se parsee más adelante
        } else {
            const text = await response.text();
            console.error("Response was not JSON:", text);
            setError(`Error del servidor: Respuesta inesperada. Estado: ${response.status}`);
            throw new Error("Respuesta del servidor no es JSON");
        }
    }, []);

    const fetchMedicalRecords = useCallback(async () => {
        setIsLoading(true);
        setError('');
        try {
            // CAMBIO CORREGIDO: Se eliminó '/api' de la ruta para que coincida con el backend
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
            setError('Error al conectar con el servidor para cargar historiales médicos. ' + err.message);
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
            record.veterinario.toLowerCase().includes(lowercasedFilter) ||
            record.diagnostico.toLowerCase().includes(lowercasedFilter)
        );
        setFilteredRecords(filtered);
    }, [searchTerm, medicalRecords]);

    const handleAddNew = () => {
        setCurrentRecord(null);
        setIsFormOpen(true);
    };

    const handleEdit = (record) => {
        setCurrentRecord(record);
        setIsFormOpen(true);
    };

    const handleDeleteConfirm = (record) => {
        setRecordToDelete(record);
        setShowDeleteConfirm(true);
    };

    const handleDelete = async () => {
        setIsLoading(true); // Bloquear UI durante la eliminación
        setNotification(null);
        try {
            const response = await authFetch(`${API_BASE_URL}/historial_medico/${recordToDelete.id_historial}`, {
                method: 'DELETE',
            });
            const data = await response.json();

            if (data.success) {
                setNotification({ message: data.message, type: 'success' });
                fetchMedicalRecords(); // Recargar la lista
            } else {
                setError(data.message || 'Error al eliminar el historial médico.');
            }
        } catch (err) {
            console.error('Error deleting medical record:', err);
            setError('Error al conectar con el servidor para eliminar el historial médico. ' + err.message);
        } finally {
            setIsLoading(false);
            setShowDeleteConfirm(false);
            setRecordToDelete(null);
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
                        placeholder="Buscar por mascota, propietario, veterinario o diagnóstico..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
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
                                    <td>{record.fecha_consulta}</td>
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
                        'No hay historiales médicos registrados.'}
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
                    <p>¿Estás seguro de que quieres eliminar el historial médico de <strong>{recordToDelete?.mascota}</strong> ({recordToDelete?.propietario}) con fecha <strong>{recordToDelete?.fecha_consulta}</strong>?</p>
                    <div className="form-actions">
                        <button className="btn-delete" onClick={handleDelete} disabled={isLoading}>
                            {isLoading ? <FaSpinner className="spinner" /> : <FaTrash />} Eliminar
                        </button>
                        <button className="btn-secondary" onClick={() => setShowDeleteConfirm(false)} disabled={isLoading}>
                            <FaTimes /> Cancelar
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default AdminMedicalRecords;
