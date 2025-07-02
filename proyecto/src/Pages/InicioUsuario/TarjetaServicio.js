import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faClock,
    faStethoscope,
    faCalendarCheck,
    faTag,
    // faInfoCircle, // Removed faInfoCircle
    // faCircleXmark // Removed faCircleXmark as image is removed
} from '@fortawesome/free-solid-svg-icons';
import { motion } from 'framer-motion';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import styles from './Styles/TarjetaServicio.module.css';

// Utility function to format price
const formatPrice = (price) => {
    if (typeof price !== 'number' || isNaN(price)) {
        return '';
    }
    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(price);
};

// Componente para el esqueleto de carga
const TarjetaServicioSkeleton = () => (
    <div className={styles.serviceCard + ' ' + styles.skeletonCard}>
        <div className={styles.categoryBadge}>
            <Skeleton width={80} />
        </div>
        <div className={styles.content}>
            <Skeleton height={24} width="80%" className={styles.title} />
            <Skeleton count={3} className={styles.description} />
            <div className={styles.detailsGrid}>
                <Skeleton width={100} />
                <Skeleton width={120} />
            </div>
        </div>
        <div className={styles.footer}>
            <Skeleton width={70} height={20} />
            <Skeleton width={100} height={40} />
        </div>
    </div>
);


const TarjetaServicio = ({
    servicio,
    isLoading = false
}) => {
    const navigate = useNavigate();

    // const [imageError, setImageError] = React.useState(false); // Removed image error state

    if (isLoading) {
        return <TarjetaServicioSkeleton />;
    }

    const { id_servicio, nombre, descripcion, precio, duracion, especialista, categoria } = servicio; // Removed imagen_url

    // const defaultImageUrl = 'https://via.placeholder.com/400x200?text=Servicio+Veterinario'; // Removed default image URL

    // const handleImageError = (e) => { // Removed handleImageError
    //     setImageError(true);
    //     e.target.onerror = null;
    //     e.target.src = defaultImageUrl;
    // };

    const handleAgendar = () => {
        try {
            const success = Math.random() > 0.5;

            if (success) {
                toast.success(`Cita para "${nombre}" agendada con éxito!`, {
                    position: "bottom-right",
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                });
                navigate('/usuario/citas/agendar', { state: { servicioId: id_servicio, servicioNombre: nombre } });
            } else {
                toast.error(`Error al agendar cita para "${nombre}". Inténtalo de nuevo.`, {
                    position: "bottom-right",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                });
            }
        } catch (error) {
            console.error("Error al agendar:", error);
            toast.error("Ocurrió un error inesperado al agendar.", {
                position: "bottom-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            });
        }
    };

    const displayDescription = descripcion.length > 100 ? `${descripcion.substring(0, 100)}...` : descripcion;
    const showReadMore = descripcion.length > 100;

    return (
        <motion.div
            className={styles.serviceCard}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            whileHover={{ scale: 1.03, boxShadow: '0 10px 30px rgba(0, 0, 0, 0.15)' }}
            aria-label={`Tarjeta de servicio: ${nombre}`}
        >
            {/* Removed imageWrapper div */}

            {categoria && (
                <div className={styles.categoryBadge}>
                    <FontAwesomeIcon icon={faTag} className={styles.categoryIcon} title="Categoría del servicio" />
                    <span>{categoria}</span>
                </div>
            )}

            <div className={styles.content}>
                <h3 className={styles.title}>{nombre}</h3>
                <p className={styles.description}>
                    {displayDescription}
                    {showReadMore && (
                        <Link to={`/usuario/servicios/${id_servicio}`} className={styles.readMore}>
                            Leer más
                        </Link>
                    )}
                </p>

                <div className={styles.detailsGrid}>
                    <div className={styles.detailItem}>
                        <FontAwesomeIcon icon={faClock} className={styles.detailIcon} title="Duración estimada" />
                        <span>{duracion || 'Tiempo variable'}</span>
                    </div>
                    <div className={styles.detailItem}>
                        <FontAwesomeIcon icon={faStethoscope} className={styles.detailIcon} title="Especialista a cargo" />
                        <span>{especialista || 'Profesional General'}</span>
                    </div>
                </div>
            </div>

            <div className={styles.footer}>
                <div className={styles.price}>{formatPrice(precio)}</div>
                {/* Removed 'Detalles' Link */}
                <button
                    className={styles.bookButton}
                    onClick={handleAgendar}
                    whileTap={{ scale: 0.95 }}
                    aria-label={`Agendar cita para ${nombre}`}
                    title={`Agendar cita para ${nombre}`}
                >
                    <FontAwesomeIcon icon={faCalendarCheck} /> Agendar
                </button>
            </div>
            <ToastContainer />
        </motion.div>
    );
};

TarjetaServicio.propTypes = {
    servicio: PropTypes.shape({
        id_servicio: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
        nombre: PropTypes.string.isRequired,
        descripcion: PropTypes.string.isRequired,
        precio: PropTypes.number.isRequired,
        duracion: PropTypes.string,
        especialista: PropTypes.string,
        categoria: PropTypes.string,
        // imagen_url: PropTypes.string, // Removed imagen_url from propTypes
    }).isRequired,
    isLoading: PropTypes.bool,
};

export default TarjetaServicio;