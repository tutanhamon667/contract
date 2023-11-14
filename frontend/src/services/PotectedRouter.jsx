import React from 'react';
import { Outlet, useLocation, Navigate } from 'react-router-dom';
import { Context } from '../context/context';

function ProtectedRoute() {
  const { isAuthenticated } = React.useContext(Context);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/signin" state={{ from: location }} />;
  }

  return <Outlet />;
}

export { ProtectedRoute };
