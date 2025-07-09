import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faClock,
    faStethoscope,
    faCalendarCheck,
    faTag,
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
    // Formato de moneda COP (Pesos Colombianos) sin decimales
    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(price);
};

// Componente para el esqueleto de carga de la tarjeta
const TarjetaServicioSkeleton = () => (
    <div className={`${styles.tsServiceCard} ${styles.tsSkeletonCard}`}>
        {/* Espacio para el badge de categoría */}
        <div className={styles.tsCategoryBadge}>
            <Skeleton width={80} />
        </div>
        <div className={styles.tsContent}>
            {/* Esqueleto para el título */}
            <Skeleton height={24} width="80%" className={styles.tsTitle} />
            {/* Esqueleto para la descripción */}
            <Skeleton count={3} className={styles.tsDescription} />
            {/* Esqueleto para la grilla de detalles */}
            <div className={styles.tsDetailsGrid}>
                <Skeleton width={100} />
                <Skeleton width={120} />
            </div>
        </div>
        <div className={styles.tsFooter}>
            {/* Esqueleto para el precio */}
            <Skeleton width={70} height={20} />
            {/* Esqueleto para el botón */}
            <Skeleton width={100} height={40} />
        </div>
    </div>
);


const TarjetaServicio = ({
    servicio,
    isLoading = false // Propiedad para controlar el estado de carga
}) => {
    const navigate = useNavigate(); // Hook para la navegación programática

    // Si isLoading es true, muestra el esqueleto de carga
    if (isLoading) {
        return <TarjetaServicioSkeleton />;
    }

    // Desestructuración de las propiedades del objeto servicio
    const { id_servicio, nombre, descripcion, precio, duracion, especialista, categoria } = servicio;

    // Función para manejar el clic en el botón "Agendar"
    const handleAgendar = () => {
        try {
            // Simulación de una respuesta de agendamiento (éxito o error aleatorio)
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
                // Redirige al usuario a la página de agendamiento de citas,
                // pasando el ID y nombre del servicio como estado.
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

    // --- SANEAR LA DESCRIPCIÓN AQUÍ ---
    // 1. Reemplaza cualquier tipo de salto de línea (\r\n, \n, \r) con un solo espacio.
    // 2. Reemplaza dos o más espacios consecutivos con un solo espacio.
    // 3. Elimina espacios en blanco al principio y al final de la cadena.
    const sanitizedDescription = descripcion
        .replace(/(\r\n|\n|\r)/gm, " ")
        .replace(/\s\s+/g, ' ')
        .trim();

    // Corta la descripción si es muy larga y añade "..." con un enlace "Leer más"
    const displayDescription = sanitizedDescription.length > 100 ? `${sanitizedDescription.substring(0, 100)}...` : sanitizedDescription;
    const showReadMore = sanitizedDescription.length > 100;

    return (
        <motion.div
            className={styles.tsServiceCard} // Clase principal de la tarjeta
            initial={{ opacity: 0, y: 50 }} // Animación inicial (invisible, un poco abajo)
            animate={{ opacity: 1, y: 0 }} // Animación al montar (aparece, sube)
            exit={{ opacity: 0, y: -20 }} // Animación al desmontar (desaparece, sube ligeramente)
            transition={{ duration: 0.3 }} // Duración de las transiciones
            // Efecto al pasar el mouse por encima (escala y sombra)
            whileHover={{ scale: 1.03, boxShadow: '0 10px 30px rgba(0, 0, 0, 0.15)' }}
            aria-label={`Tarjeta de servicio: ${nombre}`} // Etiqueta de accesibilidad
        >
            {/* Insignia de categoría, solo se muestra si hay una categoría */}
            {categoria && (
                <div className={styles.tsCategoryBadge}>
                    <FontAwesomeIcon icon={faTag} className={styles.tsCategoryIcon} title="Categoría del servicio" />
                    <span>{categoria}</span>
                </div>
            )}

            {/* Contenido principal de la tarjeta */}
            <div className={styles.tsContent}>
                <h3 className={styles.tsTitle}>{nombre}</h3>
                <p className={styles.tsDescription}>
                    {displayDescription} {/* Descripción (puede ser truncada) */}
                    {showReadMore && ( // Muestra "Leer más" si la descripción original era más larga
                        <Link to={`/usuario/servicios/${id_servicio}`} className={styles.tsReadMore}>
                            Leer más
                        </Link>
                    )}
                </p>

                {/* Grilla de detalles (duración y especialista) */}
                <div className={styles.tsDetailsGrid}>
                    <div className={styles.tsDetailItem}>
                        <FontAwesomeIcon icon={faClock} className={styles.tsDetailIcon} title="Duración estimada" />
                        <span>{duracion || 'Tiempo variable'}</span> {/* Muestra duración o un texto por defecto */}
                    </div>
                    <div className={styles.tsDetailItem}>
                        <FontAwesomeIcon icon={faStethoscope} className={styles.tsDetailIcon} title="Especialista a cargo" />
                        <span>{especialista || 'Profesional General'}</span> {/* Muestra especialista o un texto por defecto */}
                    </div>
                </div>
            </div>

            {/* Pie de página de la tarjeta (precio y botón de agendar) */}
            <div className={styles.tsFooter}>
                <div className={styles.tsPrice}>{formatPrice(precio)}</div> {/* Precio formateado */}
                <motion.button
                    className={styles.tsBookButton}
                    onClick={handleAgendar}
                    whileTap={{ scale: 0.95 }} // Efecto de escala al hacer clic
                    aria-label={`Agendar cita para ${nombre}`}
                    title={`Agendar cita para ${nombre}`}
                >
                    <FontAwesomeIcon icon={faCalendarCheck} /> Agendar
                </motion.button>
            </div>
            {/* Contenedor para las notificaciones Toastify */}
            <ToastContainer />
        </motion.div>
    );
};

// Definición de PropTypes para validar las propiedades del componente
TarjetaServicio.propTypes = {
    servicio: PropTypes.shape({
        id_servicio: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
        nombre: PropTypes.string.isRequired,
        descripcion: PropTypes.string.isRequired,
        precio: PropTypes.number.isRequired,
        duracion: PropTypes.string,
        especialista: PropTypes.string,
        categoria: PropTypes.string,
    }).isRequired,
    isLoading: PropTypes.bool,
};

export default TarjetaServicio;