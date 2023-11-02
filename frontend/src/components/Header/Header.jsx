/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, { useContext, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Context } from "../../context/context";
import HeaderAuth from "../HeaderAuth/HeaderAuth";
import "../Header/Header.css";
import "../../pages/Profiles/Profile.css";

function Header() {
  const [showSetting, setShowSetting] = useState(false);
  const { currentUser, isAuthenticated } = useContext(Context);
  let { pathname } = useLocation();

  function formatNameForHeader() {
    if (!currentUser) {
      return '';
    }

    const { is_worker, is_customer, user, name } = currentUser;

    if (is_worker) {
      const shortLastName = user?.last_name.slice(0, 1);
      return `${user?.first_name} ${shortLastName}.`;
    } else if (is_customer) {
      return name;
    }

    return '';
  }

  const completeFormPaths = (
    pathname === '/freelancer/complete' ||
    pathname === '/customer/complete' ||
    pathname === '/create-task'
  );

  const authPaths = (
    pathname === '/signin' ||
    pathname === '/signup' ||
    pathname === '/forgot-password' ||
    pathname === '/reset-password'
  );

  const profilePaths = currentUser.is_worker ? '/freelancer' : currentUser.is_customer && '/customer';

  function handleSetting() {
    setShowSetting(!showSetting);
  }

  const popStyle = `profile__popup profile_block${showSetting ? ' profile__popup_show' : ''}`

  return (
    <header className={`header${isAuthenticated && !completeFormPaths ? ' header-with-background' : ''}`}>
      <div className="header__container">
        <Link to="/" className={`header__logo${authPaths || completeFormPaths ? ' header__logo-black' : ''}`}></Link>
        {isAuthenticated ? (
          <div
            onClick={handleSetting}
            className="header__profile-container"
            role="button"
            tabIndex="0"
          >
            <p className="header__name">{formatNameForHeader()}</p>
            <div
              className="header__avatar"
              style={{ backgroundImage: `url(${currentUser?.photo})` }}
            ></div>
          </div>
        ) : (<HeaderAuth />)
        }
      </div>
      <div className={popStyle}>
        <Link
          to={profilePaths}
          onClick={() => setShowSetting(false)}
          className="profile__title"
        >
          Настройки
        </Link>
        <Link
          to="/signout"
          onClick={() => setShowSetting(false)}
          className="profile__title profile__popup-signout"
        >
          Выйти
        </Link>
      </div>
    </header>
  );
}

export default Header;
