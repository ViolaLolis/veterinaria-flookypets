// src/Components/Admin/AdminAppointmentFormLogic.js
import { useState, useEffect, useCallback } from 'react';
import { validateField } from '../../utils/validation';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export const useAdminAppointmentFormLogic = (isOpen, appointment, onSaveSuccess, onClose) => {
    const [formData, setFormData] = useState({
        id_cliente: '',
        id_mascota: '',
        id_servicio: '',
        id_veterinario: '',
        fecha_cita: '',
        notas_adicionales: '',
        estado: 'PENDIENTE'
    });
    const [formErrors, setFormErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [notification, setNotification] = useState(null);
    const [clientes, setClientes] = useState([]);
    const [mascotas, setMascotas] = useState([]);
    const [servicios, setServicios] = useState([]);
    const [veterinarios, setVeterinarios] = useState([]);
    const [filteredMascotas, setFilteredMascotas] = useState([]);

    const getAuthToken = () => {
        return localStorage.getItem('token');
    };

    const authFetch = useCallback(async (url, options = {}) => {
        const token = getAuthToken();
        if (!token) {
            setNotification({ message: 'No se encontró token de autenticación. Por favor, inicia sesión de nuevo.', type: 'error' });
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
            setNotification({ message: 'Sesión expirada o no autorizado. Por favor, inicia sesión de nuevo.', type: 'error' });
            throw new Error('No autorizado');
        }

        return response;
    }, []);

    useEffect(() => {
        if (appointment) {
            setFormData({
                id_cliente: appointment.id_cliente || '',
                id_mascota: appointment.id_mascota || '',
                id_servicio: appointment.id_servicio || '',
                id_veterinario: appointment.id_veterinario || '',
                fecha_cita: appointment.fecha_cita ? new Date(appointment.fecha_cita).toISOString().slice(0, 16) : '',
                notas_adicionales: appointment.notas_adicionales || '',
                estado: appointment.estado ? appointment.estado.toUpperCase() : 'PENDIENTE'
            });
        } else {
            setFormData({
                id_cliente: '',
                id_mascota: '',
                id_servicio: '',
                id_veterinario: '',
                fecha_cita: '',
                notas_adicionales: '',
                estado: 'PENDIENTE'
            });
        }
        setFormErrors({});
        setNotification(null);
    }, [appointment, isOpen]);

    useEffect(() => {
        const fetchDependencies = async () => {
            try {
                const [clientesRes, mascotasRes, serviciosRes, vetsRes] = await Promise.all([
                    authFetch(`${API_BASE_URL}/usuarios`),
                    authFetch(`${API_BASE_URL}/mascotas`),
                    authFetch(`${API_BASE_URL}/servicios`),
                    authFetch(`${API_BASE_URL}/usuarios/veterinarios`)
                ]);

                const clientesData = await clientesRes.json();
                const mascotasData = await mascotasRes.json();
                const serviciosData = await serviciosRes.json();
                const vetsData = await vetsRes.json();

                if (clientesData.success) {
                    setClientes(clientesData.data);
                } else {
                    setNotification({ message: clientesData.message || 'Error al cargar clientes.', type: 'error' });
                }

                if (mascotasData.success) {
                    setMascotas(mascotasData.data);
                } else {
                    setNotification({ message: mascotasData.message || 'Error al cargar mascotas.', type: 'error' });
                }

                if (serviciosData.success) {
                    setServicios(serviciosData.data);
                } else {
                    setNotification({ message: serviciosData.message || 'Error al cargar servicios.', type: 'error' });
                }

                if (vetsData.success) {
                    setVeterinarios(vetsData.data);
                } else {
                    setNotification({ message: vetsData.message || 'Error al cargar veterinarios.', type: 'error' });
                }

            } catch (err) {
                console.error('Error fetching dependencies:', err);
                setNotification({ message: 'Error al cargar datos necesarios.', type: 'error' });
            }
        };

        if (isOpen) {
            fetchDependencies();
        }
    }, [isOpen, authFetch]);

    useEffect(() => {
        if (formData.id_cliente) {
            const clientMascotas = mascotas.filter(m => m.id_propietario === parseInt(formData.id_cliente));
            setFilteredMascotas(clientMascotas);

            if (!appointment) {
                if (formData.id_mascota && !clientMascotas.some(m => m.id_mascota === parseInt(formData.id_mascota))) {
                    setFormData(prev => ({ ...prev, id_mascota: '' }));
                }
            }
        } else {
            setFilteredMascotas([]);
            if (!appointment) {
                setFormData(prev => ({ ...prev, id_mascota: '' }));
            }
        }
    }, [formData.id_cliente, mascotas, appointment]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        const validationError = validateField(`${name}_cita`, value, formData, !appointment);
        setFormErrors(prev => ({ ...prev, [name]: validationError }));
    };

    const handleBlur = (e) => {
        const { name, value } = e.target;
        const validationError = validateField(`${name}_cita`, value, formData, !appointment);
        setFormErrors(prev => ({ ...prev, [name]: validationError }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setNotification(null);

        let errors = {};
        let hasErrors = false;

        const fieldsToValidate = [
            'id_cliente', 'id_mascota', 'id_servicio', 'fecha_cita', 'estado'
        ];
        if (formData.id_veterinario) {
            fieldsToValidate.push('id_veterinario');
        }
        if (formData.notas_adicionales) {
            fieldsToValidate.push('notas_adicionales');
        }

        for (const field of fieldsToValidate) {
            const errorMsg = validateField(`${field}_cita`, formData[field], formData, !appointment);
            if (errorMsg) {
                errors[field] = errorMsg;
                hasErrors = true;
            }
        }

        setFormErrors(errors);

        if (hasErrors) {
            setIsSubmitting(false);
            setNotification({ message: 'Por favor, corrige los errores del formulario.', type: 'error' });
            return;
        }

        try {
            let response;
            const dataToSend = { ...formData };
            dataToSend.estado = dataToSend.estado.toUpperCase();

            if (appointment) {
                response = await authFetch(`${API_BASE_URL}/citas/${appointment.id_cita}`, {
                    method: 'PUT',
                    body: JSON.stringify(dataToSend),
                });
            } else {
                response = await authFetch(`${API_BASE_URL}/citas/agendar`, {
                    method: 'POST',
                    body: JSON.stringify(dataToSend),
                });
            }

            const data = await response.json();

            if (data.success) {
                setNotification({ message: data.message, type: 'success' });
                onSaveSuccess();
                onClose();
            } else {
                setNotification({ message: data.message || 'Error al guardar la cita.', type: 'error' });
            }
        } catch (err) {
            console.error('AdminAppointmentForm - Error submitting appointment form:', err);
            setNotification({ message: `Error al guardar la cita: ${err.message || 'Error desconocido'}`, type: 'error' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const getClientDisplay = (id) => {
        if (appointment && parseInt(id) === appointment.id_cliente) {
            return `${appointment.propietario_nombre}`;
        }
        const client = clientes.find(c => c.id === parseInt(id));
        return client ? `${client.nombre} ${client.apellido}` : 'Cargando...';
    };

    const getMascotaDisplay = (id) => {
        if (appointment && parseInt(id) === appointment.id_mascota) {
            return `${appointment.mascota_nombre}`;
        }
        const mascota = mascotas.find(m => m.id_mascota === parseInt(id));
        return mascota ? `${mascota.nombre}` : 'Cargando...';
    };

    const getServicioName = (id) => {
        const servicio = servicios.find(s => s.id_servicio === parseInt(id));
        return servicio ? servicio.nombre : '';
    };

    const getVeterinarioName = (id) => {
        const veterinario = veterinarios.find(v => v.id === parseInt(id));
        return veterinario ? `${veterinario.nombre} ${veterinario.apellido} (${veterinario.email})` : '';
    };

    return {
        formData,
        formErrors,
        isSubmitting,
        notification,
        clientes,
        mascotas,
        servicios,
        veterinarios,
        filteredMascotas,
        handleChange,
        handleBlur,
        handleSubmit,
        getClientDisplay,
        getMascotaDisplay,
        getServicioName,
        getVeterinarioName,
        setNotification // Expose setNotification for external control if needed
    };
};