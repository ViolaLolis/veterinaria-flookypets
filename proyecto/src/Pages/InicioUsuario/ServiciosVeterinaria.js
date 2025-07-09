import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faConciergeBell, faSearch, faInfoCircle, faSpinner, faBroom } from '@fortawesome/free-solid-svg-icons';
import TarjetaServicio from './TarjetaServicio'; // Asegúrate de que TarjetaServicio esté en la misma carpeta o ajusta la ruta
import styles from './Styles/ServiciosVeterinaria.module.css'; // Importar como CSS Module
import { authFetch } from '../../utils/api'; // Importar la función authFetch
import { toast } from 'react-toastify'; // Import toast for user feedback

function ServiciosUsuario() {
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
    }, []);

    useEffect(() => {
        fetchServices();
    }, [fetchServices]);

    // --- Search Filtering (Optimized with useMemo) ---
    const filteredServices = useMemo(() => {
        if (!searchTerm) {
            return services;
        }
        const lowerCaseSearchTerm = searchTerm.toLowerCase();
        return services.filter(service =>
            service.nombre.toLowerCase().includes(lowerCaseSearchTerm) ||
            service.descripcion.toLowerCase().includes(lowerCaseSearchTerm) ||
            (service.categoria && service.categoria.toLowerCase().includes(lowerCaseSearchTerm)) ||
            (service.especialista && service.especialista.toLowerCase().includes(lowerCaseSearchTerm))
        );
    }, [searchTerm, services]);

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
            <div className={styles.suLoadingContainer} aria-live="polite" aria-busy="true">
                <FontAwesomeIcon icon={faSpinner} spin className={styles.suSpinnerIcon} />
                <p>Cargando servicios...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.suErrorMessage} role="alert">
                <FontAwesomeIcon icon={faInfoCircle} className={styles.suErrorIcon} />
                <p>{error}</p>
                <button onClick={fetchServices} className={styles.suRetryButton}>
                    Reintentar
                </button>
            </div>
        );
    }

    return (
        <motion.div
            className={styles.suServicesDashboard}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
        >
            <div className={styles.suDashboardHeader}>
                <div className={styles.suHeaderTitle}>
                    <FontAwesomeIcon icon={faConciergeBell} className={styles.suTitleIcon} />
                    <h2>Servicios Disponibles</h2>
                </div>
                <div className={styles.suSearchContainer}>
                    <input
                        type="text"
                        placeholder="Buscar por nombre, descripción, categoría o especialista..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                        className={styles.suSearchInput}
                        aria-label="Buscar servicios"
                    />
                    {searchTerm && (
                        <button
                            onClick={handleClearSearch}
                            className={styles.suClearSearchButton}
                            aria-label="Limpiar búsqueda"
                            title="Limpiar búsqueda"
                        >
                            <FontAwesomeIcon icon={faBroom} />
                        </button>
                    )}
                    <FontAwesomeIcon icon={faSearch} className={styles.suSearchIcon} />
                </div>
            </div>

            {filteredServices.length > 0 ? (
                <div className={styles.suServicesGrid}>
                    <AnimatePresence mode="popLayout">
                        {filteredServices.map(service => (
                            <TarjetaServicio key={service.id_servicio} servicio={service} />
                        ))}
                    </AnimatePresence>
                </div>
            ) : (
                <div className={styles.suNoResults}>
                    <FontAwesomeIcon icon={faInfoCircle} className={styles.suInfoIcon} />
                    <p>{searchTerm ? `No se encontraron resultados para "${searchTerm}".` : 'Actualmente no hay servicios disponibles.'}</p>
                    {searchTerm && (
                        <button onClick={handleClearSearch} className={styles.suClearSearchButtonInNoResults}>
                            Limpiar búsqueda
                        </button>
                    )}
                </div>
            )}
        </motion.div>
    );
}

export default ServiciosUsuario;