import React, { useEffect, useRef, useCallback } from 'react';
import { Navigate, Outlet, useNavigate, useLocation } from 'react-router-dom';

export const Protegida = ({ user, setUser, allowedRoles, children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const logoutTimer = useRef(null);
  const lastProtectedPath = useRef(null);
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

  // Función de logout mejorada
  const logout = useCallback((reason = '') => {
    console.log(`Cerrando sesión. Razón: ${reason || 'desconocida'}`);
    
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.setItem('sessionInvalidated', 'true');
    
    if (logoutTimer.current) {
      clearTimeout(logoutTimer.current);
    }
    
    if (setUser) {
      setUser(null);
    }
    
    // Guardar la última ruta protegida visitada
    if (lastProtectedPath.current) {
      sessionStorage.setItem('lastProtectedPath', lastProtectedPath.current);
    }
    
    navigate('/login', { 
      replace: true,
      state: { 
        reason: reason || 'inactividad',
        from: location.pathname
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
    
    resetTimer();
    
    return () => {
      events.forEach(event => window.removeEventListener(event, resetTimer));
      if (logoutTimer.current) {
        clearTimeout(logoutTimer.current);
      }
    };
  }, [resetTimer]);

  // Efecto principal para manejar la navegación
  useEffect(() => {
    const publicPaths = ['/', '/login', '/register', '/olvide-contraseña'];
    const isPublicPath = publicPaths.includes(location.pathname);

    if (currentUser?.token) {
      // Si estamos en una ruta protegida, guardarla
      if (!isPublicPath) {
        lastProtectedPath.current = location.pathname;
        sessionStorage.removeItem('sessionInvalidated');
      }
      // Si estamos en una ruta pública pero autenticados, es porque venimos de atrás
      else if (sessionStorage.getItem('lastProtectedPath')) {
        sessionStorage.setItem('sessionInvalidated', 'true');
      }
    }

    // Si hay sesión inválida y estamos intentando acceder a una ruta protegida
    if (!isPublicPath && sessionStorage.getItem('sessionInvalidated') === 'true') {
      console.log('Intento de acceso con sesión inválida. Forzando logout.');
      logout('navegación inválida');
      return;
    }

    // Limpiar al desmontar
    return () => {
      sessionStorage.removeItem('lastProtectedPath');
    };
  }, [location.pathname, currentUser, logout]);

  // Redirecciones basadas en autenticación y roles
  if (!currentUser || !currentUser.token) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
    logout('acceso no autorizado');
    return null;
  }

  return children ? children : <Outlet />;
};