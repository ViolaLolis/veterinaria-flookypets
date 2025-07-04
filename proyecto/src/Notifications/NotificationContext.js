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

  // Función para obtener el token JWT del localStorage
  const getToken = () => {
    try {
      const user = localStorage.getItem('user');
      return user ? JSON.parse(user).token : null;
    } catch (error) {
      console.error("Error al parsear el usuario del localStorage para token:", error);
      return null;
    }
  };

  // Efecto para obtener el userId y userRole del localStorage al cargar
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUserId(parsedUser.id);
        setUserRole(parsedUser.role);
      } catch (error) {
        console.error("Error al parsear el usuario almacenado:", error);
        setUserId(null);
        setUserRole(null);
        localStorage.removeItem('user'); // Limpiar datos corruptos
        localStorage.removeItem('token');
      }
    } else {
      setUserId(null);
      setUserRole(null);
    }
  }, []);

  // Función para obtener notificaciones desde el backend
  const fetchNotifications = useCallback(async () => {
    if (!userId) {
      // Si no hay ID de usuario, no hay notificaciones que buscar.
      // Esto es normal si el usuario no ha iniciado sesión o se ha deslogueado.
      setNotifications([]); // Limpiar notificaciones si no hay usuario logueado
      return;
    }

    // No necesitamos getToken() aquí directamente porque authFetch ya lo maneja.
    // authFetch lanzará un error si no hay token o es inválido.
    try {
      // CAMBIO CLAVE: Se agregó '/api' a la ruta para que coincida con el backend
      const result = await authFetch(`/api/notifications/user/${userId}`);

      if (result.success && Array.isArray(result.data)) {
        // Filtra solo las notificaciones no leídas para mostrarlas
        const unreadNotifications = result.data.filter(notif => !notif.leida);
        setNotifications(unreadNotifications);
      } else {
        console.error("Error al obtener notificaciones:", result.message || "Formato de respuesta inesperado.");
        setNotifications([]); // Limpiar si hay un error en el formato
      }
    } catch (error) {
      console.error("Error de red o autenticación al obtener notificaciones:", error.message);
      // Si hay un error de autenticación (ej. token expirado), limpiar notificaciones
      if (error.message.includes('No autorizado') || error.message.includes('Token inválido')) {
        setNotifications([]);
        // Opcional: Aquí podrías añadir lógica para forzar un logout o redirigir al login
        // localStorage.removeItem('user');
        // localStorage.removeItem('token');
        // window.location.href = '/login';
      }
      setNotifications([]); // Limpiar notificaciones en caso de cualquier error de fetch
    }
  }, [userId]); // Depende de userId para re-ejecutarse cuando el usuario cambia

  // Función para añadir una notificación temporal (no persistente en la BD)
  const addNotification = useCallback((type, message, duration = 5000) => {
    // Genera un ID único para notificaciones efímeras (no de la BD)
    const newNotification = {
      id: Date.now() + Math.random(), // ID temporal único para el frontend
      tipo: type,
      mensaje: message,
      leida: false, // Las notificaciones efímeras no se marcan como leídas en la BD
      fecha_creacion: new Date().toISOString()
    };

    setNotifications(prevNotifications => [...prevNotifications, newNotification]);

    // Elimina la notificación después de 'duration' milisegundos
    if (duration > 0) {
      setTimeout(() => {
        setNotifications(prevNotifications =>
          prevNotifications.filter(notif => notif.id !== newNotification.id)
        );
      }, duration);
    }
  }, []);

  // Función para marcar una notificación como leída en el backend
  const markNotificationAsRead = useCallback(async (notificationId) => {
    // Solo intenta marcar como leída si es una notificación de la BD (tiene id_notificacion)
    const notificationToMark = notifications.find(n => (n.id_notificacion === notificationId || n.id === notificationId));

    if (notificationToMark && notificationToMark.id_notificacion) { // Verifica si tiene un ID de BD
      try {
        // CAMBIO CLAVE: Se cambió la ruta para marcar como leída
        const response = await authFetch(`/api/notifications/mark-read/${notificationToMark.id_notificacion}`, {
          method: 'PUT',
          body: JSON.stringify({ leida: true }) // Enviar el estado 'leida'
        });
        if (response.success) {
          // Actualiza el estado local para reflejar que está leída
          setNotifications(prevNotifications =>
            prevNotifications.map(notif =>
              notif.id_notificacion === notificationToMark.id_notificacion ? { ...notif, leida: true } : notif
            )
          );
        } else {
          console.error("Error al marcar notificación como leída:", response.message);
        }
      } catch (error) {
        console.error("Error de conexión al marcar notificación como leída:", error.message);
      }
    } else {
      // Si es una notificación efímera, simplemente la eliminamos del estado local
      removeNotification(notificationId);
    }
  }, [authFetch, notifications]); // Depende de authFetch y notifications

  // Función para eliminar una notificación del estado local (y del backend si es persistente)
  const removeNotification = useCallback(async (notificationId) => {
    const notificationToRemove = notifications.find(n => (n.id_notificacion === notificationId || n.id === notificationId));

    if (notificationToRemove && notificationToRemove.id_notificacion) { // Si tiene ID de BD, intenta eliminar del backend
      try {
        // CAMBIO CLAVE: Se cambió la ruta para eliminar notificación
        const response = await authFetch(`/api/notifications/${notificationToRemove.id_notificacion}`, {
          method: 'DELETE'
        });
        if (response.success) {
          setNotifications(prevNotifications =>
            prevNotifications.filter(notif => notif.id_notificacion !== notificationToRemove.id_notificacion)
          );
        } else {
          console.error("Error al eliminar notificación del backend:", response.message);
        }
      } catch (error) {
        console.error("Error de conexión al eliminar notificación:", error.message);
      }
    } else { // Si es efímera o no tiene ID de BD, solo elimina del estado local
      setNotifications(prevNotifications =>
        prevNotifications.filter(notif => notif.id !== notificationId)
      );
    }
  }, [authFetch, notifications]);


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
