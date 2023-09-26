import React from "react";
import { Link, useLocation } from "react-router-dom";
import "./HeaderAuth.css";

function HeaderAuth() {
  const location = useLocation();
  return (
    <div className="header-auth">
      {location.pathname !== "/signup" && (
        <Link to="/signup">
          <button className="header-auth__singup-button" type="button">
            Регистрация
          </button>
        </Link>
      )}

      {location.pathname !== "/signin" &&
        location.pathname !== "/forgot-password" && (
          <Link to="/signin">
            <button
              className={`${
                location.pathname === "/signup"
                  ? "header-auth__singup-button"
                  : "header-auth__entry-button"
              }`}
              type="button"
            >
              {location.pathname === "/signup" ? "Вход" : "Войти"}
            </button>
          </Link>
        )}
    </div>
  );
}

export default HeaderAuth;
