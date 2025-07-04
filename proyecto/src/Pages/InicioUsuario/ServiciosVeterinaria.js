import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faConciergeBell, faSearch, faInfoCircle, faSpinner, faBroom } from '@fortawesome/free-solid-svg-icons';
import TarjetaServicio from './TarjetaServicio'; // Asegúrate de que TarjetaServicio esté en la misma carpeta o ajusta la ruta
import styles from './Styles/ServiciosVeterinaria.module.css'; // Importar el CSS sin .module
import { authFetch } from '../../utils/api'; // Importar la función authFetch
import { toast } from 'react-toastify'; // Import toast for user feedback

function ServiciosUsuario() { // Renombrado de ServiciosVeterinaria a ServiciosUsuario
    const [services, setServices] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    // --- Data Fetching ---
    const fetchServices = useCallback(async () => {
        setIsLoading(true);
        setError(''); // Clear previous errors
        try {
            const response = await authFetch('/servicios'); // Endpoint para obtener servicios
            if (response.success) {
                // Ensure precio is a number
                const fetchedServices = response.data.map(service => ({
                    ...service,
                    precio: typeof service.precio === 'string' ? parseFloat(service.precio) : service.precio
                }));
                setServices(fetchedServices || []); // Ensure it's an array, even if empty
            } else {
                // More specific error message if available
                setError(response.message || 'Error al cargar los servicios. Por favor, inténtalo de nuevo.');
                toast.error(response.message || 'Error al cargar los servicios.'); // User feedback
            }
        } catch (err) {
            console.error("Error fetching services:", err);
            setError('Error de conexión con el servidor. No se pudieron cargar los servicios.');
            toast.error('Error de conexión al cargar servicios.'); // User feedback
        } finally {
            setIsLoading(false);
        }
    }, []); // No dependencies, runs once on mount

    useEffect(() => {
        fetchServices();
    }, [fetchServices]); // `fetchServices` is stable due to useCallback

    // --- Search Filtering (Optimized with useMemo) ---
    const filteredServices = useMemo(() => {
        if (!searchTerm) {
            return services; // Return all services if search term is empty
        }
        const lowerCaseSearchTerm = searchTerm.toLowerCase();
        return services.filter(service =>
            service.nombre.toLowerCase().includes(lowerCaseSearchTerm) ||
            service.descripcion.toLowerCase().includes(lowerCaseSearchTerm) ||
            (service.categoria && service.categoria.toLowerCase().includes(lowerCaseSearchTerm)) || // Search by category
            (service.especialista && service.especialista.toLowerCase().includes(lowerCaseSearchTerm)) // Search by specialist
        );
    }, [searchTerm, services]); // Recalculate only when searchTerm or services change

    // --- Handlers ---
    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleClearSearch = () => {
        setSearchTerm('');
    };

    // --- Render Logic ---
    if (isLoading) {
        return (
            <div className="loading-container" aria-live="polite" aria-busy="true">
                <FontAwesomeIcon icon={faSpinner} spin className="spinner-icon" />
                <p>Cargando servicios...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="error-message" role="alert">
                <FontAwesomeIcon icon={faInfoCircle} className="error-icon" />
                <p>{error}</p>
                <button onClick={fetchServices} className="retry-button">
                    Reintentar
                </button>
            </div>
        );
    }

    return (
        <motion.div
            className="services-dashboard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
        >
            <div className="dashboard-header">
                <div className="header-title">
                    <FontAwesomeIcon icon={faConciergeBell} className="title-icon" />
                    <h2>Servicios Disponibles</h2>
                </div>
                <div className="search-container">
                    <input
                        type="text"
                        placeholder="Buscar por nombre, descripción, categoría o especialista..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                        className="search-input"
                        aria-label="Buscar servicios"
                    />
                    {searchTerm && ( // Show clear button only when there's a search term
                        <button
                            onClick={handleClearSearch}
                            className="clear-search-button"
                            aria-label="Limpiar búsqueda"
                            title="Limpiar búsqueda"
                        >
                            <FontAwesomeIcon icon={faBroom} />
                        </button>
                    )}
                    <FontAwesomeIcon icon={faSearch} className="search-icon" />
                </div>
            </div>

            {filteredServices.length > 0 ? (
                <div className="services-grid">
                    <AnimatePresence mode="popLayout">
                        {filteredServices.map(service => (
                            <TarjetaServicio key={service.id_servicio} servicio={service} />
                        ))}
                    </AnimatePresence>
                </div>
            ) : (
                <div className="no-results">
                    <FontAwesomeIcon icon={faInfoCircle} className="info-icon" />
                    <p>{searchTerm ? `No se encontraron resultados para "${searchTerm}".` : 'Actualmente no hay servicios disponibles.'}</p>
                    {searchTerm && ( // Suggest clearing search if no results
                        <button onClick={handleClearSearch} className="clear-search-button-in-no-results">
                            Limpiar búsqueda
                        </button>
                    )}
                </div>
            )}
        </motion.div>
    );
}

export default ServiciosUsuario;
