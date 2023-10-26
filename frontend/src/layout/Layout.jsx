import React, { useContext } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Context } from "../context/context";
import Header from "../components/Header/Header";
import "./Layout.css";

export default function Layout() {

  let { pathname } = useLocation();
  const { isAuthenticated } = useContext(Context);
  const mainPageStyle = `layout__wrapper${(pathname === '/') ? ' layout__wrapper_type_background-image' : ''}`;
  const mainPageStyleAuthorized = `${isAuthenticated ? ` layout__wrapper_type_background-image-none` : ''}`;

  return (
    <div className={mainPageStyle + mainPageStyleAuthorized}>
      <Header />
      <main className="layout__outlet">
        <Outlet />
      </main>
    </div>
  );
}
