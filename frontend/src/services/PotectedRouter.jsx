import { Outlet, useLocation, Navigate } from "react-router-dom";

export const ProtectedRoute = () => {
  const location = useLocation();
  const tokenLocal = localStorage.getItem("token") || null;

  if (!tokenLocal) {
    return <Navigate to={"/signin"} state={{ from: location }} />;
  }

  return <Outlet />;
};
