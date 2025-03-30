import { Navigate, Outlet } from 'react-router-dom';

export const Protegida = ({ user, allowedRoles, children }) => {
  const storedUser = JSON.parse(localStorage.getItem('user'));
  const currentUser = user || storedUser;

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
    return <Navigate to="/" replace />;
  }

  return children ? children : <Outlet />;
};