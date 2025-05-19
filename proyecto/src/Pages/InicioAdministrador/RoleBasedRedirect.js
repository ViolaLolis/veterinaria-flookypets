import React from 'react';
import { Navigate } from 'react-router-dom';

const RoleBasedRedirect = ({ user }) => {
  if (!user) {
    return <Navigate to="/login" />;
  }

  switch(user.role) {
    case 'admin':
      return <Navigate to="/admin" />;
    case 'veterinario':
      return <Navigate to="/veterinario" />;
    case 'usuario':
      return <Navigate to="/usuario" />;
    default:
      return <Navigate to="/" />;
  }
};

export default RoleBasedRedirect;