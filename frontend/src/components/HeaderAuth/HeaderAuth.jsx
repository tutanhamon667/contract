import React from "react";
import { Link, useLocation } from "react-router-dom";
import "./HeaderAuth.css";

function HeaderAuth() {
  const location = useLocation();
  const locationAuth =
    location.pathname === "/signup" ||
    location.pathname === "/signin" ||
    location.pathname === "/forgot-password" ||
    location.pathname ===  "reset-password"
      ? true
      : false;
  return (
    <div className="header-auth">
      {location.pathname !== "/signup" && (
        <Link to="/signup">
          <button
            className={`header-auth__signup-button header-auth__white ${
              locationAuth && "header-auth__authState"
            }`}
            type="button"
          >
            Регистрация
          </button>
        </Link>
      )}

      {location.pathname !== "/signin" &&
        location.pathname !== "/forgot-password" && location.pathname !== "/reset-password" && (
          <Link to="/signin">
            <button
              className={`${
                location.pathname === "/signup"
                  ? "header-auth__signup-button"
                  : "header-auth__entry-button"
              } ${locationAuth && "header-auth__authState"}`}
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
