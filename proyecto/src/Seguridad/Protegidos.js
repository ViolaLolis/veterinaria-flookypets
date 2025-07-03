import { Navigate, Outlet } from 'react-router-dom';

export const Protegida = ({ user, allowedRoles, children }) => {
  const storedUser = JSON.parse(localStorage.getItem('user'));
  const currentUser = user || storedUser;

  // Si no hay usuario autenticado, redirigir al login
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  // Si el usuario está autenticado pero su rol no está permitido para esta ruta, redirigir a la página principal
  if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
    return <Navigate to="/" replace />;
  }

  // Si el usuario está autenticado y tiene el rol permitido, renderizar los hijos o el Outlet
  return children ? children : <Outlet />;
};
