import "../Header/Header.css";
import React, { useContext } from "react";
import { Link } from "react-router-dom";
import HeaderAuth from "../HeaderAuth/HeaderAuth";
import userIcon from "../../images/user-icon.svg";
import { Context } from "../../context/context"

function Header() {
  const {currentUser, authenticated} = useContext(Context);
  function giveOutNameInHeader(currentUser) {
    return `${currentUser.first_name} ${currentUser.last_name.slice(0, 1)}.`
  }

  return (
    <header className="header">
      <div className="header__container">
        <Link className="header__logo" to="/"/>
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
