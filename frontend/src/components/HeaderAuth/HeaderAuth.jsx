import React from "react";
import { Link, useLocation } from "react-router-dom";
import "./HeaderAuth.css";

function HeaderAuth() {
  const location = useLocation();
  return (
    <div className="header-auth">
      {location.pathname !=='/signup' && <Link to="/signup">
        <button className="header-auth__singup-button" type="button">
          Регистрация
        </button>
      </Link>}
      {location.pathname !=='/signin' && <Link to="/signin">
        <button className="header-auth__entry-button" type="button">
          Войти
        </button>
      </Link>}
    </div>
  );
}

export default HeaderAuth;
