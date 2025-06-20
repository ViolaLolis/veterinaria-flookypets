import React, { useState, useEffect, useCallback } from 'react';
import { FaTimes, FaSpinner, FaInfoCircle, FaUser, FaPaw, FaCalendarAlt, FaWeight, FaRulerCombined, FaPalette, FaMicrochip, FaVenusMars, FaBirthdayCake, FaPhone, FaMapMarkerAlt, FaIdCard, FaEnvelope } from 'react-icons/fa'; // Agregué FaEnvelope para el email
import { motion } from 'framer-motion';
import { authFetch } from './api'; // Asegúrate de que la ruta sea correcta a tu api.js
import './Styles/AdminStyles.css'; // Estilos generales de administración
/**
 * Componente AdminUserDetail
 * Muestra los detalles completos de un usuario y sus mascotas asociadas en un modal.
 * @param {object} props - Propiedades del componente.
 * @param {number} props.userId - ID del usuario a mostrar.
 * @param {object} props.user - Objeto del usuario logueado (para authFetch).
 * @param {function} props.onClose - Función para cerrar el modal.
 */
function AdminUserDetail({ userId, user, onClose }) {
    // Estados para almacenar la información del usuario, sus mascotas, carga y errores
    const [userDetails, setUserDetails] = useState(null);
    const [userPets, setUserPets] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    /**
     * Función para formatear la fecha de YYYY-MM-DD a DD/MM/YYYY.
     * Si la fecha incluye información de tiempo, también la formatea.
     * @param {string} dateString - La fecha en formato 'YYYY-MM-DD' o 'YYYY-MM-DD HH:MM:SS'.
     * @returns {string} La fecha en formato 'DD/MM/YYYY' o 'N/A' si es inválida.
     */
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        try {
            // Intenta parsear como fecha ISO para manejar diferentes formatos de backend
            const date = new Date(dateString);

            // Verifica si la fecha es válida. Si Date() recibe una cadena inválida, retorna "Invalid Date"
            if (isNaN(date.getTime())) {
                // Si falla, intenta un parseo manual para el formato YYYY-MM-DD
                const parts = dateString.split(' ')[0].split('-'); // Toma solo la parte de la fecha
                if (parts.length === 3) {
                    const [year, month, day] = parts;
                    return `${day}/${month}/${year}`;
                }
                return 'Formato de fecha inválido'; // No se pudo formatear
            }

            const day = String(date.getUTCDate()).padStart(2, '0');
            const month = String(date.getUTCMonth() + 1).padStart(2, '0'); // Meses son 0-index
            const year = date.getUTCFullYear();
            return `${day}/${month}/${year}`;
        } catch (e) {
            console.error("Error formatting date:", e);
            return 'Error de formato';
        }
    };


    /**
     * useCallback para la carga de datos del usuario y sus mascotas.
     * Se ejecuta cuando userId o el token del usuario cambian.
     */
    const fetchUserData = useCallback(async () => {
        if (!userId || !user?.token) {
            setError('No se pudo cargar la información del usuario. ID o token no proporcionados.');
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setError('');
        try {
            // 1. Obtener detalles del usuario
            const userResponse = await authFetch(`/usuarios/${userId}`);
            if (userResponse.success && userResponse.data) {
                setUserDetails(userResponse.data);
            } else {
                setError(userResponse.message || 'Error al cargar detalles del usuario.');
                setIsLoading(false);
                return; // Detener si no se puede cargar el usuario
            }

            // 2. Obtener mascotas del usuario
            // Asegúrate de que tu backend soporta el filtro por id_propietario
            const petsResponse = await authFetch(`/mascotas?id_propietario=${userId}`);
            if (petsResponse.success && Array.isArray(petsResponse.data)) {
                setUserPets(petsResponse.data);
            } else {
                console.warn('No se pudieron cargar las mascotas del usuario o no hay mascotas.');
                setUserPets([]); // Asegurarse de que sea un array vacío si falla
            }

        } catch (err) {
            console.error('Error fetching user and pet details:', err);
            setError(`Error al cargar datos: ${err.message}`);
        } finally {
            setIsLoading(false);
        }
    }, [userId, user, authFetch]);

    // Efecto para llamar a la función de carga de datos al montar o cambiar dependencias
    useEffect(() => {
        fetchUserData();
    }, [fetchUserData]);

    // Renderizado del componente
    if (isLoading) {
        return (
            <motion.div
                className="modal-overlay" // Usa overlay para que el spinner esté centrado en la pantalla
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
            >
                <motion.div
                    className="modal-content modal-detail-content"
                    initial={{ y: "-100vh", opacity: 0 }}
                    animate={{ y: "0", opacity: 1 }}
                    exit={{ y: "100vh", opacity: 0 }}
                    transition={{ type: "spring", stiffness: 120, damping: 20 }}
                >
                    <div className="loading-container">
                        <FaSpinner className="spinner-icon" />
                        <p>Cargando detalles del usuario...</p>
                    </div>
                </motion.div>
            </motion.div>
        );
    }

    if (error) {
        return (
            <motion.div
                className="modal-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
            >
                <motion.div
                    className="modal-content modal-detail-content"
                    initial={{ y: "-100vh", opacity: 0 }}
                    animate={{ y: "0", opacity: 1 }}
                    exit={{ y: "100vh", opacity: 0 }}
                    transition={{ type: "spring", stiffness: 120, damping: 20 }}
                >
                    <button className="close-modal-btn" onClick={onClose}>
                        <FaTimes />
                    </button>
                    <div className="error-message">
                        <FaInfoCircle className="icon" />
                        <p>{error}</p>
                    </div>
                    <div className="modal-footer">
                        <button onClick={onClose} className="cancel-btn">
                            <FaTimes /> Cerrar
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        );
    }

    if (!userDetails) {
        return (
            <motion.div
                className="modal-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
            >
                <motion.div
                    className="modal-content modal-detail-content"
                    initial={{ y: "-100vh", opacity: 0 }}
                    animate={{ y: "0", opacity: 1 }}
                    exit={{ y: "100vh", opacity: 0 }}
                    transition={{ type: "spring", stiffness: 120, damping: 20 }}
                >
                    <button className="close-modal-btn" onClick={onClose}>
                        <FaTimes />
                    </button>
                    <div className="no-results">
                        <FaInfoCircle className="info-icon" />
                        <p>No se encontraron detalles para este usuario.</p>
                    </div>
                    <div className="modal-footer">
                        <button onClick={onClose} className="cancel-btn">
                            <FaTimes /> Cerrar
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        );
    }

    // Renderizado de los detalles del usuario
    return (
        <motion.div
            className="modal-content modal-detail-content"
            initial={{ y: "-100vh", opacity: 0 }}
            animate={{ y: "0", opacity: 1 }}
            exit={{ y: "100vh", opacity: 0 }}
            transition={{ type: "spring", stiffness: 120, damping: 20 }}
        >
            <button className="close-modal-btn" onClick={onClose}>
                <FaTimes />
            </button>
            <div className="user-detail-header">
                <h3><FaUser /> Detalles del Propietario: {userDetails.nombre} {userDetails.apellido}</h3>
            </div>

            <div className="user-detail-info">
                <div className="info-item">
                    <strong>ID:</strong> <span>{userDetails.id}</span>
                </div>
                <div className="info-item">
                    <strong>Email:</strong> <FaEnvelope className="icon" /> <span>{userDetails.email}</span>
                </div>
                <div className="info-item">
                    <strong>Teléfono:</strong> <FaPhone className="icon" /> <span>{userDetails.telefono}</span>
                </div>
                <div className="info-item">
                    <strong>Rol:</strong> <FaUser className="icon" /> <span className="capitalize">{userDetails.role}</span>
                </div>
                <div className="info-item">
                    <strong>Estado:</strong>
                    <span className={`status-badge ${userDetails.active ? 'active' : 'inactive'}`}>
                        {userDetails.active ? 'Activo' : 'Inactivo'}
                    </span>
                </div>
                <div className="info-item">
                    <strong>Dirección:</strong> <FaMapMarkerAlt className="icon" /> <span>{userDetails.direccion || 'N/A'}</span>
                </div>
                <div className="info-item">
                    <strong>Tipo Documento:</strong> <FaIdCard className="icon" /> <span>{userDetails.tipo_documento || 'N/A'}</span>
                </div>
                <div className="info-item">
                    <strong>Número Documento:</strong> <FaIdCard className="icon" /> <span>{userDetails.numero_documento || 'N/A'}</span>
                </div>
                <div className="info-item">
                    <strong>Fecha Nacimiento:</strong> <FaBirthdayCake className="icon" /> <span>{formatDate(userDetails.fecha_nacimiento)}</span>
                </div>
                <div className="info-item">
                    <strong>Registrado:</strong> <FaCalendarAlt className="icon" /> <span>{formatDate(userDetails.created_at)}</span>
                </div>
            </div>

            {/* Sección de Mascotas */}
            <div className="user-detail-pets">
                <h4><FaPaw /> Mascotas de {userDetails.nombre}</h4>
                {userPets.length > 0 ? (
                    <div className="pets-grid">
                        {userPets.map(pet => (
                            <div key={pet.id_mascota} className="pet-card">
                                <div className="card-header">
                                    <h3>{pet.nombre}</h3>
                                    <span className="vet-id">ID: {pet.id_mascota}</span>
                                </div>
                                <div className="card-body">
                                    <div className="info-item"><FaPaw className="icon" /> <strong>Especie:</strong> <span>{pet.especie}</span></div>
                                    <div className="info-item"><FaVenusMars className="icon" /> <strong>Sexo:</strong> <span>{pet.sexo || 'Desconocido'}</span></div>
                                    <div className="info-item"><i className="fas fa-dog"></i> <strong>Raza:</strong> <span>{pet.raza || 'N/A'}</span></div>
                                    <div className="info-item"><FaBirthdayCake className="icon" /> <strong>Edad:</strong> <span>{pet.edad ? `${pet.edad} años` : 'N/A'}</span></div>
                                    <div className="info-item"><FaWeight className="icon" /> <strong>Peso:</strong> <span>{pet.peso ? `${pet.peso} kg` : 'N/A'}</span></div>
                                    <div className="info-item"><FaCalendarAlt className="icon" /> <strong>Fecha Nac:</strong> <span>{formatDate(pet.fecha_nacimiento)}</span></div>
                                    <div className="info-item"><FaPalette className="icon" /> <strong>Color:</strong> <span>{pet.color || 'N/A'}</span></div>
                                    <div className="info-item"><FaMicrochip className="icon" /> <strong>Microchip:</strong> <span>{pet.microchip || 'N/A'}</span></div>
                                    <div className="info-item"><FaCalendarAlt className="icon" /> <strong>Registrado:</strong> <span>{formatDate(pet.fecha_registro)}</span></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="no-results small">
                        <FaInfoCircle className="info-icon" />
                        <p>Este propietario no tiene mascotas registradas.</p>
                    </div>
                )}
            </div>

            <div className="modal-footer">
                <button onClick={onClose} className="cancel-btn">
                    <FaTimes /> Cerrar
                </button>
            </div>
        </motion.div>
    );
}

export default AdminUserDetail;
