import React, { useState, useEffect, useCallback } from 'react';
import { FaSave, FaTimes, FaSpinner } from 'react-icons/fa';
import { validateField } from '../../utils/validation';
import Modal from '../../Components/Modal';
import Notification from '../../Components/Notification';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const AdminMedicalRecordForm = ({ isOpen, onClose, record, onSaveSuccess }) => {
    const [formData, setFormData] = useState({
        id_mascota: '',
        id_veterinario: '',
        fecha_registro: '',
        diagnostico: '',
        tratamiento: '',
        observaciones: '',
        proxima_cita: '' // Campo opcional
    });
    const [formErrors, setFormErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [notification, setNotification] = useState(null);
    const [clientes, setClientes] = useState([]);
    const [veterinarios, setVeterinarios] = useState([]);
    const [filteredMascotas, setFilteredMascotas] = useState([]);
    const [selectedClientId, setSelectedClientId] = useState(''); // Estado para el cliente seleccionado en el dropdown

    const handleChange = useCallback((e) => {
        const { name, value } = e.target;
        if (name === 'id_cliente') { // Manejo especial para el cambio de cliente
            setSelectedClientId(value);
            setFormData(prev => ({ ...prev, id_mascota: '' })); // Limpiar mascota cuando cambia el cliente
        }
        setFormData(prev => ({ ...prev, [name]: value }));
        setFormErrors(prev => ({ ...prev, [name]: '' }));
    }, []);

    const handleBlur = useCallback((e) => {
        const { name, value } = e.target;
        const error = validateField(name, value);
        if (error) {
            setFormErrors(prev => ({ ...prev, [name]: error }));
        }
    }, []);

    // === FETCHING INITIAL DATA ===

    // Fetch clientes
    const fetchClientes = useCallback(async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            setNotification({ message: 'No autorizado. Por favor, inicia sesión.', type: 'error' });
            return;
        }
        try {
            const response = await fetch(`${API_BASE_URL}/admin/clientes`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Error al cargar clientes.');
            const data = await response.json();
            if (data.success) {
                setClientes(data.data);
            } else {
                setNotification({ message: data.message || 'No se pudieron cargar los clientes.', type: 'error' });
            }
        } catch (error) {
            console.error("Error fetching clients:", error);
            setNotification({ message: error.message || 'Error del servidor al cargar clientes.', type: 'error' });
        }
    }, [setNotification]);

    // Fetch veterinarios
    const fetchVeterinarios = useCallback(async () => {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`${API_BASE_URL}/veterinarios`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Error al cargar veterinarios.');
            const data = await response.json();
            if (data.success) {
                setVeterinarios(data.data);
            } else {
                setNotification({ message: data.message || 'No se pudieron cargar los veterinarios.', type: 'error' });
            }
        } catch (error) {
            console.error("Error fetching vets:", error);
            setNotification({ message: error.message || 'Error del servidor al cargar veterinarios.', type: 'error' });
        }
    }, [setNotification]);

    useEffect(() => {
        if (isOpen) {
            fetchClientes();
            fetchVeterinarios();

            if (record) {
                // Para edición: obtener el ID del propietario de la mascota para seleccionar el cliente
                const fetchOwnerId = async () => {
                    const token = localStorage.getItem('token');
                    if (!token) return;

                    try {
                        const response = await fetch(`${API_BASE_URL}/admin/mascotas/${record.id_mascota}`, {
                            headers: { 'Authorization': `Bearer ${token}` }
                        });
                        const data = await response.json();
                        if (response.ok && data.success) {
                            setSelectedClientId(data.data.id_propietario.toString()); // Asegurar que sea string
                        } else {
                            console.error("No se pudo obtener el propietario de la mascota:", data.message);
                        }
                    } catch (error) {
                        console.error("Error al obtener propietario de mascota:", error);
                    }
                };
                fetchOwnerId();

                // Formatear fechas para datetime-local
                const formattedFechaRegistro = record.fecha_registro ? new Date(record.fecha_registro).toISOString().slice(0, 16) : '';
                const formattedProximaCita = record.proxima_cita ? new Date(record.proxima_cita).toISOString().slice(0, 16) : '';

                setFormData({
                    id_mascota: record.id_mascota || '',
                    id_veterinario: record.id_veterinario || '',
                    fecha_registro: formattedFechaRegistro,
                    diagnostico: record.diagnostico || '',
                    tratamiento: record.tratamiento || '',
                    observaciones: record.observaciones || '',
                    proxima_cita: formattedProximaCita
                });
            } else {
                // Resetear el formulario para nuevo historial
                setFormData({
                    id_mascota: '',
                    id_veterinario: '',
                    fecha_registro: '',
                    diagnostico: '',
                    tratamiento: '',
                    observaciones: '',
                    proxima_cita: ''
                });
                setSelectedClientId(''); // Asegurarse de que el cliente también se resetee para un nuevo historial
            }
            setFormErrors({});
            setNotification(null);
        }
    }, [isOpen, record, fetchClientes, fetchVeterinarios, API_BASE_URL]);

    // === LÓGICA PARA CARGAR MASCOTAS SEGÚN EL CLIENTE SELECCIONADO ===
    useEffect(() => {
        if (isOpen && selectedClientId) {
            const fetchMascotasForClient = async () => {
                const token = localStorage.getItem('token');
                if (!token) {
                    setNotification({ message: 'No autorizado. Por favor, inicia sesión.', type: 'error' });
                    setFilteredMascotas([]);
                    return;
                }
                let result = { success: false, data: [] }; // Inicializar result aquí

                try {
                    const response = await fetch(`${API_BASE_URL}/mascotas/cliente/${selectedClientId}`, {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    });

                    if (!response.ok) {
                        if (response.status === 404) {
                            setNotification({ message: 'No se encontraron mascotas para el cliente seleccionado.', type: 'info' });
                        } else {
                            const errorData = await response.json();
                            throw new Error(errorData.message || 'Error al obtener mascotas del cliente.');
                        }
                    } else {
                        result = await response.json(); // Asignar result aquí
                        if (result.success) {
                            setFilteredMascotas(result.data);
                        } else {
                            setNotification({ message: result.message || 'No se pudieron cargar las mascotas del cliente.', type: 'error' });
                        }
                    }

                    // Asegurarse de que filteredMascotas se actualiza en ambos casos (éxito y 404)
                    setFilteredMascotas(result.data); // Esto asegura que si success es false o 404, se limpia la lista.

                    // Si se está editando y la mascota existente no está en la lista filtrada, deseleccionar
                    // O si se seleccionó un cliente y la mascota anterior no pertenece a él.
                    if (record && record.id_mascota && !result.data.some(m => m.id_mascota === record.id_mascota)) {
                         setFormData(prev => ({ ...prev, id_mascota: '' }));
                    } else if (formData.id_mascota && !result.data.some(m => m.id_mascota === formData.id_mascota)) {
                         setFormData(prev => ({ ...prev, id_mascota: '' }));
                    }


                } catch (error) {
                    console.error("Error fetching mascotas for client:", error);
                    setNotification({ message: error.message || 'Error del servidor al cargar mascotas.', type: 'error' });
                    setFilteredMascotas([]); // En caso de error, siempre limpiar
                }
            };
            fetchMascotasForClient();
        } else if (!selectedClientId && isOpen) {
            // Si no hay cliente seleccionado, limpia las mascotas filtradas
            setFilteredMascotas([]);
            setFormData(prev => ({ ...prev, id_mascota: '' }));
        }
    }, [selectedClientId, isOpen, API_BASE_URL, setNotification, record, formData.id_mascota]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setFormErrors({});
        setNotification(null);

        let valid = true;
        let newErrors = {};

        // Validar todos los campos
        // AGREGAR 'id_cliente' a la validación
        const fieldsToValidate = ['id_cliente', 'id_mascota', 'id_veterinario', 'fecha_registro', 'diagnostico', 'tratamiento'];
        fieldsToValidate.forEach(field => {
            let valueToValidate = formData[field];
            if (field === 'id_cliente') {
                valueToValidate = selectedClientId; // Validar directamente el estado selectedClientId
            }
            const error = validateField(field, valueToValidate);
            if (error) {
                newErrors[field] = error;
                valid = false;
            }
        });

        if (!valid) {
            setFormErrors(newErrors);
            setIsSubmitting(false);
            setNotification({ message: 'Por favor, corrige los errores del formulario.', type: 'error' });
            return;
        }

        const token = localStorage.getItem('token');
        if (!token) {
            setNotification({ message: 'No autorizado. Por favor, inicia sesión.', type: 'error' });
            setIsSubmitting(false);
            return;
        }

        try {
            const method = record ? 'PUT' : 'POST';
            const url = record ? `${API_BASE_URL}/admin/historiales/${record.id_historial}` : `${API_BASE_URL}/admin/historiales`;

            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            const result = await response.json();

            if (!response.ok) {
                // Log the full error response from the server for better debugging
                console.error("Server error response:", result);
                throw new Error(result.message || 'Error al guardar el historial médico.');
            }

            setNotification({ message: result.message, type: 'success' });
            onSaveSuccess();
            onClose();
        } catch (error) {
            console.error("Error saving medical record:", error);
            setNotification({ message: error.message || 'Error del servidor al guardar el historial médico.', type: 'error' });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={record ? "Editar Historial Médico" : "Registrar Historial Médico"}>
            <Notification notification={notification} onClose={() => setNotification(null)} duration={5000} />
            {isOpen && ( // Renderiza el formulario solo si el modal está abierto
                <form onSubmit={handleSubmit} className="p-4 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Cliente */}
                        <div className="form-group">
                            <label htmlFor="selectedClientId">Cliente:</label>
                            <select
                                id="selectedClientId"
                                name="id_cliente"
                                value={selectedClientId}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                className={formErrors.id_cliente ? 'input-error' : ''}
                                disabled={isSubmitting}
                            >
                                <option value="">-- Selecciona un cliente --</option>
                                {clientes.map(cliente => (
                                    <option key={cliente.id} value={cliente.id}>
                                        {cliente.nombre} {cliente.apellido}
                                    </option>
                                ))}
                            </select>
                            {formErrors.id_cliente && <span className="error-text">{formErrors.id_cliente}</span>}
                        </div>

                        {/* Mascota - Usar filteredMascotas */}
                        <div className="form-group">
                            <label htmlFor="id_mascota">Mascota:</label>
                            <select
                                id="id_mascota"
                                name="id_mascota"
                                value={formData.id_mascota}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                className={formErrors.id_mascota ? 'input-error' : ''}
                                disabled={isSubmitting || !selectedClientId || filteredMascotas.length === 0}
                            >
                                <option value="">-- Selecciona una mascota --</option>
                                {filteredMascotas.length > 0 ? (
                                    filteredMascotas.map(mascota => (
                                        <option key={mascota.id_mascota} value={mascota.id_mascota}>
                                            {mascota.nombre} ({mascota.especie})
                                        </option>
                                    ))
                                ) : (
                                    selectedClientId && <option value="" disabled>No hay mascotas para este cliente</option>
                                )}
                            </select>
                            {formErrors.id_mascota && <span className="error-text">{formErrors.id_mascota}</span>}
                        </div>

                        {/* Veterinario */}
                        <div className="form-group">
                            <label htmlFor="id_veterinario">Veterinario:</label>
                            <select
                                id="id_veterinario"
                                name="id_veterinario"
                                value={formData.id_veterinario}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                className={formErrors.id_veterinario ? 'input-error' : ''}
                                disabled={isSubmitting}
                            >
                                <option value="">-- Selecciona un veterinario --</option>
                                {veterinarios.map(veterinario => (
                                    <option key={veterinario.id} value={veterinario.id}>
                                        {veterinario.nombre} {veterinario.apellido}
                                    </option>
                                ))}
                            </select>
                            {formErrors.id_veterinario && <span className="error-text">{formErrors.id_veterinario}</span>}
                        </div>

                        {/* Fecha de Registro */}
                        <div className="form-group">
                            <label htmlFor="fecha_registro">Fecha de Registro:</label>
                            <input
                                type="datetime-local"
                                id="fecha_registro"
                                name="fecha_registro"
                                value={formData.fecha_registro}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                className={formErrors.fecha_registro ? 'input-error' : ''}
                                disabled={isSubmitting}
                            />
                            {formErrors.fecha_registro && <span className="error-text">{formErrors.fecha_registro}</span>}
                        </div>

                        {/* Diagnóstico */}
                        <div className="form-group md:col-span-2">
                            <label htmlFor="diagnostico">Diagnóstico:</label>
                            <textarea
                                id="diagnostico"
                                name="diagnostico"
                                value={formData.diagnostico}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                className={formErrors.diagnostico ? 'input-error' : ''}
                                disabled={isSubmitting}
                                rows="3"
                            ></textarea>
                            {formErrors.diagnostico && <span className="error-text">{formErrors.diagnostico}</span>}
                        </div>

                        {/* Tratamiento */}
                        <div className="form-group md:col-span-2">
                            <label htmlFor="tratamiento">Tratamiento:</label>
                            <textarea
                                id="tratamiento"
                                name="tratamiento"
                                value={formData.tratamiento}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                className={formErrors.tratamiento ? 'input-error' : ''}
                                disabled={isSubmitting}
                                rows="3"
                            ></textarea>
                            {formErrors.tratamiento && <span className="error-text">{formErrors.tratamiento}</span>}
                        </div>

                        {/* Observaciones */}
                        <div className="form-group md:col-span-2">
                            <label htmlFor="observaciones">Observaciones:</label>
                            <textarea
                                id="observaciones"
                                name="observaciones"
                                value={formData.observaciones}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                className={formErrors.observaciones ? 'input-error' : ''}
                                disabled={isSubmitting}
                                rows="3"
                            ></textarea>
                            {formErrors.observaciones && <span className="error-text">{formErrors.observaciones}</span>}
                        </div>

                        {/* Próxima Cita (Opcional) */}
                        <div className="form-group">
                            <label htmlFor="proxima_cita">Próxima Cita (Opcional):</label>
                            <input
                                type="datetime-local"
                                id="proxima_cita"
                                name="proxima_cita"
                                value={formData.proxima_cita}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                className={formErrors.proxima_cita ? 'input-error' : ''}
                                disabled={isSubmitting}
                            />
                            {formErrors.proxima_cita && <span className="error-text">{formErrors.proxima_cita}</span>}
                        </div>
                    </div>

                    <div className="form-actions mt-4 flex justify-end space-x-2">
                        <button type="submit" className="btn-primary" disabled={isSubmitting}>
                            {isSubmitting ? <FaSpinner className="spinner" /> : <FaSave />} {record ? 'Actualizar Historial' : 'Registrar Historial'}
                        </button>
                        <button type="button" className="btn-secondary" onClick={onClose} disabled={isSubmitting}>
                            <FaTimes /> Cancelar
                        </button>
                    </div>
                </form>
            )}
        </Modal>
    );
};

export default AdminMedicalRecordForm;