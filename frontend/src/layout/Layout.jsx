import React from "react";
import { Outlet } from "react-router-dom";
import Footer from "../components/Footer/Footer";
import Header from "../components/Header/Header";
import styles from "./Layout.module.css";

export default function Layout() {
  return (
    <div className={styles.wrapper}>
      <Header />
      <main>
      <div className={styles.outlet}>
        <Outlet />
      </div>
      </main>
      <Footer />
    </div>
  );
}

// Перекинул Header над main