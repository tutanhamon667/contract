import "../Header/Header.css";
import React, { useContext } from "react";
import { Link, useLocation } from "react-router-dom";
import HeaderAuth from "../HeaderAuth/HeaderAuth";
import userIcon from "../../images/user-icon.svg";
import { Context } from "../../context/context"

function Header() {
  const {currentUser, authenticated} = useContext(Context);
  const location = useLocation()
  const locationAuth =
    location.pathname === "/signup" ||
    location.pathname === "/signin" ||
    location.pathname === "/forgot-password" ||
    location.pathname ===  "reset-password"
      ? true
      : false;
  function giveOutNameInHeader(currentUser) {
    return `${currentUser.first_name} ${currentUser.last_name.slice(0, 1)}.`
  }

  return (
    <header className="header">
      <div className="header__container">
        <Link className={`${locationAuth ? "header__logoBlack" : "header__logo" }`} to="/"></Link>
        {authenticated ? (
          <Link to={`/freelancer/${currentUser.id}`}>
            <div className="header__userInfo">
              <img src={userIcon} alt="user" />
              <p>{giveOutNameInHeader(currentUser)}</p>
            </div>
          </Link>
        ) : (<HeaderAuth />)
        }
      </div>
    </header>
  );
}

export default Header;
