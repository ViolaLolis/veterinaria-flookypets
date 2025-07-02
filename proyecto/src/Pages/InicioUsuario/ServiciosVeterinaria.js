import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faConciergeBell, faSearch, faInfoCircle, faSpinner, faBroom } from '@fortawesome/free-solid-svg-icons'; // Added faBroom for clear search
import TarjetaServicio from './TarjetaServicio';
import styles from './Styles/ServiciosVeterinaria.module.css';
import { authFetch } from './api';
import { toast } from 'react-toastify'; // Import toast for user feedback

function ServiciosVeterinaria() {
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
                setServices(response.data || []); // Ensure it's an array, even if empty
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
            <div className={styles.loadingContainer} aria-live="polite" aria-busy="true">
                <FontAwesomeIcon icon={faSpinner} spin className={styles.spinnerIcon} />
                <p>Cargando servicios...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.errorMessage} role="alert">
                <FontAwesomeIcon icon={faInfoCircle} className={styles.errorIcon} />
                <p>{error}</p>
                <button onClick={fetchServices} className={styles.retryButton}>
                    Reintentar
                </button>
            </div>
        );
    }

    return (
        <motion.div
            className={styles.servicesDashboard}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
        >
            <div className={styles.dashboardHeader}>
                <div className={styles.headerTitle}>
                    <FontAwesomeIcon icon={faConciergeBell} className={styles.titleIcon} />
                    <h2>Servicios Disponibles</h2> {/* Changed title for better clarity */}
                </div>
                <div className={styles.searchContainer}>
                    <input
                        type="text"
                        placeholder="Buscar por nombre, descripción, categoría o especialista..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                        className={styles.searchInput}
                        aria-label="Buscar servicios"
                    />
                    {searchTerm && ( // Show clear button only when there's a search term
                        <button
                            onClick={handleClearSearch}
                            className={styles.clearSearchButton}
                            aria-label="Limpiar búsqueda"
                            title="Limpiar búsqueda"
                        >
                            <FontAwesomeIcon icon={faBroom} />
                        </button>
                    )}
                    <FontAwesomeIcon icon={faSearch} className={styles.searchIcon} />
                </div>
            </div>

            {filteredServices.length > 0 ? (
                <div className={styles.servicesGrid}>
                    <AnimatePresence mode="popLayout"> {/* Use mode="popLayout" for smoother exit animations */}
                        {filteredServices.map(service => (
                            <TarjetaServicio key={service.id_servicio} servicio={service} />
                        ))}
                    </AnimatePresence>
                </div>
            ) : (
                <div className={styles.noResults}>
                    <FontAwesomeIcon icon={faInfoCircle} className={styles.infoIcon} />
                    <p>{searchTerm ? `No se encontraron resultados para "${searchTerm}".` : 'Actualmente no hay servicios disponibles.'}</p>
                    {searchTerm && ( // Suggest clearing search if no results
                        <button onClick={handleClearSearch} className={styles.clearSearchButtonInNoResults}>
                            Limpiar búsqueda
                        </button>
                    )}
                </div>
            )}
        </motion.div>
    );
}

export default ServiciosVeterinaria;