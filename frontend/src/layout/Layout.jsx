import React from "react";
import { Outlet } from "react-router-dom";
import Footer from "../components/Footer/Footer";
import Header from "../components/Header/Header";
import  "./Layout.css";

export default function Layout({authenticated}) {
  return (
    <div className='wrapper'>
      <Header authenticated={authenticated} />
      <main className="outlet">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
