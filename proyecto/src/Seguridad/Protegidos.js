import React, { useEffect, useRef, useCallback } from 'react';
import { Navigate, Outlet, useNavigate } from 'react-router-dom';

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
  const logoutTimer = useRef(null);
  const INACTIVITY_TIMEOUT = 5 * 60 * 1000; // 5 minutos en milisegundos 

  // Obtener el usuario del localStorage como respaldo si no viene por props (ej. al recargar la página)
  let currentUser = user;
  if (!currentUser) {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    if (storedUser && storedToken) {
      try {
        currentUser = JSON.parse(storedUser);
        // Asegurarse de que el token también esté presente si se recupera de localStorage
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

  // Función para cerrar sesión y limpiar el estado
  const logout = useCallback(() => {
    console.log("Cerrando sesión debido a inactividad o acceso no autorizado.");
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    if (setUser) {
      setUser(null); // Limpia el estado global del usuario
    }
    navigate('/login', { replace: true });
  }, [navigate, setUser]);

  // Función para reiniciar el temporizador de inactividad
  const resetTimer = useCallback(() => {
    if (logoutTimer.current) {
      clearTimeout(logoutTimer.current);
    }
    if (currentUser && currentUser.token) { // Solo si hay un usuario logueado
      logoutTimer.current = setTimeout(logout, INACTIVITY_TIMEOUT);
    }
  }, [logout, currentUser, INACTIVITY_TIMEOUT]);

  // Efecto para iniciar y reiniciar el temporizador de inactividad
  useEffect(() => {
    resetTimer(); // Inicia el temporizador al montar el componente o cuando cambian las dependencias

    // Event listeners para actividad del usuario
    const events = ['mousemove', 'keypress', 'scroll', 'click'];
    events.forEach(event => window.addEventListener(event, resetTimer));

    return () => {
      // Limpiar el temporizador y los event listeners al desmontar
      if (logoutTimer.current) {
        clearTimeout(logoutTimer.current);
      }
      events.forEach(event => window.removeEventListener(event, resetTimer));
    };
  }, [resetTimer]); // Dependencia clave: resetTimer (para asegurar que se reinicia correctamente)


  // Efecto para manejar el historial del navegador (retroceso/avance)
  useEffect(() => {
    const handlePopState = () => {
      // Si el usuario intenta navegar hacia atrás o adelante
      // y no está autenticado o no tiene el rol correcto, redirigir al login.
      // Esto también cubre el caso donde la sesión ya expiró por inactividad.
      if (!currentUser || (allowedRoles && !allowedRoles.includes(currentUser.role))) {
        console.log("Protegida: Navegación del navegador detectada sin credenciales válidas o rol. Redirigiendo a /login.");
        logout(); // Cerrar sesión explícitamente y redirigir
      }
    };

    window.addEventListener('popstate', handlePopState);

    // Limpiar el event listener al desmontar el componente
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [currentUser, allowedRoles, logout]);

  // 1. Si no hay usuario autenticado (ni en props ni en localStorage), redirigir al login
  if (!currentUser || !currentUser.token) {
    console.log("Protegida: No hay usuario autenticado o token. Redirigiendo a /login.");
    return <Navigate to="/login" replace />;
  }

  // 2. Si el usuario está autenticado pero su rol no está permitido para esta ruta, redirigir al login
  // Opcional: Podrías redirigir a una página de "Acceso Denegado" o a la página de inicio.
  if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
    console.log(`Protegida: Rol ${currentUser.role} no permitido para esta ruta. Redirigiendo a /login.`);
    logout(); // Cerrar sesión y redirigir al login
    return null; // No renderizar nada mientras se redirige
  }

  // 3. Si el usuario está autenticado y tiene el rol permitido, renderizar los hijos o el Outlet
  console.log(`Protegida: Acceso permitido para el rol ${currentUser.role}.`);
  return children ? children : <Outlet />;
};