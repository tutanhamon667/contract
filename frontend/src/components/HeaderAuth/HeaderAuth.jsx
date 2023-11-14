import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './HeaderAuth.css';

function HeaderAuth() {
  const location = useLocation();
  const regTextStyle = `header-auth__singup-button ${
    location.pathname === '/' ? 'header-auth__singup-button_main-page' : ''
  }`;

  return (
    <div className="header-auth">
      {location.pathname !== '/signup' && (
        <Link to="/signup">
          <button className={regTextStyle} type="button">
            Регистрация
          </button>
        </Link>
      )}

      {location.pathname !== '/signin' &&
        location.pathname !== '/forgot-password' &&
        location.pathname !== '/reset-password' && (
          <Link to="/signin">
            <button
              className={`${
                location.pathname === '/signup'
                  ? 'header-auth__singup-button'
                  : 'button button__header-auth_entry-button'
              }`}
              type="button"
            >
              {location.pathname === '/signup' ? 'Вход' : 'Войти'}
            </button>
          </Link>
        )}
    </div>
  );
}

export { HeaderAuth };
