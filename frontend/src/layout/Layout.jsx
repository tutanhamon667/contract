import React, { useContext } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Context } from "../context/context";
import Header from "../components/Header/Header";
import "./Layout.css";

export default function Layout({ setAuthenticated, setCurrentUser }) {

  let { pathname } = useLocation();
  const { authenticated } = useContext(Context);
  const mainPageStyle = `wrapper ${(pathname === '/') ? 'wrapper_type_background-image ' : ''}`;
  const mainPageStyleAuthorized = `${authenticated ? `wrapper_type_background-image-none ` : ''}`;

  return (
    <div className={mainPageStyle + mainPageStyleAuthorized}>
      <Header
        setAuthenticated={setAuthenticated}
        setCurrentUser={setCurrentUser}
      />
      <main className="outlet">
        <Outlet />
      </main>
    </div>
  );
}
