// src/Components/Notifications/NotificationContext.js
import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { authFetch } from '../utils/api'; // Importa authFetch desde tu nuevo archivo de utilidades

// Crea el contexto de notificaciones
const NotificationContext = createContext();

// Hook personalizado para usar las notificaciones fácilmente
export const useNotifications = () => {
  return useContext(NotificationContext);
};

// Proveedor de notificaciones que envuelve tu aplicación
export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [userId, setUserId] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const intervalRef = useRef(null); // Para el intervalo de polling

  // Función para obtener el token JWT y datos del usuario del localStorage
  const getTokenAndUser = useCallback(() => {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        return { token: parsedUser.token, id: parsedUser.id, role: parsedUser.role };
      }
      return { token: null, id: null, role: null };
    } catch (error) {
      console.error("Error al parsear el usuario del localStorage para token/ID/rol:", error);
      return { token: null, id: null, role: null };
    }
  }, []);

  // Efecto para obtener el userId y userRole del localStorage al cargar
  useEffect(() => {
    const { id, role } = getTokenAndUser();
    setUserId(id);
    setUserRole(role);
  }, [getTokenAndUser]);

  // Función para agregar una notificación al estado local (principalmente para notificaciones efímeras del frontend)
  const addNotification = useCallback(({ message, type = 'info', ephemeral = false, duration = 5000 }) => {
    const newNotification = {
      id: Date.now() + Math.random(), // ID único para notificaciones efímeras
      mensaje: message,
      tipo: type,
      leida: false,
      fecha_creacion: new Date().toISOString(),
      ephemeral: ephemeral, // Marca si es una notificación temporal solo para el frontend
    };
    setNotifications(prevNotifications => [newNotification, ...prevNotifications]);

    if (ephemeral) {
      setTimeout(() => {
        setNotifications(prevNotifications =>
          prevNotifications.filter(notif => notif.id !== newNotification.id)
        );
      }, duration);
    }
  }, []);

  // Función para obtener notificaciones desde la API
  const fetchNotifications = useCallback(async () => {
    if (!userId) return; // Solo intentar obtener si hay un userId

    try {
      const response = await authFetch(`/api/notifications/user/${userId}`);
      if (response.success) {
        // Filtrar notificaciones efímeras del estado local antes de cargar nuevas desde la BD
        const currentEphemeralNotifications = notifications.filter(notif => notif.ephemeral);
        setNotifications([...currentEphemeralNotifications, ...response.data]);
      } else {
        console.error("Error al obtener notificaciones:", response.message);
        // addNotification({ message: response.message, type: 'error', ephemeral: true }); // Opcional: notificar al usuario sobre el error
      }
    } catch (error) {
      console.error("Error de red al obtener notificaciones:", error);
      // addNotification({ message: 'Error de conexión al cargar notificaciones.', type: 'error', ephemeral: true }); // Opcional
    }
  }, [userId, notifications]); // Dependencia 'notifications' para mantener las efímeras

  // Función para marcar una notificación como leída
  const markNotificationAsRead = useCallback(async (notificationId, isDbNotification = true) => {
    if (isDbNotification) {
      try {
        const response = await authFetch(`/api/notifications/${notificationId}/read`, {
          method: 'PUT',
        });
        if (response.success) {
          setNotifications(prevNotifications =>
            prevNotifications.map(notif =>
              notif.id_notificacion === notificationId ? { ...notif, leida: true } : notif
            )
          );
        } else {
          console.error("Error al marcar notificación como leída:", response.message);
          addNotification({ message: `Error: ${response.message}`, type: 'error', ephemeral: true });
        }
      } catch (error) {
        console.error("Error de red al marcar notificación como leída:", error);
        addNotification({ message: 'Error de conexión al marcar notificación como leída.', type: 'error', ephemeral: true });
      }
    } else { // Si es efímera, solo actualiza el estado local
      setNotifications(prevNotifications =>
        prevNotifications.map(notif =>
          notif.id === notificationId ? { ...notif, leida: true } : notif
        )
      );
    }
  }, [authFetch, addNotification]);


  // Función para eliminar una notificación
  const removeNotification = useCallback(async (notificationId, isDbNotification = true) => {
    if (isDbNotification) {
      try {
        const response = await authFetch(`/api/notifications/${notificationId}`, {
          method: 'DELETE',
        });
        if (response.success) {
          setNotifications(prevNotifications =>
            prevNotifications.filter(notif => notif.id_notificacion !== notificationId)
          );
          addNotification({ message: 'Notificación eliminada.', type: 'success', ephemeral: true });
        } else {
          console.error("Error al eliminar notificación:", response.message);
          addNotification({ message: `Error: ${response.message}`, type: 'error', ephemeral: true });
        }
      } catch (error) {
        console.error("Error de red al eliminar notificación:", error.message);
      }
    } else { // Si es efímera o no tiene ID de BD, solo elimina del estado local
      setNotifications(prevNotifications =>
        prevNotifications.filter(notif => notif.id !== notificationId)
      );
    }
  }, [authFetch, notifications, addNotification]); // add addNotification to dependencies

  // Efecto para iniciar y limpiar el polling de notificaciones
  useEffect(() => {
    // Limpiar cualquier intervalo existente
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Si hay un userId, iniciar el polling
    if (userId) {
      fetchNotifications(); // Cargar inmediatamente al iniciar sesión
      intervalRef.current = setInterval(fetchNotifications, 30000); // Polling cada 30 segundos
    }

    // Función de limpieza al desmontar o cuando userId cambia
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [userId, fetchNotifications]); // Re-ejecutar cuando userId o fetchNotifications cambian

  // El valor del contexto que se proporcionará a los componentes hijos
  const contextValue = {
    notifications,
    addNotification,
    markNotificationAsRead,
    removeNotification,
    userRole, // Proporciona el rol del usuario a los consumidores del contexto
    userId // Proporciona el ID del usuario
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
};