import React, { useContext, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Context } from '../../context/context';
import { HeaderAuth } from '../HeaderAuth/HeaderAuth';
import '../../pages/Profiles/Profile.css';
import './Header.css';

function Header() {
  const [showSetting, setShowSetting] = useState(false);
  const { currentUser, isAuthenticated } = useContext(Context);
  let { pathname } = useLocation();

  function formatNameForHeader() {
    if (!currentUser) {
      return '';
    }

    const { is_worker, is_customer, user } = currentUser;

    if (is_worker) {
      const shortLastName = user?.last_name.slice(0, 1);
      return `${user?.first_name} ${shortLastName}.`;
    }
    if (is_customer) {
      const shortLastName = currentUser?.last_name.slice(0, 1);
      return `${currentUser?.first_name} ${shortLastName}.`;
    }

    return '';
  }

  const completeFormPaths = pathname === '/profile/complete' || pathname === '/create-task';

  const authPaths =
    pathname === '/signin' ||
    pathname === '/signup' ||
    pathname === '/forgot-password' ||
    pathname === '/reset-password';

  function handleSetting() {
    setShowSetting(!showSetting);
  }

  const popStyle = `profile__popup profile_block${showSetting ? ' profile__popup_show' : ''}`;

  return (
    <header
      className={`header${isAuthenticated && !completeFormPaths ? ' header-with-background' : ''}`}
    >
      <div className="header__container">
        <Link
          to="/"
          className={`header__logo${authPaths || completeFormPaths ? ' header__logo-black' : ''}`}
        />
        {isAuthenticated ? (
          <div
            onClick={handleSetting}
            className="header__profile-container"
            role="button"
            tabIndex="0"
          >
            <p className={`header__name${completeFormPaths ? ' header__name_dark' : ''}`}>
              {formatNameForHeader()}
            </p>
            <div
              className="header__avatar"
              style={{ backgroundImage: `url('${currentUser?.photo}')` }}
            />
          </div>
        ) : (
          <HeaderAuth />
        )}
      </div>
      {showSetting && (
        <div className={popStyle}>
          <Link to="/profile" onClick={() => setShowSetting(false)} className="profile__title">
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
      )}
    </header>
  );
}

export { Header };
