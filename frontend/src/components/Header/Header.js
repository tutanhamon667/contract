import "../Header/Header.css";
import React from "react";
import HeaderAuth from "../HeaderAuth/HeaderAuth";

function Header() {
  return (
    <header className="header">
      <div className="header__container">
        <button className="header__logo"></button>
        <HeaderAuth />
      </div>
    </header>
  );
}

export default Header;
