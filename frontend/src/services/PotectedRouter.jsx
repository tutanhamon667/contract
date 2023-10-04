import React from "react";
import { Outlet, useLocation, Navigate } from "react-router-dom";
import { Context } from "../context/context";

export const ProtectedRoute = () => {
  const {authenticated} = React.useContext(Context);
  const location = useLocation();
  // const tokenLocal = localStorage.getItem("token") || null;

  if (!authenticated) {
    return <Navigate to={"/signin"} state={{ from: location }} />;
  }

  return <Outlet />;
};
