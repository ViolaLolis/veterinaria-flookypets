// src/Pages/InicioAdministrador/AdminMedicalRecords.js
import React, { useState, useEffect, useCallback } from 'react';
import { FaNotesMedical, FaSearch, FaTrash, FaSpinner, FaInfoCircle, FaEdit, FaPlus, FaTimes } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { authFetch } from '../../utils/api'; // Ruta ajustada
import { validateField } from '../../utils/validation'; // Importa la función de validación
import './Styles/AdminStyles.css'; // Ruta relativa al CSS
import { useNotifications } from '../../Notifications/NotificationContext'; // Ruta ajustada

function AdminMedicalRecords({ user }) {
    const [records, setRecords] = useState([]);
    const [filteredRecords, setFilteredRecords] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const { addNotification } = useNotifications(); // Usa el hook de notificaciones

    const [isModalOpen, setIsModalOpen] = useState(false); // Modal para Añadir/Editar
    const [editingRecord, setEditingRecord] = useState(null); // null o el objeto del historial a editar
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formErrors, setFormErrors] = useState({});

    // Estados para dropdowns en el modal
    const [pets, setPets] = useState([]);
    const [vets, setVets] = useState([]);

    const [formData, setFormData] = useState({
        id_mascota: '',
        fecha_consulta: '',
        veterinario: '',
        diagnostico: '',
        tratamiento: '',
        observaciones: '',
        peso_actual: '',
        temperatura: '',
        proxima_cita: ''
    });

    // Función para cargar datos para dropdowns (mascotas y veterinarios)
    const fetchDropdownData = useCallback(async () => {
        try {
            const [petsRes, vetsRes] = await Promise.all([
                authFetch('/mascotas'), // Endpoint para todas las mascotas
                authFetch('/usuarios/veterinarios') // Endpoint para todos los veterinarios
            ]);

            if (petsRes.success) setPets(petsRes.data);
            else console.error('Error al cargar mascotas para dropdown:', petsRes.message);

            if (vetsRes.success) setVets(vetsRes.data);
            else console.error('Error al cargar veterinarios para dropdown:', vetsRes.message);

        } catch (err) {
            console.error("Error al cargar datos para dropdowns:", err);
            addNotification('error', 'Error al cargar opciones para el formulario de historial médico.', 5000);
        }
    }, [authFetch, addNotification]);


    const fetchMedicalRecords = useCallback(async () => {
        setIsLoading(true);
        setError('');
        try {
            const responseData = await authFetch('/admin/historiales'); // Endpoint para historiales médicos de admin
            if (responseData.success && Array.isArray(responseData.data)) {
                setRecords(responseData.data);
            } else {
                addNotification('error', responseData.message || 'Formato de datos de historiales médicos incorrecto.', 5000);
                setRecords([]);
            }
        } catch (err) {
            setError(`Error al cargar los historiales médicos: ${err.message}`);
            addNotification('error', `Error de conexión: ${err.message}`, 5000);
            console.error('Error fetching medical records:', err);
            setRecords([]);
        } finally {
            setIsLoading(false);
        }
    }, [authFetch, addNotification]);

    useEffect(() => {
        if (user && user.token) {
            fetchMedicalRecords();
            fetchDropdownData(); // Cargar datos para dropdowns
        } else {
            setError('No autorizado. Por favor, inicie sesión.');
            setIsLoading(false);
        }
    }, [user, fetchMedicalRecords, fetchDropdownData]);

    useEffect(() => {
        const results = records.filter(record =>
            record.mascota.toLowerCase().includes(searchTerm.toLowerCase()) ||
            record.propietario.toLowerCase().includes(searchTerm.toLowerCase()) ||
            record.veterinario?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            record.diagnostico.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredRecords(results);
    }, [searchTerm, records]);

    const handleAdd = useCallback(() => {
        setEditingRecord(null);
        setFormData({
            id_mascota: '',
            fecha_consulta: new Date().toISOString().slice(0, 16), // Fecha y hora actual
            veterinario: '',
            diagnostico: '',
            tratamiento: '',
            observaciones: '',
            peso_actual: '',
            temperatura: '',
            proxima_cita: ''
        });
        setFormErrors({});
        setIsModalOpen(true);
    }, []);

    const handleEdit = useCallback((record) => {
        setEditingRecord(record);
        setFormData({
            id_mascota: record.id_mascota,
            fecha_consulta: new Date(record.fecha_consulta).toISOString().slice(0, 16),
            veterinario: record.veterinario_id || '', // Asumiendo que el backend envía el ID del veterinario
            diagnostico: record.diagnostico,
            tratamiento: record.tratamiento,
            observaciones: record.observaciones,
            peso_actual: record.peso_actual,
            temperatura: record.temperatura,
            proxima_cita: record.proxima_cita ? new Date(record.proxima_cita).toISOString().split('T')[0] : ''
        });
        setFormErrors({});
        setIsModalOpen(true);
    }, []);

    const handleFormChange = useCallback((e) => {
        const { name, value } = e.target;
        let newValue = value;

        // Convertir a mayúsculas para campos específicos
        if (['diagnostico', 'tratamiento', 'observaciones'].includes(name)) {
            newValue = value.toUpperCase();
        }

        setFormData(prev => ({ ...prev, [name]: newValue }));

        const errorMessage = validateField(name, newValue, { ...formData, [name]: newValue }, !editingRecord);
        setFormErrors(prev => ({ ...prev, [name]: errorMessage }));
    }, [formData, editingRecord]);

    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');

        let errors = {};
        Object.keys(formData).forEach(key => {
            const errorMessage = validateField(key, formData[key], formData, !editingRecord);
            if (errorMessage) {
                errors[key] = errorMessage;
            }
        });

        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            addNotification('error', 'Por favor, corrige los errores en el formulario.', 5000);
            setIsSubmitting(false);
            return;
        }

        try {
            let response;
            const payload = {
                ...formData,
                fecha_consulta: new Date(formData.fecha_consulta).toISOString().slice(0, 19).replace('T', ' '),
                proxima_cita: formData.proxima_cita || null, // Asegurar que sea null si está vacío
                id_mascota: parseInt(formData.id_mascota, 10),
                veterinario: formData.veterinario ? parseInt(formData.veterinario, 10) : user.id // Asigna al usuario logueado si no se selecciona veterinario
            };

            if (editingRecord) {
                response = await authFetch(`/historial_medico/${editingRecord.id_historial}`, { // Endpoint PUT
                    method: 'PUT',
                    body: payload
                });
            } else {
                response = await authFetch('/historial_medico', { // Endpoint POST
                    method: 'POST',
                    body: payload
                });
            }

            if (response.success) {
                addNotification('success', response.message || `Historial médico ${editingRecord ? 'actualizado' : 'registrado'} correctamente.`, 5000);
                setIsModalOpen(false);
                fetchMedicalRecords();
            } else {
                addNotification('error', response.message || `Error al ${editingRecord ? 'actualizar' : 'registrar'} el historial médico.`, 5000);
            }
        } catch (err) {
            addNotification('error', `Error de conexión: ${err.message}`, 5000);
            console.error("Error submitting medical record form:", err);
        } finally {
            setIsSubmitting(false);
        }
    }, [editingRecord, formData, user, authFetch, addNotification, fetchMedicalRecords]);

    const handleDelete = useCallback(async (id) => {
        if (!window.confirm('¿Estás seguro de eliminar este historial médico? Esta acción es irreversible.')) {
            return;
        }

        setIsLoading(true);
        try {
            const response = await authFetch(`/historial_medico/${id}`, { method: 'DELETE' }); // Endpoint DELETE
            if (response.success) {
                addNotification('success', response.message || 'Historial médico eliminado correctamente.', 5000);
                fetchMedicalRecords();
            } else {
                addNotification('error', response.message || 'Error al eliminar el historial médico.', 5000);
            }
        } catch (err) {
            addNotification('error', `Error de conexión: ${err.message}`, 5000);
            console.error("Error deleting medical record:", err);
        } finally {
            setIsLoading(false);
        }
    }, [authFetch, addNotification, fetchMedicalRecords]);

    if (isLoading && records.length === 0) {
        return (
            <div className="admin-loading">
                <div className="loading-spinner">
                    <FaSpinner className="spinner-icon" />
                </div>
                <p>Cargando historiales médicos...</p>
            </div>
        );
    }

    if (error && records.length === 0) {
        return (
            <div className="error-message">
                <FaInfoCircle className="info-icon" />
                {error}
                <p>Asegúrate de que el backend esté corriendo y los endpoints de API estén accesibles y funcionando correctamente.</p>
            </div>
        );
    }

    return (
        <div className="admin-content-container">
            <div className="admin-content-header">
                <h2>
                    <FaNotesMedical className="header-icon" />
                    Gestión de Historiales Médicos
                </h2>
                <div className="header-actions">
                    <div className="search-box">
                        <FaSearch className="search-icon" />
                        <input
                            type="text"
                            placeholder="Buscar por mascota, propietario, veterinario o diagnóstico..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            disabled={isLoading}
                        />
                    </div>
                    <button
                        className="add-new-btn"
                        onClick={handleAdd}
                        disabled={isLoading}
                    >
                        <FaPlus /> Nuevo Historial
                    </button>
                </div>
            </div>

            <div className="admin-table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Fecha</th>
                            <th>Mascota</th>
                            <th>Propietario</th>
                            <th>Veterinario</th>
                            <th>Diagnóstico</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredRecords.length > 0 ? (
                            filteredRecords.map(record => (
                                <tr key={record.id_historial}>
                                    <td>{record.id_historial}</td>
                                    <td>{record.fecha_consulta}</td>
                                    <td>{record.mascota} ({record.especie})</td>
                                    <td>{record.propietario}</td>
                                    <td>{record.veterinario || 'N/A'}</td>
                                    <td>{record.diagnostico}</td>
                                    <td className="actions-cell">
                                        <button
                                            className="btn-icon"
                                            onClick={() => handleEdit(record)}
                                            disabled={isLoading}
                                            title="Editar Historial"
                                        >
                                            <FaEdit />
                                        </button>
                                        <button
                                            className="btn-icon btn-delete"
                                            onClick={() => handleDelete(record.id_historial)}
                                            disabled={isLoading}
                                            title="Eliminar Historial"
                                        >
                                            <FaTrash />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="7" className="no-results">
                                    <FaInfoCircle className="info-icon" />
                                    No se encontraron historiales médicos que coincidan con la búsqueda.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal para Añadir/Editar Historial Médico */}
            <AnimatePresence>
                {isModalOpen && (
                    <motion.div
                        className="modal-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.div
                            className="modal-content"
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            <div className="modal-header">
                                <h3>{editingRecord ? 'Editar Historial Médico' : 'Registrar Nuevo Historial Médico'}</h3>
                                <button className="close-modal-btn" onClick={() => { setIsModalOpen(false); setFormErrors({}); }}>
                                    <FaTimes />
                                </button>
                            </div>
                            <form onSubmit={handleSubmit} className="modal-form">
                                <div className="form-group">
                                    <label htmlFor="id_mascota">Mascota</label>
                                    {editingRecord ? (
                                        <input
                                            type="text"
                                            id="id_mascota_display"
                                            // Asegura que pets esté cargado antes de intentar encontrar
                                            value={pets.length > 0 ? `${pets.find(p => p.id_mascota === formData.id_mascota)?.nombre || ''} (${pets.find(p => p.id_mascota === formData.id_mascota)?.especie || ''})` : 'Cargando...'}
                                            disabled
                                            className="disabled-input-text"
                                        />
                                    ) : (
                                        <select
                                            id="id_mascota"
                                            name="id_mascota"
                                            value={formData.id_mascota}
                                            onChange={handleFormChange}
                                            required
                                            disabled={isSubmitting}
                                        >
                                            <option value="">Selecciona una mascota</option>
                                            {pets.map(pet => (
                                                <option key={pet.id_mascota} value={pet.id_mascota}>
                                                    {pet.nombre} ({pet.especie}) - Dueño: {pet.propietario_nombre} {pet.propietario_apellido}
                                                </option>
                                            ))}
                                        </select>
                                    )}
                                    {formErrors.id_mascota && <p className="error-message-inline">{formErrors.id_mascota}</p>}
                                </div>
                                <div className="form-group">
                                    <label htmlFor="fecha_consulta">Fecha y Hora de Consulta</label>
                                    <input
                                        type="datetime-local"
                                        id="fecha_consulta"
                                        name="fecha_consulta"
                                        value={formData.fecha_consulta}
                                        onChange={handleFormChange}
                                        required
                                        disabled={isSubmitting}
                                    />
                                    {formErrors.fecha_consulta && <p className="error-message-inline">{formErrors.fecha_consulta}</p>}
                                </div>
                                <div className="form-group">
                                    <label htmlFor="veterinario">Veterinario</label>
                                    <select
                                        id="veterinario"
                                        name="veterinario"
                                        value={formData.veterinario}
                                        onChange={handleFormChange}
                                        disabled={isSubmitting}
                                    >
                                        <option value="">(Asignar a mí mismo)</option> {/* Opción para asignarse al admin logueado */}
                                        {vets.map(vet => (
                                            <option key={vet.id} value={vet.id}>
                                                {vet.nombre} {vet.apellido} ({vet.email})
                                            </option>
                                        ))}
                                    </select>
                                    {formErrors.veterinario && <p className="error-message-inline">{formErrors.veterinario}</p>}
                                </div>
                                <div className="form-group">
                                    <label htmlFor="diagnostico">Diagnóstico</label>
                                    <textarea
                                        id="diagnostico"
                                        name="diagnostico"
                                        value={formData.diagnostico}
                                        onChange={handleFormChange}
                                        required
                                        disabled={isSubmitting}
                                    ></textarea>
                                    {formErrors.diagnostico && <p className="error-message-inline">{formErrors.diagnostico}</p>}
                                </div>
                                <div className="form-group">
                                    <label htmlFor="tratamiento">Tratamiento</label>
                                    <textarea
                                        id="tratamiento"
                                        name="tratamiento"
                                        value={formData.tratamiento}
                                        onChange={handleFormChange}
                                        disabled={isSubmitting}
                                    ></textarea>
                                    {formErrors.tratamiento && <p className="error-message-inline">{formErrors.tratamiento}</p>}
                                </div>
                                <div className="form-group">
                                    <label htmlFor="observaciones">Observaciones</label>
                                    <textarea
                                        id="observaciones"
                                        name="observaciones"
                                        value={formData.observaciones}
                                        onChange={handleFormChange}
                                        disabled={isSubmitting}
                                    ></textarea>
                                    {formErrors.observaciones && <p className="error-message-inline">{formErrors.observaciones}</p>}
                                </div>
                                <div className="form-group">
                                    <label htmlFor="peso_actual">Peso Actual (kg)</label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        id="peso_actual"
                                        name="peso_actual"
                                        value={formData.peso_actual}
                                        onChange={handleFormChange}
                                        disabled={isSubmitting}
                                    />
                                    {formErrors.peso_actual && <p className="error-message-inline">{formErrors.peso_actual}</p>}
                                </div>
                                <div className="form-group">
                                    <label htmlFor="temperatura">Temperatura ($^\circ$C)</label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        id="temperatura"
                                        name="temperatura"
                                        value={formData.temperatura}
                                        onChange={handleFormChange}
                                        disabled={isSubmitting}
                                    />
                                    {formErrors.temperatura && <p className="error-message-inline">{formErrors.temperatura}</p>}
                                </div>
                                <div className="form-group">
                                    <label htmlFor="proxima_cita">Próxima Cita (Opcional)</label>
                                    <input
                                        type="date"
                                        id="proxima_cita"
                                        name="proxima_cita"
                                        value={formData.proxima_cita}
                                        onChange={handleFormChange}
                                        disabled={isSubmitting}
                                    />
                                    {formErrors.proxima_cita && <p className="error-message-inline">{formErrors.proxima_cita}</p>}
                                </div>
                                <button type="submit" className="submit-btn" disabled={isSubmitting}>
                                    {isSubmitting ? <FaSpinner className="spinner-icon" /> : (editingRecord ? 'Actualizar Historial' : 'Registrar Historial')}
                                </button>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default AdminMedicalRecords;
