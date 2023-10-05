import React from "react";
import { Outlet, useLocation } from "react-router-dom";
// import Footer from "../components/Footer/Footer";
import Header from "../components/Header/Header";
import { Context } from "../context/context";
import "./Layout.css";
export default function Layout({ setAuthenticated, setCurrentUser }) {
  let { pathname } = useLocation();
  const {authenticated} = React.useContext(Context)


  return (
    <div className={`wrapper ${(pathname === '/') && !authenticated ? 'wrapper_type_background-image' : ''}`}>
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
