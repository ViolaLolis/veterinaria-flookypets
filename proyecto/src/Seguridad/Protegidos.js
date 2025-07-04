// src/Seguridad/Protegidos.js
import React, { useEffect, useRef, useCallback } from 'react';
import { Navigate, Outlet, useNavigate, useLocation } from 'react-router-dom';
// NO importes showConsoleWarning aquí, lo llamaremos desde App.js una sola vez.


/**
 * Componente de Ruta Protegida.
 * Asegura que solo los usuarios autenticados y con roles específicos puedan acceder a las rutas.
 * Implementa cierre de sesión por inactividad y previene acceso no autorizado con botones del navegador.
 *
 * @param {object} props - Las propiedades del componente.
 * @param {object} props.user - El objeto de usuario actual (generalmente del estado global de la app).
 * @param {Function} props.setUser - Función para actualizar el estado del usuario (ej. a null al cerrar sesión).
 * @param {Array<string>} props.allowedRoles - Un array de roles permitidos para esta ruta (ej. ['admin', 'veterinario']).
 * @param {React.ReactNode} props.children - Los componentes hijos a renderizar si el acceso es permitido.
 */
export const Protegida = ({ user, setUser, allowedRoles, children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const logoutTimer = useRef(null);
  const INACTIVITY_TIMEOUT = 5 * 60 * 1000; // 5 minutos en milisegundos

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
        // Este console.error será suprimido en producción por la lógica en index.js
        console.error("Error al parsear el usuario del localStorage en Protegida.js:", error);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        currentUser = null;
      }
    }
  }

  const logout = useCallback(() => {
    // console.log se suprime globalmente en producción
    // console.log("Cerrando sesión debido a inactividad o acceso no autorizado.");
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    if (setUser) {
      setUser(null);
    }
    navigate('/login', { replace: true });
  }, [navigate, setUser]);

  const resetTimer = useCallback(() => {
    if (logoutTimer.current) {
      clearTimeout(logoutTimer.current);
    }
    if (currentUser && currentUser.token) {
      logoutTimer.current = setTimeout(logout, INACTIVITY_TIMEOUT);
    }
  }, [logout, currentUser, INACTIVITY_TIMEOUT]);

  useEffect(() => {
    resetTimer();

    const events = ['mousemove', 'keypress', 'scroll', 'click'];
    events.forEach(event => window.addEventListener(event, resetTimer));

    return () => {
      if (logoutTimer.current) {
        clearTimeout(logoutTimer.current);
      }
      events.forEach(event => window.removeEventListener(event, resetTimer));
    };
  }, [resetTimer]);

  useEffect(() => {
    const handlePopState = () => {
      if (currentUser && allowedRoles && allowedRoles.includes(currentUser.role)) {
        // console.log se suprime globalmente en producción
        // console.log("Protegida: Navegación del historial detectada en una ruta protegida. Invalidando sesión.");
        logout();
      } else if (!currentUser || (allowedRoles && !allowedRoles.includes(currentUser.role))) {
        // console.log se suprime globalmente en producción
        // console.log("Protegida: Navegación del navegador detectada sin credenciales válidas o rol. Redirigiendo a /login.");
        logout();
      }
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [currentUser, allowedRoles, logout, location.pathname]);

  if (!currentUser || !currentUser.token) {
    // console.log se suprime globalmente en producción
    // console.log("Protegida: No hay usuario autenticado o token. Redirigiendo a /login.");
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
    // console.log se suprime globalmente en producción
    // console.log(`Protegida: Rol ${currentUser.role} no permitido para esta ruta. Redirigiendo a /login.`);
    logout();
    return null;
  }

  // console.log se suprime globalmente en producción
  // console.log(`Protegida: Acceso permitido para el rol ${currentUser.role}.`);
  return children ? children : <Outlet />;
};