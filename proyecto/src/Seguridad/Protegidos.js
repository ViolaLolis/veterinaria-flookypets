// src/Pages/Protegida.js
import React, { useEffect } from 'react';
import { Navigate, Outlet, useNavigate } from 'react-router-dom';

/**
 * Componente de Ruta Protegida.
 * Asegura que solo los usuarios autenticados y con roles específicos puedan acceder a las rutas.
 * También implementa una medida de seguridad para evitar el acceso a rutas protegidas
 * mediante los botones de retroceso/avance del navegador después de cerrar sesión.
 *
 * @param {object} props - Las propiedades del componente.
 * @param {object} props.user - El objeto de usuario actual (generalmente del estado global de la app).
 * @param {Array<string>} props.allowedRoles - Un array de roles permitidos para esta ruta (ej. ['admin', 'veterinario']).
 * @param {React.ReactNode} props.children - Los componentes hijos a renderizar si el acceso es permitido.
 */
export const Protegida = ({ user, allowedRoles, children }) => {
  const navigate = useNavigate();

  // Obtener el usuario del localStorage como respaldo si no viene por props (ej. al recargar la página)
  const storedUser = localStorage.getItem('user');
  let currentUser = user;
  if (!currentUser && storedUser) {
    try {
      currentUser = JSON.parse(storedUser);
    } catch (error) {
      console.error("Error al parsear el usuario del localStorage:", error);
      localStorage.removeItem('user'); // Limpiar datos corruptos
      localStorage.removeItem('token');
      currentUser = null;
    }
  }

  // Efecto para manejar el historial del navegador
  useEffect(() => {
    const handlePopState = (event) => {
      // Si el usuario intenta navegar hacia atrás o adelante
      // y no está autenticado o no tiene el rol correcto, redirigir al login.
      if (!currentUser || (allowedRoles && !allowedRoles.includes(currentUser.role))) {
        navigate('/login', { replace: true }); // Usar replace para no añadir al historial
      }
    };

    window.addEventListener('popstate', handlePopState);

    // Limpiar el event listener al desmontar el componente
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [currentUser, allowedRoles, navigate]);


  // 1. Si no hay usuario autenticado, redirigir al login
  if (!currentUser || !currentUser.token) {
    console.log("Protegida: No hay usuario autenticado o token. Redirigiendo a /login.");
    return <Navigate to="/login" replace />;
  }

  // 2. Si el usuario está autenticado pero su rol no está permitido para esta ruta, redirigir a la página principal
  if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
    console.log(`Protegida: Rol ${currentUser.role} no permitido para esta ruta. Redirigiendo a /.`);
    // Podrías redirigir a una página de "Acceso Denegado" o a la página de inicio.
    return <Navigate to="/" replace />;
  }

  // 3. Si el usuario está autenticado y tiene el rol permitido, renderizar los hijos o el Outlet
  console.log(`Protegida: Acceso permitido para el rol ${currentUser.role}.`);
  return children ? children : <Outlet />;
};
