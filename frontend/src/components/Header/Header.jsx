import "../Header/Header.css";
import {React, useContext} from "react";
import { Link } from "react-router-dom";
import HeaderAuth from "../HeaderAuth/HeaderAuth";
import userIcon from "../../images/user-icon.svg";
import { CurrentUser } from "../../context/context"

function Header({ authenticated }) {
  // условные данные пользователя
  // при изменении id в userName, меняется отображение в FreelancerAccount
  const user = useContext(CurrentUser);
  function giveOutNameInHeader(user) {
    return `${user.firstName} ${user.lastName.slice(0, 1)}.`
  }

  return (
    <header className="header">
      <div className="header__container">
        <Link to="/">
          <button className="header__logo"></button>
        </Link>
        {authenticated ? (
          <Link to={`/freelancer/${user.id}`}>
            <div className="header__userInfo">
              <img src={userIcon} alt="user" />
              <p>{giveOutNameInHeader(user)}</p>
            </div>
          </Link>
        ) : (<HeaderAuth />)
        }
      </div>
    </header>
  );
}

export default Header;
