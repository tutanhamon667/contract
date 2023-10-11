import "../Header/Header.css";
import "../../pages/Profiles/Profile.css"
import React, { useContext, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import HeaderAuth from "../HeaderAuth/HeaderAuth";
import { Context } from "../../context/context"

function Header({ setAuthenticated, setCurrentUser }) {
  const [showSetting, setShowSetting] = useState(false);
  const { currentUser, authenticated } = useContext(Context);
  let { pathname } = useLocation();

  function giveOutNameInHeader(currentUser) {
    return `${currentUser.first_name} ${currentUser.last_name.slice(0, 1)}.`
  }

  const profilePaths = (currentUser.role === 'Заказчик')
    ? `customer/${currentUser.id}`
    : `freelancer/${currentUser.id}`;

  function handleSetting() {
    setShowSetting(!showSetting)
  }

  function signout() {
    setAuthenticated(false)
    setCurrentUser({})
    setShowSetting(false)
  }

  const popStyle = `profile__popup profile_block ${showSetting ? 'profile__popup_show' : ''}`
  const logoMainPageStyle = (pathname === '/' && !authenticated)
    ? 'header__logo'
    : authenticated
      ? 'header__logo'
      : 'header__logo header__logo-black';
  const headerStyle = `header ${authenticated ? 'header-with-background' : ''}`


  return (
    <header className={headerStyle}>
      <div className="header__container">
        <Link to="/" className={logoMainPageStyle}></Link>
        {authenticated ? (
          <div
            onClick={handleSetting}
            className="header__profile-container"
          >
            <p className="header__name">{giveOutNameInHeader(currentUser)}</p>
            <div className="header__avatar"></div>
          </div>
        ) : (<HeaderAuth />)
        }
      </div>
      <div className={popStyle}>
        <Link
          to={profilePaths}
          onClick={() => setShowSetting(false)}
          className="profile__title">
          Настройки
        </Link>
        <button
          className="profile__title profile__popup-signout"
          onClick={signout}>
          Выйти
        </button>
      </div>
    </header>
  );
}

export default Header;
