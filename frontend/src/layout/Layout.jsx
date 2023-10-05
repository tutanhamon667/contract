import React from "react";
import { Outlet, useLocation } from "react-router-dom";
// import Footer from "../components/Footer/Footer";
import Header from "../components/Header/Header";
import "./Layout.css";
export default function Layout({ setAuthenticated, setCurrentUser }) {
  let { pathname } = useLocation();
  const mainPageStyle = `wrapper ${(pathname === '/') ? 'wrapper_type_background-image' : ''}`

  return (
    <div className={mainPageStyle}>
      <Header
        setAuthenticated={setAuthenticated}
        setCurrentUser={setCurrentUser}
      />
      <main className="outlet">
        <Outlet />
      </main>
      {/* <Footer /> */}
    </div>
  );
}
