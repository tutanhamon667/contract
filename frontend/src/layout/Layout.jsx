import React from "react";
import { Outlet, useLocation } from "react-router-dom";
// import Footer from "../components/Footer/Footer";
import Header from "../components/Header/Header";
import "./Layout.css";
export default function Layout() {
  let { pathname } = useLocation();
  const mainPageStyle = `wrapper ${(pathname === '/') ? 'wrapper_type_background-image' : ''}`

  return (
    <div className={mainPageStyle}>
      <Header />
      <main className="outlet">
        <Outlet />
      </main>
      {/* <Footer /> */}
    </div>
  );
}
