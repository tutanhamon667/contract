import "../Header/Header.css";
import React from "react";
import { Link } from "react-router-dom"
import HeaderAuth from "../HeaderAuth/HeaderAuth";
import userIcon from "../../images/user-icon.svg"

function Header({authenticated}) {
  // условные данные пользователя
  const userName = {
    firstName: "Иван",
    lastName: "Петров"
  }
  function giveOutNameInHeader(userName) {
    return `${userName.firstName} ${userName.lastName.slice(0,1)}.`
  }

  return (
    <header className="header">
      <div className="header__container">
        <Link to="/">
          <button className="header__logo"></button>
        </Link>
        {authenticated ? (
          <Link to="*">
            <div className="header__userInfo">
              <img src={userIcon} alt="" />
              <p>{giveOutNameInHeader(userName)}</p>
            </div>
          </Link>
          ) : (<HeaderAuth />)
        }
      </div>
    </header>
  );
}

export default Header;
