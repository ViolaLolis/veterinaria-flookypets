// src/Components/Notifications/NotificationContext.js
import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';

// Crea el contexto de notificaciones
const NotificationContext = createContext();

// Hook personalizado para usar las notificaciones fácilmente
export const useNotifications = () => {
  return useContext(NotificationContext);
};

// URL base de tu backend (asegúrate de que sea la correcta para tu entorno)
// Es crucial que esta URL apunte a tu servidor Node.js
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Proveedor de notificaciones que envuelve tu aplicación
export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [userId, setUserId] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const intervalRef = useRef(null); // Para el intervalo de polling

  // Función para obtener el token JWT del localStorage
  const getToken = () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user).token : null;
  };

  // Efecto para obtener el userId y userRole del localStorage al cargar
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUserId(parsedUser.id);
      setUserRole(parsedUser.role);
    } else {
      setUserId(null);
      setUserRole(null);
    }
  }, []);

  // Función para obtener notificaciones desde el backend
  const fetchNotifications = useCallback(async () => {
    if (!userId) {
      // Si no hay ID de usuario, no hay notificaciones que buscar.
      // Esto es normal si el usuario no ha iniciado sesión.
      setNotifications([]); // Limpiar notificaciones si no hay usuario
      return;
    }

    const token = getToken();
    if (!token) {
      console.warn("No se encontró token de autenticación para obtener notificaciones. Limpiando notificaciones.");
      setNotifications([]);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/notifications/user/${userId}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        // Si el token expira o hay un error de autenticación (401/403), limpiar notificaciones
        if (response.status === 401 || response.status === 403) {
          console.error("Error de autenticación al obtener notificaciones. Por favor, inicia sesión de nuevo.");
          setNotifications([]);
          // Aquí podrías añadir lógica para redirigir al login si el token es inválido/expirado
          // window.location.href = '/login';
        }
        throw new Error(`Error HTTP! estado: ${response.status}`);
      }

      const result = await response.json();
      if (result.success) {
        // Las notificaciones ya vienen filtradas por el backend por id_usuario.
        // Aquí podrías añadir una capa de filtrado adicional si las notificaciones
        // en la BD tuvieran un campo 'target_role' y quisieras mostrarlas condicionalmente.
        // Por ahora, mostramos todas las notificaciones para el usuario logueado.
        setNotifications(result.data);
      } else {
        console.error("Error al obtener notificaciones del backend:", result.message);
        setNotifications([]);
      }
    } catch (error) {
      console.error("Error al obtener notificaciones:", error);
      setNotifications([]);
    }
  }, [userId]); // Dependencias para re-ejecutar cuando userId cambie

  // Efecto para iniciar el polling de notificaciones
  useEffect(() => {
    // Limpiar cualquier intervalo existente
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    if (userId) {
      // Realizar la primera carga inmediatamente
      fetchNotifications();
      // Configurar el polling cada 10 segundos
      intervalRef.current = setInterval(fetchNotifications, 10000); // Poll cada 10 segundos
    }

    // Limpiar el intervalo al desmontar el componente o cuando userId cambie
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [userId, fetchNotifications]); // Dependencias: re-ejecutar cuando userId o fetchNotifications cambien

  // Función para añadir una nueva notificación (normalmente llamada desde el backend)
  // En el frontend, esto se usaría para notificaciones temporales no persistentes
  // o para simular notificaciones antes de que el backend las persista y las devuelva.
  // Para notificaciones persistentes, el frontend solo las "escucha" del backend.
  const addNotification = useCallback((type, message, duration = 5000, referenceId = null) => {
    // Esta función es para notificaciones efímeras (no persistentes en la BD)
    // que se muestran inmediatamente en el frontend.
    const id = Date.now() + Math.random(); // ID temporal para notificaciones efímeras
    const newNotification = {
      id,
      type,
      message,
      leida: false, // Por defecto no leída
      fecha_creacion: new Date().toISOString(),
      referencia_id: referenceId,
    };

    setNotifications(prevNotifications => [...prevNotifications, newNotification]);

    // Eliminar la notificación efímera después de 'duration'
    if (duration > 0) {
      setTimeout(() => {
        setNotifications(prevNotifications => prevNotifications.filter(notif => notif.id !== id));
      }, duration);
    }
  }, []);


  // Función para marcar una notificación como leída en el backend
  const markNotificationAsRead = useCallback(async (notificationId) => {
    const token = getToken();
    if (!token) {
      console.warn("No se encontró token de autenticación para marcar notificación como leída.");
      return;
    }
    try {
      const response = await fetch(`${API_BASE_URL}/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        // Actualizar el estado localmente para reflejar el cambio inmediatamente
        setNotifications(prevNotifications =>
          prevNotifications.map(notif =>
            notif.id_notificacion === notificationId ? { ...notif, leida: true } : notif
          )
        );
        console.log(`Notificación ${notificationId} marcada como leída.`);
      } else {
        console.error(`Error al marcar notificación ${notificationId} como leída:`, await response.json());
      }
    } catch (error) {
      console.error(`Error al marcar notificación ${notificationId} como leída:`, error);
    }
  }, []);

  // Función para eliminar una notificación del backend
  const removeNotification = useCallback(async (notificationId) => {
    const token = getToken();
    if (!token) {
      console.warn("No se encontró token de autenticación para eliminar notificación.");
      return;
    }
    try {
      const response = await fetch(`${API_BASE_URL}/notifications/${notificationId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        // Eliminar del estado localmente
        setNotifications(prevNotifications => prevNotifications.filter(notif => notif.id_notificacion !== notificationId));
        console.log(`Notificación ${notificationId} eliminada.`);
      } else {
        console.error(`Error al eliminar notificación ${notificationId}:`, await response.json());
      }
    } catch (error) {
      console.error(`Error al eliminar notificación ${notificationId}:`, error);
    }
  }, []);

  // Función para limpiar todas las notificaciones (eliminarlas del backend)
  const clearAllNotifications = useCallback(async () => {
    const token = getToken();
    if (!token) {
      console.warn("No se encontró token de autenticación para limpiar todas las notificaciones.");
      return;
    }
    try {
      // Obtener todas las notificaciones actuales para el usuario y eliminarlas una por una
      // Esto asegura que se respeten los permisos de eliminación individuales en el backend.
      const response = await fetch(`${API_BASE_URL}/notifications/user/${userId}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data.length > 0) {
          const deletePromises = result.data.map(notif => removeNotification(notif.id_notificacion));
          await Promise.all(deletePromises);
          console.log("Todas las notificaciones eliminadas.");
          setNotifications([]); // Limpiar el estado local después de eliminar todas
        }
      } else {
        console.error("Error al obtener notificaciones para limpiar:", await response.json());
      }
    } catch (error) {
      console.error("Error al limpiar todas las notificaciones:", error);
    }
  }, [userId, removeNotification]);


  const value = {
    notifications,
    addNotification, // Para notificaciones efímeras del frontend
    removeNotification, // Para eliminar una notificación individual (persiste en backend)
    markNotificationAsRead, // Para marcar como leída (persiste en backend)
    clearAllNotifications, // Para limpiar todas (persiste en backend)
    fetchNotifications, // Para forzar una recarga de notificaciones
    userId,
    userRole,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
