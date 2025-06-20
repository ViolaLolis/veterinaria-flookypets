import React, { useState, useEffect, useCallback } from 'react';
import { FaSearch, FaPlus, FaEdit, FaTrash, FaTimes, FaSave, FaSpinner, FaInfoCircle, FaConciergeBell, FaDollarSign, FaClock } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { authFetch } from './api'; // Importa la función authFetch centralizada
import './Styles/AdminStyles.css'; // Asegúrate de que este archivo CSS existe y contiene los estilos necesarios

function ServicesManagement({ user }) {
    const [services, setServices] = useState([]);
    const [filteredServices, setFilteredServices] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [currentService, setCurrentService] = useState(null); // Servicio para editar o el nuevo
    const [validationErrors, setValidationErrors] = useState({}); // Nuevo estado para errores de validación
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [notification, setNotification] = useState(null);

    /**
     * Muestra una notificación temporal en la UI.
     * @param {string} message - El mensaje a mostrar.
     * @param {string} type - El tipo de notificación ('success' o 'error').
     */
    const showNotification = useCallback((message, type = 'success') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    }, []);

    /**
     * Carga la lista de servicios desde el backend.
     */
    const fetchServices = useCallback(async () => {
        setIsLoading(true);
        setError('');
        try {
            // Usar authFetch para obtener los servicios desde la API real
            const responseData = await authFetch('/servicios'); // Endpoint: /servicios

            if (responseData.success && Array.isArray(responseData.data)) {
                setServices(responseData.data);
                setFilteredServices(responseData.data);
            } else {
                setError(responseData.message || 'Formato de datos de servicios incorrecto.');
                showNotification(responseData.message || 'Error al cargar servicios: Formato incorrecto.', 'error');
            }
        } catch (err) {
            setError(`Error al cargar servicios: ${err.message}`);
            console.error('Error fetching services:', err);
        } finally {
            setIsLoading(false);
        }
    }, [authFetch, showNotification, setError, setIsLoading]);

    // useEffect para cargar los servicios al montar el componente
    useEffect(() => {
        if (user && user.token) { // Solo si el usuario está autenticado
            fetchServices();
        } else {
            setIsLoading(false);
            setError('No autorizado. Por favor, inicie sesión.');
            showNotification('No autorizado para ver servicios.', 'error');
        }
    }, [fetchServices, user, showNotification]);

    // useEffect para filtrar la lista de servicios
    useEffect(() => {
        const results = services.filter(service =>
            service.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
            service.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (typeof service.precio === 'string' && service.precio.toLowerCase().includes(searchTerm.toLowerCase()))
        );
        setFilteredServices(results);
    }, [searchTerm, services]);

    /**
     * Función de validación exhaustiva para los campos del formulario de servicio.
     * @param {string} name - Nombre del campo a validar.
     * @param {*} value - Valor del campo.
     * @param {object} currentServiceData - Datos actuales del formulario.
     * @returns {string} Mensaje de error si la validación falla, cadena vacía si es válida.
     */
    const validateField = useCallback((name, value, currentServiceData) => {
        let message = '';
        const trimmedValue = typeof value === 'string' ? value.trim() : value;

        // --- Patrones y listas de palabras clave para validaciones generales y de seguridad ---
        const commonSpecialChars = /[!@#$%^&*()_+\-=\[\]{};':"\\|<>\/?~`€£¥§°¶™®©₽₹¢\p{Emoji}]/u; // Quité la coma del grupo porque es común en descripciones
        const sqlInjectionKeywords = /(union\s+select|select\s+from|drop\s+table|insert\s+into|delete\s+from|alter\s+table|--|;|xp_cmdshell|exec\s+\(|sleep\(|benchmark\()/i;
        const xssKeywords = /(<script|javascript:|onmouseover|onerror|onload|onclick|alert\(|prompt\(|confirm\(|<iframe|<img|<svg|<body|<div|<style)/i;
        const commonBadWords = ['sexo', 'puta', 'mierda', 'nazi', 'fuck', 'shit', 'asshole', 'bitch', 'joder']; // Ejemplos, ampliar según necesidad
        const repetitivePattern = /(.)\1{4,}/; // Más de 4 caracteres idénticos consecutivos
        const sequentialPattern = /(?:01234|12345|23456|34567|45678|56789|7890|9876|8765|7654|6543|5432|4321|3210|abcde|bcdef|cdefg|defgh|efghi|fghij|ghijk|hijkl|ijklm|jklmn|klmno|lmnop|mnopq|nopqr|opqrs|pqrst|qrstu|rstuv|stuvw|tuvwx|uvwxy|vwxyz)/i;
        const genericTerms = /(servicio\s*nuevo|prueba|demo|example|test\s*servicio|unnamed|untitled|sin\s*nombre|generico|consultar\s*precio|custom\s*service)/i;

        // Validaciones de seguridad y generales aplicables a casi todos los campos de texto
        if (typeof trimmedValue === 'string' && trimmedValue.length > 0) {
            if (sqlInjectionKeywords.test(trimmedValue)) {
                return `Contenido sospechoso de inyección SQL detectado en ${name}. Por favor, evite comandos inusuales.`;
            }
            if (xssKeywords.test(trimmedValue)) {
                return `Contenido sospechoso de ataque XSS detectado en ${name}. No utilice etiquetas HTML, JavaScript o atributos de evento.`;
            }
            if (/\s\s\s+|\t|\n|\r/.test(value)) {
                return `El campo ${name} no debe contener múltiples espacios consecutivos, tabs o saltos de línea.`;
            }
            if (repetitivePattern.test(trimmedValue)) {
                return `El campo ${name} no debe contener más de 4 caracteres idénticos consecutivos.`;
            }
            if (sequentialPattern.test(trimmedValue)) {
                return `El campo ${name} contiene secuencias comunes (ej. "abcde", "12345").`;
            }
            if (commonBadWords.some(word => trimmedValue.toLowerCase().includes(word))) {
                return `El campo ${name} contiene contenido inapropiado o no permitido.`;
            }
            if (genericTerms.test(trimmedValue)) {
                return `El valor en ${name} es un término genérico o de prueba. Por favor, use un valor real.`;
            }
        }


        switch (name) {
            case 'nombre':
                if (!trimmedValue) {
                    message = 'El Nombre del servicio es obligatorio.';
                } else if (trimmedValue.length < 5) {
                    message = 'El nombre debe tener al menos 5 caracteres.';
                } else if (trimmedValue.length > 100) {
                    message = 'El nombre no debe exceder los 100 caracteres.';
                } else if (!/^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s\.,\-_]+$/.test(trimmedValue)) {
                    message = 'El nombre solo puede contener letras, números, espacios, puntos, comas, guiones y guiones bajos.';
                } else if (trimmedValue.startsWith(' ') || trimmedValue.endsWith(' ')) {
                    message = 'El nombre no debe iniciar o terminar con espacios.';
                } else if (/\s{2,}|-{2,}|_{2,}/.test(trimmedValue)) {
                    message = 'El nombre no debe contener múltiples espacios, guiones o guiones bajos consecutivos.';
                } else if (/^\d+$/.test(trimmedValue)) {
                    message = 'El nombre no puede ser solo números.';
                }
                break;

            case 'descripcion':
                if (!trimmedValue) {
                    message = 'La Descripción del servicio es obligatoria.';
                } else if (trimmedValue.length < 20) {
                    message = 'La descripción debe tener al menos 20 caracteres para ser detallada.';
                } else if (trimmedValue.length > 500) {
                    message = 'La descripción no debe exceder los 500 caracteres.';
                } else if (trimmedValue.startsWith(' ') || trimmedValue.endsWith(' ')) {
                    message = 'La descripción no debe iniciar o terminar con espacios.';
                } else if (/\s{3,}/.test(trimmedValue)) {
                    message = 'La descripción no debe contener más de 2 espacios consecutivos.';
                }
                break;

            case 'precio':
                if (!trimmedValue && trimmedValue !== 0) { // Permitir 0 si es un número
                    message = 'El Precio es obligatorio.';
                } else {
                    const priceString = String(trimmedValue).replace(/[^0-9,\.$€£¥§°¶™®©₽₹¢]/g, ''); // Limpia caracteres, permite comas/puntos de moneda
                    const normalizedPriceString = priceString.replace(/\./g, '').replace(/,/g, '.').replace(/^\$/, ''); // Convierte a formato decimal para parsing

                    // Intenta convertir a número
                    const numericValue = parseFloat(normalizedPriceString);

                    if (isNaN(numericValue) && priceString.toLowerCase() !== 'consultar') {
                        message = 'El precio debe ser un número válido (ej. 50000, 50.000, $50000) o la palabra "Consultar".';
                    } else if (!isNaN(numericValue)) {
                        // Validaciones para precios numéricos
                        if (numericValue <= 0) {
                            message = 'El precio debe ser un número positivo.';
                        } else if (numericValue < 1000) {
                            message = 'El precio mínimo es $1.000 COP.';
                        } else if (numericValue > 1000000) {
                            message = 'El precio máximo es $1.000.000 COP.';
                        }
                        // Validar que el string original no tenga ceros a la izquierda (ej. 05000) si es numérico
                        else if (/^0\d+/.test(priceString.replace(/^\$/, ''))) {
                             message = 'El precio numérico no debe tener ceros iniciales si no es cero (ej. use 50000, no 050000).';
                        }
                        // Evitar precios que parecen números de teléfono o secuencias (más allá de la detección general)
                        else if (/(\d)\1{5,}/.test(String(numericValue)) || /(12345|23456|34567|45678|56789|00000)/.test(String(numericValue))) {
                            message = 'El precio contiene patrones numéricos repetitivos o secuenciales que lo hacen sospechoso.';
                        }
                    } else if (priceString.toLowerCase() === 'consultar') {
                        // "Consultar" es un valor válido, no hay mensaje de error.
                        message = '';
                    } else {
                        message = 'Formato de precio no válido.';
                    }
                }
                break;

            default:
                break;
        }
        return message;
    }, []); // Dependencias para useCallback (vacío ya que las regex son constantes)

    /**
     * Prepara el formulario para editar un servicio existente.
     * @param {object} service - El objeto servicio a editar.
     */
    const handleEdit = useCallback((service) => {
        setCurrentService(service);
        // Al abrir para editar, limpiar errores de validación. Se revalidarán al cambiar el input.
        setValidationErrors({});
        setIsFormOpen(true);
        setError('');
    }, []);

    /**
     * Cierra el modal del formulario y limpia el servicio actual.
     */
    const handleCancel = useCallback(() => {
        setIsFormOpen(false);
        setCurrentService(null);
        setValidationErrors({}); // Limpiar errores al cerrar
        setError('');
    }, []);

    /**
     * Maneja los cambios en los campos del formulario y activa la validación en tiempo real.
     * @param {object} e - El evento de cambio del input.
     */
    const handleInputChange = useCallback((e) => {
        const { name, value } = e.target;
        // Actualizar el estado del servicio actual
        setCurrentService(prev => ({
            ...prev,
            [name]: value
        }));

        // Validar el campo y actualizar los errores
        const updatedServiceData = { ...currentService, [name]: value }; // Usar una copia actualizada para la validación
        const errorMessage = validateField(name, value, updatedServiceData);
        setValidationErrors(prev => ({ ...prev, [name]: errorMessage }));
    }, [currentService, validateField]); // currentService es una dependencia porque updatedServiceData depende de ella.

    /**
     * Maneja el evento onBlur (cuando un input pierde el foco) para activar la validación.
     * @param {object} e - El evento de blur.
     */
    const handleInputBlur = useCallback((e) => {
        const { name, value, required } = e.target;
        // Solo valida si el campo tiene contenido o si es un campo requerido.
        if (value.trim() !== '' || required) {
            const errorMessage = validateField(name, value, currentService);
            setValidationErrors(prev => ({ ...prev, [name]: errorMessage }));
        }
    }, [currentService, validateField]);


    /**
     * Maneja la actualización de un servicio.
     */
    const handleSave = useCallback(async () => {
        // Validar todos los campos antes de guardar
        let errors = {};
        const fieldsToValidate = ['nombre', 'descripcion', 'precio'];
        fieldsToValidate.forEach(field => {
            const errorMessage = validateField(field, currentService[field], currentService);
            if (errorMessage) {
                errors[field] = errorMessage;
            }
        });

        setValidationErrors(errors);

        if (Object.keys(errors).length > 0) {
            showNotification('Por favor, corrige los errores en el formulario antes de guardar.', 'error');
            return;
        }

        setIsSubmitting(true);
        setError('');
        try {
            // Normalizar el precio a un número si no es "Consultar" antes de enviar
            const payload = { ...currentService };
            if (typeof payload.precio === 'string' && payload.precio.toLowerCase() !== 'consultar') {
                // Eliminar cualquier símbolo de moneda y separadores de miles, y reemplazar coma decimal por punto
                const numericPriceString = payload.precio.replace(/[^0-9,]/g, '').replace(/,/g, '.');
                payload.precio = parseFloat(numericPriceString);
            }

            // Llama a la API para actualizar el servicio
            const responseData = await authFetch(`/servicios/${currentService.id_servicio}`, {
                method: 'PUT',
                body: payload // Envía los datos completos del servicio
            });

            if (responseData.success && responseData.data) {
                setServices(prevServices => prevServices.map(s =>
                    s.id_servicio === currentService.id_servicio ? responseData.data : s
                ));
                showNotification(responseData.message || 'Servicio actualizado correctamente.');
                handleCancel(); // Cierra el modal
            } else {
                showNotification(responseData.message || 'Error al actualizar servicio.', 'error');
            }
        } catch (err) {
            console.error('Error al actualizar servicio:', err);
            showNotification(`Error al actualizar servicio: ${err.message}`, 'error');
        } finally {
            setIsSubmitting(false);
        }
    }, [currentService, authFetch, showNotification, handleCancel, setServices, setError, setIsSubmitting, validateField]);

    /**
     * Maneja la eliminación de un servicio.
     * @param {number} id - El ID del servicio a eliminar.
     */
    const handleDelete = useCallback(async (id) => {
        if (!window.confirm('¿Estás seguro de eliminar este servicio? Esta acción es irreversible.')) {
            return;
        }

        setIsSubmitting(true);
        setError('');
        try {
            // Llama a la API para eliminar el servicio
            const responseData = await authFetch(`/servicios/${id}`, {
                method: 'DELETE'
            });

            if (responseData.success) {
                setServices(prevServices => prevServices.filter(s => s.id_servicio !== id));
                showNotification(responseData.message || 'Servicio eliminado correctamente.');
            } else {
                showNotification(responseData.message || 'Error al eliminar servicio.', 'error');
            }
        } catch (err) {
            console.error('Error al eliminar servicio:', err);
            showNotification(`Error al eliminar servicio: ${err.message}`, 'error');
        } finally {
            setIsSubmitting(false);
        }
    }, [authFetch, showNotification, setServices, setError, setIsSubmitting]);

    /**
     * Prepara el formulario para agregar un nuevo servicio.
     */
    const handleAddNew = useCallback(() => {
        setCurrentService({
            nombre: '',
            descripcion: '',
            precio: ''
        });
        setValidationErrors({}); // Limpiar errores al abrir para añadir
        setIsFormOpen(true);
        setError('');
    }, []);

    /**
     * Maneja la creación de un nuevo servicio.
     */
    const handleCreate = useCallback(async () => {
        // Validar todos los campos antes de crear
        let errors = {};
        const fieldsToValidate = ['nombre', 'descripcion', 'precio'];
        fieldsToValidate.forEach(field => {
            const errorMessage = validateField(field, currentService[field], currentService);
            if (errorMessage) {
                errors[field] = errorMessage;
            }
        });

        setValidationErrors(errors);

        if (Object.keys(errors).length > 0) {
            showNotification('Por favor, corrige los errores en el formulario antes de guardar.', 'error');
            return;
        }

        setIsSubmitting(true);
        setError('');
        try {
            // Normalizar el precio a un número si no es "Consultar" antes de enviar
            const payload = { ...currentService };
            if (typeof payload.precio === 'string' && payload.precio.toLowerCase() !== 'consultar') {
                const numericPriceString = payload.precio.replace(/[^0-9,]/g, '').replace(/,/g, '.');
                payload.precio = parseFloat(numericPriceString);
            }

            // Llama a la API para crear un nuevo servicio
            const responseData = await authFetch('/servicios', {
                method: 'POST',
                body: payload
            });

            if (responseData.success && responseData.data && responseData.data.id_servicio) {
                setServices(prevServices => [...prevServices, responseData.data]);
                showNotification(responseData.message || 'Servicio creado correctamente.');
                handleCancel(); // Cierra el modal
            } else {
                showNotification(responseData.message || 'Error al crear servicio.', 'error');
            }
        } catch (err) {
            console.error('Error al crear servicio:', err);
            showNotification(`Error al crear servicio: ${err.message}`, 'error');
        } finally {
            setIsSubmitting(false);
        }
    }, [currentService, authFetch, showNotification, handleCancel, setServices, setError, setIsSubmitting, validateField]);

    // Formato de precio y duración (mantengo tus funciones aunque la duración no esté en el modelo actual)
    const formatPrice = useCallback((price) => {
        // Si el precio ya es una cadena como "$50.000" (lo cual puede venir así del backend o del input del usuario), lo devuelve directamente
        if (typeof price === 'string' && price.startsWith('$')) {
            return price;
        }
        // Si es un número, lo formatea como moneda COP
        if (typeof price === 'number') {
            return new Intl.NumberFormat('es-CO', {
                style: 'currency',
                currency: 'COP',
                minimumFractionDigits: 0, // No mostrar centavos si no son necesarios
                maximumFractionDigits: 2 // Máximo 2 decimales para centavos
            }).format(price);
        }
        // Si es la palabra "Consultar"
        if (typeof price === 'string' && price.toLowerCase() === 'consultar') {
            return 'Consultar';
        }
        // Para cualquier otro caso, o un precio no válido, devuelve "Consultar"
        return 'Consultar';
    }, []);


    const formatDuration = useCallback((duration) => {
        // Asumo que 'duration' no es parte de tu esquema de servicio actual,
        // pero mantengo la función si la necesitas en el futuro.
        return duration > 0 ? `${duration} min` : 'Variable';
    }, []);

    if (isLoading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner">
                    <FaSpinner className="spinner-icon" />
                </div>
                <p>Cargando servicios...</p>
            </div>
        );
    }

    if (error && services.length === 0) {
        return <div className="error-message"><FaInfoCircle className="icon" /> {error}</div>;
    }

    return (
        <div className="management-section">
            {/* Notificación */}
            <AnimatePresence>
                {notification && (
                    <motion.div
                        key="service-notification"
                        className={`notification ${notification.type}`}
                        initial={{ opacity: 0, y: -20, pointerEvents: 'none' }}
                        animate={{ opacity: 1, y: 0, pointerEvents: 'auto' }}
                        exit={{ opacity: 0, y: -20, pointerEvents: 'none' }}
                        transition={{ duration: 0.3 }}
                    >
                        <FaInfoCircle className="notification-icon" />
                        {notification.message}
                        <button className="close-notification" onClick={() => setNotification(null)}>
                            <FaTimes />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Modal de formulario */}
            <AnimatePresence>
                {isFormOpen && (
                    <motion.div
                        key="service-form-modal"
                        className="modal-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.div
                            className="modal-content"
                            initial={{ y: "-100vh", opacity: 0 }}
                            animate={{ y: "0", opacity: 1 }}
                            exit={{ y: "100vh", opacity: 0 }}
                            transition={{ type: "spring", stiffness: 120, damping: 20 }}
                        >
                            <button className="close-modal-btn" onClick={handleCancel} disabled={isSubmitting}>
                                <FaTimes />
                            </button>
                            <div className="modal-header">
                                <h3>
                                    <FaConciergeBell className="form-icon" />
                                    {currentService?.id_servicio ? 'Editar Servicio' : 'Nuevo Servicio'}
                                </h3>
                            </div>

                            <form onSubmit={currentService?.id_servicio ? handleSave : handleCreate}>
                                <div className="form-group">
                                    <label htmlFor="nombre">Nombre:*</label>
                                    <input
                                        type="text"
                                        id="nombre"
                                        name="nombre"
                                        value={currentService?.nombre || ''}
                                        onChange={handleInputChange}
                                        onBlur={handleInputBlur} // Añadido onBlur para validación
                                        placeholder="Ej: Consulta General"
                                        required
                                        disabled={isSubmitting}
                                    />
                                    {validationErrors.nombre && <span className="error-message-inline">{validationErrors.nombre}</span>}
                                </div>

                                <div className="form-group">
                                    <label htmlFor="descripcion">Descripción:*</label>
                                    <textarea
                                        id="descripcion"
                                        name="descripcion"
                                        value={currentService?.descripcion || ''}
                                        onChange={handleInputChange}
                                        onBlur={handleInputBlur} // Añadido onBlur para validación
                                        rows="4"
                                        placeholder="Descripción detallada del servicio (ej. 'Revisión completa de salud, vacunas y desparasitación...')"
                                        required
                                        disabled={isSubmitting}
                                    />
                                    {validationErrors.descripcion && <span className="error-message-inline">{validationErrors.descripcion}</span>}
                                </div>

                                <div className="form-group">
                                    <label htmlFor="precio">Precio:*</label>
                                    <input
                                        type="text" // Usar text para permitir "$", comas y "Consultar"
                                        id="precio"
                                        name="precio"
                                        value={currentService?.precio || ''}
                                        onChange={handleInputChange}
                                        onBlur={handleInputBlur} // Añadido onBlur para validación
                                        placeholder="Ej: $50.000 o Consultar"
                                        required
                                        disabled={isSubmitting}
                                    />
                                    {validationErrors.precio && <span className="error-message-inline">{validationErrors.precio}</span>}
                                </div>

                                <div className="form-actions">
                                    <button type="button" onClick={handleCancel} className="cancel-btn" disabled={isSubmitting}>
                                        <FaTimes /> Cancelar
                                    </button>
                                    <button type="submit" className="save-btn" disabled={isSubmitting}>
                                        {isSubmitting ? <><FaSpinner className="spinner-icon" /> Guardando...</> : <><FaSave /> Guardar</>}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="admin-content-header">
                <h2><FaConciergeBell className="header-icon" /> Gestión de Servicios</h2>
                <div className="header-actions">
                    <div className="search-box">
                        <FaSearch className="search-icon" />
                        <input
                            type="text"
                            placeholder="Buscar servicios..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            disabled={isLoading || isSubmitting}
                        />
                        {searchTerm && (
                            <button className="clear-search" onClick={() => setSearchTerm('')} disabled={isLoading || isSubmitting}>
                                <FaTimes />
                            </button>
                        )}
                    </div>
                    <button onClick={handleAddNew} className="add-btn" disabled={isLoading || isSubmitting}>
                        <FaPlus /> Nuevo Servicio
                    </button>
                </div>
            </div>

            <div className="admin-table-container">
                {filteredServices.length > 0 ? (
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Nombre</th>
                                <th>Descripción</th>
                                <th>Precio</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredServices.map(service => (
                                <tr key={service.id_servicio}>
                                    <td>{service.id_servicio}</td>
                                    <td>{service.nombre}</td>
                                    <td>{service.descripcion}</td>
                                    <td>{formatPrice(service.precio)}</td>
                                    <td className="actions-cell">
                                        <button onClick={() => handleEdit(service)} className="edit-btn" disabled={isLoading || isSubmitting} title="Editar Servicio">
                                            <FaEdit />
                                        </button>
                                        <button onClick={() => handleDelete(service.id_servicio)} className="delete-btn" disabled={isLoading || isSubmitting} title="Eliminar Servicio">
                                            <FaTrash />
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
                            'No se encontraron servicios que coincidan con la búsqueda.' :
                            'No hay servicios registrados.'}
                        <button onClick={handleAddNew} className="add-btn" disabled={isLoading || isSubmitting}>
                            <FaPlus /> Agregar Servicio
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default ServicesManagement;
