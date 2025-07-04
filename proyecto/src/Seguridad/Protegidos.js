import React, { useEffect, useRef, useCallback } from 'react';
import { Navigate, Outlet, useNavigate, useLocation } from 'react-router-dom';

export const Protegida = ({ user, setUser, allowedRoles, children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const logoutTimer = useRef(null);
  const INACTIVITY_TIMEOUT = 5 * 60 * 1000; // 5 minutos en milisegundos

  // Intenta recuperar el usuario del localStorage si no se pasa por props
  let currentUser = user;
  if (!currentUser) {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    if (storedUser && storedToken) {
      try {
        currentUser = JSON.parse(storedUser);
        if (!currentUser.token) {
          currentUser.token = storedToken;
        }
      } catch (error) {
        console.error("Error al parsear el usuario del localStorage:", error);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        currentUser = null;
      }
    }
  }

  // Función de logout mejorada con manejo de razones
  const logout = useCallback((reason = '') => {
    console.log(`Cerrando sesión. Razón: ${reason || 'desconocida'}`);
    
    // Limpiar almacenamiento local
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Establecer banderas de sesión inválida
    sessionStorage.setItem('sessionInvalidated', 'true');
    sessionStorage.setItem('logoutReason', reason || 'inactividad');
    
    // Limpiar temporizador
    if (logoutTimer.current) {
      clearTimeout(logoutTimer.current);
    }
    
    // Actualizar estado del usuario
    if (setUser) {
      setUser(null);
    }
    
    // Redirigir al login con información del estado
    navigate('/login', { 
      replace: true,
      state: { 
        from: location.pathname,
        reason: reason || 'inactividad'
      }
    });
  }, [navigate, setUser, location.pathname]);

  // Función para reiniciar el temporizador de inactividad
  const resetTimer = useCallback(() => {
    if (logoutTimer.current) {
      clearTimeout(logoutTimer.current);
    }
    
    if (currentUser?.token) {
      logoutTimer.current = setTimeout(() => {
        logout('inactividad');
      }, INACTIVITY_TIMEOUT);
    }
  }, [logout, currentUser, INACTIVITY_TIMEOUT]);

  // Efecto para gestionar el temporizador de inactividad
  useEffect(() => {
    const events = ['mousemove', 'keydown', 'scroll', 'click', 'touchstart'];
    events.forEach(event => window.addEventListener(event, resetTimer));
    
    // Iniciar el temporizador al montar
    resetTimer();
    
    return () => {
      // Limpiar listeners y temporizador al desmontar
      events.forEach(event => window.removeEventListener(event, resetTimer));
      if (logoutTimer.current) {
        clearTimeout(logoutTimer.current);
      }
    };
  }, [resetTimer]);

  // Efecto para manejar navegación del navegador (atrás/adelante)
  useEffect(() => {
    const publicPaths = ['/', '/login', '/register', '/olvide-contraseña'];
    const isCurrentPathPublic = publicPaths.includes(location.pathname);

    if (currentUser?.token) {
      if (isCurrentPathPublic) {
        // Usuario autenticado en ruta pública - marcar sesión como inválida
        console.log("Usuario autenticado en ruta pública. Marcando sesión como inválida.");
        sessionStorage.setItem('sessionInvalidated', 'true');
        sessionStorage.setItem('logoutReason', 'navegación inválida');
      } else {
        // Usuario autenticado en ruta protegida - limpiar banderas
        console.log("Usuario autenticado en ruta protegida. Limpiando banderas de sesión inválida.");
        sessionStorage.removeItem('sessionInvalidated');
        sessionStorage.removeItem('logoutReason');
      }
    }

    // Limpiar banderas al cerrar la pestaña/ventana
    const handleBeforeUnload = () => {
      sessionStorage.removeItem('sessionInvalidated');
      sessionStorage.removeItem('logoutReason');
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [location.pathname, currentUser]);

  // Efecto para verificar sesión inválida al montar/cambiar usuario
  useEffect(() => {
    if (currentUser?.token && sessionStorage.getItem('sessionInvalidated') === 'true') {
      const reason = sessionStorage.getItem('logoutReason') || 'navegación inválida';
      console.log(`Sesión marcada como inválida. Razón: ${reason}. Forzando logout.`);
      logout(reason);
    }
  }, [currentUser, logout]);

  // --- Lógica de redirección basada en autenticación y roles ---

  // 1. Si no hay usuario o token, redirigir a login
  if (!currentUser || !currentUser.token) {
    console.log("No hay usuario autenticado. Redirigiendo a /login.");
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  // 2. Si el usuario no tiene un rol permitido, cerrar sesión y redirigir
  if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
    console.log(`Rol ${currentUser.role} no permitido. Cerrando sesión.`);
    logout('acceso no autorizado');
    return null;
  }

  // Si todas las comprobaciones pasan, el acceso está permitido
  console.log(`Acceso permitido para el rol ${currentUser.role}.`);
  return children ? children : <Outlet />;
};