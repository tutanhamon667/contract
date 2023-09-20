import "../Header/Header.css";
import React from "react";
import { Link } from "react-router-dom"
import HeaderAuth from "../HeaderAuth/HeaderAuth";

function Header() {
  return (
    <header className="header">
      <div className="header__container">
        <Link to="/">
          <button className="header__logo"></button>
        </Link>
        <HeaderAuth />
      </div>
    </header>
  );
}

export default Header;
