import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faConciergeBell, faSearch, faInfoCircle, faSpinner } from '@fortawesome/free-solid-svg-icons';
import TarjetaServicio from './TarjetaServicio'; // Asegúrate de que esta importación sea correcta
import styles from './Styles/ServiciosVeterinaria.module.css'; // Asegúrate de que este CSS exista
import { authFetch } from './api'; // Importa la función authFetch

function ServiciosVeterinaria() {
    const [services, setServices] = useState([]);
    const [filteredServices, setFilteredServices] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchServices = useCallback(async () => {
        setIsLoading(true);
        setError('');
        try {
            const response = await authFetch('/servicios'); // Endpoint para obtener servicios
            if (response.success) {
                setServices(response.data);
                setFilteredServices(response.data); // Inicialmente, mostrar todos los servicios
            } else {
                setError(response.message || 'Error al cargar los servicios.');
            }
        } catch (err) {
            console.error("Error fetching services:", err);
            setError('Error de conexión al servidor.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchServices();
    }, [fetchServices]);

    useEffect(() => {
        const results = services.filter(service =>
            service.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
            service.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredServices(results);
    }, [searchTerm, services]);

    if (isLoading) {
        return (
            <div className={styles.loadingContainer}>
                <FontAwesomeIcon icon={faSpinner} spin className={styles.spinnerIcon} />
                <p>Cargando servicios...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.errorMessage}>
                <FontAwesomeIcon icon={faInfoCircle} className={styles.errorIcon} />
                <p>{error}</p>
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
                    <h2>Gestión de Servicios</h2>
                </div>
                <div className={styles.searchContainer}>
                    <input
                        type="text"
                        placeholder="Buscar servicios..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className={styles.searchInput}
                    />
                    <FontAwesomeIcon icon={faSearch} className={styles.searchIcon} />
                </div>
            </div>

            {filteredServices.length > 0 ? (
                <div className={styles.servicesGrid}>
                    <AnimatePresence>
                        {filteredServices.map(service => (
                            <TarjetaServicio key={service.id_servicio} servicio={service} />
                        ))}
                    </AnimatePresence>
                </div>
            ) : (
                <div className={styles.noResults}>
                    <FontAwesomeIcon icon={faInfoCircle} className={styles.infoIcon} />
                    <p>{searchTerm ? 'No se encontraron servicios que coincidan con la búsqueda.' : 'No hay servicios registrados.'}</p>
                </div>
            )}
        </motion.div>
    );
}

export default ServiciosVeterinaria;
