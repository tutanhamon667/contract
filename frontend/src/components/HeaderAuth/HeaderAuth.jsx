import React from "react";
import "./HeaderAuth.css";

function HeaderAuth() {
  return (
    <div className="header-auth">
      <a href="/signup">
        <button className="header-auth__singup-button" type="button">
          Регистрация
        </button>
      </a>
      <a href="/signin">
        <button className="header-auth__entry-button" type="button">
          Войти
        </button>
      </a>
    </div>
  );
}

export default HeaderAuth;