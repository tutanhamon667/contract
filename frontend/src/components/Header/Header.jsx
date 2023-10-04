import "../Header/Header.css";
import React, { useContext } from "react";
import { Link, useLocation } from "react-router-dom";
import HeaderAuth from "../HeaderAuth/HeaderAuth";
import { Context } from "../../context/context"

function Header() {
  const { currentUser, authenticated } = useContext(Context);
  let { pathname } = useLocation();

  function giveOutNameInHeader(currentUser) {
    return `${currentUser.first_name} ${currentUser.last_name.slice(0, 1)}.`
  }

  const authPaths = pathname === '/signin' || pathname === '/signup';

  return (
    <header className={`header ${authenticated ? 'header-with-background' : ''}`}>
      <div className="header__container">
        <Link to="/" className={`header__logo ${authPaths ? 'header__logo-black' : ''}`}></Link>
        {authenticated ? (
          <Link to={`/freelancer/${currentUser.id}`} className="header__userInfo">
            <p className="header__name">{giveOutNameInHeader(currentUser)}</p>
            <div className="header__avatar"></div>
          </Link>
        ) : (<HeaderAuth />)
        }
      </div>
    </header>
  );
}

export default Header;
